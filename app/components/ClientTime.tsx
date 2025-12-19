"use client";

import { useEffect, useState } from "react";

export default function ClientTime({
    iso,
    options,
}: {
    iso: string;
    options?: Intl.DateTimeFormatOptions;
}) {
    const [text, setText] = useState<string>("");

    useEffect(() => {
        const d = new Date(iso);
        setText(
            d.toLocaleString(undefined, options ?? {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    }, [iso, options]);

    // keeps server + client identical during hydration
    return <span suppressHydrationWarning>{text || "—"}</span>;
}
