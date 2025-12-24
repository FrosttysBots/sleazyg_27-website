"use client";

import { TwitchIcon, YouTubeIcon, InstagramIcon, TikTokIcon, XIcon } from "./SocialIcons";

export default function FooterSocials() {
    return (
        <div className="footer-socials">
            <span className="footer-socials-label">CONNECT</span>
            <div className="footer-socials-grid">
                <a href="https://twitch.tv/SleazyG_27" target="_blank" rel="noreferrer" className="footer-social-link footer-social-twitch">
                    <TwitchIcon className="footer-social-svg" />
                    <span>Twitch</span>
                </a>
                <a href="https://www.youtube.com/@buntbaby420" target="_blank" rel="noreferrer" className="footer-social-link footer-social-youtube">
                    <YouTubeIcon className="footer-social-svg" />
                    <span>YouTube</span>
                </a>
                <a href="https://instagram.com/sleazyg_27" target="_blank" rel="noreferrer" className="footer-social-link footer-social-instagram">
                    <InstagramIcon className="footer-social-svg" />
                    <span>Instagram</span>
                </a>
                <a href="https://tiktok.com/@blunt_baby27" target="_blank" rel="noreferrer" className="footer-social-link footer-social-tiktok">
                    <TikTokIcon className="footer-social-svg" />
                    <span>TikTok</span>
                </a>
                <a href="https://x.com/sportyg27" target="_blank" rel="noreferrer" className="footer-social-link footer-social-x">
                    <XIcon className="footer-social-svg" />
                    <span>X</span>
                </a>
            </div>
        </div>
    );
}
