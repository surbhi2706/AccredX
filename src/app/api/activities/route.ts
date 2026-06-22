import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google, sheets_v4 } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const SHEET_NAME = "AccredX Activities";
const REPOSITORY_NAME = "AccredX Repository";
const HEADERS = [
    "Timestamp",
    "Faculty Email",
    "Faculty Name",
    "Academic Year",
    "PMS Category",
    "Activity Type",
    "Title",
    "Role",
    "Level",
    "Duration",
    "Outcome",
    "Evidence File Name",
    "Drive File URL",
    "Drive File ID",
    "Description",
    "Remarks",
    "PMS Section",
    "Metadata JSON",
];

type GoogleSession = {
    accessToken?: string;
    error?: string;
    user?: {
        email?: string | null;
        name?: string | null;
    };
};

type ActivityInput = {
    academicYear?: unknown;
    pmsCategory?: unknown;
    pmsSection?: unknown;
    activityType?: unknown;
    data?: unknown;
};

function asString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function getSessionAuth(session: GoogleSession) {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: session.accessToken });
    return auth;
}

async function findRepositoryFolderId(
    drive: drive_v3.Drive
): Promise<string | undefined> {
    const repositorySearch = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${REPOSITORY_NAME}' and trashed=false`,
        fields: "files(id)",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    return repositorySearch.data.files?.[0]?.id ?? undefined;
}

async function getOrCreateRepositoryFolderId(
    drive: drive_v3.Drive
): Promise<string> {
    const existingId = await findRepositoryFolderId(drive);
    if (existingId) return existingId;

    const folder = await drive.files.create({
        requestBody: {
            name: REPOSITORY_NAME,
            mimeType: "application/vnd.google-apps.folder",
            parents: ["root"],
        },
        fields: "id",
        supportsAllDrives: true,
    });

    if (!folder.data.id) {
        throw new Error("Google Drive did not return a repository folder ID.");
    }

    return folder.data.id;
}

async function findSpreadsheetId(
    drive: drive_v3.Drive,
    repositoryFolderId: string
): Promise<string | undefined> {
    const sheetSearch = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${SHEET_NAME}' and '${repositoryFolderId}' in parents and trashed=false`,
        fields: "files(id)",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    return sheetSearch.data.files?.[0]?.id ?? undefined;
}

async function getOrCreateSpreadsheetId(
    drive: drive_v3.Drive,
    sheets: sheets_v4.Sheets,
    repositoryFolderId: string
): Promise<string> {
    const existingId = await findSpreadsheetId(drive, repositoryFolderId);
    if (existingId) return existingId;

    const spreadsheet = await drive.files.create({
        requestBody: {
            name: SHEET_NAME,
            mimeType: "application/vnd.google-apps.spreadsheet",
            parents: [repositoryFolderId],
        },
        fields: "id",
    });

    if (!spreadsheet.data.id) {
        throw new Error("Google Drive did not return a spreadsheet ID.");
    }

    await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet.data.id,
        range: "Sheet1!A1:R1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [HEADERS] },
    });

    return spreadsheet.data.id;
}

function rowValue(
    row: string[],
    headerIndexes: Map<string, number>,
    header: string
): string {
    const index = headerIndexes.get(header);
    return index === undefined ? "" : String(row[index] ?? "");
}

// Best-effort Drive cleanup — a missing/already-deleted file or a
// permissions hiccup here should never block the Sheets row from being
// deleted/updated, so this always resolves, never rejects.
async function safeDeleteDriveFile(
    drive: drive_v3.Drive,
    fileId: string
): Promise<{ deleted: boolean; warning: string }> {
    if (!fileId) return { deleted: false, warning: "" };

    try {
        await drive.files.delete({ fileId, supportsAllDrives: true });
        return { deleted: true, warning: "" };
    } catch (error: unknown) {
        console.error("Error deleting Drive evidence file:", error);
        return {
            deleted: false,
            warning:
                "The activity was removed, but the evidence file could not be deleted from Drive. It may already be gone, or this account may lack permission.",
        };
    }
}

