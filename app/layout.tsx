import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import CursorGlow from "./components/CursorGlow";
import Preloader from "./components/Preloader";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
    title: "SleazyG_27 Hub",
    description: "Community hub for SleazyG_27 - streams, clips, socials and more.",
};

function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer-inner">
                <div className="footer-brand">
                    <span className="footer-logo-dot" />
                    <div className="footer-brand-text">
                        <span className="footer-brand-name">SleazyG_27</span>
                        <span className="footer-brand-sub">Valorant - Variety - Community</span>
                    </div>
                </div>

                <nav className="footer-links">
                    <a href="/">Home</a>
                    <a href="/clips">Clips</a>
                    <a href="/social">Socials</a>
                    <a href="/discord">Discord</a>
                </nav>

                <div className="footer-socials">
                    <a href="https://twitch.tv/SleazyG_27" target="_blank" rel="noreferrer">Twitch</a>
                    <a href="https://www.youtube.com/@buntbaby420" target="_blank" rel="noreferrer">YouTube</a>
                    <a href="https://instagram.com/sleazyg_27" target="_blank" rel="noreferrer">Instagram</a>
                    <a href="https://tiktok.com/@blunt_baby27" target="_blank" rel="noreferrer">TikTok</a>
                    <a href="https://x.com/sportyg27" target="_blank" rel="noreferrer">X</a>
                </div>
            </div>

            <div className="site-footer-bottom">
                <span>&copy; {new Date().getFullYear()} SleazyG_27. All rights reserved.</span>
                <span className="footer-made-by">Built with love by Frostty.</span>
            </div>
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
