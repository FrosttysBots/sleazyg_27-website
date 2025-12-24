import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import CursorGlow from "./components/CursorGlow";
import Preloader from "./components/Preloader";
import FooterSocials from "./components/FooterSocials";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
    title: "SleazyG_27 Hub",
    description: "Community hub for SleazyG_27 - streams, clips, socials and more.",
};

function Footer() {
    return (
        <footer className="site-footer">
            {/* Animated top border */}
            <div className="footer-border-glow" />

            <div className="site-footer-inner">
                {/* Brand section */}
                <div className="footer-brand">
                    <div className="footer-logo-container">
                        <span className="footer-logo-dot" />
                        <span className="footer-logo-ring" />
                    </div>
                    <div className="footer-brand-text">
                        <span className="footer-brand-name">SLEAZYG_27</span>
                        <span className="footer-brand-sub">VALORANT // VARIETY // COMMUNITY</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="footer-links">
                    <span className="footer-links-label">NAVIGATE</span>
                    <div className="footer-links-grid">
                        <a href="/">Home</a>
                        <a href="/clips">Clips</a>
                        <a href="/community">Community</a>
                        <a href="/social">Socials</a>
                        <a href="/discord">Discord</a>
                    </div>
                </nav>

                {/* Socials */}
                <FooterSocials />
            </div>

            <div className="site-footer-bottom">
                <div className="footer-bottom-left">
                    <span className="footer-copyright">&copy; {new Date().getFullYear()} SleazyG_27</span>
                    <span className="footer-divider">|</span>
                    <span className="footer-tagline">Stream. Play. Connect.</span>
                </div>
                <span className="footer-made-by">
                    Built with <span className="footer-heart">♥</span> by Frostty
                </span>
            </div>

            {/* HUD corner decorations */}
            <div className="footer-corner footer-corner-bl" />
            <div className="footer-corner footer-corner-br" />
        </footer>
    );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Preloader />
                <Navbar />
                <div id="cursor-glow" />
                <CursorGlow />

                <main className="site-main">{children}</main>

                <Footer />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
