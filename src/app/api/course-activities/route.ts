import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google, sheets_v4 } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getErrorStatus, getErrorMessage, getOrCreateFolder, getRepositoryFolder } from "@/lib/driveHelpers";

const SHEET_NAME = "AccredX Activities";
const TARGET_TAB_NAME = "Course Activities";

async function getCourseActivitiesSpreadsheet(drive: drive_v3.Drive, repositoryFolderId: string): Promise<string | undefined> {
    const sheetSearch = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${SHEET_NAME}' and '${repositoryFolderId}' in parents and trashed=false`,
        fields: "files(id, name)",
        spaces: "drive",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    if (sheetSearch.data.files && sheetSearch.data.files.length > 0) {
        return sheetSearch.data.files[0].id as string;
    }
    return undefined;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const googleSession = session as any;

        if (!googleSession || !googleSession.accessToken || !googleSession.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: googleSession.accessToken });

        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });

        const repositoryFolder = await getRepositoryFolder(drive);
        const spreadsheetId = await getCourseActivitiesSpreadsheet(drive, repositoryFolder.id);

        if (!spreadsheetId) {
            return NextResponse.json({ activities: [] });
        }

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${TARGET_TAB_NAME}!A:Z`,
        });

        const rows = (valuesResponse.data.values ?? []) as string[][];

        if (rows.length < 2) {
            return NextResponse.json({ activities: [] });
        }

        const headers = rows[0];
        const headerIndexes = new Map(headers.map((h, i) => [String(h).trim(), i]));
        
        const rowValue = (row: string[], header: string) => {
            const index = headerIndexes.get(header);
            return index !== undefined ? String(row[index] ?? "") : "";
        };

        const signedInEmail = googleSession.user.email.toLowerCase();
        
        const activities = rows.slice(1).map((row, index) => {
            return {
                rowIndex: index + 1, // Store the physical row index for future reference if needed
                recordId: rowValue(row, "Record ID"),
                timestamp: rowValue(row, "Timestamp"),
                facultyEmail: rowValue(row, "Faculty Email"),
                facultyName: rowValue(row, "Faculty Name"),
                academicYear: rowValue(row, "Academic Year"),
                branch: rowValue(row, "Branch"),
                semester: rowValue(row, "Semester"),
                courseName: rowValue(row, "Course Name"),
                courseCode: rowValue(row, "Course Code"),
                documentCategory: rowValue(row, "Document Category"),
                documentType: rowValue(row, "Document Type"),
                evidenceFileName: rowValue(row, "Evidence File Name"),
                driveFileUrl: rowValue(row, "Drive File URL"),
                driveFileId: rowValue(row, "Drive File ID"),
                metadataJson: rowValue(row, "Metadata JSON"),
                resourceType: rowValue(row, "Resource Type") || (row[15] ?? ""),
                externalUrl: rowValue(row, "External URL") || (row[16] ?? "")
            };
        }).filter(a => a.facultyEmail.toLowerCase() === signedInEmail && a.recordId);

        return NextResponse.json({ activities });
    } catch (error) {
        console.error("GET course activities error:", error);
        return NextResponse.json({ error: getErrorMessage(error, "Failed to load course activities") }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const recordId = searchParams.get("id");

        if (!recordId) {
            return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const googleSession = session as any;

        if (!googleSession || !googleSession.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: googleSession.accessToken });

        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });

        const repositoryFolder = await getRepositoryFolder(drive);
        const spreadsheetId = await getCourseActivitiesSpreadsheet(drive, repositoryFolder.id);

        if (!spreadsheetId) {
            return NextResponse.json({ error: "Spreadsheet not found" }, { status: 404 });
        }

        // We need the sheet ID to delete a row
        const spreadsheetData = await sheets.spreadsheets.get({
            spreadsheetId,
            includeGridData: false
        });
        
        const targetSheet = spreadsheetData.data.sheets?.find(s => s.properties?.title === TARGET_TAB_NAME);
        if (!targetSheet || targetSheet.properties?.sheetId === undefined) {
            return NextResponse.json({ error: "Target sheet not found" }, { status: 404 });
        }
        
        const sheetId = targetSheet.properties.sheetId;

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${TARGET_TAB_NAME}!A:Z`,
        });

        const rows = (valuesResponse.data.values ?? []) as string[][];
        if (rows.length < 2) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        const headers = rows[0];
        const recordIdIndex = headers.findIndex(h => String(h).trim() === "Record ID");

        if (recordIdIndex === -1) {
            return NextResponse.json({ error: "Record ID column not found" }, { status: 500 });
        }

        const rowIndexToDelete = rows.findIndex((row, idx) => idx > 0 && String(row[recordIdIndex]) === recordId);

        if (rowIndexToDelete === -1) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: rowIndexToDelete,
                                endIndex: rowIndexToDelete + 1
                            }
                        }
                    }
                ]
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("DELETE course activity error:", error);
        return NextResponse.json({ error: getErrorMessage(error, "Failed to delete course activity") }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { recordId, academicYear, branch, semester, courseName, courseCode, documentCategory, documentType, description } = body;

        if (!recordId) {
            return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const googleSession = session as any;

        if (!googleSession || !googleSession.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: googleSession.accessToken });

        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });

        const repositoryFolder = await getRepositoryFolder(drive);
        const spreadsheetId = await getCourseActivitiesSpreadsheet(drive, repositoryFolder.id);

        if (!spreadsheetId) {
            return NextResponse.json({ error: "Spreadsheet not found" }, { status: 404 });
        }

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${TARGET_TAB_NAME}!A:Z`,
        });

        const rows = (valuesResponse.data.values ?? []) as string[][];
        if (rows.length < 2) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        const headers = rows[0];
        const headerIndexes = new Map(headers.map((h, i) => [String(h).trim(), i]));
        const recordIdIndex = headerIndexes.get("Record ID");

        if (recordIdIndex === undefined) {
            return NextResponse.json({ error: "Record ID column not found" }, { status: 500 });
        }

        const rowIndexToUpdate = rows.findIndex((row, idx) => idx > 0 && String(row[recordIdIndex]) === recordId);

        if (rowIndexToUpdate === -1) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }

        const existingRow = rows[rowIndexToUpdate];
        
        const rowValue = (header: string) => {
            const index = headerIndexes.get(header);
            return index !== undefined ? String(existingRow[index] ?? "") : "";
        };

        const existingYear = rowValue("Academic Year");
        const existingBranch = rowValue("Branch");
        const existingSemester = rowValue("Semester");
        const existingCourseCode = rowValue("Course Code");
        const existingCourseName = rowValue("Course Name");
        const existingCategory = rowValue("Document Category");
        const existingDocType = rowValue("Document Type");
        const driveFileId = rowValue("Drive File ID");
        const metadataJsonStr = rowValue("Metadata JSON");
        
        let metadata = {};
        try {
            metadata = JSON.parse(metadataJsonStr || "{}");
        } catch(e) {}
        
        const newMetadata = { ...metadata, description };

        let fileMoved = false;

        // Determine if folder hierarchy changed
        if (driveFileId && (
            existingYear !== academicYear ||
            existingBranch !== branch ||
            existingSemester !== semester ||
            existingCourseCode !== courseCode ||
            existingCourseName !== courseName ||
            existingCategory !== documentCategory ||
            existingDocType !== documentType
        )) {
            // Find current parents
            const fileMeta = await drive.files.get({
                fileId: driveFileId,
                fields: "parents",
                supportsAllDrives: true
            });
            const previousParents = fileMeta.data.parents?.join(",") || "";

            // Create new folder structure
            const courseActivityRootId = await getOrCreateFolder(drive, "Course Activity", repositoryFolder.id);
            const yearFolderId = await getOrCreateFolder(drive, academicYear, courseActivityRootId);
            const branchFolderId = await getOrCreateFolder(drive, branch, yearFolderId);
            const semesterFolderId = await getOrCreateFolder(drive, semester, branchFolderId);
            const courseFolderId = await getOrCreateFolder(drive, `${courseCode} - ${courseName}`, semesterFolderId);
            const categoryFolderId = await getOrCreateFolder(drive, documentCategory, courseFolderId);
            const finalFolderId = await getOrCreateFolder(drive, documentType, categoryFolderId);

            // Move the file
            await drive.files.update({
                fileId: driveFileId,
                addParents: finalFolderId,
                removeParents: previousParents,
                supportsAllDrives: true
            });
            
            fileMoved = true;
        }

        // Update the row
        const newRow = [...existingRow];
        
        const updateField = (header: string, val: string) => {
            const idx = headerIndexes.get(header);
            if (idx !== undefined) {
                while (newRow.length <= idx) newRow.push("");
                newRow[idx] = val;
            }
        };

        updateField("Academic Year", academicYear);
        updateField("Branch", branch);
        updateField("Semester", semester);
        updateField("Course Name", courseName);
        updateField("Course Code", courseCode);
        updateField("Document Category", documentCategory);
        updateField("Document Type", documentType);
        updateField("Metadata JSON", JSON.stringify(newMetadata));

        // Rows in Sheets API are 1-indexed, so index 0 is row 1.
        // rowIndexToUpdate is the index in the array `rows`. 
        // e.g., if it's index 1 in `rows`, it corresponds to row 2 in the sheet.
        const sheetRowNumber = rowIndexToUpdate + 1;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${TARGET_TAB_NAME}!A${sheetRowNumber}:Z${sheetRowNumber}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [newRow]
            }
        });

        return NextResponse.json({ success: true, fileMoved });
    } catch (error) {
        console.error("PUT course activity error:", error);
        return NextResponse.json({ error: getErrorMessage(error, "Failed to update course activity") }, { status: 500 });
    }
}
