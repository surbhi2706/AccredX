import { NextRequest, NextResponse } from "next/server";
import { google, sheets_v4 } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
    pmsMapping as fallbackPmsMapping,
    pmsCategoryMeta as fallbackPmsCategoryMeta,
    pmsSectionGuidance as fallbackPmsSectionGuidance,
} from "@/data/pmsMapping";
import type { PmsActivityDefinition } from "@/data/pmsMapping";
import { activityFields as fallbackActivityFields } from "@/data/formFields";
import type { ActivityField, FieldType } from "@/data/formFields";

export const dynamic = "force-dynamic";

// The Config sheet has 4 tabs with these exact names.
const TAB_CATEGORIES = "Categories";
const TAB_ACTIVITIES = "Activities";
const TAB_FIELDS = "Fields";
const TAB_ACADEMIC_YEARS = "AcademicYears";
const ALL_TABS = [TAB_CATEGORIES, TAB_ACTIVITIES, TAB_FIELDS, TAB_ACADEMIC_YEARS] as const;
type TabName = (typeof ALL_TABS)[number];

const FALLBACK_ACADEMIC_YEARS = ["2025-26", "2024-25", "2023-24"];

function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const allowList = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
    return allowList.includes(email.toLowerCase());
}

const VALID_FIELD_TYPES: FieldType[] = [
    "text",
    "number",
    "date",
    "select",
    "textarea",
    "file",
];

type PmsMappingShape = Record<string, Record<string, PmsActivityDefinition[]>>;

function toBool(value: string): boolean {
    return value.trim().toUpperCase() === "TRUE";
}

function toNumberOrUndefined(value: string): number | undefined {
    if (!value.trim()) return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
}

function getSpreadsheetId(): string | undefined {
    return process.env.CONFIG_SPREADSHEET_ID;
}

// A service account is used here (not the signed-in faculty member's own
// Google login) because the Config sheet is one single shared sheet that
// every faculty member's browser needs to be able to write to — sharing a
// service account's access is much simpler than sharing real Drive
// permissions with every individual account.
function getServiceAccountAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (!email || !rawKey) return null;

    // .env files can't hold real newlines, so the key is stored with \n
    // escape sequences — undo that here.
    const key = rawKey.replace(/\\n/g, "\n");
    return new google.auth.JWT({
        email,
        key,
        scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/spreadsheets.readonly",
            "https://www.googleapis.com/auth/drive.readonly",
        ],
    });
}

function getSheetsClient(): sheets_v4.Sheets | null {
    const auth = getServiceAccountAuth();
    if (!auth) return null;
    return google.sheets({ version: "v4", auth });
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
    if (rows.length === 0) return [];
    const headers = rows[0].map((h) => String(h ?? "").trim());
    return rows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            obj[header] = String(row[index] ?? "").trim();
        });
        return obj;
    });
}

function buildPmsCategoryMeta(
    rows: Record<string, string>[]
): Record<string, { maxMarks: number }> {
    const result: Record<string, { maxMarks: number }> = {};
    for (const row of rows) {
        if (!row.Category) continue;
        result[row.Category] = { maxMarks: Number(row.MaxMarks) || 0 };
    }
    return result;
}

function buildPmsMappingAndGuidance(rows: Record<string, string>[]): {
    pmsMapping: PmsMappingShape;
    pmsSectionGuidance: Record<string, string>;
} {
    const pmsMapping: PmsMappingShape = {};
    const pmsSectionGuidance: Record<string, string> = {};

    for (const row of rows) {
        const { Category, Section, Activity, NBA, SubCriterion, Guidance } = row;
        console.log("CATEGORY:", Category);
        if (!Category || !Section || !Activity) continue;

        if (!pmsMapping[Category]) pmsMapping[Category] = {};
        if (!pmsMapping[Category][Section]) pmsMapping[Category][Section] = [];

        pmsMapping[Category][Section].push({
            activity: Activity,
            nba: NBA || "",
            subCriterion: SubCriterion || "",
        });

        if (Guidance && !pmsSectionGuidance[Section]) {
            pmsSectionGuidance[Section] = Guidance;
        }
    }

    return { pmsMapping, pmsSectionGuidance };
}

