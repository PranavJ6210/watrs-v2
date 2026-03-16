/**
 * src/pages/Admin.jsx
 * ───────────────────
 * Placeholder admin dashboard for moderating the staging queue.
 * Protected by Super-Admin role via ProtectedRoute.
 */

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Inbox,
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";

// Mock staging data for UI layout
const MOCK_STAGING = [
    {
        id: "stg_001",
        name: "Kolukkumalai",
        submitter: "Hari D.",
        status: "pending",
        submitted_at: "2026-03-15",
    },
    {
        id: "stg_002",
        name: "Vattakanal",
        submitter: "Priya S.",
        status: "pending",
        submitted_at: "2026-03-14",
    },
    {
        id: "stg_003",
        name: "Parvathamalai",
        submitter: "Karthik R.",
        status: "pending",
        submitted_at: "2026-03-13",
    },
];

export default function Admin() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
            <div className="max-w-5xl mx-auto">
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
                        <h1 className="text-2xl font-bold text-white">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-gray-500">
                            Review and moderate community submissions
                        </p>
                    </div>
                </motion.div>

                {/* ── Stats row ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        {
                            icon: Clock,
                            label: "Pending Review",
                            value: MOCK_STAGING.length,
                            color: "text-amber-400",
                            bg: "bg-amber-500/10",
                        },
                        {
                            icon: CheckCircle2,
                            label: "Approved",
                            value: 10,
                            color: "text-emerald-400",
                            bg: "bg-emerald-500/10",
                        },
                        {
                            icon: XCircle,
                            label: "Rejected",
                            value: 2,
                            color: "text-red-400",
                            bg: "bg-red-500/10",
                        },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-lg ${stat.bg}`}
                                >
                                    <stat.icon
                                        className={`w-5 h-5 ${stat.color}`}
                                    />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Staging queue ───────────────────────────────────────── */}
                <div className="glass rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10">
                        <Inbox className="w-5 h-5 text-primary-400" />
                        <h2 className="text-lg font-semibold text-white">
                            Staging Queue
                        </h2>
                    </div>

                    <div className="divide-y divide-white/5">
                        {MOCK_STAGING.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                            >
                                <div>
                                    <h3 className="text-sm font-medium text-white">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        by {item.submitter} · {item.submitted_at}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors">
                                        Approve
                                    </button>
                                    <button className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors">
                                        Reject
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ── Placeholder note ────────────────────────────────────── */}
                <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 text-center">
                    This is a UI scaffold. Actions will be wired to{" "}
                    <code className="bg-white/5 px-1 py-0.5 rounded">
                        /api/v1/staging
                    </code>{" "}
                    once the backend endpoints are built.
                </div>
            </div>
        </div>
    );
}
