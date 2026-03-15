/**
 * src/App.jsx
 * ───────────
 * Root application component with BrowserRouter.
 *
 * Routes:
 *   /        → Home (landing page + search trigger)
 *   /search  → Results (recommendation cards)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Search from "./pages/Search";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