function buildActivityFields(
    rows: Record<string, string>[]
): Record<string, ActivityField[]> {
    const result: Record<string, ActivityField[]> = {};

    for (const row of rows) {
        const { Activity, FieldName, Label } = row;
        if (!Activity || !FieldName || !Label) continue;

        const rawType = (row.Type || "text").trim() as FieldType;
        const type = VALID_FIELD_TYPES.includes(rawType) ? rawType : "text";

        const field: ActivityField = {
            name: FieldName,
            label: Label,
            type,
            required: toBool(row.Required || ""),
            fullWidth: toBool(row.FullWidth || ""),
            disabled: toBool(row.Disabled || ""),
        };

        if (row.Options?.trim()) {
            field.options = row.Options.split(";").map((opt) => opt.trim()).filter(Boolean);
        }
        if (row.HelperText?.trim()) field.helperText = row.HelperText.trim();
        if (row.Placeholder?.trim()) field.placeholder = row.Placeholder.trim();
        if (row.Pattern?.trim()) field.pattern = row.Pattern.trim();

        const min = toNumberOrUndefined(row.Min || "");
        const max = toNumberOrUndefined(row.Max || "");
        const step = toNumberOrUndefined(row.Step || "");
        if (min !== undefined) field.min = min;
        if (max !== undefined) field.max = max;
        if (step !== undefined) field.step = step;

        if (!result[Activity]) result[Activity] = [];
        result[Activity].push(field);
    }

    return result;
}

function buildAcademicYears(rows: Record<string, string>[]): string[] {
    return rows
        .map((row) => row.Year?.trim())
        .filter((year): year is string => Boolean(year));
}

function fallbackPayload(reason: string) {
    return NextResponse.json({
        pmsMapping: fallbackPmsMapping,
        pmsCategoryMeta: fallbackPmsCategoryMeta,
        pmsSectionGuidance: fallbackPmsSectionGuidance,
        activityFields: fallbackActivityFields,
        academicYears: FALLBACK_ACADEMIC_YEARS,
        source: "fallback",
        reason,
    });
}

async function debugListTabs(sheets: sheets_v4.Sheets, spreadsheetId: string) {
    const meta = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties",
    });
    return meta.data.sheets?.map((s) => ({
        title: s.properties?.title,
        titleLength: s.properties?.title?.length,
        titleCharCodes: s.properties?.title?.split("").map((c) => c.charCodeAt(0)),
    }))
}

async function getSheetIdByTitle(
    sheets: sheets_v4.Sheets,
    spreadsheetId: string,
    title: string
): Promise<number | null> {
    const meta = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties",
    });
    const match = meta.data.sheets?.find((s) => s.properties?.title === title);
    return match?.properties?.sheetId ?? null;
}

export async function GET() {
    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    if (!sheets || !spreadsheetId) {
        return fallbackPayload(
            "Config sheet isn't wired up yet (missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY / CONFIG_SPREADSHEET_ID) — using bundled defaults."
        );
    }

    const debugTabs = await debugListTabs(sheets, spreadsheetId);
    console.log("=== ACTUAL TABS IN YOUR SHEET ===");
    console.log(JSON.stringify(debugTabs, null, 2));
    console.log("==================================")



    try {
        const [catRes, actRes, fldRes, yearRes] = await Promise.all([
            sheets.spreadsheets.values.get({ spreadsheetId, range: `${TAB_CATEGORIES}!A:Z` }),
            sheets.spreadsheets.values.get({ spreadsheetId, range: `${TAB_ACTIVITIES}!A:Z` }),
            sheets.spreadsheets.values.get({ spreadsheetId, range: `${TAB_FIELDS}!A:Z` }),
            sheets.spreadsheets.values.get({ spreadsheetId, range: `${TAB_ACADEMIC_YEARS}!A:Z` }),
        ]);

        const categoriesRows = rowsToObjects((catRes.data.values ?? []) as string[][]);
        const activitiesRows = rowsToObjects((actRes.data.values ?? []) as string[][]);
        const fieldsRows = rowsToObjects((fldRes.data.values ?? []) as string[][]);
        const yearsRows = rowsToObjects((yearRes.data.values ?? []) as string[][]);

        const pmsCategoryMeta = buildPmsCategoryMeta(categoriesRows);
        const { pmsMapping, pmsSectionGuidance } = buildPmsMappingAndGuidance(activitiesRows);
        const activityFields = buildActivityFields(fieldsRows);

        console.log("=== PARSE DEBUG ===");
        console.log("activitiesRows (parsed):", JSON.stringify(activitiesRows, null, 2));
        console.log("fieldsRows (parsed):", JSON.stringify(fieldsRows, null, 2));
        console.log("pmsMapping keys:", Object.keys(pmsMapping));
        console.log("activityFields keys:", Object.keys(activityFields));
        console.log("===================");
        const academicYearsFromSheet = buildAcademicYears(yearsRows);
        const academicYears = academicYearsFromSheet.length > 0
            ? academicYearsFromSheet
            : FALLBACK_ACADEMIC_YEARS;

        if (Object.keys(pmsMapping).length === 0 || Object.keys(activityFields).length === 0) {
            return fallbackPayload("Config sheet has no usable rows yet — using bundled defaults.");
        }

        return NextResponse.json({
            pmsMapping,
            pmsCategoryMeta,
            pmsSectionGuidance,
            activityFields,
            academicYears,
            // Raw rows too, so the Manage Config screen can list/add/delete
            // without needing to re-flatten the nested shapes above.
            rawRows: {
                [TAB_CATEGORIES]: categoriesRows,
                [TAB_ACTIVITIES]: activitiesRows,
                [TAB_FIELDS]: fieldsRows,
                [TAB_ACADEMIC_YEARS]: yearsRows,
            },
            source: "sheet",
        });
    } catch (error) {
        console.error("Error reading live config sheet:", error);
        return fallbackPayload(
            error instanceof Error ? error.message : "Unknown error reading config sheet."
        );
    }
}