// Mirrors the folder resolution used in /api/upload, so a replacement
// evidence file lands in the same Year/Category/Activity folder structure.
async function getOrCreateFolder(
    drive: drive_v3.Drive,
    folderName: string,
    parentFolderId: string
): Promise<string> {
    if (!folderName) return parentFolderId;

    const escapedFolderName = folderName.trim().replace(/'/g, "\\'");
    const query = `mimeType='application/vnd.google-apps.folder' and name='${escapedFolderName}' and '${parentFolderId}' in parents and trashed=false`;

    const folderSearch = await drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    if (folderSearch.data.files && folderSearch.data.files.length > 0) {
        return folderSearch.data.files[0].id as string;
    }

    const folderCreate = await drive.files.create({
        requestBody: {
            name: folderName.trim(),
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentFolderId],
        },
        fields: "id",
        supportsAllDrives: true,
    });
    return folderCreate.data.id as string;
}

type ReplacementUploadResult = {
    fileName: string;
    fileUrl: string;
    fileId: string;
};

// Uploads a new evidence file into the repository's Year/Category/Activity
// folder path and returns the info needed to overwrite the row's evidence
// columns. Does not touch the old file — caller deletes it separately.
async function uploadReplacementFile(
    drive: drive_v3.Drive,
    repositoryFolderId: string,
    academicYear: string,
    pmsCategory: string,
    activityType: string,
    file: File
): Promise<ReplacementUploadResult> {
    const yearFolderId = academicYear
        ? await getOrCreateFolder(drive, academicYear, repositoryFolderId)
        : repositoryFolderId;
    const categoryFolderId = pmsCategory
        ? await getOrCreateFolder(drive, pmsCategory, yearFolderId)
        : yearFolderId;
    const finalFolderId = activityType
        ? await getOrCreateFolder(drive, activityType, categoryFolderId)
        : categoryFolderId;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
    fs.writeFileSync(tempPath, buffer);

    try {
        const created = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [finalFolderId],
            },
            media: {
                mimeType: file.type,
                body: fs.createReadStream(tempPath),
            },
            supportsAllDrives: true,
            fields: "id",
        });

        const fileId = created.data.id as string;
        return {
            fileName: file.name,
            fileUrl: `https://drive.google.com/file/d/${fileId}/view`,
            fileId,
        };
    } finally {
        fs.unlinkSync(tempPath);
    }
}

