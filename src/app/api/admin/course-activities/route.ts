import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google, sheets_v4 } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getErrorMessage, getOrCreateFolder, getRepositoryFolder, getSheetRange, RepositoryFolder } from "@/lib/driveHelpers";

const SHEET_NAME = "AccredX Activities";
const TARGET_TAB_NAME = "Course Activities";
const HEADERS = [
    "Record ID",
    "Timestamp",
    "Faculty Email",
    "Faculty Name",
    "Academic Year",
    "Branch",
    "Semester",
    "Course Name",
    "Course Code",
    "Document Category",
    "Document Type",
    "Evidence File Name",
    "Drive File URL",
    "Drive File ID",
    "Metadata JSON",
    "Resource Type",
    "External URL",
];

type GoogleSession = {
    accessToken?: string;
    user?: {
        email?: string | null;
    };
};

type AdminCourseActivityUpdateInput = {
    recordId?: unknown;
    row?: unknown;
};

type AdminClients = {
    drive: drive_v3.Drive;
    sheets: sheets_v4.Sheets;
};

type SheetContext = AdminClients & {
    repositoryFolder: RepositoryFolder;
    spreadsheetId: string;
    rows: string[][];
    headers: string[];
    sheetId?: number;
};

type ErrorResult = {
    error: NextResponse;
};

function isErrorResult(result: ErrorResult | unknown): result is ErrorResult {
    return Boolean(result && typeof result === "object" && "error" in result);
}

function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const allowList = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
    return allowList.includes(email.toLowerCase());
}

function rowToObject(row: string[], headers: string[]): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
        obj[header] = String(row[index] ?? "");
    });
    return obj;
}

function getRowValue(row: string[], headerIndexes: Map<string, number>, header: string): string {
    const index = headerIndexes.get(header);
    return index === undefined ? "" : String(row[index] ?? "");
}

async function getCourseActivitiesSpreadsheet(
    drive: drive_v3.Drive,
    repositoryFolderId: string
): Promise<string | undefined> {
    const sheetSearch = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${SHEET_NAME}' and '${repositoryFolderId}' in parents and trashed=false`,
        fields: "files(id, name)",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    return sheetSearch.data.files?.[0]?.id ?? undefined;
}

async function getAdminClients(): Promise<AdminClients | ErrorResult> {
    const session = await getServerSession(authOptions);
    const googleSession = session as (typeof session & GoogleSession);

    if (!isAdminEmail(googleSession?.user?.email)) {
        return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
    }

    if (!googleSession?.accessToken) {
        return { error: NextResponse.json({ error: "Google session expired. Please sign in again." }, { status: 401 }) };
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: googleSession.accessToken });

    return {
        drive: google.drive({ version: "v3", auth }),
        sheets: google.sheets({ version: "v4", auth }),
    };
}

async function getSheetContext(): Promise<SheetContext | ErrorResult> {
    const clients = await getAdminClients();
    if (isErrorResult(clients)) return clients;

    const { drive, sheets } = clients;
    const repositoryFolder = await getRepositoryFolder(drive);
    const spreadsheetId = await getCourseActivitiesSpreadsheet(drive, repositoryFolder.id);

    if (!spreadsheetId) {
        return { drive, sheets, repositoryFolder, spreadsheetId: "", rows: [] as string[][], headers: HEADERS };
    }

    const spreadsheetData = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties",
    });
    const targetSheet = spreadsheetData.data.sheets?.find(
        (sheet) => sheet.properties?.title === TARGET_TAB_NAME
    );

    if (!targetSheet) {
        return { drive, sheets, repositoryFolder, spreadsheetId, rows: [] as string[][], headers: HEADERS };
    }

    const valuesResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: getSheetRange(TARGET_TAB_NAME, "A:Z"),
    });
    const rows = (valuesResponse.data.values ?? []) as string[][];
    const headers = rows[0]?.map((header) => String(header).trim()) ?? HEADERS;

    const sheetId = targetSheet.properties?.sheetId;
    return {
        drive,
        sheets,
        repositoryFolder,
        spreadsheetId,
        rows,
        headers,
        sheetId: typeof sheetId === "number" ? sheetId : undefined,
    };
}

