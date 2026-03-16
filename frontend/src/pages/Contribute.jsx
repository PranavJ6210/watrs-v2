/**
 * src/pages/Contribute.jsx
 * ─────────────────────────
 * Multi-step form for submitting new "Hidden Gems" to places_staging.
 *
 * Steps:
 *   1. Location Definition
 *   2. Vibe Taxonomy (strict enum tags)
 *   3. Safety & Accessibility Checklist
 *   4. Media Upload
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Sparkles,
    ShieldCheck,
    Image,
    ArrowLeft,
    ArrowRight,
    Check,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { cn } from "../lib/utils";

// ── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, title: "Location", icon: MapPin, description: "Define the place" },
    { id: 2, title: "Vibe", icon: Sparkles, description: "Set the tags" },
    { id: 3, title: "Safety", icon: ShieldCheck, description: "Accessibility info" },
    { id: 4, title: "Media", icon: Image, description: "Upload photos" },
];

// ── Predefined WATRS tags (strict enum — no free text) ──────────────────────
const WATRS_TAGS = [
    "Nature", "Waterfall", "Trekking", "Heritage", "Beach",
    "Wildlife", "Tea Estates", "Hills", "Photography", "Adventure",
    "Relaxation", "Boating", "History", "Agriculture", "Ruins",
];

// ── Road access options (matching backend enum) ─────────────────────────────
const ROAD_ACCESS_OPTIONS = [
    { value: "paved", label: "Paved Road" },
    { value: "unpaved", label: "Unpaved Road" },
    { value: "4wd_only", label: "4WD Only" },
    { value: "foot_only", label: "Foot Only" },
    { value: "off_road", label: "Off-Road" },
];

const SAFETY_RATINGS = [
    { value: "high", label: "High", color: "text-emerald-400" },
    { value: "moderate", label: "Moderate", color: "text-amber-400" },
    { value: "low", label: "Low", color: "text-red-400" },
];

export default function Contribute() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Location
        name: "",
        description: "",
        latitude: "",
        longitude: "",
        // Step 2: Vibe
        watrs_tags: [],
        // Step 3: Safety
        road_access: "paved",
        safety_rating: "high",
        safety_notes: "",
        // Step 4: Media
        image_url: "",
    });

    const updateField = (field, value) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const toggleTag = (tag) => {
        setFormData((prev) => ({
            ...prev,
            watrs_tags: prev.watrs_tags.includes(tag)
                ? prev.watrs_tags.filter((t) => t !== tag)
                : [...prev.watrs_tags, tag],
        }));
    };

    const goNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
    const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setSubmitting(true);
        // TODO: Call POST /api/v1/places/staging when backend endpoint is ready
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSubmitting(false);
        navigate("/search");
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* ── Header ─────────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Submit a Hidden Gem
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Help the community discover amazing places
                    </p>
                </motion.div>

                {/* ── Step indicator ──────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-10 px-4">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                            isCompleted
                                                ? "bg-primary-600 border-primary-600 text-white"
                                                : isActive
                                                    ? "border-primary-500 text-primary-400 bg-primary-500/10"
                                                    : "border-white/10 text-gray-500 bg-white/5"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs mt-2 hidden sm:block",
                                            isActive ? "text-primary-400 font-medium" : "text-gray-500"
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </div>

                                {/* Connector line */}
                                {idx < STEPS.length - 1 && (
                                    <div
                                        className={cn(
                                            "flex-1 h-0.5 mx-3 rounded-full transition-colors duration-300",
                                            currentStep > step.id
                                                ? "bg-primary-600"
                                                : "bg-white/10"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Step content ────────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="glass rounded-2xl p-6"
                    >
                        {currentStep === 1 && (
                            <StepLocation formData={formData} updateField={updateField} />
                        )}
                        {currentStep === 2 && (
                            <StepVibe formData={formData} toggleTag={toggleTag} />
                        )}
                        {currentStep === 3 && (
                            <StepSafety formData={formData} updateField={updateField} />
                        )}
                        {currentStep === 4 && (
                            <StepMedia formData={formData} updateField={updateField} />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* ── Navigation buttons ──────────────────────────────────── */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={goBack}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    {currentStep < 4 ? (
                        <button
                            onClick={goNext}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
                        >
                            Next
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {submitting ? "Submitting…" : "Submit"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Step sub-components
// ═══════════════════════════════════════════════════════════════════════════

function StepLocation({ formData, updateField }) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">
                    Location Details
                </h2>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                    Place Name <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="e.g. Meghamalai"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                    Description
                </label>
                <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
                    placeholder="What makes this place special?"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                        Latitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => updateField("latitude", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        placeholder="e.g. 9.6922"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1.5">
                        Longitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => updateField("longitude", e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                        placeholder="e.g. 77.4080"
                    />
                </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                    Google Places Autocomplete will be integrated here to
                    automatically extract coordinates and place details.
                </span>
            </div>
        </div>
    );
}

function StepVibe({ formData, toggleTag }) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">
                    Vibe Taxonomy
                </h2>
            </div>

            <p className="text-sm text-gray-400">
                Select all tags that describe this place. These are used by the
                recommendation engine to match user preferences.
            </p>

            <div className="flex flex-wrap gap-2">
                {WATRS_TAGS.map((tag) => {
                    const isSelected = formData.watrs_tags.includes(tag);
                    return (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm border transition-all duration-200",
                                isSelected
                                    ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                            )}
                        >
                            {isSelected && (
                                <Check className="w-3 h-3 inline mr-1" />
                            )}
                            {tag}
                        </button>
                    );
                })}
            </div>

            {formData.watrs_tags.length > 0 && (
                <p className="text-xs text-gray-500">
                    {formData.watrs_tags.length} tag
                    {formData.watrs_tags.length !== 1 ? "s" : ""} selected
                </p>
            )}
        </div>
    );
}

function StepSafety({ formData, updateField }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">
                    Safety & Accessibility
                </h2>
            </div>

            {/* Road Access */}
            <div>
                <label className="block text-sm text-gray-400 mb-3">
                    Road Access
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ROAD_ACCESS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField("road_access", opt.value)}
                            className={cn(
                                "px-3 py-2 rounded-xl text-sm border transition-all duration-200 text-center",
                                formData.road_access === opt.value
                                    ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Safety Rating */}
            <div>
                <label className="block text-sm text-gray-400 mb-3">
                    Safety Rating
                </label>
                <div className="flex gap-3">
                    {SAFETY_RATINGS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField("safety_rating", opt.value)}
                            className={cn(
                                "flex-1 px-3 py-2.5 rounded-xl text-sm border transition-all duration-200 text-center",
                                formData.safety_rating === opt.value
                                    ? "bg-primary-600/20 border-primary-500 text-primary-300 font-medium"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Safety Notes */}
            <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                    Safety Notes (optional)
                </label>
                <textarea
                    rows={2}
                    value={formData.safety_notes}
                    onChange={(e) => updateField("safety_notes", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
                    placeholder="Any safety considerations visitors should know?"
                />
            </div>
        </div>
    );
}

function StepMedia({ formData, updateField }) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-semibold text-white">
                    Media Upload
                </h2>
            </div>

            {/* Image URL input */}
            <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                    Image URL
                </label>
                <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => updateField("image_url", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="https://images.unsplash.com/..."
                />
            </div>

            {/* Drag-and-drop zone (placeholder) */}
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-white/20 transition-colors cursor-pointer">
                <Image className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-1">
                    Drag & drop an image here, or click to browse
                </p>
                <p className="text-xs text-gray-600">
                    PNG, JPG up to 5MB — Cloudinary upload coming soon
                </p>
            </div>

            {/* Preview */}
            {formData.image_url && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                    <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                </div>
            )}
        </div>
    );
}
