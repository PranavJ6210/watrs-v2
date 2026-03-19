/**
 * src/pages/Profile.jsx
 * ─────────────────────
 * User dashboard with gamification metrics.
 *
 * Features:
 *   • User info header with role badge
 *   • Trust Score metric
 *   • Stats cards (approved, total, feedback score, likes)
 *   • Pathfinder Tracker progress bar
 *   • Submission history with status badges
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Shield,
    Star,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    Award,
    Heart,
    FileText,
    Flag,
    Loader2,
    Sparkles,
    Calendar,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth, ROLES } from "../context/AuthContext";
import { getUserProfile } from "../lib/api";

// ── Role badge config ───────────────────────────────────────────────────────
const ROLE_STYLES = {
    "Explorer": { bg: "bg-gray-500/10", border: "border-gray-500/20", text: "text-gray-400", icon: User },
    "Contributor": { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: FileText },
    "Pathfinder": { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: Award },
    "Super-Admin": { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: Shield },
};

const STATUS_CONFIG = {
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
    approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
};

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await getUserProfile();
                setProfile(data);
            } catch {
                console.warn("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    if (!profile) return null;

    const { stats, pathfinder, submissions } = profile;
    const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES["Explorer"];
    const RoleIcon = roleStyle.icon;
    const progressPct = (pathfinder.current / pathfinder.threshold) * 100;
    const remaining = pathfinder.threshold - pathfinder.current;

    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* ── User Header Card ───────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6"
                >
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-white truncate">{user?.name}</h1>
                                <span className={cn("flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", roleStyle.bg, roleStyle.text, roleStyle.border)}>
                                    <RoleIcon className="w-3 h-3" />
                                    {user?.role}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                Member since {new Date(profile.user.joined_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                            </p>
                        </div>

                        {/* Trust Score */}
                        <div className="hidden sm:flex flex-col items-center">
                            <div className="relative w-20 h-20">
                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                                    <motion.circle
                                        cx="36" cy="36" r="30" fill="none"
                                        stroke="url(#trustGradient)"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(stats.trust_score / 100) * 188.5} 188.5`}
                                        initial={{ strokeDasharray: "0 188.5" }}
                                        animate={{ strokeDasharray: `${(stats.trust_score / 100) * 188.5} 188.5` }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                    />
                                    <defs>
                                        <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#6366f1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold text-white">{stats.trust_score}</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1">Trust Score</span>
                        </div>
                    </div>
                </motion.div>

                {/* ── Stats Row ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: CheckCircle2, label: "Approved", value: stats.approved_submissions, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { icon: FileText, label: "Total Submissions", value: stats.total_submissions, color: "text-blue-400", bg: "bg-blue-500/10" },
                        { icon: Heart, label: "Likes Received", value: stats.likes_received, color: "text-pink-400", bg: "bg-pink-500/10" },
                        { icon: Star, label: "Feedback Score", value: `${stats.feedback_score}%`, color: "text-amber-400", bg: "bg-amber-500/10" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Pathfinder Tracker ──────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Award className={cn("w-5 h-5", pathfinder.unlocked ? "text-purple-400" : "text-gray-500")} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Pathfinder Status</h2>
                            <p className="text-xs text-gray-500">
                                {pathfinder.unlocked
                                    ? "🎉 You've earned the Pathfinder badge!"
                                    : `${remaining} more verified submission${remaining !== 1 ? "s" : ""} to unlock Pathfinder`
                                }
                            </p>
                        </div>
                        {pathfinder.unlocked && (
                            <span className="ml-auto px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold">
                                ✦ Unlocked
                            </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{pathfinder.current} / {pathfinder.threshold} verified submissions</span>
                            <span className={cn("font-semibold", pathfinder.unlocked ? "text-purple-400" : "text-gray-400")}>
                                {Math.round(progressPct)}%
                            </span>
                        </div>
                        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                className={cn(
                                    "h-full rounded-full",
                                    pathfinder.unlocked
                                        ? "bg-gradient-to-r from-purple-600 to-purple-400"
                                        : "bg-gradient-to-r from-primary-600 to-primary-400"
                                )}
                            />
                        </div>

                        {/* Milestone dots */}
                        <div className="flex items-center justify-between px-1">
                            {Array.from({ length: pathfinder.threshold }, (_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-colors",
                                        i < pathfinder.current
                                            ? pathfinder.unlocked ? "bg-purple-400" : "bg-primary-400"
                                            : "bg-white/10"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── Submission History ──────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl overflow-hidden"
                >
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
                        <TrendingUp className="w-5 h-5 text-primary-400" />
                        <h2 className="text-lg font-semibold text-white">Submission History</h2>
                        <span className="ml-auto text-xs text-gray-500">{submissions.length} entries</span>
                    </div>

                    {submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Sparkles className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm">No submissions yet</p>
                            <p className="text-xs mt-1">Start contributing to earn your Pathfinder badge!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {submissions.map((sub, idx) => {
                                const status = STATUS_CONFIG[sub.status];
                                const StatusIcon = status.icon;
                                return (
                                    <motion.div
                                        key={sub.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + idx * 0.05 }}
                                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/5 transition-colors"
                                    >
                                        <div className={cn("p-1.5 rounded-lg", status.bg)}>
                                            <StatusIcon className={cn("w-4 h-4", status.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white truncate">{sub.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {new Date(sub.submitted_at).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", status.bg, status.color, `border-${status.color.replace("text-", "")}/20`)}>
                                            {status.label}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
