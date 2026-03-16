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

// ── Auth token interceptor ─────────────────────────────────────────────────
// Attaches the JWT token from localStorage to every request if available.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("watrs_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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
// Auth Functions — Mock implementations (swap with real backend endpoints)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mock login — simulates backend auth response.
 *
 * Demo accounts:
 *   admin@watrs.dev    → Super-Admin
 *   pathfinder@watrs.dev → Pathfinder
 *   contributor@watrs.dev → Contributor
 *   Any other email    → Explorer
 */
export async function loginUser(email, password) {
    // TODO: Replace with real API call: const { data } = await api.post("/api/v1/auth/login", { email, password });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    // Determine role based on email for demo purposes
    let role = "Explorer";
    let name = "Explorer User";

    if (email.includes("admin")) {
        role = "Super-Admin";
        name = "Admin User";
    } else if (email.includes("pathfinder")) {
        role = "Pathfinder";
        name = "Pathfinder User";
    } else if (email.includes("contributor")) {
        role = "Contributor";
        name = "Contributor User";
    }

    return {
        user: {
            id: "mock_" + Date.now(),
            name,
            email,
            role,
        },
        token: "mock_jwt_" + btoa(email) + "_" + Date.now(),
    };
}

/**
 * Mock register — simulates backend registration.
 * New users get the Explorer role by default.
 */
export async function registerUser(name, email, password) {
    // TODO: Replace with real API call: const { data } = await api.post("/api/v1/auth/register", { name, email, password });

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!name || !email || !password) {
        return { error: "All fields are required." };
    }

    return {
        user: {
            id: "mock_" + Date.now(),
            name,
            email,
            role: "Explorer",
        },
        token: "mock_jwt_" + btoa(email) + "_" + Date.now(),
    };
}

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
