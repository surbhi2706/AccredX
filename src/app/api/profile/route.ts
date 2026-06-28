import { NextRequest, NextResponse } from "next/server";
import { drive_v3, google, sheets_v4 } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getErrorMessage, getRepositoryFolder } from "@/lib/driveHelpers";
import { readLocalProfile, writeLocalProfile } from "@/lib/localDb";

const REPOSITORY_NAME = "AccredX Repository";
const SPREADSHEET_NAME = "AccredX Activities";
const SHEET_NAME = "Profile";

const HEADERS = [
    "Timestamp",
    "Faculty Email",
    "Faculty Name",
    "Employee ID",
    "Department",
    "School/Institute",
    "Designation",
    "Administrative Designation",
    "Official Email",
    "Alternate Email",
    "Phone Number",
    "Office Address",
    "Date of Joining",
    "Career Experience",
    "Industry Experience",
    "Teaching Experience",
    "Profile JSON",
];

type GoogleSession = {
    accessToken?: string;
    error?: string;
    user?: {
        email?: string | null;
        name?: string | null;
    };
};

function getSessionAuth(session: GoogleSession) {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: session.accessToken });
    return auth;
}

async function findRepositoryFolderId(drive: drive_v3.Drive): Promise<string | undefined> {
    const repositorySearch = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${REPOSITORY_NAME}' and 'root' in parents and trashed=false`,
        fields: "files(id)",
        spaces: "drive",
    });
    return repositorySearch.data.files?.[0]?.id ?? undefined;
}

async function findSpreadsheetId(drive: drive_v3.Drive, repositoryFolderId: string): Promise<string | undefined> {
    const sheetSearch = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.spreadsheet' and name='${SPREADSHEET_NAME}' and '${repositoryFolderId}' in parents and trashed=false`,
        fields: "files(id)",
        spaces: "drive",
    });
    return sheetSearch.data.files?.[0]?.id ?? undefined;
}

async function getOrCreateSpreadsheetId(
    drive: drive_v3.Drive,
    repositoryFolderId: string
): Promise<string> {
    const existingId = await findSpreadsheetId(drive, repositoryFolderId);
    if (existingId) return existingId;

    const spreadsheet = await drive.files.create({
        requestBody: {
            name: SPREADSHEET_NAME,
            mimeType: "application/vnd.google-apps.spreadsheet",
            parents: [repositoryFolderId],
        },
        fields: "id",
    });

    if (!spreadsheet.data.id) {
        throw new Error("Google Drive did not return a spreadsheet ID.");
    }

    return spreadsheet.data.id;
}

async function ensureProfileSheetExists(sheets: sheets_v4.Sheets, spreadsheetId: string) {
    // Check if the Profile sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = spreadsheet.data.sheets?.some(
        (sheet) => sheet.properties?.title === SHEET_NAME
    );

    if (!sheetExists) {
        // Create the Profile sheet
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: SHEET_NAME,
                            },
                        },
                    },
                ],
            },
        });

        // Add headers
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${SHEET_NAME}!A1:Q1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [HEADERS] },
        });
    }
}

