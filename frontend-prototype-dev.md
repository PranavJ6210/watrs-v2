# WATRS v2.0 — Frontend Prototype Development Report

> **Weather-Aware Tour Recommendation System — React UI**
> React 19 · Vite 7 · Tailwind CSS 3.4 · Framer Motion

---

## 1. Prototype Overview

The frontend is a single-page React application that serves as the user-facing prototype for the WATRS recommendation engine. It provides a dark-themed, glassmorphism-styled UI with two core views: a **landing page** and a **search results page** that displays weather-aware place recommendations fetched from the FastAPI backend.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **UI Framework** | React | ^19.2.0 | Component-based UI rendering |
| **Build Tool** | Vite | ^7.3.1 | Dev server with HMR & ESM bundling |
| **Styling** | Tailwind CSS | ^3.4.19 | Utility-first CSS with custom design tokens |
| **CSS Processing** | PostCSS + Autoprefixer | ^8.5 / ^10.4 | Tailwind compilation & vendor prefixing |
| **Routing** | React Router DOM | ^7.13.0 | Client-side SPA routing |
| **HTTP Client** | Axios | ^1.13.5 | API requests with interceptors |
| **Animations** | Framer Motion | ^12.34.0 | Page transitions & micro-interactions |
| **Icons** | Lucide React | ^0.564.0 | SVG icon library |
| **Utilities** | clsx + tailwind-merge | ^2.1 / ^3.4 | Conditional class merging with conflict resolution |
| **Linting** | ESLint | ^9.39.1 | Code quality with React Hooks & Refresh plugins |
| **Typography** | Google Fonts (Inter) | — | Modern sans-serif font family |

---

## 3. Project Structure

```
frontend/
├── index.html                # SPA entry point
├── .env                      # Environment variables (VITE_API_BASE_URL)
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite + React plugin
├── tailwind.config.js        # Custom colours, fonts, content paths
├── postcss.config.js         # Tailwind + Autoprefixer pipeline
├── eslint.config.js          # Flat ESLint config with React rules
│
└── src/
    ├── main.jsx              # React DOM entry (StrictMode)
    ├── App.jsx               # Root component with BrowserRouter
    ├── App.css               # Legacy Vite scaffold styles (unused)
    ├── index.css             # Tailwind directives + custom utilities
    │
    ├── pages/
    │   ├── Home.jsx          # Landing page with hero section
    │   └── Search.jsx        # Recommendation results page
    │
    ├── components/
    │   └── PlaceCard.jsx     # Glassmorphism recommendation card
    │
    ├── lib/
    │   ├── api.js            # Axios-based backend API bridge
    │   └── utils.js          # cn() — Tailwind class merger
    │
    └── assets/
        └── react.svg         # Default Vite asset
```

---

## 4. Design System

### 4.1 Colour Palette

Two custom colour scales defined in `tailwind.config.js`:

| Token | Role | Scale |
|---|---|---|
| `primary-*` | Main brand colour (blue) | 50–950 (11 shades) |
| `accent-*` | Secondary highlight (purple/fuchsia) | 50–950 (11 shades) |

Both are used for gradient backgrounds, buttons, badges, and text highlights.

### 4.2 Typography

- **Font**: Inter (loaded via Google Fonts CDN)
- **Fallback**: `system-ui → -apple-system → sans-serif`
- **Rendering**: `antialiased` applied globally

### 4.3 Custom CSS Utilities (`index.css`)

| Utility Class | Effect |
|---|---|
| `.text-gradient` | Gradient text (`primary-400 → accent-400`) via `bg-clip-text` |
| `.glass` | Glassmorphism: `bg-white/5`, `backdrop-blur-xl`, subtle border |
| `.glass-hover` | Interactive glass with brighter background on hover |

### 4.4 Dark Theme

The entire application uses a dark theme (`bg-gray-950`, `text-gray-100`) applied at the `<body>` level, with all components designed against this dark backdrop.

---

