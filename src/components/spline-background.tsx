"use client";

import dynamic from "next/dynamic";
import type { Application } from "@splinetool/runtime";

// ✅ Define a basic SplineEvent type to avoid the import error
type SplineEvent = {
  target: {
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

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
    if (e.target && "name" in e.target) {
      console.log("Mouse move over object:", e.target.name);
    } else {
      console.log("Mouse move:", e);
    }
  };

  const onLoad = (splineApp: Application) => {
    if (splineApp) {
      console.log("Spline loaded");
      // Optional: add camera/animation control here
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