export async function GET() {
    try {
        const context = await getSheetContext();
        if (isErrorResult(context)) return context.error;

        const rows = context.rows.length > 0 ? context.rows.slice(1) : [];
        return NextResponse.json({
            headers: context.headers,
            rows: rows.map((row: string[]) => rowToObject(row, context.headers)),
        });
    } catch (error) {
        console.error("Admin GET course activities error:", error);
        return NextResponse.json(
            { error: getErrorMessage(error, "Failed to load course activities.") },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const input = (await req.json()) as AdminCourseActivityUpdateInput;
        const recordId = typeof input.recordId === "string" ? input.recordId : "";
        const rowInput = input.row && typeof input.row === "object" && !Array.isArray(input.row)
            ? input.row as Record<string, string>
            : {};

        if (!recordId) {
            return NextResponse.json({ error: "Missing record ID." }, { status: 400 });
        }

        const context = await getSheetContext();
        if (isErrorResult(context)) return context.error;
        if (!context.spreadsheetId || context.rows.length < 2) {
            return NextResponse.json({ error: "Record not found." }, { status: 404 });
        }

        const headerIndexes = new Map<string, number>(
            context.headers.map((header: string, index: number) => [header, index])
        );
        const recordIdIndex = headerIndexes.get("Record ID");
        if (recordIdIndex === undefined) {
            return NextResponse.json({ error: "Record ID column not found." }, { status: 500 });
        }

        const rowIndexToUpdate = context.rows.findIndex(
            (row, index) => index > 0 && String(row[recordIdIndex]) === recordId
        );
        if (rowIndexToUpdate === -1) {
            return NextResponse.json({ error: "Record not found." }, { status: 404 });
        }

        const existingRow = context.rows[rowIndexToUpdate];
        const newRow = [...existingRow];
        context.headers.forEach((header, index) => {
            if (header in rowInput) {
                while (newRow.length <= index) newRow.push("");
                newRow[index] = String(rowInput[header] ?? "");
            }
        });
        newRow[recordIdIndex] = recordId;

        const changedFolderFields = [
            "Academic Year",
            "Branch",
            "Semester",
            "Course Name",
            "Course Code",
            "Document Category",
            "Document Type",
        ].some((header) => getRowValue(existingRow, headerIndexes, header) !== getRowValue(newRow, headerIndexes, header));
        const driveFileId = getRowValue(existingRow, headerIndexes, "Drive File ID");

        if (driveFileId && changedFolderFields) {
            const fileMeta = await context.drive.files.get({
                fileId: driveFileId,
                fields: "parents",
                supportsAllDrives: true,
            });
            const previousParents = fileMeta.data.parents?.join(",") || "";
            const courseActivityRootId = await getOrCreateFolder(context.drive, "Course Activity", context.repositoryFolder.id);
            const yearFolderId = await getOrCreateFolder(context.drive, getRowValue(newRow, headerIndexes, "Academic Year"), courseActivityRootId);
            const branchFolderId = await getOrCreateFolder(context.drive, getRowValue(newRow, headerIndexes, "Branch"), yearFolderId);
            const semesterFolderId = await getOrCreateFolder(context.drive, getRowValue(newRow, headerIndexes, "Semester"), branchFolderId);
            const courseFolderId = await getOrCreateFolder(
                context.drive,
                `${getRowValue(newRow, headerIndexes, "Course Code")} - ${getRowValue(newRow, headerIndexes, "Course Name")}`,
                semesterFolderId
            );
            const categoryFolderId = await getOrCreateFolder(context.drive, getRowValue(newRow, headerIndexes, "Document Category"), courseFolderId);
            const finalFolderId = await getOrCreateFolder(context.drive, getRowValue(newRow, headerIndexes, "Document Type"), categoryFolderId);

            await context.drive.files.update({
                fileId: driveFileId,
                addParents: finalFolderId,
                removeParents: previousParents,
                supportsAllDrives: true,
            });
        }

        const sheetRowNumber = rowIndexToUpdate + 1;
        await context.sheets.spreadsheets.values.update({
            spreadsheetId: context.spreadsheetId,
            range: getSheetRange(TARGET_TAB_NAME, `A${sheetRowNumber}:Z${sheetRowNumber}`),
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin PUT course activities error:", error);
        return NextResponse.json(
            { error: getErrorMessage(error, "Failed to update course activity.") },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const recordId = searchParams.get("id") || "";

        if (!recordId) {
            return NextResponse.json({ error: "Missing record ID." }, { status: 400 });
        }

        const context = await getSheetContext();
        if (isErrorResult(context)) return context.error;
        if (!context.spreadsheetId || context.rows.length < 2 || context.sheetId === undefined) {
            return NextResponse.json({ error: "Record not found." }, { status: 404 });
        }

        const recordIdIndex = context.headers.indexOf("Record ID");
        if (recordIdIndex === -1) {
            return NextResponse.json({ error: "Record ID column not found." }, { status: 500 });
        }

        const rowIndexToDelete = context.rows.findIndex(
            (row: string[], index: number) => index > 0 && String(row[recordIdIndex]) === recordId
        );
        if (rowIndexToDelete === -1) {
            return NextResponse.json({ error: "Record not found." }, { status: 404 });
        }

        await context.sheets.spreadsheets.batchUpdate({
            spreadsheetId: context.spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: context.sheetId,
                                dimension: "ROWS",
                                startIndex: rowIndexToDelete,
                                endIndex: rowIndexToDelete + 1,
                            },
                        },
                    },
                ],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Admin DELETE course activities error:", error);
        return NextResponse.json(
            { error: getErrorMessage(error, "Failed to delete course activity.") },
            { status: 500 }
        );
    }
}
