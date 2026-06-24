"use client";

import { useEffect, useState } from "react";
import {
    pmsMapping as defaultPmsMapping,
    pmsCategoryMeta as defaultPmsCategoryMeta,
    pmsSectionGuidance as defaultPmsSectionGuidance,
} from "@/data/pmsMapping";
import type { PmsActivityDefinition, PmsDetailedActivity } from "@/data/pmsMapping";
import { activityFields as defaultActivityFields } from "@/data/formFields";
import type { ActivityField } from "@/data/formFields";

type PmsMappingShape = Record<string, Record<string, PmsActivityDefinition[]>>;

type ConfigShape = {
    pmsMapping: PmsMappingShape;
    pmsCategoryMeta: Record<string, { maxMarks: number }>;
    pmsSectionGuidance: Record<string, string>;
    activityFields: Record<string, ActivityField[]>;
    academicYears: string[];
};

const FALLBACK_ACADEMIC_YEARS = ["2025-26", "2024-25", "2023-24"];

// Bundled defaults so the app renders correctly immediately, even before the
// live config sheet has loaded (or if it's unreachable). Once /api/config
// resolves, `current` is swapped and every component using useConfigSync()
// re-renders with the live data.
let current: ConfigShape = {
    pmsMapping: defaultPmsMapping as PmsMappingShape,
    pmsCategoryMeta: defaultPmsCategoryMeta,
    pmsSectionGuidance: defaultPmsSectionGuidance,
    activityFields: defaultActivityFields,
    academicYears: FALLBACK_ACADEMIC_YEARS,
};

let fetchStarted = false;
let listeners: Array<() => void> = [];

function notifyListeners() {
    console.log("NOTIFYING", listeners.length, "listeners");
    listeners.forEach((listener) => listener());
}

async function loadRemoteConfig() {
    fetchStarted = false;

    try {
        const res = await fetch("/api/config", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();

        if (json?.pmsMapping && json?.activityFields) {

            console.log("CONFIG YEARS:", json.academicYears);

            current = {
                pmsMapping: json.pmsMapping,
                pmsCategoryMeta: json.pmsCategoryMeta ?? current.pmsCategoryMeta,
                pmsSectionGuidance: json.pmsSectionGuidance ?? current.pmsSectionGuidance,
                activityFields: json.activityFields,
                academicYears: json.academicYears ?? current.academicYears,
            };

            console.log("UPDATED STORE YEARS:", current.academicYears);

            notifyListeners();
        }
    } catch (error) {
        console.warn("Could not load live config sheet, using bundled defaults.", error);
    }
}

/**
 * Call this once near the top of any component that reads from this store
 * (getPmsCategories, getActivityGroups, getActivityFields, etc). It kicks off
 * the one-time fetch of /api/config and re-renders the component once live
 * data arrives, so config sheet edits show up without a page reload.
 */
export function useConfigSync() {
    const [, forceRerender] = useState(0);

    useEffect(() => {
        const listener = () => {
    console.log("FORCING RERENDER");
    forceRerender((tick) => tick + 1);
};
        listeners.push(listener);
        loadRemoteConfig();
        return () => {
            listeners = listeners.filter((entry) => entry !== listener);
        };
    }, []);
}

export function getPmsCategories(): string[] {
    const fromActivities = Object.keys(current.pmsMapping);
    const fromCategoryList = Object.keys(current.pmsCategoryMeta);
    return Array.from(new Set([...fromCategoryList, ...fromActivities]));
}

export function getAcademicYears(): string[] {
    console.log("CURRENT YEARS IN STORE:", current.academicYears);
    return current.academicYears;
}

export function getActivityGroups(category: string): Array<{
    section: string;
    activities: PmsDetailedActivity[];
}> {
    const categoryData = current.pmsMapping[category];
    if (!categoryData) return [];

    return Object.entries(categoryData).map(([section, activities]) => ({
        section,
        activities: activities.map((item) => ({ ...item, section })),
    }));
}

export function findDetailedActivity(
    category: string,
    activityName: string
): PmsDetailedActivity | null {
    return (
        getActivityGroups(category)
            .flatMap((group) => group.activities)
            .find((item) => item.activity === activityName) ?? null
    );
}

export function getPmsCategoryMeta(category: string): { maxMarks: number } | undefined {
    return current.pmsCategoryMeta[category];
}

export function getPmsSectionGuidance(section: string): string | undefined {
    return current.pmsSectionGuidance[section];
}

export function getActivityFields(activity?: string | null): ActivityField[] {
    if (!activity) return [];
    return current.activityFields[activity] ?? [];
}
