/**
 * src/lib/constants.js
 * ────────────────────
 * Shared constants used across Contribute form and Admin moderation.
 * Single source of truth for WATRS enums and options.
 */

// ── Predefined WATRS tags (strict enum — no free text) ──────────────────────
export const WATRS_TAGS = [
    "Nature", "Waterfall", "Trekking", "Heritage", "Beach",
    "Wildlife", "Tea Estates", "Hills", "Photography", "Adventure",
    "Relaxation", "Boating", "History", "Agriculture", "Ruins",
];

// ── Road access options (matching backend enum) ─────────────────────────────
export const ROAD_ACCESS_OPTIONS = [
    { value: "paved", label: "Paved Road" },
    { value: "unpaved", label: "Unpaved Road" },
    { value: "4wd_only", label: "4WD Only" },
    { value: "foot_only", label: "Foot Only" },
    { value: "off_road", label: "Off-Road" },
];

// ── Safety ratings ──────────────────────────────────────────────────────────
export const SAFETY_RATINGS = [
    { value: "high", label: "High", color: "text-emerald-400" },
    { value: "moderate", label: "Moderate", color: "text-amber-400" },
    { value: "low", label: "Low", color: "text-red-400" },
];

// ── Staging statuses ────────────────────────────────────────────────────────
export const STAGING_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};
