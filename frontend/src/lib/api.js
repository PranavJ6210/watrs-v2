/**
 * src/lib/api.js
 * ──────────────
 * Axios-based API bridge for the WATRS v2.0 backend.
 *
 * Base URL is loaded from VITE_API_BASE_URL (defaults to localhost:8000).
 * All functions handle network errors gracefully — they log a warning
 * and return safe fallback values instead of crashing the app.
 */

import axios from "axios";

// ── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
    timeout: 10_000, // 10 s
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Response interceptor (global error logging) ────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
            console.warn(
                "⚠️ WATRS API unreachable — is the backend running?",
                error.message
            );
        } else if (error.response) {
            console.warn(
                `⚠️ API Error ${error.response.status}:`,
                error.response.data?.detail || error.message
            );
        } else {
            console.warn("⚠️ Unexpected API error:", error.message);
        }
        return Promise.reject(error);
    }
);

// ═══════════════════════════════════════════════════════════════════════════
// API Functions — matching backend endpoints
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch weather-aware place recommendations.
 *
 * @param {number} lat       - Latitude
 * @param {number} lon       - Longitude
 * @param {number} radius    - Search radius in km (default 10)
 * @param {string[]} tags    - User preference tags
 * @returns {Promise<{results: Array, total_candidates: number, warnings: string[]}>}
 */
export async function getRecommendations(lat, lon, radius = 10, tags = []) {
    try {
        const params = { lat, lon, radius_km: radius };
        if (tags.length > 0) {
            params.tags = tags.join(",");
        }

        const { data } = await api.get("/api/v1/recommendations", { params });
        return data;
    } catch (error) {
        console.warn("getRecommendations failed:", error.message);
        return { results: [], total_candidates: 0, warnings: ["Backend unreachable"] };
    }
}

/**
 * Submit feedback for a place (LIKE / DISLIKE / SAFETY_ALERT).
 *
 * @param {string} placeId      - MongoDB ObjectId as string
 * @param {"like"|"dislike"|"safety_alert"} feedbackType
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendFeedback(placeId, feedbackType) {
    try {
        const { data } = await api.post(`/api/v1/feedback/${placeId}`, {
            feedback_type: feedbackType,
        });
        return data;
    } catch (error) {
        console.warn("sendFeedback failed:", error.message);
        return { success: false, message: "Could not submit feedback" };
    }
}

export default api;