## 5. Routing

Defined in `App.jsx` using React Router v7:

| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Landing page with hero CTA |
| `/search` | `Search` | Geolocation-based recommendation results |

The root layout wraps all routes in a `min-h-screen bg-gray-950` container.

---

## 6. Pages

### 6.1 Home Page (`pages/Home.jsx`)

The landing page serves as the entry point and search trigger.

**Visual Elements:**
- **Background gradient orbs** — Two large, blurred gradient circles (`primary-600/20` and `accent-600/20`) for depth
- **Badge** — Glassmorphism pill with compass icon: *"Weather-Aware Tour Recommendations"*
- **Hero Title** — Two-tone heading: *"Discover"* (white) + *"Tamil Nadu"* (gradient text)
- **Subtitle** — Description highlighting AI-powered weather-aware recommendations
- **CTA Button** — Gradient button ("Start Exploring") with hover scale animation, navigates to `/search`
- **Stats Bar** — Three metrics: *3+ Curated Places*, *12mo Climate Data*, *Live Weather Sync*

**Animations (Framer Motion):**
- Hero content fades in with upward slide (`y: 30 → 0`, 0.8s)
- Badge scales in with 0.2s delay
- Stats bar fades in with 0.6s delay
- CTA button has `whileHover` (scale 1.05) and `whileTap` (scale 0.97) interactions

### 6.2 Search Page (`pages/Search.jsx`)

The recommendation results page with full lifecycle state management.

**Flow:**
1. On mount, requests browser geolocation (8s timeout)
2. Falls back to **Trichy** coordinates (10.7905, 78.7047) if denied
3. Calls `getRecommendations(lat, lon, 500)` with a 500 km radius
4. Renders results in a responsive card grid

**UI States:**

| State | Visual |
|---|---|
| **Loading** | Spinning `Loader2` icon + contextual message (*"Getting your location…"* or *"Finding hidden gems…"*) |
| **Error** | Red `AlertCircle` icon + error message + "Try Again" button |
| **Empty** | `MapPinOff` icon + *"No hidden gems found… yet"* message |
| **Results** | Responsive grid (1 / 2 / 3 cols) of `PlaceCard` components |

**Additional Features:**
- Back navigation button to Home
- Location source indicator (GPS vs default)
- Results count display (*"X of Y places scored"*)
- API warning banner (amber) for weather fallback notices
- Staggered card entrance animations (0.1s delay per card)

---

## 7. Components

### 7.1 PlaceCard (`components/PlaceCard.jsx`)

A feature-rich glassmorphism card with 240 lines of interactive UI.

**Layout Sections:**

```
┌──────────────────────────────────────┐
│  [Image with gradient overlay]       │
│  ┌─────────┐              ┌────┐    │
│  │Hidden Gem│              │ 48%│    │
│  └─────────┘              └────┘    │
├──────────────────────────────────────┤
│  Place Name                  12.3 km │
│  Description text (2-line clamp)     │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Nature│ │Hills │ │Beach │        │
│  └──────┘ └──────┘ └──────┘        │
│  ┌──────────────────────────────┐   │
│  │ 🌡 Comfort — Mar    Great 85% │   │
│  │ ████████████████░░░░░        │   │
│  └──────────────────────────────┘   │
│  [👍 Like] [👎 Dislike] [⚠ Report]  │
└──────────────────────────────────────┘
```

**Features:**

| Feature | Detail |
|---|---|
| **Hero Image** | Place image with fallback to Unsplash mountain photo on error |
| **Gradient Overlay** | Bottom-to-top gradient for text readability over image |
| **Badges** | "Hidden Gem" 💎 (amber, percentile > 0.8) and "Off-Road" 🚗 (red) |
| **Score Pill** | Percentage score displayed top-right |
| **Distance** | Kilometres from user shown with MapPin icon |
| **Tags** | WATRS tags rendered as subtle bordered pills |
| **Comfort Widget** | Current month's weather comfort with colour-coded label + animated progress bar |
| **Weather Source** | "(historical)" amber indicator when live weather was unavailable |
| **Feedback Buttons** | Like (emerald), Dislike (red), Report/Safety Alert (amber) |
| **Feedback State** | Post-submission: buttons replaced with "Thanks for your feedback!" confirmation |

