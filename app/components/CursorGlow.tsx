"use client";

import { useEffect } from "react";

export default function CursorGlow() {
    useEffect(() => {
        const glow = document.getElementById("cursor-glow");
        if (!glow) return;

        const move = (e: MouseEvent) => {
            glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        };

        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return null;
}
