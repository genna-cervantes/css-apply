"use client";

import type { IScannerControls } from "@zxing/browser";
import { Camera, CameraOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ScannerState = "idle" | "starting" | "scanning" | "blocked" | "error";

export default function AttendanceQrScanner({
  disabled = false,
  onScan,
}: {
  disabled?: boolean;
  onScan: (credential: string) => void | Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const disabledRef = useRef(disabled);
  const onScanRef = useRef(onScan);
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);
  const [state, setState] = useState<ScannerState>("idle");
  const [message, setMessage] = useState(
    "Camera access starts only when you press Start scanning.",
  );

  useEffect(() => {
    disabledRef.current = disabled;
    lastScanRef.current = null;
  }, [disabled]);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setState("idle");
    setMessage("Camera stopped. Start it again when you are ready.");
  }, []);

  useEffect(
    () => () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    },
    [],
  );

  const startScanner = useCallback(async () => {
    if (disabled || state === "starting" || state === "scanning") return;
    if (!window.isSecureContext) {
      setState("blocked");
      setMessage("Camera scanning requires HTTPS or localhost.");
      return;
    }

    setState("starting");
    setMessage("Requesting camera permission…");
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const video = videoRef.current;
      if (!video) throw new Error("VIDEO_UNAVAILABLE");
      const reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 150,
        delayBetweenScanSuccess: 800,
      });
      controlsRef.current = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        video,
        (result) => {
          if (!result || disabledRef.current) return;
          const value = result.getText().trim();
          const now = Date.now();
          const previous = lastScanRef.current;
          if (
            !value ||
            (previous?.value === value && now - previous.at < 2_000)
          ) {
            return;
          }
          lastScanRef.current = { value, at: now };
          void onScanRef.current(value);
        },
      );
      setState("scanning");
      setMessage(
        "Scan a CSS digital ID QR or an imported student’s UST QR. Camera frames stay on this device.",
      );
    } catch (error) {
      const permissionDenied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");
      setState(permissionDenied ? "blocked" : "error");
      setMessage(
        permissionDenied
          ? "Camera permission was denied. Allow access or use manual lookup."
          : "The camera could not start. Check whether another app is using it.",
      );
    }
  }, [disabled, state]);

  return (
    <section className="rounded-2xl border border-[#005FD9]/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#044FAF]/60">
            Camera input
          </p>
          <h2 className="font-poppins text-xl font-bold text-[#134687]">
            QR scanner
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F2FF] px-3 py-1 font-mono text-[10px] font-semibold uppercase text-[#044FAF]">
          <span
            className={`h-2 w-2 rounded-full ${state === "scanning" ? "bg-green-500" : "bg-gray-400"}`}
          />
          {state === "scanning"
            ? "Live"
            : state === "starting"
              ? "Starting"
              : "Camera off"}
        </span>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-[#071A34]">
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Live attendance QR scanner"
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-[14%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(3,21,48,0.48)]" />
        {state !== "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
            {state === "starting" ? (
              <LoaderCircle className="h-8 w-8 animate-spin" />
            ) : (
              <CameraOff className="h-8 w-8" />
            )}
            <strong className="font-poppins text-sm">
              {state === "starting" ? "Opening camera" : "Camera is off"}
            </strong>
          </div>
        )}
      </div>

      <p
        className={`mt-3 flex items-start gap-2 text-xs ${state === "error" || state === "blocked" ? "text-red-700" : "text-[#134687]/65"}`}
        role={state === "error" || state === "blocked" ? "alert" : undefined}
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {message}
      </p>

      <button
        type="button"
        onClick={state === "scanning" ? stopScanner : startScanner}
        disabled={(disabled && state !== "scanning") || state === "starting"}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#134687] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#044FAF] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "starting" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : state === "scanning" ? (
          <CameraOff className="h-4 w-4" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        {state === "scanning" ? "Stop camera" : "Start scanning"}
      </button>
    </section>
  );
}
