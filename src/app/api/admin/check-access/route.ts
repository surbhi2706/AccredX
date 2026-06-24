import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Without this, Next.js can statically render this GET handler at build
// time (since it takes no params and reads no request data directly),
// which would freeze its response — including "no session found" if that's
// what was true the first time it ran — for every request after that.
export const dynamic = "force-dynamic";

function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const allowList = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
    return allowList.includes(email.toLowerCase());
}

export async function GET() {
    const session = await getServerSession(authOptions);
    return NextResponse.json({ isAdmin: isAdminEmail(session?.user?.email) });
}