function parseMetadata(value: string): Record<string, string> {
    if (!value) return {};

    try {
        const parsed = JSON.parse(value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

        return Object.fromEntries(
            Object.entries(parsed).map(([key, fieldValue]) => [
                key,
                typeof fieldValue === "string" ? fieldValue : String(fieldValue ?? ""),
            ])
        );
    } catch {
        return {};
    }
}

function fallbackMetadata(
    row: string[],
    headerIndexes: Map<string, number>
): Record<string, string> {
    const fields: Array<[string, string]> = [
        ["title", "Title"],
        ["role", "Role"],
        ["level", "Level"],
        ["duration", "Duration"],
        ["outcomes", "Outcome"],
        ["description", "Description"],
        ["remarks", "Remarks"],
    ];

    return Object.fromEntries(
        fields
            .map(([key, header]) => [key, rowValue(row, headerIndexes, header)])
            .filter(([, value]) => value)
    );
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const googleSession = session as (typeof session & GoogleSession);

        if (
            !googleSession ||
            !googleSession.accessToken ||
            googleSession.error ||
            !googleSession.user?.email
        ) {
            return NextResponse.json(
                { error: "Your Google session has expired. Please sign in again." },
                { status: 401 }
            );
        }

        const auth = getSessionAuth(googleSession);
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });
        const repositoryFolderId = await findRepositoryFolderId(drive);

        if (!repositoryFolderId) {
            return NextResponse.json({ activities: [] });
        }

        const spreadsheetId = await findSpreadsheetId(drive, repositoryFolderId);

        if (!spreadsheetId) {
            return NextResponse.json({ activities: [] });
        }

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A:R",
        });
        const rows = (valuesResponse.data.values ?? []) as string[][];

        if (rows.length < 2) {
            return NextResponse.json({ activities: [] });
        }

        const headerIndexes = new Map(
            rows[0].map((header, index) => [String(header).trim(), index])
        );
        const signedInEmail = googleSession.user.email.toLowerCase();
        const activities = rows
            .slice(1)
            .filter(
                (row) =>
                    rowValue(row, headerIndexes, "Faculty Email").toLowerCase() ===
                    signedInEmail
            )
            .map((row, index) => {
                const timestamp = rowValue(row, headerIndexes, "Timestamp");
                const metadataValue = rowValue(row, headerIndexes, "Metadata JSON");
                const metadata = parseMetadata(metadataValue);
                const data =
                    Object.keys(metadata).length > 0
                        ? metadata
                        : fallbackMetadata(row, headerIndexes);
                const timestampMs = Date.parse(timestamp);

                return {
                    // The raw ISO timestamp doubles as a stable row identifier —
                    // it's written once at creation and never changes, so PATCH/DELETE
                    // can use it to re-locate this exact row later.
                    id: timestamp || `row-${index + 1}`,
                    academicYear: rowValue(row, headerIndexes, "Academic Year"),
                    pmsCategory: rowValue(row, headerIndexes, "PMS Category"),
                    pmsSection:
                        rowValue(row, headerIndexes, "PMS Section") ||
                        data.pmsSection ||
                        "",
                    activityType: rowValue(row, headerIndexes, "Activity Type"),
                    data,
                    evidenceFileName: rowValue(
                        row,
                        headerIndexes,
                        "Evidence File Name"
                    ),
                    evidenceFileId: rowValue(row, headerIndexes, "Drive File ID"),
                    createdAt: Number.isNaN(timestampMs)
                        ? timestamp
                        : new Date(timestampMs).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }),
                };
            })
            .reverse();

        return NextResponse.json({ activities });
    } catch (error: unknown) {
        console.error("Error loading Google Sheets activities:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to load activities from Google Sheets.",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const googleSession = session as (typeof session & GoogleSession);

        if (
            !googleSession ||
            !googleSession.accessToken ||
            googleSession.error ||
            !googleSession.user?.email
        ) {
            return NextResponse.json(
                { error: "Your Google session has expired. Please sign in again." },
                { status: 401 }
            );
        }

        const input = (await req.json()) as ActivityInput;
        const data =
            input.data && typeof input.data === "object" && !Array.isArray(input.data)
                ? Object.fromEntries(
                    Object.entries(input.data).map(([key, value]) => [
                        key,
                        asString(value),
                    ])
                )
                : {};
        const extractField = (keys: string[]) => {
            for (const key of keys) {
                if (data[key]) return data[key];
            }
            return "";
        };
        const auth = getSessionAuth(googleSession);
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });
        const repositoryFolderId = await getOrCreateRepositoryFolderId(drive);
        const spreadsheetId = await getOrCreateSpreadsheetId(
            drive,
            sheets,
            repositoryFolderId
        );

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Sheet1!A1:R1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [HEADERS] },
        });

        const timestamp = new Date().toISOString();
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "Sheet1!A:R",
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [[
                    timestamp,
                    googleSession.user.email,
                    googleSession.user.name || "Unknown Faculty",
                    asString(input.academicYear),
                    asString(input.pmsCategory),
                    asString(input.activityType),
                    extractField(["title", "paperTitle", "courseName", "projectTitle", "activityTitle"]),
                    extractField(["role", "roleDetails", "roleInEvent", "roleName"]),
                    extractField(["quartile", "indexing", "level", "indexingType"]),
                    extractField(["duration", "dates", "date", "academicYear", "year"]),
                    extractField(["outcomes", "learningOutcomes", "achievements", "expectedOutcome"]),
                    "",
                    "",
                    "",
                    extractField(["description", "practiceDescription", "projectDescription", "details"]),
                    extractField(["remarks", "feedbackProvided", "analysis"]),
                    asString(input.pmsSection) || data.pmsSection || "",
                    JSON.stringify(data),
                ]],
            },
        });

        return NextResponse.json({
            success: true,
            id: timestamp,
            createdAt: new Date(timestamp).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
        });
    } catch (error: unknown) {
        console.error("Error saving Google Sheets activity:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to save activity to Google Sheets.",
            },
            { status: 500 }
        );
    }
}

type ActivityPatchInput = ActivityInput & { id?: unknown };

type RowLookupResult =
    | { ok: true; rowIndex: number; existingRow: string[]; headerIndexes: Map<string, number> }
    | { ok: false; status: number; error: string };

