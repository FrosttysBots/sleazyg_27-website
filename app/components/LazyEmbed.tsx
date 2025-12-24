"use client";

import { useEffect, useRef, useState } from "react";

type LazyEmbedProps = {
    src: string;
    title: string;
    className?: string;
    allow?: string;
};

export default function LazyEmbed({ src, title, className, allow }: LazyEmbedProps) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "100px" } // Start loading 100px before visible
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className={className} style={{ minHeight: isVisible ? undefined : 200 }}>
            {isVisible ? (
                <iframe
                    className={className}
                    src={src}
                    allow={allow ?? "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"}
                    allowFullScreen
                    title={title}
                />
            ) : (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        minHeight: 200,
                        background: "rgba(15, 23, 42, 0.6)",
                        borderRadius: 12,
                        color: "rgba(226, 232, 240, 0.6)",
                        fontSize: "0.9rem",
                    }}
                >
                    Loading {title}...
                </div>
            )}
        </div>
    );
}