type ConfigWriteInput = {
    tab?: unknown;
    row?: unknown;
};

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!isAdminEmail(session?.user?.email)) {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    if (!sheets || !spreadsheetId) {
        return NextResponse.json(
            { error: "The live config sheet isn't set up yet. See SETUP.md." },
            { status: 503 }
        );
    }

    try {
        const input = (await req.json()) as ConfigWriteInput;
        const tab = typeof input.tab === "string" ? input.tab : "";

        if (!ALL_TABS.includes(tab as TabName)) {
            return NextResponse.json({ error: "Unknown config tab." }, { status: 400 });
        }

        const row = Array.isArray(input.row) ? input.row.map((v) => String(v ?? "")) : [];
        if (row.every((cell) => !cell.trim())) {
            return NextResponse.json({ error: "Row is empty." }, { status: 400 });
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${tab}!A:Z`,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: { values: [row] },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error writing to config sheet:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unable to save row." },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!isAdminEmail(session?.user?.email)) {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const sheets = getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    if (!sheets || !spreadsheetId) {
        return NextResponse.json(
            { error: "The live config sheet isn't set up yet. See SETUP.md." },
            { status: 503 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const tab = searchParams.get("tab") || "";
        const matchParam = searchParams.get("match") || "";

        if (!ALL_TABS.includes(tab as TabName)) {
            return NextResponse.json({ error: "Unknown config tab." }, { status: 400 });
        }

        let matchCriteria: Record<string, string> = {};
        try {
            matchCriteria = JSON.parse(matchParam);
        } catch {
            return NextResponse.json({ error: "Invalid match criteria." }, { status: 400 });
        }

        const valuesRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${tab}!A:Z`,
        });
        const rows = (valuesRes.data.values ?? []) as string[][];

        if (rows.length < 2) {
            return NextResponse.json({ error: "Nothing to delete." }, { status: 404 });
        }

        const headers = rows[0].map((h) => String(h).trim());
        const dataRowIndex = rows.slice(1).findIndex((row) =>
            Object.entries(matchCriteria).every(([key, value]) => {
                const index = headers.indexOf(key);
                return index !== -1 && String(row[index] ?? "").trim() === value;
            })
        );

        if (dataRowIndex === -1) {
            return NextResponse.json(
                { error: "Row not found (it may have already been deleted)." },
                { status: 404 }
            );
        }

        const sheetId = await getSheetIdByTitle(sheets, spreadsheetId, tab);
        if (sheetId === null) {
            return NextResponse.json(
                { error: `Could not find a tab named "${tab}" in the config sheet.` },
                { status: 404 }
            );
        }

        // dataRowIndex is 0-based within the data rows (header excluded), and
        // the sheet's row 0 IS the header, so the actual sheet row to delete
        // is dataRowIndex + 1.
        const sheetRowIndex = dataRowIndex + 1;

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId,
                                dimension: "ROWS",
                                startIndex: sheetRowIndex,
                                endIndex: sheetRowIndex + 1,
                            },
                        },
                    },
                ],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting from config sheet:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unable to delete row." },
            { status: 500 }
        );
    }
}