'use client';
import { useRef, useEffect } from 'react';

/**
 * VideoLogo Component
 * Renders a high-fidelity video logo with fallback support.
 * The logo has a dark background by design; the parent container
 * in page.js handles theme-based styling of the card wrapper.
 *
 * @param {string} src - Path to the video file.
 * @param {string} poster - Fallback image if video fails to load.
 * @param {string} className - Additional CSS classes.
 * @param {object} style - Inline styles.
 */
export default function VideoLogo({ 
    src = "/video-logo.mp4", 
    poster = "/logo.png", 
    className = "", 
    style = {},
    autoPlay = true,
    loop = true,
    muted = true,
    playsInline = true
}) {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && autoPlay) {
            videoRef.current.play().catch(error => {
                console.warn("VideoLogo: Autoplay failed:", error);
            });
        }
    }, [autoPlay]);

    return (
        <div className={`relative overflow-hidden notranslate ${className}`} style={style} translate="no">
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                autoPlay={autoPlay}
                loop={loop}
                muted={muted}
                playsInline={playsInline}
                webkit-playsinline="true"
                disablePictureInPicture
                controlsList="nopictureinpicture"
                translate="no"
                className="w-full h-full object-contain pointer-events-none notranslate"
                onContextMenu={(e) => e.preventDefault()}
            >
                {/* Fallback for very old browsers */}
                <img src={poster} alt="MasterKey Labs Logo" className="w-full h-full object-contain" />
            </video>
        </div>
    );
}
