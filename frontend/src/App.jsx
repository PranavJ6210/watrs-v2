/**
 * src/App.jsx
 * ───────────
 * Root application component with BrowserRouter and AuthProvider.
 *
 * Routes:
 *   /            → Home (landing page + search trigger)
 *   /search      → Results (recommendation cards)
 *   /login       → Login page
 *   /register    → Registration page
 *   /profile     → User dashboard (any authenticated user)
 *   /contribute  → Contributor form (Contributor+ only)
 *   /admin       → Admin dashboard (Super-Admin only)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contribute from "./pages/Contribute";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-950">
                    <Navbar />
                    <Routes>
                        {/* ── Public routes ───────────────────────────────── */}
                        <Route path="/" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* ── Protected: Any authenticated user ──────────── */}
                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "Explorer",
                                        "Contributor",
                                        "Pathfinder",
                                        "Super-Admin",
                                    ]}
                                />
                            }
                        >
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* ── Protected: Contributor+ ────────────────────── */}
                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "Contributor",
                                        "Pathfinder",
                                        "Super-Admin",
                                    ]}
                                />
                            }
                        >
                            <Route
                                path="/contribute"
                                element={<Contribute />}
                            />
                        </Route>

                        {/* ── Protected: Super-Admin ─────────────────────── */}
                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={["Super-Admin"]}
                                />
                            }
                        >
                            <Route path="/admin" element={<Admin />} />
                        </Route>
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}
