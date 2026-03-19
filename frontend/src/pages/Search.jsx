/**
 * src/pages/Search.jsx
 * ────────────────────
 * Recommendation results page with interactive search controls.
 *
 * Features:
 *   • Dynamic radius slider (10–200 km)
 *   • Tag filter chips (WATRS_TAGS from constants)
 *   • Base location override (preset cities + GPS)
 *   • PlaceCard grid with loading / error / empty states
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Search as SearchIcon,
    Loader2,
    MapPinOff,
    Compass,
    AlertCircle,
    SlidersHorizontal,
    MapPin,
    Navigation,
    Tag,
    X,
} from "lucide-react";
import { getRecommendations } from "../lib/api";
import { WATRS_TAGS } from "../lib/constants";
import { cn } from "../lib/utils";
import PlaceCard from "../components/PlaceCard";

// ── Preset cities (lat, lon) ────────────────────────────────────────────────
const PRESET_CITIES = [
    { name: "Trichy", lat: 10.7905, lon: 78.7047 },
    { name: "Madurai", lat: 9.9252, lon: 78.1198 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    { name: "Kochi", lat: 9.9312, lon: 76.2673 },
];

// ── Default coords: Trichy ─────────────────────────────────────────────────
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

    // ── Search controls ─────────────────────────────────────────────────────
    const [radius, setRadius] = useState(50);
    const [selectedTags, setSelectedTags] = useState([]);
    const [activeCity, setActiveCity] = useState(null); // null = GPS or default
    const isInitialMount = useRef(true);

    // ── Fetch recommendations ───────────────────────────────────────────────
    const fetchResults = useCallback(async (lat, lon, rad, tags) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRecommendations(lat, lon, rad, tags);
            setResults(data.results || []);
            setTotalCandidates(data.total_candidates || 0);
            setWarnings(data.warnings || []);
        } catch (err) {
            setError("Failed to fetch recommendations. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Geolocation on mount ────────────────────────────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) {
            setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON, source: "default" });
            fetchResults(DEFAULT_LAT, DEFAULT_LON, radius, selectedTags);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                setCoords({ lat, lon, source: "gps" });
                fetchResults(lat, lon, radius, selectedTags);
            },
            () => {
                setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON, source: "default" });
                fetchResults(DEFAULT_LAT, DEFAULT_LON, radius, selectedTags);
            },
            { timeout: 8000, enableHighAccuracy: false }
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Re-fetch when controls change (skip initial mount) ──────────────────
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (coords) {
            fetchResults(coords.lat, coords.lon, radius, selectedTags);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [radius, selectedTags, coords]);

    // ── Tag toggle ──────────────────────────────────────────────────────────
    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const clearAllTags = () => setSelectedTags([]);

    // ── City preset selection ───────────────────────────────────────────────
    const selectCity = (city) => {
        setActiveCity(city.name);
        setCoords({ lat: city.lat, lon: city.lon, source: "preset" });
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) return;
        setActiveCity(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: "gps" });
            },
            () => {
                setCoords({ lat: DEFAULT_LAT, lon: DEFAULT_LON, source: "default" });
            },
            { timeout: 8000 }
        );
    };

    // ── Location label ──────────────────────────────────────────────────────
    const locationLabel = activeCity
        ? activeCity
        : coords?.source === "gps"
            ? "Your Location"
            : "Trichy (default)";

    return (
        <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* ── Header ──────────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
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
                                    Weather-aware recommendations · {locationLabel}
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

                {/* ── Filter Bar ──────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-5 mb-6 space-y-5"
                >
                    {/* Row 1: Location + Radius */}
                    <div className="flex flex-col lg:flex-row gap-5">
                        {/* Location presets */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2.5">
                                <MapPin className="w-4 h-4 text-primary-400" />
                                <span className="text-xs font-medium text-gray-400">Base Location</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {/* GPS button */}
                                <button
                                    onClick={useMyLocation}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all duration-200",
                                        !activeCity && coords?.source === "gps"
                                            ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                    )}
                                >
                                    <Navigation className="w-3 h-3" />
                                    My Location
                                </button>
                                {/* City presets */}
                                {PRESET_CITIES.map((city) => (
                                    <button
                                        key={city.name}
                                        onClick={() => selectCity(city)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs border transition-all duration-200",
                                            activeCity === city.name
                                                ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                        )}
                                    >
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Radius slider */}
                        <div className="lg:w-64">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-primary-400" />
                                    <span className="text-xs font-medium text-gray-400">Radius</span>
                                </div>
                                <span className="text-sm font-semibold text-white">{radius} km</span>
                            </div>
                            <input
                                type="range"
                                min={10}
                                max={200}
                                step={5}
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:h-4
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-primary-500
                                    [&::-webkit-slider-thumb]:shadow-lg
                                    [&::-webkit-slider-thumb]:shadow-primary-500/30
                                    [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-moz-range-thumb]:w-4
                                    [&::-moz-range-thumb]:h-4
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-primary-500
                                    [&::-moz-range-thumb]:border-0
                                    [&::-moz-range-thumb]:cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                                <span>10 km</span>
                                <span>200 km</span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Tag filters */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary-400" />
                                <span className="text-xs font-medium text-gray-400">Vibe Filter</span>
                                {selectedTags.length > 0 && (
                                    <span className="text-[10px] text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">
                                        {selectedTags.length} selected
                                    </span>
                                )}
                            </div>
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={clearAllTags}
                                    className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {WATRS_TAGS.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={cn(
                                            "px-2.5 py-1 rounded-lg text-xs border transition-all duration-200",
                                            isSelected
                                                ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                        )}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
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
                            onClick={() => coords && fetchResults(coords.lat, coords.lon, radius, selectedTags)}
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
                            Try expanding your search radius, removing tag filters, or selecting a different base location.
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
