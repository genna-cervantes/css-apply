"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        const textTimer = setTimeout(() => {
            setShowText(true);
        }, 500);

        return () => {
            clearInterval(interval);
            clearTimeout(textTimer);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-[#000000] via-[rgb(1,124,238)] via-69% to-[#0054FF] flex flex-col items-center justify-center z-50">
        <div className="mb-8">
            <Image
            src="/assets/logos/cssapply_logo.png"
            alt="CSS Apply Logo"
            width={140}
            height={80}
            className="drop-shadow-md"
            />
        </div>
        
        <div className="w-80 bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            ></div>
        </div>
        
        {showText && (
            <div className="text-white text-center">
            <p className="text-lg font-semibold mb-2">Getting things ready...</p>
            <p className="text-sm opacity-80">You'll be redirected in a moment</p>
            </div>
        )}
        
        <div className="mt-8 flex space-x-2">
            {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
            ))}
        </div>
        </div>
    );
}