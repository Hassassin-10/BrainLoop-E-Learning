
"use client";

import dynamic from "next/dynamic";
import type { SplineEvent } from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";

// Dynamically import Spline to ensure it's client-side only and SSR is false.
// Attempting to use the standard import, relying on the package's "exports" field.
const Spline = dynamic(
  () => import('@splinetool/react-spline').then((mod) => mod.default),
  {
    ssr: false, // Ensures this component only renders on the client.
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
        <div className="animate-pulse text-primary">Loading 3D Scene...</div>
      </div>
    ),
  }
);

export function SplineBackground() {
  const handleMouseDown = (e: SplineEvent) => {
    // console.log("Spline interaction (mousedown):", e.target?.name);
  };

  const handleMouseMove = (e: SplineEvent) => {
    // console.log("Spline interaction (mousemove on):", e.target?.name);
  };

  const onLoad = (splineApp: Application) => {
    if (splineApp) {
      // console.log("Spline scene loaded successfully.");
      // You can interact with the Spline application instance here if needed.
      // e.g., splineApp.findObjectByName('MyObject')?.visible = false;
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full">
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