**Comfort Score Colour Mapping:**

| Score Range | Colour | Label |
|---|---|---|
| ≥ 0.75 | Emerald | Great |
| ≥ 0.50 | Amber | Fair |
| < 0.50 | Red | Poor |

**Animations:**
- Card entrance: fade + slide up (0.4s)
- Comfort progress bar: width animation from 0 to actual value (0.8s, 0.2s delay)
- Image zoom on card hover (scale 1.05, 0.5s)
- Feedback confirmation: scale + fade in

---

## 8. API Bridge (`lib/api.js`)

Centralised Axios client connecting the frontend to the FastAPI backend.

### Configuration

| Setting | Value |
|---|---|
| Base URL | `VITE_API_BASE_URL` or `http://localhost:8000` |
| Timeout | 10 seconds |
| Content-Type | `application/json` |

### Response Interceptor

Global error handler categorises failures:
- **Network errors** (`ERR_NETWORK`, `ECONNREFUSED`): Logs "backend unreachable" warning
- **HTTP errors**: Logs status code and detail message
- **Other errors**: Logs generic warning

### API Functions

| Function | Method | Endpoint | Fallback Return |
|---|---|---|---|
| `getRecommendations(lat, lon, radius, tags)` | GET | `/api/v1/recommendations` | `{ results: [], total_candidates: 0, warnings: ["Backend unreachable"] }` |
| `sendFeedback(placeId, feedbackType)` | POST | `/api/v1/feedback/{placeId}` | `{ success: false, message: "Could not submit feedback" }` |

Both functions return **safe fallback values** on failure instead of throwing, preventing UI crashes.

---

## 9. Utilities (`lib/utils.js`)

Single utility function:

```javascript
cn(...inputs) → string
```

Combines `clsx` (conditional class joins) with `twMerge` (Tailwind conflict resolution). Used throughout components for dynamic styling.

---

## 10. Environment Configuration

| Variable | File | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `.env` | Backend API base URL (`http://localhost:8000`) |

Vite exposes this at build time via `import.meta.env`.

---

## 11. Build & Dev Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Local dev server with HMR (port 5173) |
| `build` | `vite build` | Production bundle |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint .` | Code quality check |

---

## 12. ESLint Configuration

Flat ESLint config (`eslint.config.js`):
- Extends `@eslint/js` recommended rules
- React Hooks plugin (flat config)
- React Refresh plugin for Vite HMR
- Custom rule: `no-unused-vars` ignores uppercase/underscore-prefixed variables
- Ignores `dist/` build output

---

## 13. Summary of Frontend Work Completed

| Area | Work Done |
|---|---|
| **Project scaffolding** | Vite + React 19 initialisation with ESM module system |
| **Design system** | Custom Tailwind colour palette (primary blue + accent purple), Inter font, dark theme |
| **Custom CSS** | Gradient text, glassmorphism, and glass-hover utility classes |
| **Routing** | Client-side SPA routing with React Router v7 (Home + Search) |
| **Landing page** | Hero section with gradient orbs, animated CTA, and stats bar |
| **Search page** | Full lifecycle management — loading, error, empty, and results states with geolocation |
| **PlaceCard component** | Feature-rich card with image fallback, badges, tags, comfort widget, distance, and feedback |
| **API integration** | Axios bridge with error interceptors, safe fallbacks, and two endpoint functions |
| **Animations** | Framer Motion — page transitions, staggered grids, hover effects, progress bars |
| **Feedback system** | Interactive like/dislike/report buttons with submission state management |
| **Code quality** | ESLint with React Hooks and Refresh plugins |
| **Environment config** | Vite env variable for backend URL |
