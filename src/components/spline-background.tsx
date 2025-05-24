
"use client";

import dynamic from "next/dynamic";
import type { SplineEvent } from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
      <div className="animate-pulse text-primary">Loading 3D Scene...</div>
    </div>
  ),
});

export function SplineBackground() {
  const handleMouseDown = (e: SplineEvent) => {
    // console.log("Spline interaction:", e);
  };

  const handleMouseMove = (e: SplineEvent) => {
    // Accessing e.point might be specific to how SplineEvent is structured.
    // For now, logging the event or a specific property if known.
    // console.log("Mouse move over Spline:", e.name);
  };

  const onLoad = (splineApp: Application) => {
    if (splineApp) {
      // console.log("Spline scene loaded");
      // Optional: Attach camera tracking or animation controls here
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full"> {/* Interactions enabled */}
      <Spline
        scene="https://prod.spline.design/2bQwIVHcPknQyiuy/scene.splinecode"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onLoad={onLoad}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
