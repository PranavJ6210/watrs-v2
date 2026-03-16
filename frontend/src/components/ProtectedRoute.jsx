/**
 * src/components/ProtectedRoute.jsx
 * ──────────────────────────────────
 * Route guard that checks authentication and role-based access.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={["Contributor", "Pathfinder", "Super-Admin"]} />}>
 *     <Route path="/contribute" element={<Contribute />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldX, Loader2 } from "lucide-react";
import { useAuth, ROLES } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const { isAuthenticated, isLoading, role } = useAuth();
    const location = useLocation();

    // ── Still restoring session from localStorage ───────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            </div>
        );
    }

    // ── Not logged in → redirect to login ───────────────────────────────────
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ── Check role access ───────────────────────────────────────────────────
    const hasAccess =
        allowedRoles.length === 0 ||
        allowedRoles.some(
            (allowed) => ROLES.indexOf(role) >= ROLES.indexOf(allowed)
        );

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <ShieldX className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-400 text-sm max-w-md">
                        You don't have permission to access this page.
                        Required role:{" "}
                        <span className="text-primary-400 font-medium">
                            {allowedRoles[0]}
                        </span>{" "}
                        or higher.
                    </p>
                </motion.div>
            </div>
        );
    }

    return <Outlet />;
}
