/**
 * src/context/AuthContext.jsx
 * ───────────────────────────
 * Global authentication state using React Context + useReducer.
 *
 * Stores: user object, JWT token, role.
 * Persists token to localStorage and restores on mount.
 *
 * Roles (ascending privilege):
 *   Explorer → Contributor → Pathfinder → Super-Admin
 */

import { createContext, useContext, useReducer, useEffect, useMemo } from "react";

// ── Role hierarchy (index = privilege level) ─────────────────────────────────
export const ROLES = ["Explorer", "Contributor", "Pathfinder", "Super-Admin"];

/**
 * Check if `userRole` meets the minimum required role.
 */
export function hasRole(userRole, requiredRole) {
    return ROLES.indexOf(userRole) >= ROLES.indexOf(requiredRole);
}

// ── Reducer ──────────────────────────────────────────────────────────────────

const initialState = {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    isLoading: true, // true while restoring session from localStorage
};

function authReducer(state, action) {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                role: action.payload.user.role,
                isAuthenticated: true,
                isLoading: false,
            };
        case "LOGOUT":
            return {
                ...initialState,
                isLoading: false,
            };
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        default:
            return state;
    }
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // ── Restore session from localStorage on mount ──────────────────────────
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem("watrs_token");
            const storedUser = localStorage.getItem("watrs_user");

            if (storedToken && storedUser) {
                const user = JSON.parse(storedUser);
                dispatch({
                    type: "LOGIN",
                    payload: { user, token: storedToken },
                });
            } else {
                dispatch({ type: "SET_LOADING", payload: false });
            }
        } catch {
            localStorage.removeItem("watrs_token");
            localStorage.removeItem("watrs_user");
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, []);

    // ── Actions ─────────────────────────────────────────────────────────────

    const login = (user, token) => {
        localStorage.setItem("watrs_token", token);
        localStorage.setItem("watrs_user", JSON.stringify(user));
        dispatch({ type: "LOGIN", payload: { user, token } });
    };

    const logout = () => {
        localStorage.removeItem("watrs_token");
        localStorage.removeItem("watrs_user");
        dispatch({ type: "LOGOUT" });
    };

    const value = useMemo(
        () => ({
            ...state,
            login,
            logout,
        }),
        [state]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

/**
 * Hook to access auth state and actions.
 * @returns {{ user, token, role, isAuthenticated, isLoading, login, logout }}
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an <AuthProvider>");
    }
    return context;
}
