import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import os from "os";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getOrCreateFolder(drive: any, folderName: string, parentFolderId: string): Promise<string> {
    if (!folderName) return parentFolderId;

    const escapedFolderName = folderName.trim().replace(/'/g, "\\'");
    const query = `mimeType='application/vnd.google-apps.folder' and name='${escapedFolderName}' and '${parentFolderId}' in parents and trashed=false`;

    const folderSearch = await drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
    });

    if (folderSearch.data.files && folderSearch.data.files.length > 0) {
        return folderSearch.data.files[0].id as string;
    } else {
        const folderCreate = await drive.files.create({
            requestBody: {
                name: folderName.trim(),
                mimeType: "application/vnd.google-apps.folder",
                parents: [parentFolderId],
            },
            fields: "id",
        });
        return folderCreate.data.id as string;
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file = formData.get("file") as File;
        const academicYear = (formData.get("academicYear") as string)?.trim() || "";
        const pmsCategory = (formData.get("pmsCategory") as string)?.trim() || "";
        const activityType = (formData.get("activityType") as string)?.trim() || "";
        const metadata = (formData.get("metadata") as string)?.trim() || "{}";

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);

        if (!session || !(session as any).accessToken) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        auth.setCredentials({ access_token: (session as any).accessToken });

        const drive = google.drive({
            version: "v3",
            auth,
        });

        const sheets = google.sheets({
            version: "v4",
            auth,
        });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const tempPath = path.join(
            os.tmpdir(),
            `${Date.now()}-${file.name}`
        );

        fs.writeFileSync(tempPath, buffer);

        let finalFolderId = null;

        try {
            const rootFolderId = await getOrCreateFolder(drive, "AccredX", "root");
            const yearFolderId = academicYear ? await getOrCreateFolder(drive, academicYear, rootFolderId) : rootFolderId;
            const categoryFolderId = pmsCategory ? await getOrCreateFolder(drive, pmsCategory, yearFolderId) : yearFolderId;
            finalFolderId = activityType ? await getOrCreateFolder(drive, activityType, categoryFolderId) : categoryFolderId;
        } catch (folderError) {
            console.error("Error creating folder structure:", folderError);
            throw new Error("Failed to create folder structure in Google Drive.");
        }

        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: finalFolderId ? [finalFolderId] : undefined,
            },
            media: {
                mimeType: file.type,
                body: fs.createReadStream(tempPath),
            },
        });

        fs.unlinkSync(tempPath);

        let sheetsSuccess = false;
        let sheetsErrorMsg = "";

        // Handle Google Sheets
        try {
            const rootFolderId = await getOrCreateFolder(drive, "AccredX", "root");
            const sheetName = "AccredX Activities";
            
            // Search for existing spreadsheet in the root folder
            const sheetSearch = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${sheetName}' and '${rootFolderId}' in parents and trashed=false`,
                fields: "files(id, name)",
                spaces: "drive",
            });

            let spreadsheetId = "";
            let isNewSheet = false;

            if (sheetSearch.data.files && sheetSearch.data.files.length > 0) {
                spreadsheetId = sheetSearch.data.files[0].id as string;
            } else {
                // Create new spreadsheet
                const sheetCreate = await drive.files.create({
                    requestBody: {
                        name: sheetName,
                        mimeType: "application/vnd.google-apps.spreadsheet",
                        parents: [rootFolderId],
                    },
                    fields: "id",
                });
                spreadsheetId = sheetCreate.data.id as string;
                isNewSheet = true;
            }

            const driveFileId = response.data.id;
            const driveFileUrl = `https://drive.google.com/file/d/${driveFileId}/view`;
            const facultyName = session.user?.name || "Unknown Faculty";
            const facultyEmail = session.user?.email || "unknown@example.com";
            const timestamp = new Date().toISOString();

            let parsedMetadata: Record<string, string> = {};
            try {
                parsedMetadata = JSON.parse(metadata);
            } catch (e) {
                console.error("Failed to parse metadata", e);
            }

            const extractField = (keys: string[]) => {
                for (const key of keys) {
                    if (parsedMetadata[key]) return parsedMetadata[key];
                }
                return "";
            };

            const mappedTitle = extractField(["title", "paperTitle", "courseName", "projectTitle", "seminarTitle", "workshopTitle", "eventName", "activityTitle", "hackathonName", "bookTitle", "chapterTitle", "patentTitle", "workTitle", "subjectName", "materialTitle", "contentTitle", "methodName", "practiceTitle", "bosTitle", "trackName", "sessionTitle", "programName", "departmentName", "committeeName", "organizationName", "instituteOrganization", "lectureTitle", "awardTitle"]);
            const mappedRole = extractField(["role", "roleDetails", "piDetails", "coordinationDetails", "roleInEvent", "bosMembership", "iqacRole", "roleName"]);
            const mappedLevel = extractField(["quartile", "indexing", "level", "journalList", "indexingType", "studentEngagement"]);
            const mappedDuration = extractField(["duration", "dates", "date", "sessionsEngaged", "implementationYear", "year", "academicYear", "semester", "publicationYear", "startYear"]);
            const mappedOutcome = extractField(["outcomes", "learningOutcomes", "achievements", "expectedOutcome", "projectOutcomes", "skillsDeveloped"]);
            const mappedDescription = extractField(["description", "practiceDescription", "projectDescription", "scope", "details", "contribution", "deliverables", "activitySupported"]);
            const mappedRemarks = extractField(["remarks", "feedbackProvided", "analysis", "suggestedImprovements"]);

            const expectedHeaders = [
                "Timestamp", "Faculty Email", "Faculty Name", "Academic Year", 
                "PMS Category", "Activity Type", "Title", "Role", "Level", 
                "Duration", "Outcome", "Evidence File Name", "Drive File URL", 
                "Drive File ID", "Description", "Remarks"
            ];
            
            // Check headers explicitly
            let needsHeaders = false;
            if (isNewSheet) {
                needsHeaders = true;
            } else {
                try {
                    const headerResponse = await sheets.spreadsheets.values.get({
                        spreadsheetId,
                        range: "Sheet1!A1:P1",
                    });
                    const rows = headerResponse.data.values;
                    if (!rows || rows.length === 0 || rows[0].length === 0) {
                        needsHeaders = true;
                    }
                } catch (err) {
                    console.error("Error reading headers, assuming needs headers:", err);
                    needsHeaders = true;
                }
            }

            if (needsHeaders) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: "Sheet1!A1:P1",
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        values: [expectedHeaders]
                    }
                });
            }

            // Append Data
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: "Sheet1!A:P",
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                requestBody: {
                    values: [
                        [
                            timestamp,
                            facultyEmail,
                            facultyName,
                            academicYear,
                            pmsCategory,
                            activityType,
                            mappedTitle,
                            mappedRole,
                            mappedLevel,
                            mappedDuration,
                            mappedOutcome,
                            file.name,
                            driveFileUrl,
                            driveFileId,
                            mappedDescription,
                            mappedRemarks
                        ]
                    ]
                }
            });

            sheetsSuccess = true;

        } catch (sheetError: any) {
            console.error("Error updating Google Sheets:", sheetError);
            sheetsErrorMsg = sheetError?.message || sheetError?.toString() || "Unknown error";
        }

        console.log("Upload successful");

        return NextResponse.json({
            success: true,
            fileId: response.data.id,
            folderId: finalFolderId,
            sheetsSuccess,
            sheetsError: sheetsErrorMsg
        });
    } catch (error: any) {
        console.error("Error during file upload:", error);

        return NextResponse.json(
            { 
                error: "Upload failed", 
                details: error?.message || error?.toString() || "Unknown error"
            },
            { status: 500 }
        );
    }
}