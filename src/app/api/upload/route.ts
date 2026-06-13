import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google } from "googleapis";
import fs from "fs";
import path from "path";
import os from "os";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function getErrorStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;

    const candidate = error as {
        code?: unknown;
        response?: { status?: unknown };
    };
    const status = candidate.code ?? candidate.response?.status;

    return typeof status === "number" ? status : undefined;
}

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

async function getOrCreateFolder(drive: drive_v3.Drive, folderName: string, parentFolderId: string): Promise<string> {
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
    } else {
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
}

type RepositoryFolder = {
    id: string;
    warning: string;
};

async function getRepositoryFolder(drive: drive_v3.Drive): Promise<RepositoryFolder> {
    const configuredFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    if (configuredFolderId) {
        try {
            const configuredFolder = await drive.files.get({
                fileId: configuredFolderId,
                fields: "id, name, mimeType",
                supportsAllDrives: true,
            });

            if (configuredFolder.data.mimeType !== "application/vnd.google-apps.folder") {
                throw new Error("GOOGLE_DRIVE_FOLDER_ID does not point to a Google Drive folder.");
            }

            return {
                id: configuredFolder.data.id as string,
                warning: "",
            };
        } catch (error: unknown) {
            const status = getErrorStatus(error);

            if (status !== 403 && status !== 404) {
                throw error;
            }

            console.warn(
                `Configured Google Drive repository returned ${status}; using the signed-in account's repository.`
            );

            return {
                id: await getOrCreateFolder(drive, "AccredX Repository", "root"),
                warning:
                    "The configured shared Drive folder was unavailable, so this evidence was saved to your personal AccredX Repository.",
            };
        }
    }

    return {
        id: await getOrCreateFolder(drive, "AccredX Repository", "root"),
        warning: "",
    };
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

        const drive = google.drive({
            version: "v3",
            auth,
        });

        const sheets = google.sheets({
            version: "v4",
            auth,
        });

        let finalFolderId = null;
        let repositoryFolderId = "";
        let repositoryWarning = "";

        try {
            const repositoryFolder = await getRepositoryFolder(drive);
            repositoryFolderId = repositoryFolder.id;
            repositoryWarning = repositoryFolder.warning;
            const yearFolderId = academicYear ? await getOrCreateFolder(drive, academicYear, repositoryFolderId) : repositoryFolderId;
            const categoryFolderId = pmsCategory ? await getOrCreateFolder(drive, pmsCategory, yearFolderId) : yearFolderId;
            finalFolderId = activityType ? await getOrCreateFolder(drive, activityType, categoryFolderId) : categoryFolderId;
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

        // Handle Google Sheets
        try {
            const sheetName = "AccredX Activities";
            
            // Keep the activity index beside the academic-year folders.
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
                // Create new spreadsheet
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
                "Drive File ID", "Description", "Remarks", "PMS Section",
                "Metadata JSON"
            ];

            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "Sheet1!A1:R1",
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [expectedHeaders]
                }
            });

            // Append Data
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: "Sheet1!A:R",
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
                            mappedRemarks,
                            parsedMetadata.pmsSection || "",
                            JSON.stringify(parsedMetadata)
                        ]
                    ]
                }
            });

            sheetsSuccess = true;

        } catch (sheetError: unknown) {
            console.error("Error updating Google Sheets:", sheetError);
            sheetsErrorMsg = getErrorMessage(sheetError, "Unknown error");
        }

        console.log("Upload successful");

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
        console.error("Error during file upload:", error);

        return NextResponse.json(
            { 
                error: "Upload failed", 
                details: getErrorMessage(error, "Unknown error")
            },
            { status: 500 }
        );
    }
}
