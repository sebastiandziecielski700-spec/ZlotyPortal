"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SkanowaniePage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
            });
            setStream(mediaStream);
            setHasPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
        } catch (error) {
            console.error("Błąd dostępu do aparatu:", error);
            setHasPermission(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data URL
            const imageDataUrl = canvas.toDataURL("image/jpeg");
            setCapturedImage(imageDataUrl);

            // Post-capture: process image
            processImage();
        }
    };

    const processImage = async () => {
        if (!capturedImage) return;
        setIsProcessing(true);
        
        try {
            // Convert data URl to Blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            const file = new File([blob], `scan_${Date.now()}.jpeg`, { type: "image/jpeg" });

            // // TODO: Add auth guard before production
            const supabase = createClient();
            
            const { data, error } = await supabase.storage
                .from("id-scans")
                .upload(`scans/${file.name}`, file, {
                    contentType: "image/jpeg",
                    upsert: false
                });

            if (error) {
                throw error;
            }

            setIsProcessing(false);
            setIsSuccess(true);

            // Po sukcesie przekierowujemy do strony głównej
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err) {
            console.error("Błąd podczas przetwarzania obrazu:", err);
            setIsProcessing(false);
            setIsSuccess(false);
            alert("Błąd podczas wgrywania skanu legitymacji.");
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setIsProcessing(false);
        setIsSuccess(false);
    };

    if (hasPermission === false) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl">videocam_off</span>
                </div>
                <h1 className="text-xl font-bold mb-2">Brak dostępu do aparatu</h1>
                <p className="text-slate-400 mb-6 max-w-sm">
                    Aby zeskanować legitymację, musisz zezwolić przeglądarce na dostęp do aparatu.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#c62a3a] rounded-lg font-semibold hover:bg-red-700 transition"
                >
                    Spróbuj ponownie
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden text-white">
            {/* Header */}
            <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="text-center font-medium">Skanowanie legitymacji</div>
                <div className="w-10 h-10"></div> {/* Spacer */}
            </header>

            {/* Main content area */}
            <main className="flex-1 relative flex flex-col">
                {/* Camera View */}
                {!capturedImage && (
                    <div className="relative flex-1 bg-black flex items-center justify-center h-full">
                        <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full object-cover"
                            playsInline
                            autoPlay
                            muted
                        />

                        {/* Overlay guidelines */}
                        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center border-[20px] border-black/40">
                            <div className="w-full max-w-[90%] aspect-[1.58/1] border-2 border-dashed border-white/70 rounded-xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#c62a3a] rounded-tl-xl -translate-x-0.5 -translate-y-0.5"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#c62a3a] rounded-tr-xl translate-x-0.5 -translate-y-0.5"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#c62a3a] rounded-bl-xl -translate-x-0.5 translate-y-0.5"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#c62a3a] rounded-br-xl translate-x-0.5 translate-y-0.5"></div>
                            </div>
                            <p className="text-white/80 font-medium mt-6 text-sm px-4 text-center">
                                Umieść legitymację wewnątrz ramki
                            </p>
                        </div>

                        {/* Capture Button */}
                        <div className="absolute bottom-10 inset-x-0 flex justify-center z-20">
                            <button
                                onClick={takePhoto}
                                className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm border-[4px] border-white flex items-center justify-center hover:bg-white/50 transition-colors"
                            >
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black">
                                    <span className="material-symbols-outlined text-3xl">photo_camera</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing View */}
                {capturedImage && (
                    <div className="relative flex-1 bg-black flex flex-col items-center justify-center h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={capturedImage}
                            alt="Captured id"
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />

                        <div className="relative z-10 flex flex-col items-center p-8 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 m-6">
                            {isProcessing && (
                                <>
                                    <div className="w-16 h-16 border-4 border-[#c62a3a]/30 border-t-[#c62a3a] rounded-full animate-spin mb-4"></div>
                                    <h2 className="text-xl font-bold mb-2">Przetwarzanie...</h2>
                                    <p className="text-white/70 text-center text-sm">
                                        Wysyłanie zdjęcia do bazy i weryfikacja tożsamości.
                                    </p>
                                </>
                            )}

                            {isSuccess && (
                                <>
                                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">Zweryfikowano pomyślnie!</h2>
                                    <p className="text-white/70 text-center text-sm">
                                        Za chwilę nastąpi przekierowanie...
                                    </p>
                                </>
                            )}

                            {!isProcessing && !isSuccess && (
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={retakePhoto}
                                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
                                    >
                                        <span className="material-symbols-outlined">refresh</span>
                                        Ponów próbę
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Hidden canvas for taking photos */}
                <canvas ref={canvasRef} className="hidden" />
            </main>
        </div>
    );
}
