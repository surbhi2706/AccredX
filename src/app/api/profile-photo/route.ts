import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Readable } from "stream";

type GoogleSession = Session & {
  accessToken?: string;
};

async function getSessionAuth(session: GoogleSession) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: session.accessToken });
  return auth;
}

export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("id");
  if (!fileId) {
    return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
  }

  const session = (await getServerSession(authOptions)) as GoogleSession | null;
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const auth = await getSessionAuth(session);
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.get({
      fileId,
      alt: "media",
      supportsAllDrives: true,
    }, { responseType: "stream" as const });

    const headers: Record<string, string> = {
      "Content-Type": response.headers["content-type"] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    return new NextResponse(response.data as unknown as ReadableStream, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    console.error("Profile photo proxy error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve profile photo." },
      { status: 500 }
    );
  }
}
