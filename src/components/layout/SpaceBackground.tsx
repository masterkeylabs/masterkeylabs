"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function SpaceBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const springX = useSpring(mousePosition.x, { stiffness: 50, damping: 30 });
    const springY = useSpring(mousePosition.y, { stiffness: 50, damping: 30 });

    useEffect(() => {
        springX.set(mousePosition.x);
        springY.set(mousePosition.y);
    }, [mousePosition, springX, springY]);

    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; opacity: number; delay: number }[]>([]);

    useEffect(() => {
        const generatedStars = Array.from({ length: 200 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.7 + 0.3,
            delay: Math.random() * 5,
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none">
            {/* Deep Space Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(161,161,170,0.05)_0%,transparent_70%)]" />

            {/* Nebula elements */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="absolute inset-[-10%] opacity-30"
            >
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-silver/5 rounded-full blur-[150px]" />
            </motion.div>

            {/* Stars Layer 1 (Slow) */}
            <motion.div
                style={{ x: useTransform(springX, (v) => v * 0.5), y: useTransform(springY, (v) => v * 0.5) }}
                className="absolute inset-0"
            >
                {stars.slice(0, 100).map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute bg-white rounded-full"
                        style={{
                            top: star.top,
                            left: star.left,
                            width: star.size,
                            height: star.size,
                            opacity: star.opacity,
                        }}
                        animate={{ opacity: [star.opacity, 0.2, star.opacity] }}
                        transition={{ duration: 3 + star.delay, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </motion.div>

            {/* Stars Layer 2 (Faster) */}
            <motion.div
                style={{ x: springX, y: springY }}
                className="absolute inset-0"
            >
                {stars.slice(100).map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute bg-white rounded-full"
                        style={{
                            top: star.top,
                            left: star.left,
                            width: star.size * 0.8,
                            height: star.size * 0.8,
                            opacity: star.opacity * 0.5,
                        }}
                    />
                ))}
            </motion.div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />
        </div>
    );
}
