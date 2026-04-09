"use client";
import { useState, useEffect } from "react";

export function useBreakpoint() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function update() { setWidth(window.innerWidth); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    isMobile: width > 0 && width < 640,
    isTablet: width > 0 && width < 1024,
    width,
  };
}
