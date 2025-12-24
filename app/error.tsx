"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Runtime error:", error);
    }, [error]);

    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-code">500</div>
                <h1 className="error-title">Round Lost!</h1>
                <p className="error-message">
                    Something broke on our end. The server threw a molly at itself.
                    Don&apos;t worry, we&apos;re calling a timeout.
                </p>

                <div className="error-actions">
                    <button onClick={reset} className="error-btn error-btn-primary">
                        Try Again
                    </button>
                    <a href="/" className="error-btn error-btn-ghost">
                        Back to Spawn
                    </a>
                </div>

                <div className="error-hint">
                    <span>If this keeps happening, the devs might be throwing.</span>
                </div>
            </div>

            <div className="error-decoration">
                <span className="error-crosshair">+</span>
            </div>
        </div>
    );
}
