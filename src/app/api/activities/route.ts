import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google, sheets_v4 } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { readLocalActivities, writeLocalActivity, deleteLocalActivity } from "@/lib/localDb";

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
        q: `mimeType='application/vnd.google-apps.folder' and name='${REPOSITORY_NAME}' and 'root' in parents and trashed=false`,
        fields: "files(id)",
        spaces: "drive",
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
    console.log("ACTIVITIES API HIT");
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
        let repositoryFolderId: string | undefined;
        try {
            repositoryFolderId = await findRepositoryFolderId(drive);
        } catch (e) {
            console.warn("Drive folder find failed:", e);
        }

        if (!repositoryFolderId) {
            const local = readLocalActivities(googleSession.user.email);
            return NextResponse.json({ activities: local });
        }

        let spreadsheetId: string | undefined;
        try {
            spreadsheetId = await findSpreadsheetId(drive, repositoryFolderId);
        } catch (e) {
            console.warn("Spreadsheet find failed:", e);
        }

        if (!spreadsheetId) {
            const local = readLocalActivities(googleSession.user.email);
            return NextResponse.json({ activities: local });
        }

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A:R",
        });
        const rows = (valuesResponse.data.values ?? []) as string[][];

        if (rows.length < 2) {
            const local = readLocalActivities(googleSession.user.email);
            return NextResponse.json({ activities: local });
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
                    id: Number.isNaN(timestampMs) ? index + 1 : timestampMs + index,
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
        
        // Cache loaded activities locally
        try {
            for (const act of activities) {
                writeLocalActivity(signedInEmail, act);
            }
        } catch (e) {
            console.error("Failed to cache activities locally:", e);
        }

        console.log("ACTIVITIES RETURNED:", activities.length);

        return NextResponse.json({ activities });
    } catch (error: unknown) {
        console.error("Error loading Google Sheets activities, falling back to local:", error);
        try {
            const session = await getServerSession(authOptions);
            const googleSession = session as (typeof session & GoogleSession);
            if (googleSession?.user?.email) {
                const local = readLocalActivities(googleSession.user.email);
                return NextResponse.json({ activities: local });
            }
        } catch (localErr) {
            console.error("Local activities fallback read failed:", localErr);
        }
        return NextResponse.json({ activities: [] });
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
        const generatedId = Date.parse(timestamp);
        const formattedDate = new Date(timestamp).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const newActivity = {
            id: generatedId,
            academicYear: asString(input.academicYear),
            pmsCategory: asString(input.pmsCategory),
            pmsSection: asString(input.pmsSection) || (data as any).pmsSection || "",
            activityType: asString(input.activityType),
            data,
            evidenceFileName: "",
            evidenceFileId: "",
            createdAt: formattedDate,
        };

        // Cache activity locally
        try {
            writeLocalActivity(googleSession.user.email, newActivity);
        } catch (localErr) {
            console.error("Local activities cache save failed:", localErr);
        }

        try {
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
        } catch (sheetsErr) {
            console.warn("Failed to write to Google Sheets, using local cache backup:", sheetsErr);
            return NextResponse.json({
                success: true,
                id: generatedId,
                createdAt: formattedDate,
                warning: "Saved locally. Google Sheets was unreachable."
            });
        }

        return NextResponse.json({
            success: true,
            id: generatedId,
            createdAt: formattedDate,
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

export async function DELETE(req: NextRequest) {
    let id: string | null = null;
    let googleSession: any = null;
    try {
        const session = await getServerSession(authOptions);
        googleSession = session as (typeof session & GoogleSession);

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
        id = searchParams.get("id");

        console.log("Deleting activity:", id);

        const auth = getSessionAuth(googleSession);
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });

        const repositoryFolderId = await findRepositoryFolderId(drive);

        if (!repositoryFolderId) {
            return NextResponse.json(
                { error: "Repository folder not found" },
                { status: 404 }
            );
        }

        const spreadsheetId = await findSpreadsheetId(
            drive,
            repositoryFolderId
        );

        console.log("GET SPREADSHEET ID:", spreadsheetId);

        console.log("DELETE SPREADSHEET ID:", spreadsheetId);


        if (!spreadsheetId) {
            return NextResponse.json(
                { error: "Spreadsheet not found" },
                { status: 404 }
            );
        }

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A:R",
        });

        const rows = (valuesResponse.data.values ?? []) as string[][];
        console.log("GET TOTAL ROWS:", rows.length);
        console.log("DELETE ROWS:", rows);
console.log("DELETE TOTAL ROWS:", rows.length);

        const headerIndexes = new Map(
            rows[0].map((header, index) => [String(header).trim(), index])
        );
        const signedInEmail = googleSession.user.email.toLowerCase();
        
        const filteredRows = rows
            .slice(1)
            .filter((row) => rowValue(row, headerIndexes, "Faculty Email").toLowerCase() === signedInEmail);
            
        const idMs = Number(id);
        const targetFilteredIndex = filteredRows.findIndex((row, index) => {
            const timestamp = rowValue(row, headerIndexes, "Timestamp");
            const rowMs = Date.parse(timestamp);
            const generatedId = Number.isNaN(rowMs) ? index + 1 : rowMs + index;
            return generatedId === idMs;
        });

        if (targetFilteredIndex === -1) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        const targetRow = filteredRows[targetFilteredIndex];
        const actualRowIndex = rows.indexOf(targetRow);

        if (actualRowIndex === -1) {
            return NextResponse.json({ error: "Activity not found in spreadsheet" }, { status: 404 });
        }

        const rowData = rows[actualRowIndex];
        const driveFileId = rowData[13];

        if (driveFileId) {
            try {
                await drive.files.delete({ fileId: driveFileId });
                console.log("Deleted Drive file:", driveFileId);
            } catch (err) {
                console.error("Failed to delete drive file:", err);
            }
        }

        const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetId = spreadsheetInfo.data.sheets?.[0]?.properties?.sheetId || 0;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: actualRowIndex,
                                endIndex: actualRowIndex + 1,
                            },
                        },
                    },
                ],
            },
        });

        // Delete locally as well
        try {
            deleteLocalActivity(googleSession.user.email, Number(id));
        } catch (localErr) {
            console.error("Local activities delete cache failed:", localErr);
        }

        return NextResponse.json({
            success: true,
            deletedId: id,
            rowIndex: actualRowIndex,
        });
    } catch (error) {
        console.error("Error deleting from Google Sheets:", error);
        try {
            if (id) {
                deleteLocalActivity(googleSession.user.email, Number(id));
                return NextResponse.json({
                    success: true,
                    deletedId: id,
                    warning: "Deleted locally. Google Sheets was unreachable."
                });
            }
        } catch (localErr) {
            console.error("Local activities fallback delete failed:", localErr);
        }

        return NextResponse.json(
            { error: "Delete failed" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
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

        const input = (await req.json()) as ActivityInput & { id?: string | number };
        if (!input.id) {
            return NextResponse.json({ error: "Missing activity ID" }, { status: 400 });
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

        const repositoryFolderId = await findRepositoryFolderId(drive);
        if (!repositoryFolderId) return NextResponse.json({ error: "Repository folder not found" }, { status: 404 });

        const spreadsheetId = await findSpreadsheetId(drive, repositoryFolderId);
        if (!spreadsheetId) return NextResponse.json({ error: "Spreadsheet not found" }, { status: 404 });

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Sheet1!A:R",
        });

        const rows = (valuesResponse.data.values ?? []) as string[][];
        const headerIndexes = new Map(
            rows[0].map((header, index) => [String(header).trim(), index])
        );
        const signedInEmail = googleSession.user.email.toLowerCase();
        
        const filteredRows = rows
            .slice(1)
            .filter((row) => rowValue(row, headerIndexes, "Faculty Email").toLowerCase() === signedInEmail);

        const idMs = Number(input.id);
        const targetFilteredIndex = filteredRows.findIndex((row, index) => {
            const timestamp = rowValue(row, headerIndexes, "Timestamp");
            const rowMs = Date.parse(timestamp);
            const generatedId = Number.isNaN(rowMs) ? index + 1 : rowMs + index;
            return generatedId === idMs;
        });

        if (targetFilteredIndex === -1) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        const targetRow = filteredRows[targetFilteredIndex];
        const actualRowIndex = rows.indexOf(targetRow);

        if (actualRowIndex === -1) {
            return NextResponse.json({ error: "Activity not found in spreadsheet" }, { status: 404 });
        }

        const existingRow = rows[actualRowIndex];

        const updatedRow = [
            existingRow[0] || "",
            existingRow[1] || "",
            existingRow[2] || "",
            asString(input.academicYear),
            asString(input.pmsCategory),
            asString(input.activityType),
            extractField(["title", "paperTitle", "courseName", "projectTitle", "activityTitle"]),
            extractField(["role", "roleDetails", "roleInEvent", "roleName"]),
            extractField(["quartile", "indexing", "level", "indexingType"]),
            extractField(["duration", "dates", "date", "academicYear", "year"]),
            extractField(["outcomes", "learningOutcomes", "achievements", "expectedOutcome"]),
            existingRow[11] || "",
            existingRow[12] || "",
            existingRow[13] || "",
            extractField(["description", "practiceDescription", "projectDescription", "details"]),
            extractField(["remarks", "feedbackProvided", "analysis"]),
            asString(input.pmsSection) || data.pmsSection || "",
            JSON.stringify(data),
        ];

        const updatedActivity = {
            id: Number(input.id),
            academicYear: asString(input.academicYear),
            pmsCategory: asString(input.pmsCategory),
            pmsSection: asString(input.pmsSection) || (data as any).pmsSection || "",
            activityType: asString(input.activityType),
            data,
            evidenceFileName: existingRow[11] || "",
            evidenceFileId: existingRow[12] || "",
            createdAt: existingRow[0]
                ? new Date(Date.parse(existingRow[0])).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
        };

        // Cache update locally
        try {
            writeLocalActivity(googleSession.user.email, updatedActivity);
        } catch (localErr) {
            console.error("Local activities cache save failed:", localErr);
        }

        try {
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `Sheet1!A${actualRowIndex + 1}:R${actualRowIndex + 1}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [updatedRow] },
            });
        } catch (sheetsErr) {
            console.warn("Failed to write to Google Sheets, using local cache backup:", sheetsErr);
            return NextResponse.json({
                success: true,
                id: input.id,
                updated: true,
                warning: "Updated locally. Google Sheets was unreachable."
            });
        }

        return NextResponse.json({
            success: true,
            id: input.id,
            updated: true
        });
    } catch (error: unknown) {
        console.error("Error updating activity:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Update failed" },
            { status: 500 }
        );
    }
}
