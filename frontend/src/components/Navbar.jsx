/**
 * src/components/Navbar.jsx
 * ─────────────────────────
 * Persistent glassmorphism navigation bar.
 * Auth-aware: shows Login or user avatar + logout.
 * Role-aware: shows Admin link for Super-Admin users.
 */

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Compass,
    Search,
    PlusCircle,
    ShieldCheck,
    LogIn,
    LogOut,
    User,
    UserCircle,
    Menu,
    X,
} from "lucide-react";
import { useAuth, hasRole } from "../context/AuthContext";
import { cn } from "../lib/utils";

const NAV_LINKS = [
    { to: "/", label: "Home", icon: Compass },
    { to: "/search", label: "Explore", icon: Search },
];

export default function Navbar() {
    const { isAuthenticated, user, role, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
        setMobileOpen(false);
    };

    const allLinks = [
        ...NAV_LINKS,
        // Show Contribute for Contributor+
        ...(isAuthenticated && hasRole(role, "Contributor")
            ? [{ to: "/contribute", label: "Contribute", icon: PlusCircle }]
            : []),
        // Show Admin for Super-Admin
        ...(isAuthenticated && hasRole(role, "Super-Admin")
            ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }]
            : []),
    ];

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* ── Logo ────────────────────────────────────────────── */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white font-bold text-lg"
                    >
                        <Compass className="w-5 h-5 text-primary-400" />
                        <span className="text-gradient">WATRS</span>
                    </Link>

                    {/* ── Desktop links ───────────────────────────────────── */}
                    <div className="hidden md:flex items-center gap-1">
                        {allLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200",
                                    location.pathname === to
                                        ? "bg-white/10 text-white font-medium"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* ── Auth area (desktop) ─────────────────────────────── */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors"
                                >
                                    <UserCircle className="w-4 h-4 text-primary-400" />
                                    <span className="text-gray-300">
                                        {user?.name || "User"}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">
                                        {role}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* ── Mobile menu toggle ──────────────────────────────── */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                    >
                        {mobileOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* ── Mobile dropdown ─────────────────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/10 overflow-hidden"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {allLinks.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                        location.pathname === to
                                            ? "bg-white/10 text-white"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}

                            <hr className="border-white/10 my-2" />

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={() => setMobileOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <UserCircle className="w-4 h-4 text-primary-400" />
                                        {user?.name || "User"}
                                        <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded ml-auto">
                                            {role}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
