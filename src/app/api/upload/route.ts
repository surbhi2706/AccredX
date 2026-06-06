import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import os from "os";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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