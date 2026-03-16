/**
 * src/pages/Login.jsx
 * ───────────────────
 * Login page with glassmorphism form card.
 * Calls mock auth API (ready to swap with real backend endpoint).
 */

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../lib/api";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await loginUser(form.email, form.password);

            if (data.error) {
                setError(data.error);
            } else {
                login(data.user, data.token);
                navigate(from, { replace: true });
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600/20 mb-4">
                        <LogIn className="w-7 h-7 text-primary-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Sign in to your WATRS account
                    </p>
                </div>

                {/* ── Form card ───────────────────────────────────────────── */}
                <form
                    onSubmit={handleSubmit}
                    className="glass rounded-2xl p-6 space-y-5"
                >
                    {/* Error alert */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <LogIn className="w-4 h-4" />
                        )}
                        {loading ? "Signing in…" : "Sign In"}
                    </button>

                    {/* Register link */}
                    <p className="text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            Create one
                        </Link>
                    </p>
                </form>

                {/* ── Demo hint ───────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 text-center"
                >
                    <strong>Demo Mode:</strong> Use any email/password. Try role:{" "}
                    <code className="bg-white/5 px-1 py-0.5 rounded">admin@watrs.dev</code>{" "}
                    for Super-Admin access.
                </motion.div>
            </motion.div>
        </div>
    );
}
