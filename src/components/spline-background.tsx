"use client";

import { Spline } from "@splinetool/react-spline";
import type { Application } from "@splinetool/runtime";

// Optional: define or import this if needed more strictly
type SplineEvent = {
  target: {
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

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
    console.log("Spline loaded", splineApp);
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
