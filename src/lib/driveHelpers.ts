import { drive_v3 } from "googleapis";

export function getErrorStatus(error: unknown): number | undefined {
    if (!error || typeof error !== "object") return undefined;

    const candidate = error as {
        code?: unknown;
        response?: { status?: unknown };
    };
    const status = candidate.code ?? candidate.response?.status;

    return typeof status === "number" ? status : undefined;
}

export function getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === "object") {
        const anyError = error as any;
        if (anyError.response?.data?.error?.message) {
            return anyError.response.data.error.message;
        }
        if (anyError.message) {
            return anyError.message;
        }
    }
    return fallback;
}

export function getSheetRange(sheetName: string, range: string): string {
    const escapedSheetName = sheetName.replace(/'/g, "''");
    return `'${escapedSheetName}'!${range}`;
}

export async function getOrCreateFolder(
    drive: drive_v3.Drive,
    folderName: string,
    parentFolderId: string
): Promise<string> {
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

export type RepositoryFolder = {
    id: string;
    warning: string;
};

export async function getRepositoryFolder(
    drive: drive_v3.Drive
): Promise<RepositoryFolder> {
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
                    "Activity saved successfully. Evidence has been uploaded to your Google Drive and metadata has been recorded in your AccredX Activities sheet.",
            };
        }
    }

    return {
        id: await getOrCreateFolder(drive, "AccredX Repository", "root"),
        warning: "",
    };
}
