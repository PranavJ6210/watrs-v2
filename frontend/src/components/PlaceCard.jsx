/**
 * src/components/PlaceCard.jsx
 * ────────────────────────────
 * Glassmorphism card displaying a recommended place with:
 *   • Hero image with fallback
 *   • Hidden Gem / Off-Road badges
 *   • Weather comfort bar (monthly or live)
 *   • Feedback buttons (LIKE / DISLIKE / SAFETY_ALERT)
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    ThumbsUp,
    ThumbsDown,
    AlertTriangle,
    Gem,
    CarFront,
    Droplets,
    Thermometer,
    MapPin,
    Check,
    Award,
    UserCheck2,
} from "lucide-react";
import { sendFeedback } from "../lib/api";
import { cn } from "../lib/utils";

// ── Month helpers ──────────────────────────────────────────────────────────
const MONTH_ABBR = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const CURRENT_MONTH = MONTH_ABBR[new Date().getMonth()];

// ── Comfort color ──────────────────────────────────────────────────────────
function comfortColor(score) {
    if (score >= 0.75) return "bg-emerald-500";
    if (score >= 0.5) return "bg-amber-500";
    return "bg-red-500";
}

function comfortLabel(score) {
    if (score >= 0.75) return "Great";
    if (score >= 0.5) return "Fair";
    return "Poor";
}

// ── Fallback image ─────────────────────────────────────────────────────────
const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80";

export default function PlaceCard({ place, score, distMeters, weatherFallback }) {
    const [feedbackState, setFeedbackState] = useState(null); // "like" | "dislike" | "safety_alert" | null
    const [submitting, setSubmitting] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Current month's comfort score
    const comfortScore = useMemo(() => {
        if (!place.metrics?.weather_comfort_history) return 0.5;
        const history = place.metrics.weather_comfort_history;
        return history[CURRENT_MONTH] ?? 0.5;
    }, [place]);

    const isHiddenGem = (place.metrics?.hidden_percentile ?? 0) > 0.8;
    const isOffRoad = place.safety_metadata?.road_access === "off_road";
    const distKm = distMeters ? (distMeters / 1000).toFixed(1) : null;

    // ── Feedback handler ───────────────────────────────────────────────────
    const handleFeedback = async (type) => {
        if (submitting || feedbackState) return;
        setSubmitting(true);
        try {
            const placeId = place._id || place.id;
            await sendFeedback(placeId, type);
            setFeedbackState(type);
        } catch {
            // Error already logged in api.js
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="group relative rounded-2xl overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/10"
        >
            {/* ── Image ─────────────────────────────────────────────────────── */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={imgError ? FALLBACK_IMG : place.image_url}
                    alt={place.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {isHiddenGem && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-xs font-semibold text-black backdrop-blur-sm">
                            <Gem className="w-3 h-3" />
                            Hidden Gem
                        </span>
                    )}
                    {isOffRoad && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/90 text-xs font-semibold text-white backdrop-blur-sm">
                            <CarFront className="w-3 h-3" />
                            Off-Road
                        </span>
                    )}
                </div>

                {/* Score pill */}
                {score != null && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs font-bold text-white">
                        {(score * 100).toFixed(0)}%
                    </div>
                )}
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            <div className="p-5">
                {/* Title + distance */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white leading-tight">
                        {place.name}
                    </h3>
                    {distKm && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {distKm} km
                        </span>
                    )}
                </div>

                {/* Submitter badge */}
                {place.submitted_by && (
                    <div className="flex items-center gap-1.5 mb-2">
                        {place.submitted_by.role === "Pathfinder" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-purple-400">
                                <Award className="w-3 h-3" />
                                Verified by Pathfinder
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                                <UserCheck2 className="w-3 h-3" />
                                Submitted by {place.submitted_by.name}
                            </span>
                        )}
                    </div>
                )}

                {/* Description */}
                {place.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {place.description}
                    </p>
                )}

                {/* Tags */}
                {place.watrs_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {place.watrs_tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-gray-300 border border-white/5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* ── Weather comfort ─────────────────────────────────────────── */}
                <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Thermometer className="w-3.5 h-3.5" />
                            Comfort — {CURRENT_MONTH}
                            {weatherFallback && (
                                <span className="text-amber-400 ml-1">(historical)</span>
                            )}
                        </span>
                        <span
                            className={cn(
                                "text-xs font-semibold",
                                comfortScore >= 0.75
                                    ? "text-emerald-400"
                                    : comfortScore >= 0.5
                                        ? "text-amber-400"
                                        : "text-red-400"
                            )}
                        >
                            {comfortLabel(comfortScore)} ({(comfortScore * 100).toFixed(0)}%)
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${comfortScore * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className={cn("h-full rounded-full", comfortColor(comfortScore))}
                        />
                    </div>
                </div>

                {/* ── Feedback buttons ────────────────────────────────────────── */}
                <div className="flex items-center gap-2">
                    {feedbackState ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1.5 text-sm text-emerald-400"
                        >
                            <Check className="w-4 h-4" />
                            Thanks for your feedback!
                        </motion.div>
                    ) : (
                        <>
                            <button
                                onClick={() => handleFeedback("like")}
                                disabled={submitting}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 text-xs transition-all duration-200 disabled:opacity-50"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                Like
                            </button>
                            <button
                                onClick={() => handleFeedback("dislike")}
                                disabled={submitting}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-all duration-200 disabled:opacity-50"
                            >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                Dislike
                            </button>
                            <button
                                onClick={() => handleFeedback("safety_alert")}
                                disabled={submitting}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 text-xs transition-all duration-200 disabled:opacity-50"
                            >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Report
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
