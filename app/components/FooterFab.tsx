"use client";

import { usePathname } from "next/navigation";

export default function FooterFab({ onClick }: { onClick?: () => void }) {
    const pathname = usePathname();

    if (pathname !== "/community") return null;

    return (
        <button
            type="button"
            className="fab footer-fab"
            aria-label="Add message"
            onClick={onClick}
        >
            +
        </button>
    );
}
