"use client";

import { useEffect, useState } from "react";
import "./preloader.css";

const MIN_DISPLAY_MS = 800;

export default function Preloader() {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const startTime = Date.now();

        function hidePreloader() {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

            setTimeout(() => {
                setIsHidden(true);
            }, remaining);
        }

        // Check if page is already loaded
        if (document.readyState === "complete") {
            hidePreloader();
        } else {
            window.addEventListener("load", hidePreloader);
            return () => window.removeEventListener("load", hidePreloader);
        }
    }, []);

    return (
        <div className={`preloader${isHidden ? " preloader-hidden" : ""}`} aria-hidden={isHidden}>
            <div className="preloader-content">
                <div className="preloader-dot" />
                <div className="preloader-brand">SleazyG_27</div>
                <div className="preloader-text">
                    Loading
                    <span className="preloader-dots">
                        <span />
                        <span />
                        <span />
                    </span>
                </div>
            </div>
        </div>
    );
}
