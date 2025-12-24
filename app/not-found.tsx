import Link from "next/link";

export default function NotFound() {
    return (
        <div className="error-page">
            <div className="error-content">
                <div className="error-code">404</div>
                <h1 className="error-title">You whiffed!</h1>
                <p className="error-message">
                    The page you&apos;re looking for got smoked. Maybe it rotated,
                    or it never existed in the first place.
                </p>

                <div className="error-actions">
                    <Link href="/" className="error-btn error-btn-primary">
                        Back to Spawn
                    </Link>
                    <Link href="/clips" className="error-btn error-btn-ghost">
                        Watch Clips
                    </Link>
                </div>

                <div className="error-suggestions">
                    <span className="error-suggestions-label">Try these instead:</span>
                    <div className="error-links">
                        <Link href="/community">Community</Link>
                        <Link href="/social">Socials</Link>
                        <Link href="/discord">Discord</Link>
                    </div>
                </div>
            </div>

            <div className="error-decoration">
                <span className="error-crosshair">+</span>
            </div>
        </div>
    );
}
