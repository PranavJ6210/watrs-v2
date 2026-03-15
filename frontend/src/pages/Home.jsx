/**
 * src/pages/Home.jsx
 * ──────────────────
 * Landing page — search trigger for recommendations.
 */

import { useNavigate } from "react-router-dom";
import { MapPin, Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
    const navigate = useNavigate();

    const handleExplore = () => {
        navigate("/search");
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden px-4">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />
            </div>

            {/* Hero content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center max-w-3xl"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full glass text-sm text-gray-300"
                >
                    <Compass className="w-4 h-4 text-primary-400" />
                    Weather-Aware Tour Recommendations
                </motion.div>

                {/* Title */}
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
                    <span className="text-white">Discover</span>{" "}
                    <span className="text-gradient">Tamil Nadu</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed">
                    AI-powered recommendations that adapt to real-time weather.
                    Find hidden gems when the conditions are{" "}
                    <span className="text-primary-400 font-medium">perfect</span>.
                </p>

                {/* CTA Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExplore}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-2xl shadow-lg shadow-primary-600/25 transition-all duration-300"
                >
                    <MapPin className="w-5 h-5" />
                    Start Exploring
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </motion.div>

            {/* Bottom stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="relative z-10 mt-20 flex gap-12 text-center"
            >
                {[
                    { value: "3+", label: "Curated Places" },
                    { value: "12mo", label: "Climate Data" },
                    { value: "Live", label: "Weather Sync" },
                ].map((stat) => (
                    <div key={stat.label}>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
