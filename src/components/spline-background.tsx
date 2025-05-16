
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
    console.log("Clicked:", e);
  };

  const handleMouseMove = (e: SplineEvent) => {
    // Accessing e.point might be specific to how SplineEvent is structured.
    // If e.point is not directly available, you might need to inspect the event object (e.g., e.target.point).
    // For now, logging the event or a specific property if known.
    // console.log("Mouse move:", e.point); // e.point might not be standard, using e.name or similar if available.
    if (e.target && 'name' in e.target) {
      console.log("Mouse move over object:", e.target.name);
    } else {
      console.log("Mouse move:", e);
    }
  };

  const onLoad = (splineApp: Application) => {
    if (splineApp) {
      console.log("Spline loaded");
      // Optional: Attach camera tracking or animation controls here
      // e.g., const camera = splineApp.findObjectByName('Camera');
      // if (camera) { /* ... control camera ... */ }
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full"> {/* Removed z-[-1] to allow interactions */}
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

