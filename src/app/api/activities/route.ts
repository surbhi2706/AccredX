import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google, sheets_v4 } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
            id: Date.parse(timestamp),
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
