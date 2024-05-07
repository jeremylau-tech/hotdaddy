"use client";

import React from "react";
import Lottie from "react-lottie";
import loadingAnimation from "./loadingSapling.json";

export default function Loading() {
  return (
    <main className="h-screen w-screen flex items-center justify-center">
      <div className="h-160 w-96">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingAnimation,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice",
            },
          }}
          height="100%"
          width="100%"
        />
      </div>
    </main>
  );
}
