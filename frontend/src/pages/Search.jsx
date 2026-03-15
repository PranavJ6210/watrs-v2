/**
 * src/pages/Search.jsx
 * ────────────────────
 * Recommendation results page.
 *
 * Flow:
 *   1. Request browser geolocation (fallback: Trichy 10.7905, 78.7047)
 *   2. Call getRecommendations(lat, lon, 50000)
 *   3. Render PlaceCard grid with loading / error / empty states
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Search as SearchIcon,
    Loader2,
    MapPinOff,
    Compass,
    AlertCircle,
} from "lucide-react";
import { getRecommendations } from "../lib/api";
import PlaceCard from "../components/PlaceCard";

// ── Default coords: Trichy (Central Tamil Nadu) ────────────────────────────
const DEFAULT_LAT = 10.7905;
const DEFAULT_LON = 78.7047;

export default function Search() {
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [totalCandidates, setTotalCandidates] = useState(0);
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coords, setCoords] = useState(null);

    // ── Fetch recommendations ──────────────────────────────────────────────
    const fetchResults = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRecommendations(lat, lon, 500);
            setResults(data.results || []);
            setTotalCandidates(data.total_candidates || 0);
            setWarnings(data.warnings || []);
        } catch (err) {
            setError("Failed to fetch recommendations. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Geolocation on mount ───────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) {
            setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON, source: "default" });
            fetchResults(DEFAULT_LAT, DEFAULT_LON);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                setCoords({ lat, lon, source: "gps" });
                fetchResults(lat, lon);
            },
            () => {
                // Denied or error → fall back to Trichy
                setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON, source: "default" });
                fetchResults(DEFAULT_LAT, DEFAULT_LON);
            },
            { timeout: 8000, enableHighAccuracy: false }
        );
    }, [fetchResults]);

    return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* ── Header ──────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-600/20">
                                <SearchIcon className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Hidden Gems Near You
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Weather-aware recommendations
                                    {coords &&
                                        ` · ${coords.source === "gps" ? "Your location" : "Trichy (default)"}`}
                                </p>
                            </div>
                        </div>

                        {!loading && results.length > 0 && (
                            <div className="text-sm text-gray-500">
                                {results.length} of {totalCandidates} places scored
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Warnings ────────────────────────────────────────────────── */}
                {warnings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                    >
                        {warnings.map((w, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-amber-400">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {w}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* ── Loading state ───────────────────────────────────────────── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-10 h-10 text-primary-400 animate-spin mb-4" />
                        <p className="text-gray-400">
                            {!coords ? "Getting your location…" : "Finding hidden gems…"}
                        </p>
                    </div>
                )}

                {/* ── Error state ─────────────────────────────────────────────── */}
                {!loading && error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-32"
                    >
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <p className="text-gray-300 text-lg font-medium mb-2">
                            Connection Error
                        </p>
                        <p className="text-gray-500 text-sm text-center max-w-md">
                            {error}
                        </p>
                        <button
                            onClick={() => coords && fetchResults(coords.lat, coords.lon)}
                            className="mt-6 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* ── Empty state ─────────────────────────────────────────────── */}
                {!loading && !error && results.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-32"
                    >
                        <MapPinOff className="w-12 h-12 text-gray-600 mb-4" />
                        <p className="text-gray-300 text-lg font-medium mb-2">
                            No hidden gems found… yet
                        </p>
                        <p className="text-gray-500 text-sm text-center max-w-md">
                            Try expanding your search radius or checking back later when
                            weather conditions change.
                        </p>
                    </motion.div>
                )}

                {/* ── Results grid ────────────────────────────────────────────── */}
                {!loading && !error && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {results.map((item, idx) => (
                            <motion.div
                                key={item.place?._id || item.place?.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.4 }}
                            >
                                <PlaceCard
                                    place={item.place}
                                    score={item.score}
                                    distMeters={item.dist_meters}
                                    weatherFallback={item.weather_fallback}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
