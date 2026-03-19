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

// ═══════════════════════════════════════════════════════════════════════════
// Staging Functions — Mock implementations (swap with real backend endpoints)
// ═══════════════════════════════════════════════════════════════════════════

// Mock staging data — realistic structure matching places_staging collection
const MOCK_STAGING_DATA = [
    {
        id: "stg_001",
        name: "Kolukkumalai",
        description: "World's highest organic tea estate with breathtaking sunrise views above the clouds at 7,900 ft.",
        latitude: 10.0608,
        longitude: 77.2490,
        watrs_tags: ["Tea Estates", "Hills", "Photography", "Nature"],
        road_access: "4wd_only",
        safety_rating: "moderate",
        safety_notes: "Steep jeep track, not suitable for regular vehicles.",
        image_url: "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&q=80",
        submitter: { name: "Hari D.", email: "hari@example.com", role: "Contributor" },
        status: "pending",
        submitted_at: "2026-03-15T10:30:00Z",
    },
    {
        id: "stg_002",
        name: "Vattakanal",
        description: "Serene hamlet near Kodaikanal with misty waterfalls and lush forest trails.",
        latitude: 10.2209,
        longitude: 77.4893,
        watrs_tags: ["Nature", "Waterfall", "Trekking", "Relaxation"],
        road_access: "paved",
        safety_rating: "high",
        safety_notes: "",
        image_url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80",
        submitter: { name: "Priya S.", email: "priya@example.com", role: "Pathfinder" },
        status: "pending",
        submitted_at: "2026-03-14T14:15:00Z",
    },
    {
        id: "stg_003",
        name: "Parvathamalai",
        description: "Sacred hill with challenging overnight trek and panoramic views from the summit temple.",
        latitude: 12.3833,
        longitude: 78.7833,
        watrs_tags: ["Trekking", "Heritage", "Adventure", "Hills"],
        road_access: "foot_only",
        safety_rating: "low",
        safety_notes: "Steep rocky terrain, torches required for night treks. No phone signal at summit.",
        image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
        submitter: { name: "Karthik R.", email: "karthik@example.com", role: "Contributor" },
        status: "pending",
        submitted_at: "2026-03-13T09:45:00Z",
    },
    {
        id: "stg_004",
        name: "Dhanushkodi",
        description: "Ghost town at India's southeastern tip — ruins, beaches and the Ram Setu viewpoint.",
        latitude: 9.1701,
        longitude: 79.4277,
        watrs_tags: ["Beach", "History", "Ruins", "Photography"],
        road_access: "unpaved",
        safety_rating: "moderate",
        safety_notes: "Sandy roads, high tide can flood parts of the route.",
        image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        submitter: { name: "Meena K.", email: "meena@example.com", role: "Contributor" },
        status: "approved",
        submitted_at: "2026-03-10T08:20:00Z",
        reviewed_at: "2026-03-11T11:00:00Z",
    },
    {
        id: "stg_005",
        name: "Test Submission",
        description: "Low quality submission for testing rejection flow.",
        latitude: 0,
        longitude: 0,
        watrs_tags: [],
        road_access: "paved",
        safety_rating: "high",
        safety_notes: "",
        image_url: "",
        submitter: { name: "Spam Bot", email: "spam@example.com", role: "Explorer" },
        status: "rejected",
        rejection_reason: "Invalid coordinates. No tags selected. Insufficient detail.",
        submitted_at: "2026-03-09T16:00:00Z",
        reviewed_at: "2026-03-09T17:30:00Z",
    },
];

/**
 * Fetch the staging queue for admin moderation.
 * @returns {Promise<{items: Array, stats: {pending: number, approved: number, rejected: number}}>}
 */
export async function getStagingQueue() {
    // TODO: Replace with: const { data } = await api.get("/api/v1/staging");
    await new Promise((resolve) => setTimeout(resolve, 600));

    const items = [...MOCK_STAGING_DATA];
    return {
        items,
        stats: {
            pending: items.filter((i) => i.status === "pending").length,
            approved: items.filter((i) => i.status === "approved").length,
            rejected: items.filter((i) => i.status === "rejected").length,
        },
    };
}

/**
 * Approve a staging item — moves to places_live.
 * @param {string} id
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function approveStagingItem(id) {
    // TODO: Replace with: const { data } = await api.post(`/api/v1/staging/${id}/approve`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, message: `Item ${id} approved and moved to places_live.` };
}

/**
 * Reject a staging item with a reason.
 * @param {string} id
 * @param {string} reason
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function rejectStagingItem(id, reason) {
    // TODO: Replace with: const { data } = await api.post(`/api/v1/staging/${id}/reject`, { reason });
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, message: `Item ${id} rejected.` };
}

/**
 * Edit and approve a staging item — applies edits then moves to places_live.
 * @param {string} id
 * @param {object} edits - Fields to update (watrs_tags, road_access, safety_rating, etc.)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function updateAndApproveStagingItem(id, edits) {
    // TODO: Replace with: const { data } = await api.post(`/api/v1/staging/${id}/edit-approve`, edits);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: `Item ${id} updated and approved.` };
}

export default api;
