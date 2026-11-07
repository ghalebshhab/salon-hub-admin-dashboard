"use client";

import { Check, ChevronDown, Palette, Sparkles, Type } from "lucide-react";
import { useEffect, useState } from "react";

type DashboardPalette = "ocean" | "plum" | "emerald";
type DashboardBackground = "aurora" | "mesh" | "grid";
type DashboardFont = "modern" | "editorial" | "compact";

const palettes: Array<{ id: DashboardPalette; label: string; colors: [string, string, string] }> = [
  { id: "ocean", label: "Ocean", colors: ["#4f46e5", "#06b6d4", "#0f172a"] },
  { id: "plum", label: "Plum", colors: ["#88556e", "#d4a0b7", "#2a1d27"] },
  { id: "emerald", label: "Emerald", colors: ["#047857", "#d97706", "#10251f"] },
];
const backgrounds: Array<{ id: DashboardBackground; label: string }> = [
  { id: "aurora", label: "Aurora" }, { id: "mesh", label: "Mesh" }, { id: "grid", label: "Grid" },
];
const fonts: Array<{ id: DashboardFont; label: string; sample: string }> = [
  { id: "modern", label: "Modern", sample: "Aa" }, { id: "editorial", label: "Editorial", sample: "Ag" }, { id: "compact", label: "Compact", sample: "01" },
];

export function DashboardThemePicker() {
  const [palette, setPalette] = useState<DashboardPalette>("ocean");
  const [background, setBackground] = useState<DashboardBackground>("aurora");
  const [font, setFont] = useState<DashboardFont>("modern");

  useEffect(() => {
    const root = document.documentElement.dataset;
    const nextPalette = root.palette === "plum" || root.palette === "emerald" ? root.palette : "ocean";
    const nextBackground = root.background === "mesh" || root.background === "grid" ? root.background : "aurora";
    const nextFont = root.font === "editorial" || root.font === "compact" ? root.font : "modern";
    const timer = window.setTimeout(() => { setPalette(nextPalette); setBackground(nextBackground); setFont(nextFont); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function choosePalette(next: DashboardPalette) { document.documentElement.setAttribute("data-palette", next); window.localStorage.setItem("salon-hub-admin-palette", next); setPalette(next); }
  function chooseBackground(next: DashboardBackground) { document.documentElement.setAttribute("data-background", next); window.localStorage.setItem("salon-hub-admin-background", next); setBackground(next); }
  function chooseFont(next: DashboardFont) { document.documentElement.setAttribute("data-font", next); window.localStorage.setItem("salon-hub-admin-font", next); setFont(next); }

  return (
    <details className="admin-customizer" open>
      <summary><Sparkles size={14} /><span>Customize</span><ChevronDown size={13} /></summary>
      <div className="admin-customizer-group">
        <div className="admin-customizer-label"><Palette size={12} />Color</div>
        <div className="admin-choice-grid">
          {palettes.map((option) => <button className={palette === option.id ? "is-active" : ""} key={option.id} type="button" onClick={() => choosePalette(option.id)} aria-pressed={palette === option.id} title={`${option.label} colors`}><span className="admin-palette-swatches">{option.colors.map((color) => <i key={color} style={{ backgroundColor: color }} />)}</span><strong>{option.label}</strong>{palette === option.id && <Check size={10} />}</button>)}
        </div>
      </div>
      <div className="admin-customizer-group">
        <div className="admin-customizer-label"><Sparkles size={12} />Background</div>
        <div className="admin-choice-grid">
          {backgrounds.map((option) => <button className={background === option.id ? "is-active" : ""} key={option.id} type="button" onClick={() => chooseBackground(option.id)} aria-pressed={background === option.id} title={`${option.label} background`}><span className={`admin-background-sample ${option.id}`}><i /><i /></span><strong>{option.label}</strong>{background === option.id && <Check size={10} />}</button>)}
        </div>
      </div>
      <div className="admin-customizer-group">
        <div className="admin-customizer-label"><Type size={12} />Typography</div>
        <div className="admin-choice-grid admin-font-choices">
          {fonts.map((option) => <button className={`${font === option.id ? "is-active" : ""} font-${option.id}`} key={option.id} type="button" onClick={() => chooseFont(option.id)} aria-pressed={font === option.id} title={`${option.label} typography`}><span>{option.sample}</span><strong>{option.label}</strong>{font === option.id && <Check size={10} />}</button>)}
        </div>
      </div>
    </details>
  );
}
