import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "src/data/local_cache.json");

function ensureCacheFile() {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(CACHE_FILE)) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify({ profiles: {}, activities: {} }, null, 4));
    }
}

export function readLocalProfile(email: string) {
    try {
        ensureCacheFile();
        const raw = fs.readFileSync(CACHE_FILE, "utf-8");
        const data = JSON.parse(raw);
        return data.profiles?.[email.toLowerCase()] || null;
    } catch (e) {
        console.error("Error reading local profile:", e);
        return null;
    }
}

export function writeLocalProfile(email: string, profile: any) {
    try {
        ensureCacheFile();
        const raw = fs.readFileSync(CACHE_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (!data.profiles) data.profiles = {};
        data.profiles[email.toLowerCase()] = profile;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 4));
        console.log(`[LOCAL DB WRITE] Saved profile locally for ${email}`);
    } catch (e) {
        console.error("Error writing local profile:", e);
    }
}

export function readLocalActivities(email: string) {
    try {
        ensureCacheFile();
        const raw = fs.readFileSync(CACHE_FILE, "utf-8");
        const data = JSON.parse(raw);
        return data.activities?.[email.toLowerCase()] || [];
    } catch (e) {
        console.error("Error reading local activities:", e);
        return [];
    }
}

export function writeLocalActivity(email: string, activity: any) {
    try {
        ensureCacheFile();
        const raw = fs.readFileSync(CACHE_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (!data.activities) data.activities = {};
        const key = email.toLowerCase();
        if (!data.activities[key]) data.activities[key] = [];
        
        // Remove existing activity if ID matches to prevent duplicate appends on updates
        data.activities[key] = data.activities[key].filter((a: any) => Number(a.id) !== Number(activity.id));
        data.activities[key].push(activity);
        
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 4));
        console.log(`[LOCAL DB WRITE] Saved activity locally for ${email}`);
    } catch (e) {
        console.error("Error writing local activity:", e);
    }
}

export function deleteLocalActivity(email: string, activityId: number) {
    try {
        ensureCacheFile();
        const raw = fs.readFileSync(CACHE_FILE, "utf-8");
        const data = JSON.parse(raw);
        const key = email.toLowerCase();
        if (data.activities?.[key]) {
            data.activities[key] = data.activities[key].filter((a: any) => Number(a.id) !== Number(activityId));
            fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 4));
            console.log(`[LOCAL DB DELETE] Deleted activity ${activityId} locally for ${email}`);
        }
    } catch (e) {
        console.error("Error deleting local activity:", e);
    }
}
