/**
 * src/pages/Admin.jsx
 * ───────────────────
 * Full moderation dashboard for reviewing community staging submissions.
 * Protected by Super-Admin role via ProtectedRoute.
 *
 * Features:
 *   • Tab filtering (All / Pending / Approved / Rejected)
 *   • Rich staging queue with status badges and tag chips
 *   • Review detail modal with full submission data
 *   • Approve / Edit & Approve / Reject actions
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Inbox,
    CheckCircle2,
    XCircle,
    Clock,
    X,
    MapPin,
    Sparkles,
    ShieldAlert,
    Image,
    Loader2,
    Check,
    Pencil,
    AlertTriangle,
    User,
    Calendar,
    ExternalLink,
} from "lucide-react";
import { cn } from "../lib/utils";
import { WATRS_TAGS, ROAD_ACCESS_OPTIONS, SAFETY_RATINGS } from "../lib/constants";
import {
    getStagingQueue,
    approveStagingItem,
    rejectStagingItem,
    updateAndApproveStagingItem,
} from "../lib/api";

// ── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    approved: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

const TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

export default function Admin() {
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedItem, setSelectedItem] = useState(null);
    const [toast, setToast] = useState(null);

    // ── Fetch staging queue ─────────────────────────────────────────────────
    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getStagingQueue();
            setItems(data.items);
            setStats(data.stats);
        } catch {
            setToast({ type: "error", message: "Failed to load staging queue." });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    // ── Filter items by tab ─────────────────────────────────────────────────
    const filteredItems = activeTab === "all"
        ? items
        : items.filter((i) => i.status === activeTab);

    // ── Action handlers ─────────────────────────────────────────────────────
    const handleApprove = async (id) => {
        const result = await approveStagingItem(id);
        if (result.success) {
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, status: "approved", reviewed_at: new Date().toISOString() } : i))
            );
            setStats((prev) => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
            setSelectedItem(null);
            showToast("success", result.message);
        }
    };

    const handleReject = async (id, reason) => {
        const result = await rejectStagingItem(id, reason);
        if (result.success) {
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, status: "rejected", rejection_reason: reason, reviewed_at: new Date().toISOString() } : i))
            );
            setStats((prev) => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
            setSelectedItem(null);
            showToast("success", result.message);
        }
    };

    const handleEditApprove = async (id, edits) => {
        const result = await updateAndApproveStagingItem(id, edits);
        if (result.success) {
            setItems((prev) =>
                prev.map((i) => (i.id === id ? { ...i, ...edits, status: "approved", reviewed_at: new Date().toISOString() } : i))
            );
            setStats((prev) => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
            setSelectedItem(null);
            showToast("success", result.message);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* ── Header ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <div className="p-2.5 rounded-xl bg-primary-600/20">
                        <ShieldCheck className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Review and moderate community submissions</p>
                    </div>
                </motion.div>

                {/* ── Stats row ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: Clock, label: "Pending Review", value: stats.pending, color: "text-amber-400", bg: "bg-amber-500/10" },
                        { icon: CheckCircle2, label: "Approved", value: stats.approved, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                        { icon: XCircle, label: "Rejected", value: stats.rejected, color: "text-red-400", bg: "bg-red-500/10" },
                    ].map((stat) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-xs text-gray-500">{stat.label}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Tab filters ─────────────────────────────────────────── */}
                <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/5 w-fit">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                activeTab === tab.key
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab.label}
                            {tab.key !== "all" && (
                                <span className="ml-1.5 text-xs opacity-70">
                                    {tab.key === "pending" ? stats.pending : tab.key === "approved" ? stats.approved : stats.rejected}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Staging queue ───────────────────────────────────────── */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
                        <Inbox className="w-5 h-5 text-primary-400" />
                        <h2 className="text-lg font-semibold text-white">Staging Queue</h2>
                        <span className="ml-auto text-xs text-gray-500">{filteredItems.length} items</span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <Inbox className="w-10 h-10 mb-3 opacity-30" />
                            <p className="text-sm">No items in this category</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredItems.map((item, idx) => {
                                const status = STATUS_CONFIG[item.status];
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedItem(item)}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        {/* Image thumbnail */}
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image className="w-5 h-5 text-gray-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", status.bg, status.color, status.border, "border")}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {item.submitter.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(item.submitted_at).toLocaleDateString()}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Tags preview */}
                                        <div className="hidden md:flex items-center gap-1">
                                            {item.watrs_tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 border border-white/5">
                                                    {tag}
                                                </span>
                                            ))}
                                            {item.watrs_tags.length > 3 && (
                                                <span className="text-[10px] text-gray-600">+{item.watrs_tags.length - 3}</span>
                                            )}
                                        </div>

                                        <ExternalLink className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Toast notification ──────────────────────────────────── */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className={cn(
                                "fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl z-50",
                                toast.type === "success"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border-red-500/20 text-red-400"
                            )}
                        >
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Review detail modal ─────────────────────────────────────── */}
            <AnimatePresence>
                {selectedItem && (
                    <ReviewModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onEditApprove={handleEditApprove}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Review Detail Modal
// ═══════════════════════════════════════════════════════════════════════════

function ReviewModal({ item, onClose, onApprove, onReject, onEditApprove }) {
    const [mode, setMode] = useState("view"); // "view" | "edit" | "reject"
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // Editable fields (for edit & approve)
    const [editTags, setEditTags] = useState(item.watrs_tags);
    const [editRoadAccess, setEditRoadAccess] = useState(item.road_access);
    const [editSafetyRating, setEditSafetyRating] = useState(item.safety_rating);

    const status = STATUS_CONFIG[item.status];
    const isPending = item.status === "pending";
    const roadLabel = ROAD_ACCESS_OPTIONS.find((o) => o.value === item.road_access)?.label || item.road_access;
    const safetyLabel = SAFETY_RATINGS.find((o) => o.value === item.safety_rating)?.label || item.safety_rating;

    const toggleEditTag = (tag) => {
        setEditTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };

    const handleApprove = async () => {
        setActionLoading(true);
        await onApprove(item.id);
        setActionLoading(false);
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        setActionLoading(true);
        await onReject(item.id, rejectionReason.trim());
        setActionLoading(false);
    };

    const handleEditApprove = async () => {
        setActionLoading(true);
        await onEditApprove(item.id, {
            watrs_tags: editTags,
            road_access: editRoadAccess,
            safety_rating: editSafetyRating,
        });
        setActionLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl border border-white/10"
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 glass z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-white">Review Submission</h2>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", status.bg, status.color, status.border)}>
                            {status.label}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* ── Image ───────────────────────────────────────────── */}
                    {item.image_url && (
                        <div className="rounded-xl overflow-hidden border border-white/10">
                            <img src={item.image_url} alt={item.name} className="w-full h-56 object-cover" />
                        </div>
                    )}

                    {/* ── Place details ───────────────────────────────────── */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
                    </div>

                    {/* ── Metadata grid ───────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoBlock icon={MapPin} label="Coordinates" value={`${item.latitude}, ${item.longitude}`} />
                        <InfoBlock icon={User} label="Submitted by" value={`${item.submitter.name} (${item.submitter.role})`} />
                        <InfoBlock icon={Calendar} label="Submitted" value={new Date(item.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
                        <InfoBlock icon={ShieldAlert} label="Road Access" value={roadLabel} />
                    </div>

                    {/* ── Tags ────────────────────────────────────────────── */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            <span className="text-sm font-medium text-gray-300">
                                {mode === "edit" ? "Edit Tags" : "Tags"}
                            </span>
                        </div>

                        {mode === "edit" ? (
                            <div className="flex flex-wrap gap-2">
                                {WATRS_TAGS.map((tag) => {
                                    const isSelected = editTags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleEditTag(tag)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg text-xs border transition-all duration-200",
                                                isSelected
                                                    ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                            )}
                                        >
                                            {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {item.watrs_tags.length > 0 ? (
                                    item.watrs_tags.map((tag) => (
                                        <span key={tag} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-gray-300 border border-white/5">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-600 italic">No tags selected</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Safety (editable in edit mode) ──────────────────── */}
                    {mode === "edit" && (
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm font-medium text-gray-300 mb-2 block">Road Access</span>
                                <div className="flex flex-wrap gap-2">
                                    {ROAD_ACCESS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setEditRoadAccess(opt.value)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs border transition-all",
                                                editRoadAccess === opt.value
                                                    ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-300 mb-2 block">Safety Rating</span>
                                <div className="flex gap-2">
                                    {SAFETY_RATINGS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setEditSafetyRating(opt.value)}
                                            className={cn(
                                                "flex-1 px-3 py-1.5 rounded-lg text-xs border transition-all text-center",
                                                editSafetyRating === opt.value
                                                    ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Safety notes ────────────────────────────────────── */}
                    {item.safety_notes && mode !== "edit" && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{item.safety_notes}</span>
                        </div>
                    )}

                    {/* ── Rejection reason (for already-rejected items) ──── */}
                    {item.status === "rejected" && item.rejection_reason && mode === "view" && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold">Rejection reason:</span> {item.rejection_reason}
                            </div>
                        </div>
                    )}

                    {/* ── Reject text area ────────────────────────────────── */}
                    {mode === "reject" && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Rejection Reason <span className="text-red-400">*</span></label>
                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
                                placeholder="Explain why this submission is being rejected…"
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* ── Action buttons ──────────────────────────────────────── */}
                {isPending && (
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-white/10 sticky bottom-0 glass">
                        {mode === "view" && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Approve
                                </button>
                                <button
                                    onClick={() => setMode("edit")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit & Approve
                                </button>
                                <button
                                    onClick={() => setMode("reject")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors ml-auto"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                            </>
                        )}

                        {mode === "edit" && (
                            <>
                                <button
                                    onClick={handleEditApprove}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Save & Approve
                                </button>
                                <button
                                    onClick={() => {
                                        setMode("view");
                                        setEditTags(item.watrs_tags);
                                        setEditRoadAccess(item.road_access);
                                        setEditSafetyRating(item.safety_rating);
                                    }}
                                    className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {mode === "reject" && (
                            <>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectionReason.trim()}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Confirm Rejection
                                </button>
                                <button
                                    onClick={() => { setMode("view"); setRejectionReason(""); }}
                                    className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// ── Info block helper ───────────────────────────────────────────────────────
function InfoBlock({ icon: Icon, label, value }) {
    return (
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </div>
            <div className="text-sm text-white font-medium truncate">{value}</div>
        </div>
    );
}
