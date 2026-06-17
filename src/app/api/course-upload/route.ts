import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google, sheets_v4 } from "googleapis";
import fs from "fs";
import path from "path";
import os from "os";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getErrorStatus, getErrorMessage, getOrCreateFolder, getRepositoryFolder } from "@/lib/driveHelpers";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file = formData.get("file") as File;
        const academicYear = (formData.get("academicYear") as string)?.trim() || "";
        const branch = (formData.get("branch") as string)?.trim() || "";
        const semester = (formData.get("semester") as string)?.trim() || "";
        const courseName = (formData.get("courseName") as string)?.trim() || "";
        const courseCode = (formData.get("courseCode") as string)?.trim() || "";
        const documentCategory = (formData.get("documentCategory") as string)?.trim() || "";
        const documentType = (formData.get("documentType") as string)?.trim() || "";
        const metadata = (formData.get("metadata") as string)?.trim() || "{}";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        if (!academicYear || !branch || !semester || !courseName || !courseCode || !documentCategory || !documentType) {
            return NextResponse.json({ error: "Missing required course activity folder metadata" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const googleSession = session as (typeof session & {
            accessToken?: string;
            error?: string;
        });

        if (!googleSession || !googleSession.accessToken || googleSession.error) {
            return NextResponse.json(
                { error: "Your Google session has expired. Please sign out and sign in again." },
                { status: 401 }
            );
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        auth.setCredentials({ access_token: googleSession.accessToken });

        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });

        let finalFolderId = null;
        let repositoryFolderId = "";
        let repositoryWarning = "";

        // 1. Create Nested Folder Structure
        try {
            const repositoryFolder = await getRepositoryFolder(drive);
            repositoryFolderId = repositoryFolder.id;
            repositoryWarning = repositoryFolder.warning;

            const courseActivityRootId = await getOrCreateFolder(drive, "Course Activity", repositoryFolderId);
            const yearFolderId = await getOrCreateFolder(drive, academicYear, courseActivityRootId);
            const branchFolderId = await getOrCreateFolder(drive, branch, yearFolderId);
            const semesterFolderId = await getOrCreateFolder(drive, semester, branchFolderId);
            const courseFolderId = await getOrCreateFolder(drive, `${courseCode} - ${courseName}`, semesterFolderId);
            const categoryFolderId = await getOrCreateFolder(drive, documentCategory, courseFolderId);
            finalFolderId = await getOrCreateFolder(drive, documentType, categoryFolderId);
        } catch (folderError: unknown) {
            console.error("Error creating folder structure:", folderError);
            const status = getErrorStatus(folderError);

            if (status === 401) {
                return NextResponse.json(
                    { error: "Your Google authorization has expired. Please sign out and sign in again." },
                    { status: 401 }
                );
            }

            if (status === 403 || status === 404) {
                return NextResponse.json(
                    {
                        error:
                            "The configured Google Drive repository is unavailable. Share it with the signed-in account, verify GOOGLE_DRIVE_FOLDER_ID, then sign out and sign in again.",
                    },
                    { status: 403 }
                );
            }

            throw new Error(getErrorMessage(folderError, "Failed to create folder structure in Google Drive."));
        }

        // 2. Upload File to Drive
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);

        fs.writeFileSync(tempPath, buffer);

        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: finalFolderId ? [finalFolderId] : undefined,
            },
            media: {
                mimeType: file.type,
                body: fs.createReadStream(tempPath),
            },
            supportsAllDrives: true,
        });

        fs.unlinkSync(tempPath);

        let sheetsSuccess = false;
        let sheetsErrorMsg = "";

        // 3. Handle Google Sheets Metadata Update
        try {
            const sheetName = "AccredX Activities";
            const targetTabName = "Course Activities";
            
            // Search for existing AccredX Activities spreadsheet
            const sheetSearch = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${sheetName}' and '${repositoryFolderId}' in parents and trashed=false`,
                fields: "files(id, name)",
                spaces: "drive",
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
            });

            let spreadsheetId = "";

            if (sheetSearch.data.files && sheetSearch.data.files.length > 0) {
                spreadsheetId = sheetSearch.data.files[0].id as string;
            } else {
                // Create new spreadsheet if not exists
                const sheetCreate = await drive.files.create({
                    requestBody: {
                        name: sheetName,
                        mimeType: "application/vnd.google-apps.spreadsheet",
                        parents: [repositoryFolderId],
                    },
                    fields: "id",
                    supportsAllDrives: true,
                });
                spreadsheetId = sheetCreate.data.id as string;
            }

            // Ensure "Course Activities" tab exists
            const spreadsheetData = await sheets.spreadsheets.get({
                spreadsheetId,
                fields: "sheets.properties.title"
            });
            const existingTabs = spreadsheetData.data.sheets?.map(s => s.properties?.title) || [];
            
            const expectedHeaders = [
                "Timestamp", "Faculty Email", "Faculty Name", "Academic Year", 
                "Branch", "Semester", "Course Name", "Course Code", "Document Category",
                "Document Type", "Evidence File Name", "Drive File URL", 
                "Drive File ID", "Metadata JSON"
            ];

            if (!existingTabs.includes(targetTabName)) {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId,
                    requestBody: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: targetTabName
                                }
                            }
                        }]
                    }
                });
                // Initialize headers
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `${targetTabName}!A1:Z1`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [expectedHeaders]
                    }
                });
            }

            const driveFileId = response.data.id;
            const driveFileUrl = `https://drive.google.com/file/d/${driveFileId}/view`;
            const facultyName = googleSession.user?.name || "Unknown Faculty";
            const facultyEmail = googleSession.user?.email || "unknown@example.com";
            const timestamp = new Date().toISOString();

            let parsedMetadata: Record<string, string> = {};
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (e) {
                console.error("Failed to parse metadata", e);
            }

            // Append Data
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${targetTabName}!A:Z`,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                requestBody: {
                    values: [
                        [
                            timestamp,
                            facultyEmail,
                            facultyName,
                            academicYear,
                            branch,
                            semester,
                            courseName,
                            courseCode,
                            documentCategory,
                            documentType,
                            file.name,
                            driveFileUrl,
                            driveFileId,
                            JSON.stringify(parsedMetadata)
                        ]
                    ]
                }
            });

            sheetsSuccess = true;

        } catch (sheetError: unknown) {
            console.error("Error updating Google Sheets:", sheetError);
            sheetsErrorMsg = getErrorMessage(sheetError, "Unknown error updating Course Activities spreadsheet");
        }

        console.log("Course Activity Upload successful to folder:", finalFolderId);

        return NextResponse.json({
            success: true,
            fileId: response.data.id,
            folderId: finalFolderId,
            repositoryFolderId,
            repositoryWarning,
            sheetsSuccess,
            sheetsError: sheetsErrorMsg
        });
    } catch (error: unknown) {
        console.error("Error during course activity upload:", error);

        return NextResponse.json(
            { 
                error: "Course Activity Upload failed", 
                details: getErrorMessage(error, "Unknown error")
            },
            { status: 500 }
        );
    }
}
