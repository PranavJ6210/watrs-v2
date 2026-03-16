/**
 * src/pages/Register.jsx
 * ──────────────────────
 * Registration page with glassmorphism form card.
 * Calls mock auth API (ready to swap with real backend endpoint).
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    UserPlus,
    Mail,
    Lock,
    User,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../lib/api";

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            const data = await registerUser(
                form.name,
                form.email,
                form.password
            );

            if (data.error) {
                setError(data.error);
            } else {
                login(data.user, data.token);
                navigate("/", { replace: true });
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-600/20 mb-4">
                        <UserPlus className="w-7 h-7 text-accent-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Join WATRS
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Create your account and start discovering hidden gems
                    </p>
                </div>

                {/* ── Form card ───────────────────────────────────────────── */}
                <form
                    onSubmit={handleSubmit}
                    className="glass rounded-2xl p-6 space-y-5"
                >
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

                    {/* Name */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) =>
                                    updateField("name", e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="Your name"
                            />
                        </div>
                    </div>

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
                                    updateField("email", e.target.value)
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
                                    updateField("password", e.target.value)
                                }
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="Min. 6 characters"
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="password"
                                required
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    updateField(
                                        "confirmPassword",
                                        e.target.value
                                    )
                                }
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                                placeholder="Re-enter your password"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-500 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <UserPlus className="w-4 h-4" />
                        )}
                        {loading ? "Creating account…" : "Create Account"}
                    </button>

                    {/* Login link */}
                    <p className="text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