function rowValue(row: string[], headerIndexes: Map<string, number>, header: string): string {
    const index = headerIndexes.get(header);
    return index === undefined ? "" : String(row[index] ?? "");
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const googleSession = session as (typeof session & GoogleSession);

        if (!googleSession || !googleSession.accessToken || googleSession.error || !googleSession.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const auth = getSessionAuth(googleSession);
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });

        const repositoryFolderId = await findRepositoryFolderId(drive);
        if (!repositoryFolderId) return NextResponse.json({ profile: null });

        const spreadsheetId = await findSpreadsheetId(drive, repositoryFolderId);
        if (!spreadsheetId) return NextResponse.json({ profile: null });

        await ensureProfileSheetExists(sheets, spreadsheetId);

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A:Q`,
        });

        const rows = (valuesResponse.data.values ?? []) as string[][];
        if (rows.length < 2) return NextResponse.json({ profile: null });

        const headerIndexes = new Map(rows[0].map((header, index) => [String(header).trim(), index]));
        const signedInEmail = googleSession.user.email.toLowerCase();

        // Find the profile row for the logged-in user
        const profileRow = rows.find(
            (row, index) => index > 0 && rowValue(row, headerIndexes, "Faculty Email").toLowerCase() === signedInEmail
        );

        if (!profileRow) {
            const local = readLocalProfile(signedInEmail);
            return NextResponse.json({ profile: local });
        }

        const profileJsonStr = rowValue(profileRow, headerIndexes, "Profile JSON");
        
        let profile = null;
        if (profileJsonStr) {
            try {
                profile = JSON.parse(profileJsonStr);
            } catch (e) {
                console.error("Failed to parse profile JSON", e);
            }
        }

        // If JSON is invalid or missing, try to reconstruct from columns (fallback)
        if (!profile) {
            profile = {
                fullName: rowValue(profileRow, headerIndexes, "Faculty Name"),
                employeeId: rowValue(profileRow, headerIndexes, "Employee ID"),
                designation: rowValue(profileRow, headerIndexes, "Designation"),
                department: rowValue(profileRow, headerIndexes, "Department"),
                schoolInstitute: rowValue(profileRow, headerIndexes, "School/Institute"),
                officialEmail: rowValue(profileRow, headerIndexes, "Official Email") || signedInEmail,
                alternateEmail: rowValue(profileRow, headerIndexes, "Alternate Email"),
                phoneNumber: rowValue(profileRow, headerIndexes, "Phone Number"),
                officeAddress: rowValue(profileRow, headerIndexes, "Office Address"),
                dateOfJoining: rowValue(profileRow, headerIndexes, "Date of Joining"),
                careerExperience: rowValue(profileRow, headerIndexes, "Career Experience"),
                industryExperience: rowValue(profileRow, headerIndexes, "Industry Experience"),
                teachingExperience: rowValue(profileRow, headerIndexes, "Teaching Experience"),
                administrativeDesignation: rowValue(profileRow, headerIndexes, "Administrative Designation"),
                education: [], // Without JSON, education is lost. That's why Profile JSON is critical.
            };
        }

        // Cache profile locally
        try {
            writeLocalProfile(signedInEmail, profile);
        } catch (e) {
            console.error("Failed to cache profile locally:", e);
        }

        return NextResponse.json({ profile });
    } catch (error: unknown) {
        console.error("Error fetching Google Sheets profile, falling back to local:", error);
        try {
            const session = await getServerSession(authOptions);
            const googleSession = session as (typeof session & GoogleSession);
            if (googleSession?.user?.email) {
                const localProfile = readLocalProfile(googleSession.user.email);
                if (localProfile) {
                    console.log("[LOCAL FALLBACK] Successfully resolved profile from local cache.");
                    return NextResponse.json({ profile: localProfile });
                }
            }
        } catch (localErr) {
            console.error("Local profile fallback read failed:", localErr);
        }
        return NextResponse.json({ profile: null });
    }
}

export async function POST(req: NextRequest) {
    let signedInEmail = "";
    let inputProfile: any = null;
    try {
        const session = await getServerSession(authOptions);
        const googleSession = session as (typeof session & GoogleSession);

        if (!googleSession || !googleSession.accessToken || googleSession.error || !googleSession.user?.email) {
            return NextResponse.json(
                {
                    error: googleSession?.error === "RefreshAccessTokenError"
                        ? "Your Google session has expired. Please sign out and sign in again."
                        : "Unauthorized",
                },
                { status: 401 }
            );
        }

        inputProfile = await req.json();
        signedInEmail = googleSession.user.email.toLowerCase();
        
        const auth = getSessionAuth(googleSession);
        const drive = google.drive({ version: "v3", auth });
        const sheets = google.sheets({ version: "v4", auth });

        const { id: repositoryFolderId } = await getRepositoryFolder(drive);
        const spreadsheetId = await getOrCreateSpreadsheetId(drive, repositoryFolderId);

        await ensureProfileSheetExists(sheets, spreadsheetId);

        const valuesResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${SHEET_NAME}!A:Q`,
        });

        const rows = (valuesResponse.data.values ?? []) as string[][];
        const headerIndexes = new Map(
            (rows[0] || HEADERS).map((header, index) => [String(header).trim(), index])
        );
        signedInEmail = googleSession.user.email.toLowerCase();
        
        let rowIndexToUpdate = -1;
        let existingRow: string[] = [];

        for (let i = 1; i < rows.length; i++) {
            if (rowValue(rows[i], headerIndexes, "Faculty Email").toLowerCase() === signedInEmail) {
                rowIndexToUpdate = i;
                existingRow = rows[i];
                break;
            }
        }

        const timestamp = new Date().toISOString();
        
        const buildRow = (existing: string[]) => {
            const newRow = [...existing];
            const updateField = (header: string, val: string) => {
                const idx = headerIndexes.get(header);
                if (idx !== undefined) {
                    while (newRow.length <= idx) newRow.push("");
                    newRow[idx] = val || "";
                }
            };

            updateField("Timestamp", timestamp);
            updateField("Faculty Email", signedInEmail);
            updateField("Faculty Name", inputProfile.fullName);
            updateField("Employee ID", inputProfile.employeeId);
            updateField("Department", inputProfile.department);
            updateField("School/Institute", inputProfile.schoolInstitute);
            updateField("Designation", inputProfile.designation);
            updateField("Administrative Designation", inputProfile.administrativeDesignation);
            updateField("Official Email", inputProfile.officialEmail || signedInEmail);
            updateField("Alternate Email", inputProfile.alternateEmail);
            updateField("Phone Number", inputProfile.phoneNumber);
            updateField("Office Address", inputProfile.officeAddress);
            updateField("Date of Joining", inputProfile.dateOfJoining);
            updateField("Career Experience", inputProfile.careerExperience);
            updateField("Industry Experience", inputProfile.industryExperience);
            updateField("Teaching Experience", inputProfile.teachingExperience);
            updateField("Profile JSON", JSON.stringify(inputProfile));

            return newRow;
        };

        if (rowIndexToUpdate !== -1) {
            // Update existing row
            const updatedRow = buildRow(existingRow);
            const rangeToUpdate = `${SHEET_NAME}!A${rowIndexToUpdate + 1}:Q${rowIndexToUpdate + 1}`;
            
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: rangeToUpdate,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [updatedRow] },
            });
        } else {
            // Append new row
            const newRow = buildRow([]);
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${SHEET_NAME}!A:Q`,
                valueInputOption: "USER_ENTERED",
                insertDataOption: "INSERT_ROWS",
                requestBody: { values: [newRow] },
            });
        }

        // Cache profile locally
        try {
            writeLocalProfile(signedInEmail, inputProfile);
        } catch (localErr) {
            console.error("Local profile cache save failed:", localErr);
        }

        return NextResponse.json({ success: true, profile: inputProfile });
    } catch (error: unknown) {
        console.error("Error saving profile to Google Sheets, falling back to local:", error);
        try {
            writeLocalProfile(signedInEmail, inputProfile);
            return NextResponse.json({
                success: true,
                profile: inputProfile,
                warning: "Saved locally. Google Sheets was unreachable."
            });
        } catch (localErr) {
            console.error("Local profile fallback write failed:", localErr);
            return NextResponse.json(
                {
                    error: "Failed to save profile",
                    details: getErrorMessage(error, "Unable to save profile."),
                },
                { status: 500 }
            );
        }
    }
}
