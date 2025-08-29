import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Html, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, RefreshCw, Clock, Eye } from "lucide-react";

/**
 * 3D + Animated Maintenance Page (React JSX)
 * - Message: server change attempt; we'll be back in a few hours
 * - Live visitor count: starts at 6,352 and increments once when page opens
 * - Fancy 3D scene via @react-three/fiber + drei
 * - TailwindCSS styling (no import needed in this environment)
 *
 * NOTE (optional backend hook):
 * Replace the localStorage/sessionStorage logic with a real API to keep a true global count.
 * Example (pseudo):
 *   fetch("/api/visitors/increment", { method: "POST" })
 *     .then(r => r.json()).then(({ total }) => setTargetCount(total));
 */

// === 3D Parts ===
function SpinningKnot() {
  const ref = useRef();
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.25;
    ref.current.rotation.y += delta * 0.35;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.1}>
        <torusKnotGeometry args={[1, 0.3, 200, 32]} />
        <meshStandardMaterial metalness={0.6} roughness={0.2} envMapIntensity={1.2} color="#7c3aed" />
      </mesh>
    </Float>
  );
}

function PulsingShield() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = performance.now() / 1000;
    ref.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
  });
  return (
    <Float speed={1}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial emissive="#22c55e" emissiveIntensity={0.5} color="#10b981" metalness={0.3} roughness={0.4} />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 3, 2]} intensity={0.9} />
      <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <SpinningKnot />
      <group position={[2.2, -1.6, 0]}>
        <PulsingShield />
      </group>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
    </>
  );
}

// === Utility: animated number ===
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const start = value;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - startTime) / duration);
      setValue(Math.round(start + diff * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

// === Main Component ===
export default function Maintenance3D() {
  const BASE = 6352; // initial visitors since launch
  const [targetCount, setTargetCount] = useState(BASE);

  // On first open of a session, increment the total (client-side demo)
  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem("cw_total_visitors") || String(BASE), 10);
      const counted = sessionStorage.getItem("cw_counted_session");
      const next = counted ? stored : stored + 1; // increment once per browser session
      if (!counted) sessionStorage.setItem("cw_counted_session", "1");
      localStorage.setItem("cw_total_visitors", String(next));
      setTargetCount(next);

      // OPTION: Real API increment -> uncomment & implement server route
      // fetch("/api/visitors/increment", { method: "POST" })
      //   .then(r => r.json())
      //   .then(({ total }) => setTargetCount(total))
      //   .catch(() => {});
    } catch (e) {
      setTargetCount(BASE + 1);
    }
  }, []);

  const animated = useAnimatedNumber(targetCount);

  // Glitchy headline effect pieces
  const glitch = useMemo(() => [
    { x: 0, y: 0, o: 1 },
    { x: 2, y: -2, o: 0.6 },
    { x: -2, y: 1, o: 0.4 },
  ], []);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white relative overflow-hidden">
      {/* Gradient glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl opacity-30 bg-fuchsia-600" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full blur-3xl opacity-30 bg-emerald-500" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 -z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Content Card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-3xl rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 md:p-10">
          <div className="flex items-center gap-3 text-fuchsia-300">
            <ShieldAlert className="h-6 w-6" />
            <span className="uppercase tracking-widest text-xs">System Notice</span>
          </div>

          {/* Glitchy Title */}
          <div className="relative mt-4">
            <AnimatePresence>
              {glitch.map((g, i) => (
                <motion.h1
                  key={i}
                  className="text-4xl md:text-6xl font-extrabold leading-tight select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: g.o, x: g.x, y: g.y }}
                  transition={{ duration: 0.3 + i * 0.05, repeat: Infinity, repeatType: "mirror", repeatDelay: 2 }}
                  style={{ position: i === 0 ? "relative" : "absolute", top: 0, left: 0 }}
                >
                  We’re locking things down 🔐
                </motion.h1>
              ))}
            </AnimatePresence>
          </div>

          <p className="mt-5 text-slate-300 text-base md:text-lg leading-relaxed">
            Someone tried to make changes on our server. We’ve paused access while we secure everything.
            We’ll be right back in a few hours. No action needed on your side.
          </p>

          {/* Status pills */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/30 px-3 py-1 text-fuchsia-200 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin-slow" /> Hardening in progress
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 px-3 py-1 text-emerald-200 text-sm">
              <Eye className="h-4 w-4" /> Monitoring live
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-600/20 border border-sky-500/30 px-3 py-1 text-sky-200 text-sm">
              <Clock className="h-4 w-4" /> Back in a few hours
            </span>
          </div>

          {/* Live Visitors */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl bg-black/40 border border-white/10 p-5">
              <div className="text-sm uppercase tracking-wider text-slate-400">Total visitors since launch</div>
              <div className="mt-1 text-5xl font-black tabular-nums">{animated.toLocaleString()}</div>
              <div className="mt-2 text-slate-400 text-sm">Count increases once when this page opens in a browser session.</div>
            </div>

            <div className="rounded-xl bg-black/40 border border-white/10 p-5">
              <div className="text-sm uppercase tracking-wider text-slate-400">Status</div>
              <div className="mt-1 text-2xl font-bold text-emerald-300">SAFE MODE</div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-fuchsia-500 to-emerald-400" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
            <div>© {new Date().getFullYear()} CiteWise · All systems under watch.</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live telemetry enabled
            </div>
          </div>
        </div>
      </div>

      {/* Little helper styles */}
      <style>{`
        .animate-spin-slow { animation: spin 2.5s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
