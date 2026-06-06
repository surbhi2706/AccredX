import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const credentialsPath = path.join(
            process.cwd(),
            "credentials.json"
        );

        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ["https://www.googleapis.com/auth/drive"],
        });

        const drive = google.drive({
            version: "v3",
            auth,
        });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const tempPath = path.join(
            process.cwd(),
            "temp-upload.pdf"
        );

        fs.writeFileSync(tempPath, buffer);

        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
            },
            media: {
                mimeType: file.type,
                body: fs.createReadStream(tempPath),
            },
        });

        fs.unlinkSync(tempPath);

        return NextResponse.json({
            success: true,
            fileId: response.data.id,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}