async function loadOwnRowOrFail(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    id: string,
    signedInEmail: string
): Promise<RowLookupResult> {
    const valuesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A:R",
    });
    const rows = (valuesResponse.data.values ?? []) as string[][];

    if (rows.length < 2) {
        return { ok: false, status: 404, error: "Activity not found." };
    }

    const headerIndexes = new Map(
        rows[0].map((header, index) => [String(header).trim(), index])
    );

    console.log("Headers found in sheet:", rows[0]);
    console.log("Looking for id:", id, "email:", signedInEmail);

    const dataRowIndex = rows.slice(1).findIndex((row) => {
        const rowTimestamp = rowValue(row, headerIndexes, "Timestamp").trim();
        const rowEmail = rowValue(row, headerIndexes, "Faculty Email").trim().toLowerCase();

        console.log("Checking row - timestamp:", rowTimestamp, "email:", rowEmail);

        // The id from the frontend may be:
        // 1. An ISO string (e.g. "2026-06-19T07:45:22.276Z") — direct match
        // 2. A numeric string from Date.now() — convert both to ms for comparison
        const rowMs = Date.parse(rowTimestamp);
        const idMs = Number(id);

        const timestampMatches =
            rowTimestamp === id ||
            (!isNaN(rowMs) && !isNaN(idMs) && rowMs === idMs) ||
            (!isNaN(rowMs) && String(rowMs) === id);

        const emailMatches = !rowEmail || rowEmail === signedInEmail;

        return timestampMatches && emailMatches;
    });

    if (dataRowIndex === -1) {
        return {
            ok: false,
            status: 404,
            error: "Activity not found, or you don't have permission to change it.",
        };
    }

    return {
        ok: true,
        rowIndex: dataRowIndex,
        existingRow: rows[dataRowIndex + 1],
        headerIndexes,
    };
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const googleSession = session as (typeof session & GoogleSession);

        if (
            !googleSession ||
            !googleSession.accessToken ||
            googleSession.error ||
            !googleSession.user?.email
        ) {
            return NextResponse.json(
                { error: "Your Google session has expired. Please sign in again." },
                { status: 401 }
            );
        }

        const contentType = req.headers.get("content-type") || "";
        const isMultipart = contentType.includes("multipart/form-data");

        let input: ActivityPatchInput;
        let newEvidenceFile: File | null = null;

        if (isMultipart) {
            const formData = await req.formData();
            const rawData = (formData.get("data") as string) || "{}";
            let parsedData: unknown = {};
            try {
                parsedData = JSON.parse(rawData);
            } catch {
                parsedData = {};
            }

            input = {
                id: (formData.get("id") as string) || "",
                academicYear: (formData.get("academicYear") as string) || "",
                pmsCategory: (formData.get("pmsCategory") as string) || "",
                pmsSection: (formData.get("pmsSection") as string) || "",
                activityType: (formData.get("activityType") as string) || "",
                data: parsedData,
            };

            const fileEntry = formData.get("file");
            if (fileEntry instanceof File && fileEntry.size > 0) {
                newEvidenceFile = fileEntry;
            }
        } else {
            input = (await req.json()) as ActivityPatchInput;
        }

        const id = typeof input.id === "string" ? input.id : "";
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

        const data =
            input.data && typeof input.data === "object" && !Array.isArray(input.data)
                ? Object.fromEntries(
                    Object.entries(input.data).map(([key, value]) => [
                        key,
                        asString(value),
                    ])
                )
                : {};
        const extractField = (keys: string[]) => {
            for (const key of keys) {
                if (data[key]) return data[key];
            }
            return "";
        };

        const auth = getSessionAuth(googleSession);
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });
        const signedInEmail = googleSession.user.email.toLowerCase();

        const repositoryFolderId = await findRepositoryFolderId(drive);
        if (!repositoryFolderId) {
            return NextResponse.json({ error: "Activity not found." }, { status: 404 });
        }
        const spreadsheetId = await findSpreadsheetId(drive, repositoryFolderId);
        if (!spreadsheetId) {
            return NextResponse.json({ error: "Activity not found." }, { status: 404 });
        }

        const located = await loadOwnRowOrFail(sheets, spreadsheetId, id, signedInEmail);
        if (!located.ok) {
            return NextResponse.json({ error: located.error }, { status: located.status });
        }

        const { existingRow, headerIndexes, rowIndex } = located;
        // Header is row 1 in the sheet, data starts at row 2.
        const sheetRowNumber = rowIndex + 2;

        const existingFileName = rowValue(existingRow, headerIndexes, "Evidence File Name");
        const existingFileUrl = rowValue(existingRow, headerIndexes, "Drive File URL");
        const existingFileId = rowValue(existingRow, headerIndexes, "Drive File ID");

        let evidenceFileName = existingFileName;
        let evidenceFileUrl = existingFileUrl;
        let evidenceFileIdValue = existingFileId;
        let driveWarning = "";

        if (newEvidenceFile) {
            const replacement = await uploadReplacementFile(
                drive,
                repositoryFolderId,
                asString(input.academicYear),
                asString(input.pmsCategory),
                asString(input.activityType),
                newEvidenceFile
            );

            // Only drop the old file once the new one is safely uploaded.
            if (existingFileId) {
                const cleanup = await safeDeleteDriveFile(drive, existingFileId);
                if (cleanup.warning) driveWarning = cleanup.warning;
            }

            evidenceFileName = replacement.fileName;
            evidenceFileUrl = replacement.fileUrl;
            evidenceFileIdValue = replacement.fileId;
        }

        const updatedRow = [
            id, // the timestamp is the stable id — keep it unchanged
            googleSession.user.email,
            googleSession.user.name ||
            rowValue(existingRow, headerIndexes, "Faculty Name") ||
            "Unknown Faculty",
            asString(input.academicYear),
            asString(input.pmsCategory),
            asString(input.activityType),
            extractField(["title", "paperTitle", "courseName", "projectTitle", "activityTitle"]),
            extractField(["role", "roleDetails", "roleInEvent", "roleName"]),
            extractField(["quartile", "indexing", "level", "indexingType"]),
            extractField(["duration", "dates", "date", "academicYear", "year"]),
            extractField(["outcomes", "learningOutcomes", "achievements", "expectedOutcome"]),
            evidenceFileName,
            evidenceFileUrl,
            evidenceFileIdValue,
            extractField(["description", "practiceDescription", "projectDescription", "details"]),
            extractField(["remarks", "feedbackProvided", "analysis"]),
            asString(input.pmsSection) || data.pmsSection || "",
            JSON.stringify(data),
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Sheet1!A${sheetRowNumber}:R${sheetRowNumber}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [updatedRow] },
        });

        return NextResponse.json({
            success: true,
            id,
            evidenceFileName,
            evidenceFileId: evidenceFileIdValue,
            driveWarning: driveWarning || undefined,
        });
    } catch (error: unknown) {
        console.error("Error updating Google Sheets activity:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to update activity in Google Sheets.",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const googleSession = session as (typeof session & GoogleSession);

        if (
            !googleSession ||
            !googleSession.accessToken ||
            googleSession.error ||
            !googleSession.user?.email
        ) {
            return NextResponse.json(
                { error: "Your Google session has expired. Please sign in again." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id") || "";
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

        const auth = getSessionAuth(googleSession);
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });
        const signedInEmail = googleSession.user.email.toLowerCase();

        const repositoryFolderId = await findRepositoryFolderId(drive);
        console.log("DELETE repositoryFolderId:", repositoryFolderId, "id:", id, "email:", signedInEmail);
        if (!repositoryFolderId) {
            return NextResponse.json({ error: "Activity not found." }, { status: 404 });
        }
        const spreadsheetId = await findSpreadsheetId(drive, repositoryFolderId);
        if (!spreadsheetId) {
            return NextResponse.json({ error: "Activity not found." }, { status: 404 });
        }

        const located = await loadOwnRowOrFail(sheets, spreadsheetId, id, signedInEmail);
        if (!located.ok) {
            return NextResponse.json({ error: located.error }, { status: located.status });
        }

        const sheetMeta = await sheets.spreadsheets.get({
            spreadsheetId,
            fields: "sheets.properties",
        });
        const sheetId = sheetMeta.data.sheets?.find(
            (s) => s.properties?.title === "Sheet1"
        )?.properties?.sheetId;

        if (sheetId === undefined || sheetId === null) {
            return NextResponse.json(
                { error: "Could not locate the activities sheet tab." },
                { status: 500 }
            );
        }

        // located.rowIndex is 0-based within the data rows (header excluded);
        // the sheet's row 0 IS the header, so the actual row to delete is
        // rowIndex + 1.
        const sheetRowIndex = located.rowIndex + 1;

        const driveFileId = rowValue(
            located.existingRow,
            located.headerIndexes,
            "Drive File ID"
        );
        const driveCleanup = await safeDeleteDriveFile(drive, driveFileId);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId,
                                dimension: "ROWS",
                                startIndex: sheetRowIndex,
                                endIndex: sheetRowIndex + 1,
                            },
                        },
                    },
                ],
            },
        });

        return NextResponse.json({
            success: true,
            driveWarning: driveCleanup.warning || undefined,
        });
    } catch (error: unknown) {
        console.error("Error deleting Google Sheets activity:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to delete activity from Google Sheets.",
            },
            { status: 500 }
        );
    }
}