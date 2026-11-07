"use client";

import { useEffect, useState } from "react";
import Aurora from "@/components/react-bits/aurora";

export function DashboardBackdrop() {
  const [dark, setDark] = useState(false);
  const [palette, setPalette] = useState("ocean");
  const [background, setBackground] = useState("aurora");

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => {
      setDark(root.dataset.theme === "dark");
      setPalette(root.dataset.palette ?? "ocean");
      setBackground(root.dataset.background ?? "aurora");
    };
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-palette", "data-background"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`admin-aurora admin-background-${background}`} aria-hidden="true">
      {background === "aurora" ? <Aurora
        colorStops={
          palette === "plum"
            ? dark ? ["#6f3155", "#b86a94", "#6e5aa8"] : ["#b56b8c", "#d9a2ba", "#9b7bc4"]
            : palette === "emerald"
              ? dark ? ["#047857", "#0891b2", "#b45309"] : ["#10b981", "#22d3ee", "#f59e0b"]
              : dark ? ["#4338ca", "#0891b2", "#7c3aed"] : ["#6366f1", "#22d3ee", "#8b5cf6"]
        }
        amplitude={0.72}
        blend={0.78}
        speed={0.24}
        height={0.6}
        scale={0.88}
        glow={0.45}
        brightness={dark ? 0.64 : 0.5}
        layers={2}
        mouseInteraction={false}
        opacity={dark ? 0.26 : 0.15}
        lightMode={!dark}
      /> : <div className="admin-css-background"><i /><i /><i /></div>}
    </div>
  );
}
