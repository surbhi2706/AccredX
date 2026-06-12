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

        console.log("Upload successful");

        return NextResponse.json({
            success: true,
            fileId: response.data.id,
            folderId: finalFolderId,
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