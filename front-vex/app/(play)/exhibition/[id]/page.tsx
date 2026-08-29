"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";
import Cookies from "js-cookie";

import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { v4 as uuidv4 } from 'uuid';

import Experience from "@/components/play/experience";
import Crosshair from "@/components/play/crosshair";
import Image from "next/image";

import {
  getKaryaList, getPlayerName, deletePlayer,
  getKaryaDetail, postKunjungan
} from "@/components/play/apiPlay";

type PosterData = {
  src: string;
  booth: string;
};

/* ======================= */
/* AUTH HEADERS HELPER     */
/* ======================= */

export default function ExhibitionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Mode kamera (first/third person) di-lift ke sini (bukan di dalam
  // Experience/Canvas lagi) supaya Crosshair (cuma boleh tampil pas
  // first-person) dan tombol "ganti sudut pandang" di HUD mobile bisa
  // baca/ubah state yang sama dari luar <Canvas>.
  const [cameraMode, setCameraMode] = useState<"first" | "third">("first");

  // Label "Tekan E untuk ..." — dikirim dari ThirdPersonInteract (di dalam
  // Canvas) lewat callback onInteractHint, ditampilkan sebagai HUD di sini.
  const [interactHint, setInteractHint] = useState<{ label: string } | null>(null);

  // Loading dibagi 2 fase, digabung jadi satu progress bar 0-100%:
  //   Fase 1 (bobot 30%): fetch data awal di Experience — getHallModel,
  //     getKaryaList, getPameranFolder. Ini terjadi SEBELUM scene di-mount,
  //     jadi useProgress() drei belum ada apa pun untuk dibaca di sini.
  //     Experience memanggil onDataReady() sekali saat fase ini selesai.
  //   Fase 2 (bobot 70%): load GLTF (hall + booth model) dan texture
  //     (poster/sampul/panel display) — semuanya lewat sharedTextureLoader
  //     (lihat loadingManager.ts) sehingga ikut terbaca oleh useProgress()
  //     dari <LoaderWatcher> di dalam <Canvas>.
  // Pembagian 30/70 ini perkiraan kasar (fetch JSON biasanya jauh lebih
  // cepat dari decode model 3D + texture), bukan ukuran presisi — tapi
  // progress tetap representatif dan tidak pernah mundur.
  const DATA_FETCH_WEIGHT = 30;
  const ASSET_LOAD_WEIGHT = 70;

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [assetProgress, setAssetProgress] = useState(0); // 0-100 dari useProgress()
  const [loadProgress, setLoadProgress] = useState(0);   // gabungan 0-100, dipakai progress bar

  const handleDataReady = useCallback(() => {
    setDataReady(true);
  }, []);

  // Gabungkan kedua fase jadi satu angka. Pakai Math.max terhadap nilai
  // sebelumnya supaya progress bar tidak pernah terlihat mundur, walau
  // misal assetProgress sempat reset karena re-render Experience.
  useEffect(() => {
    const dataPortion = dataReady ? DATA_FETCH_WEIGHT : 0;
    const assetPortion = dataReady ? (assetProgress / 100) * ASSET_LOAD_WEIGHT : 0;
    const combined = dataPortion + assetPortion;
    setLoadProgress((prev) => Math.max(prev, combined));
  }, [dataReady, assetProgress]);

  // Intro: "controls" → "welcome" → null (ditutup)
  // Sengaja mulai dari null — baru di-set ke "controls" setelah asset selesai load,
  // supaya panduan kontrol tidak numpuk dengan loading screen.
  const [introStep, setIntroStep] = useState<"controls" | "welcome" | null>(null);

  const [posterData, setPosterData] = useState<PosterData>({ src: "", booth: "" });
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");

  const [karyaList, setKaryaList] = useState<any[]>([]);

  // Guard agar tidak POST kunjungan dua kali saat StrictMode di dev
  const hasTrackedVisitor = useRef(false);

  // Load karya once & record visit
  useEffect(() => {
    if (!id) return;

    if (!hasTrackedVisitor.current) {
      hasTrackedVisitor.current = true;
      postKunjungan(id).catch(() => { });
    }

    getKaryaList(id)
      .then(({ karya }) => {
        setKaryaList(karya);
      })
      .catch(() => { });
  }, [id]);

  /* ====================== */
  /* PLAYER MULTIPLAYER     */
  /* ====================== */

  const [playerId] = useState(() => {
    if (typeof window === "undefined") {
      return typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2);
    }
    const existing = sessionStorage.getItem("playerId");
    if (existing) return existing;
    const newId = uuidv4();
    sessionStorage.setItem("playerId", newId);
    return newId;
  });

  const generateGuestName = () => {
    const num = Math.floor(Math.random() * 999) + 1;
    return `guest${String(num).padStart(3, "0")}`;
  };

  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const initPlayerName = async () => {
      try {
        const name = await getPlayerName();
        // Cuma ambil nama depan — dipakai buat label di atas kepala player
        // (multiplayer) dan dikirim ke /api/player, jadi cukup di-set sekali
        // di sini supaya konsisten di semua tempat yang memakai playerName.
        setPlayerName(firstName(name));
      } catch {
        setPlayerName(generateGuestName());
      }
    };
    initPlayerName();
  }, []);

  // mobileMove was previously React state, updated on every touchmove event
  // (60+/sec while dragging). That re-rendered the ENTIRE page tree —
  // Canvas, map button, modals — at touch-drag frequency,
  // on the exact device class with the least CPU headroom. lookDelta was
  // already correctly a ref; mobileMove now follows the same pattern so
  // dragging the joystick no longer triggers any React re-render at all.
  // Player reads mobileMoveRef.current directly inside its useFrame loop.
  const mobileMoveRef = useRef({ w: false, a: false, s: false, d: false });
  const lookDelta = useRef({ x: 0, y: 0 });

  // Toggle sprint dari tombol HP: sekali tap nyala terus sampai di-tap lagi
  // buat matiin (beda dari mobileMoveRef yang harus ditahan). Sama kayak
  // mobileMoveRef, sengaja ref biar update-nya nggak re-render seluruh page.
  const mobileSprintRef = useRef(false);
  // Tombol lompat HP: true selama tombolnya ditekan, false pas dilepas.
  const mobileJumpRef = useRef(false);

  // Status "lagi sprint" (dari Shift desktop ATAU toggle sprint HP + lagi
  // gerak) — ini React state (bukan ref) karena dipakai buat nampilin/
  // nyembunyiin overlay animasi sprint, jadi memang butuh re-render.
  const [sprinting, setSprinting] = useState(false);

  // Ref ke elemen <canvas> Three.js — dipakai buat manual re-lock pointer
  // setelah modal (poster/video/menu) ditutup, karena exitPointerLock()
  // saat modal dibuka tidak otomatis di-lock lagi begitu modal ditutup.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const relockRetryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref sinkron ke state isMobile, dipakai relockPointer/exitPointerLockSafe
  // di bawah supaya nggak perlu isMobile di dependency array-nya.
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // HP nggak pernah pakai Pointer Lock API sama sekali (kontrolnya lewat
  // joystick/tap, bukan mouse) — <PointerLockControls> di player.tsx
  // sendiri cuma di-mount kalau !isMobile. Jadi di HP nggak pernah ada
  // "lock" beneran untuk dilepas-pasang; panggilan exitPointerLock() /
  // requestPointerLock() di situ cuma kerja sia-sia (dan berpotensi
  // ke-block browser tanpa alasan). Dua helper ini jadi satu titik yang
  // otomatis skip kalau lagi di HP, jadi tempat pemanggilnya (banyak
  // tersebar di modal open/close) nggak perlu masing-masing ngecek isMobile.
  const exitPointerLockSafe = useCallback(() => {
    if (isMobileRef.current) return;
    document.exitPointerLock?.();
  }, []);

  const relockPointer = useCallback(() => {
    if (isMobileRef.current) return;
    if (relockRetryTimer.current) {
      clearTimeout(relockRetryTimer.current);
      relockRetryTimer.current = null;
    }

    const canvas = canvasRef.current;
    if (!canvas?.requestPointerLock) return;

    try {
      const result = canvas.requestPointerLock() as unknown;
      if (result && typeof (result as Promise<void>).catch === "function") {
        (result as Promise<void>).catch(() => {
          // Cooldown browser aktif atau user gesture belum ada; abaikan tanpa throw
        });
      }
    } catch {
      // Abaikan error gesture
    }
  }, []);

  useEffect(() => {
    return () => {
      if (relockRetryTimer.current) clearTimeout(relockRetryTimer.current);
    };
  }, []);

  /* ====================== */
  /* DETECT MOBILE          */
  /* ====================== */

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  /* ====================== */
  /* REMOVE PLAYER          */
  /* ====================== */

  useEffect(() => {
    const removePlayer = () => {
      deletePlayer(playerId);
    };
    window.addEventListener("beforeunload", removePlayer);
    return () => {
      removePlayer();
      window.removeEventListener("beforeunload", removePlayer);
    };
  }, [playerId]);

  useEffect(() => {
    if (posterOpen) exitPointerLockSafe();
  }, [posterOpen, exitPointerLockSafe]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !posterOpen) {
        setMenuOpen(true);
        exitPointerLockSafe();
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [posterOpen, exitPointerLockSafe]);

  // Stable identities via useCallback — these get passed down into the R3F
  // tree (Experience/Booth), so keeping the same function reference across
  // renders avoids unnecessary re-renders/effect re-runs in children that
  // depend on them (e.g. Booth's onClick, or any future React.memo).
  const openPoster = useCallback((src: string, booth: string) => {
    exitPointerLockSafe();
    setPosterData({ src, booth });
    setPosterOpen(true);
  }, [exitPointerLockSafe]);

  // Dipanggil saat klik PanelVideo di booth → langsung buka embed
  const openTautan = useCallback((url: string, _booth: string) => {
    exitPointerLockSafe();
    setEmbedUrl(url);
    setEmbedOpen(true);
  }, [exitPointerLockSafe]);

  // Dipanggil dari PosterViewer tombol "Tonton Video"
  const openEmbedFromPoster = useCallback((url: string) => {
    setPosterOpen(false);
    setEmbedUrl(url);
    setEmbedOpen(true);
  }, []);

  // Dipanggil oleh LoaderWatcher saat semua asset (model 3D, texture, dll)
  // di dalam Canvas sudah selesai di-load. Setelah ini intro "controls" baru muncul.
  const handleAssetsLoaded = useCallback(() => {
    setAssetsLoaded(true);
    setLoadProgress(100);
  }, []);

  // Begitu kedua fase (data + asset) selesai, baru munculkan intro kontrol.
  useEffect(() => {
    if (assetsLoaded) setIntroStep("controls");
  }, [assetsLoaded]);

  const controlsLocked =
    assetsLoaded && !posterOpen && !menuOpen && !embedOpen && introStep === null;

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative touch-none select-none">

      {/* PORTRAIT WARNING */}
      {isMobile && isPortrait && (
        <div className="fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Rotate Your Phone</h1>
          <p className="text-white/70 text-lg">Use landscape mode to enter the 3D exhibition</p>
        </div>
      )}

      {/* GAME */}
      {(!isMobile || !isPortrait) && (
        <>
          {playerName && (
            <Canvas ref={canvasRef} camera={{ position: [0, 2, 5], fov: 75 }} gl={{ preserveDrawingBuffer: true }}>
              <LoaderWatcher dataReady={dataReady} onProgress={setAssetProgress} onLoaded={handleAssetsLoaded} />
              <Suspense fallback={null}>
                <Experience
                  exhibitionId={id}
                  openTautan={openTautan}
                  openPoster={openPoster}
                  controlsLocked={controlsLocked}
                  soundOn={soundOn}
                  mobile={isMobile}
                  mobileMove={mobileMoveRef}
                  mobileSprint={mobileSprintRef}
                  mobileJump={mobileJumpRef}
                  lookDelta={lookDelta}
                  playerId={playerId}
                  playerName={playerName}
                  onDataReady={handleDataReady}
                  cameraMode={cameraMode}
                  setCameraMode={setCameraMode}
                  onInteractHint={setInteractHint}
                  onSprintChange={setSprinting}
                />
              </Suspense>
            </Canvas>
          )}

          {!isMobile && controlsLocked && cameraMode === "first" && (
            <Crosshair canvasRef={canvasRef} />
          )}

          {/* Overlay animasi sprint — vignette + garis kecepatan, nyala
              tiap kali player lagi lari cepat (Shift ditahan di desktop
              atau toggle sprint di HP), baik first maupun third person. */}
          {controlsLocked && <SprintOverlay active={sprinting} />}

          {/* HINT "TEKAN E" — cuma tampil pas desktop third-person & lagi
              deket panel poster/video (dikirim dari ThirdPersonInteract). */}
          {!isMobile && controlsLocked && cameraMode === "third" && interactHint && (
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-full bg-black/70 backdrop-blur border border-white/15 text-white text-sm font-medium flex items-center gap-2">
              <kbd className="px-2 h-6 rounded-md bg-white/15 border border-white/20 flex items-center justify-center font-bold text-[11px]">
                E
              </kbd>
              {interactHint.label}
            </div>
          )}

          {isMobile && controlsLocked && (
            <MobileHUD
              mobileMoveRef={mobileMoveRef}
              lookDelta={lookDelta}
              mobileSprintRef={mobileSprintRef}
              mobileJumpRef={mobileJumpRef}
            />
          )}

          {/* TOP-RIGHT BUTTON STACK — ganti sudut pandang & menu cuma
              muncul di HP, karena di desktop udah ada tombol C dan ESC di
              keyboard buat itu. */}
          {controlsLocked && isMobile && (
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
              <button
                onClick={() => setCameraMode((m) => (m === "first" ? "third" : "first"))}
                className="w-10 h-10 rounded-xl bg-black/60 border border-white/15 text-white flex items-center justify-center text-lg"
                title="Switch view"
              >
                🎥
              </button>
              <button
                onClick={() => { setMenuOpen(true); exitPointerLockSafe(); }}
                className="w-10 h-10 rounded-xl bg-black/60 border border-white/15 text-white flex items-center justify-center text-lg"
                title="Menu"
              >
                ☰
              </button>
            </div>
          )}
        </>
      )}

      {/* LOADING SCREEN — menutupi semuanya sampai asset 3D selesai load.
          Background pakai gambar frontend (bukan hitam polos), dengan
          progress bar putih full-width dipin di tepi bawah layar. */}
      {!assetsLoaded && (!isMobile || !isPortrait) && (
        <div className="fixed inset-0 z-[999999] bg-[url(/image/BGLoading.png)] bg-cover bg-center flex flex-col items-center justify-center px-6">
          {/* Teks "Loading exhibition..." — nempel tepat di atas progress
              bar, rata kiri (bukan center kayak konten lain di layar ini).
              Titik-titiknya cycling muncul-hilang satu-satu (typing-dots
              style), bukan cuma "..." statis. */}
          <div className="fixed bottom-4 left-6 z-[999999] flex items-baseline gap-[3px] text-white/80 text-lg font-medium tracking-wide">
            <span>Loading Exhibition</span>
            <span className="loading-dot">.</span>
            <span className="loading-dot" style={{ animationDelay: "0.2s" }}>.</span>
            <span className="loading-dot" style={{ animationDelay: "0.4s" }}>.</span>
          </div>

          {/* Bar putih penuh selebar layar, dipin di tepi paling bawah */}
          <div className="fixed bottom-0 left-0 w-full h-2 bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white transition-[width] duration-150 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>

          <style>{`
            @keyframes loadingDotFade {
              0%, 80%, 100% { opacity: 0; }
              40% { opacity: 1; }
            }
            .loading-dot {
              display: inline-block;
              animation: loadingDotFade 1.4s ease-in-out infinite;
            }
          `}</style>
        </div>
      )}

      {/* MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[99998] bg-black/75 flex items-center justify-center">
          <div className="w-[380px] max-w-[90%] rounded-2xl bg-zinc-900 p-6 text-white space-y-4">
            <h1 className="text-2xl font-bold">Menu</h1>
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="w-full h-12 rounded-xl bg-white/10"
            >
              Sound : {soundOn ? " ON" : " OFF"}
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                relockPointer();
              }}
              className="w-full h-12 rounded-xl bg-green-500 font-bold"
            >
              Resume
            </button>
            <button
              onClick={() => {
                exitPointerLockSafe();
                fetch(`/api-internal/player?id=${playerId}`, { method: "DELETE" }).catch(() => { });
                sessionStorage.removeItem("playerId");
                sessionStorage.removeItem("playerName");
                document.cookie = "username=; path=/; max-age=0";
                const isAdmin = Cookies.get("is_admin_logged_in") === "true" || !!localStorage.getItem("token");
                window.location.href = isAdmin ? "/admin/pameran" : "/pameran";
              }}
              className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 font-bold transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* POSTER + DETAIL */}
      {posterOpen && (
        <PosterViewer
          id={id}
          src={posterData.src}
          booth={posterData.booth}
          karyaList={karyaList}
          onClose={() => {
            setPosterOpen(false);
            relockPointer();
          }}
          onOpenTautan={openEmbedFromPoster}
        />
      )}

      {/* EMBED VIDEO */}
      {embedOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/90 flex flex-col items-center justify-center px-4">
          <div
            className="relative mx-auto"
            style={{
              aspectRatio: "16 / 9",
              width: "min(100%, calc(75vh * 16 / 9))",
            }}
          >
            <button
              onClick={() => {
                setEmbedOpen(false);
                relockPointer();
              }}
              className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-black/70 text-white text-lg font-bold flex items-center justify-center"
            >
              ✕
            </button>
            <iframe
              src={toEmbedUrl(embedUrl)}
              className="w-full h-full rounded-xl"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
        </div>
      )}

      {/* INTRO — STEP 1: CONTROLS */}
      {introStep === "controls" && (
        <div className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center px-4">
          <div className="w-[480px] max-w-full rounded-2xl bg-zinc-900 border border-white/10 p-8 text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">Controls Guide</h1>
              <p className="text-white/40 text-xs">Learn how to explore the exhibition</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-sm">
              {!isMobile && (
                <>
                  <div className="flex items-center justify-between gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 shrink-0">
                        {["W", "A", "S", "D"].map((k) => (
                          <kbd
                            key={k}
                            className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px]"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                      <span className="text-white/70">Move</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                        SPACE
                      </kbd>
                      <span className="text-white/70">Jump</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                      SHIFT
                    </kbd>
                    <span className="text-white/70">Hold to run</span>
                  </div>

                  <div className="flex items-center bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <span className="text-white/70">Move the mouse to look around, click to interact</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                      ESC
                    </kbd>
                    <span className="text-white/70">Open settings menu</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                      C
                    </kbd>
                    <span className="text-white/70">Switch view (first/third person)</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                      E
                    </kbd>
                    <span className="text-white/70">Interact (third-person mode only)</span>
                  </div>
                </>
              )}

              {isMobile && (
                <>
                  <div className="flex items-center bg-white/5 rounded-xl p-3">
                    <span className="text-white/70">Left joystick to move</span>
                  </div>
                  <div className="flex items-center bg-white/5 rounded-xl p-3">
                    <span className="text-white/70">Right joystick to look around</span>
                  </div>
                  <div className="flex items-center bg-white/5 rounded-xl p-3">
                    <span className="text-white/70">Tap objects to interact</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIntroStep(null);
                  relockPointer();
                }}
                className="flex-1 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 font-medium text-sm transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setIntroStep("welcome")}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTRO — STEP 2: WELCOME MESSAGE */}
      {introStep === "welcome" && (
        <div className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center">
          <div className="w-[420px] max-w-[92%] rounded-2xl bg-zinc-900 border border-white/10 p-8 text-white text-center space-y-5">
            <h1 className="text-3xl font-bold">Welcome!</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Explore this virtual exhibition, visit every booth, and enjoy the best works on display.
            </p>
            <button
              onClick={() => {
                setIntroStep(null);
                relockPointer();
              }}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-lg transition-colors"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================= */
/* LOADER WATCHER          */
/* Dipasang sebagai child dari <Canvas>. useProgress() dari drei membaca   */
/* status loading manager Three.js (semua useGLTF/useLoader/useTexture    */
/* yang aktif). Komponen ini tidak merender apa pun — cuma melaporkan     */
/* progress ke parent lewat callback.                                     */
/* ======================= */

function LoaderWatcher({
  dataReady,
  onProgress,
  onLoaded,
}: {
  dataReady: boolean;
  onProgress: (percent: number) => void;
  onLoaded: () => void;
}) {
  const firedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const dataReadyRef = useRef(dataReady);

  useEffect(() => {
    dataReadyRef.current = dataReady;
  }, [dataReady]);

  // Subscribe ke progress store milik drei (zustand-based)
  useEffect(() => {
    const unsub = useProgress.subscribe((state) => {
      const { progress, active, total } = state;

      if (total > 0 || active) {
        hasStartedRef.current = true;
      }

      onProgress(progress);

      if (firedRef.current) return;
      if (!dataReadyRef.current) return;

      // Hanya selesai jika progress sudah benar-benar 100% atau semua item selesai diunduh
      if (progress >= 100 && (!active || total === 0)) {
        firedRef.current = true;
        // Beri jeda 350ms agar GPU selesai mengompilasi shader sebelum layar dibuka
        setTimeout(() => {
          onLoaded();
        }, 350);
      }
    });

    return () => unsub();
  }, [onLoaded, onProgress]);

  // Safety fallback (12 detik): jika jaringan sangat lambat atau tidak ada aset tambahan
  useEffect(() => {
    if (!dataReady) return;

    const t = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onLoaded();
      }
    }, 12000);

    return () => clearTimeout(t);
  }, [dataReady, onLoaded]);

  return null;
}

/* ======================= */
/* NAME HELPER             */
/* Ambil kata pertama saja dari nama lengkap, buat ditampilkan di list    */
/* komentar (privasi + tampilan lebih ringkas).                          */
/* ======================= */

function firstName(nama: string | null | undefined): string {
  if (!nama) return "Anonim";
  const trimmed = nama.trim();
  if (!trimmed) return "Anonim";
  return trimmed.split(/\s+/)[0];
}

/* ======================= */
/* YOUTUBE EMBED HELPER    */
/* ======================= */

function toEmbedUrl(url: string): string {
  if (!url) return "";

  // Google Drive: /file/d/{id}/view atau ?id={id} → harus jadi /preview
  // supaya bisa di-embed di iframe (format /view diblokir Google).
  if (url.includes("drive.google.com")) {
    const match = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    return url;
  }

  if (url.includes("youtube.com/embed/")) return url;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return url;
}

/* ======================= */
/* MOBILE HUD              */
/* mobileMoveRef is a ref now (not state) — updating it on every          */
/* touchmove no longer triggers a re-render of the parent page.           */
/* Player reads mobileMoveRef.current directly in its useFrame loop.      */
/* ======================= */

function MobileHUD({
  mobileMoveRef,
  lookDelta,
  mobileSprintRef,
  mobileJumpRef,
}: {
  mobileMoveRef: React.MutableRefObject<{ w: boolean; a: boolean; s: boolean; d: boolean }>;
  lookDelta: React.MutableRefObject<{ x: number; y: number }>;
  mobileSprintRef: React.MutableRefObject<boolean>;
  mobileJumpRef: React.MutableRefObject<boolean>;
}) {
  // Cuma dipakai buat re-render tombol sprint (ganti warna aktif/nggak) —
  // nilai sebenarnya yang dibaca Player tetap mobileSprintRef.current.
  const [sprintOn, setSprintOn] = useState(false);

  const toggleSprint = () => {
    const next = !mobileSprintRef.current;
    mobileSprintRef.current = next;
    setSprintOn(next);
  };

  // Jump: nyala selama tombol ditekan, mati pas dilepas — persis kayak
  // menahan Space di keyboard (lihat pengecekan grounded di player.tsx).
  const jumpStart = (e: any) => {
    e.preventDefault();
    mobileJumpRef.current = true;
  };
  const jumpEnd = (e: any) => {
    e.preventDefault();
    mobileJumpRef.current = false;
  };
  const moveBase = useRef<any>(null);
  const moveStick = useRef<any>(null);
  const moveTouchId = useRef<number | null>(null);

  const lookZone = useRef<HTMLDivElement>(null);
  const lookTouchId = useRef<number | null>(null);
  const lookBasePos = useRef({ x: 0, y: 0 });

  // Buat bedain tap (klik poster/booth) vs swipe (look-around).
  const lookStartTime = useRef(0);
  const lookMoved = useRef(false);
  const TAP_MOVE_THRESHOLD = 10; // px
  const TAP_TIME_THRESHOLD = 300; // ms

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const updateMove = (touch: Touch) => {
    const rect = moveBase.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    const dx = clamp(x, -35, 35);
    const dy = clamp(y, -35, 35);
    moveStick.current.style.transform = `translate(${dx}px,${dy}px)`;
    mobileMoveRef.current = { w: dy < -10, s: dy > 10, a: dx < -10, d: dx > 10 };
  };

  const updateLook = (touch: Touch) => {
    const x = touch.clientX - lookBasePos.current.x;
    const y = touch.clientY - lookBasePos.current.y;
    if (Math.abs(x) > TAP_MOVE_THRESHOLD || Math.abs(y) > TAP_MOVE_THRESHOLD) {
      lookMoved.current = true;
    }
    const dx = clamp(x, -35, 35);
    const dy = clamp(y, -35, 35);
    lookDelta.current = { x: dx * 0.0015, y: dy * 0.0015 };
  };

  // Tap terdeteksi → lepas pointer-events dari overlay sesaat, terus
  // "teruskan" urutan event pointerdown/pointerup/click ke elemen asli di
  // bawahnya (canvas Three.js), supaya sistem klik bawaan R3F (dipakai
  // Booth buat openPoster/openTautan) tetap jalan normal.
  const forwardTap = (x: number, y: number) => {
    const zone = lookZone.current;
    if (!zone) return;
    zone.style.pointerEvents = "none";
    const target = document.elementFromPoint(x, y) as HTMLElement | null;
    zone.style.pointerEvents = "auto";
    if (!target) return;

    const base = { clientX: x, clientY: y, bubbles: true, cancelable: true, view: window };
    target.dispatchEvent(new PointerEvent("pointerdown", { ...base, pointerId: 1, pointerType: "touch", isPrimary: true }));
    target.dispatchEvent(new PointerEvent("pointerup", { ...base, pointerId: 1, pointerType: "touch", isPrimary: true }));
    target.dispatchEvent(new MouseEvent("click", base));
  };

  const moveStart = (e: any) => { moveTouchId.current = e.changedTouches[0].identifier; updateMove(e.changedTouches[0]); };
  const moveMove = (e: any) => { for (const t of e.touches) if (t.identifier === moveTouchId.current) updateMove(t); };
  const moveEnd = (e: any) => {
    for (const t of e.changedTouches) {
      if (t.identifier === moveTouchId.current) {
        moveTouchId.current = null;
        moveStick.current.style.transform = "translate(0px,0px)";
        mobileMoveRef.current = { w: false, a: false, s: false, d: false };
      }
    }
  };

  const lookStart = (e: any) => {
    e.preventDefault();
    if (lookTouchId.current !== null) return;
    const t = e.changedTouches[0];
    lookTouchId.current = t.identifier;
    lookBasePos.current = { x: t.clientX, y: t.clientY };
    lookStartTime.current = Date.now();
    lookMoved.current = false;
    updateLook(t);
  };

  const lookMove = (e: any) => {
    e.preventDefault();
    for (const t of e.touches) if (t.identifier === lookTouchId.current) updateLook(t);
  };

  const lookEnd = (e: any) => {
    for (const t of e.changedTouches) {
      if (t.identifier === lookTouchId.current) {
        const wasTap = !lookMoved.current && Date.now() - lookStartTime.current < TAP_TIME_THRESHOLD;
        const { x, y } = lookBasePos.current;
        lookTouchId.current = null;
        lookDelta.current = { x: 0, y: 0 };
        if (wasTap) forwardTap(x, y);
      }
    }
  };

  return (
    <>
      <div
        ref={lookZone}
        onTouchStart={lookStart}
        onTouchMove={lookMove}
        onTouchEnd={lookEnd}
        onTouchCancel={lookEnd}
        style={{ touchAction: "none" }}
        className="fixed inset-0 z-[9997]"
      />

      <div ref={moveBase} onTouchStart={moveStart} onTouchMove={moveMove} onTouchEnd={moveEnd}
        style={{ touchAction: "none" }}
        className="fixed bottom-5 left-5 z-[99999] w-28 h-28 rounded-full bg-white/10 border border-white/20">
        <div ref={moveStick} className="absolute left-1/2 top-1/2 w-10 h-10 -ml-5 -mt-5 rounded-full bg-white/60" />
      </div>

      {/* JUMP — tap & tahan, sama kayak Space di keyboard. */}
      <button
        onTouchStart={jumpStart}
        onTouchEnd={jumpEnd}
        onTouchCancel={jumpEnd}
        style={{ touchAction: "none" }}
        className="fixed bottom-24 right-5 z-[99999] w-16 h-16 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center justify-center active:bg-white/25"
      >
        JUMP
      </button>

      {/* SPRINT — toggle on/off, bukan ditahan. Warna berubah pas aktif. */}
      <button
        onClick={toggleSprint}
        style={{ touchAction: "none" }}
        className={`fixed bottom-5 right-5 z-[99999] w-16 h-16 rounded-full border text-xs font-bold flex items-center justify-center transition-colors ${
          sprintOn
            ? "bg-amber-400/80 border-amber-300 text-black"
            : "bg-white/10 border-white/20 text-white"
        }`}
      >
        SPRINT
      </button>
    </>
  );
}

/* ======================= */
/* SPRINT OVERLAY           */
/* Efek visual pas player lagi sprint: vignette yang menggelap di tepi     */
/* layar + garis-garis kecepatan yang "narik" ke tengah, plus sedikit      */
/* zoom pulsing biar berasa ngebut. Murni CSS, ditaruh di luar <Canvas>    */
/* jadi nggak numpang render loop three.js.                                */
/* ======================= */

function SprintOverlay({ active }: { active: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[9996] pointer-events-none transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="sprint-fx-vignette absolute inset-0" />
      <div className="sprint-fx-lines-wrap absolute inset-0 overflow-hidden">
        <div className="sprint-fx-lines absolute inset-0" />
      </div>

      <style>{`
        .sprint-fx-vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 45%,
            rgba(0, 0, 0, 0.55) 100%
          );
          animation: sprintFxPulse 0.7s ease-in-out infinite alternate;
        }

        .sprint-fx-lines-wrap {
          mix-blend-mode: screen;
        }

        .sprint-fx-lines {
          background-image: repeating-conic-gradient(
            from 0deg,
            rgba(255, 255, 255, 0.08) 0deg 1deg,
            transparent 1deg 6deg
          );
          transform: scale(2.2);
          animation: sprintFxZoom 0.5s linear infinite;
          opacity: 0.5;
        }

        @keyframes sprintFxPulse {
          from { opacity: 0.75; }
          to { opacity: 1; }
        }

        @keyframes sprintFxZoom {
          from { transform: scale(2.1); }
          to { transform: scale(2.35); }
        }
      `}</style>
    </div>
  );
}

function PosterViewer({
  id,
  src,
  booth,
  karyaList = [],
  onClose,
  onOpenTautan,
}: {
  id: string;
  src: string;
  booth: string;
  karyaList?: any[];
  onClose: () => void;
  onOpenTautan: (url: string) => void;
}) {
  const [zoom, setZoom] = useState(1);

  const norm = (s: any) => String(s ?? "").trim().toLowerCase();
  const boothNorm = norm(booth);

  // Cari karya langsung di memori (instant 0ms)
  const findMatch = (list: any[]) => {
    return list.find((k: any) =>
      norm(k.booth_name) === boothNorm ||
      norm(k.judul) === boothNorm ||
      norm(k.id_stan) === boothNorm
    );
  };

  const initialKarya = findMatch(karyaList);

  const [info, setInfo] = useState<{
    id_karya: number | null;
    judul: string;
    deskripsi: string;
    is_terbaik: boolean;
    is_terbanyak: boolean;
    tautan: string | null;
  }>(() => {
    if (initialKarya) {
      return {
        id_karya: initialKarya.id_karya,
        judul: initialKarya.judul ?? "-",
        deskripsi: initialKarya.deskripsi ?? "-",
        is_terbaik: initialKarya.is_terbaik ?? false,
        is_terbanyak: initialKarya.is_terbanyak ?? false,
        tautan: initialKarya.tautan ?? null,
      };
    }
    return {
      id_karya: null,
      judul: "Loading...",
      deskripsi: "Loading...",
      is_terbaik: false,
      is_terbanyak: false,
      tautan: null,
    };
  });

  /* ====================== */
  /* LOAD DATA KARYA FALLBACK */
  /* ====================== */

  useEffect(() => {
    let cancelled = false;

    // Jika sudah ketemu dari memori, update dan tidak perlu request HTTP lagi
    const matched = findMatch(karyaList);
    if (matched) {
      setInfo({
        id_karya: matched.id_karya,
        judul: matched.judul ?? "-",
        deskripsi: matched.deskripsi ?? "-",
        is_terbaik: matched.is_terbaik ?? false,
        is_terbanyak: matched.is_terbanyak ?? false,
        tautan: matched.tautan ?? null,
      });
      return;
    }

    const load = async () => {
      try {
        const res = await getKaryaDetail(id);
        const karya = findMatch(res);

        if (!karya) throw new Error("Karya tidak ditemukan");
        if (cancelled) return;

        setInfo({
          id_karya: karya.id_karya,
          judul: karya.judul ?? "-",
          deskripsi: karya.deskripsi ?? "-",
          is_terbaik: karya.is_terbaik ?? false,
          is_terbanyak: karya.is_terbanyak ?? false,
          tautan: karya.tautan ?? null,
        });
      } catch {
        if (cancelled) return;
        setInfo({
          id_karya: null,
          judul: "Data Tidak Ditemukan",
          deskripsi: "Data karya belum tersedia.",
          is_terbaik: false,
          is_terbanyak: false,
          tautan: null,
        });
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id, booth, karyaList]);

  const resolveImageSrc = (url: string) => {
    if (!url) return "";
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    if (url.startsWith("/storage/")) {
      return `${base}${url}`;
    }
    if (url.includes("drive.google.com")) {
      return `${base}/api/experience/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const wheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((p) => Math.min(Math.max(p - e.deltaY * 0.0015, 0.5), 5));
  };

  const finalSrc = resolveImageSrc(src);

  return (
    <div className="fixed inset-0 z-[99997] bg-black/95 flex flex-row">

      {/* IMAGE */}
      <div onWheel={wheel} className="w-[55%] h-full flex items-center justify-center p-3 border-r border-white/10 relative overflow-hidden">
        {finalSrc ? (
          <div style={{ transform: `scale(${zoom})` }} className="relative w-full h-full">
            <Image
              src={finalSrc}
              alt="Poster"
              fill
              unoptimized
              draggable={false}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="text-white/50 text-sm font-medium">Poster belum diunggah</div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[45%] h-full text-white flex flex-col">

        {/* HEADER */}
        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h1 className="font-bold text-sm lg:text-base">Project Detail</h1>
          <button onClick={onClose} className="px-3 h-9 text-md font-bold">✕</button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* TOP */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold leading-tight">{info.judul}</h1>
            </div>
          </div>

          {/* DESC */}
          <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed text-justify">
            {info.deskripsi}
          </p>

          {/* TOMBOL TONTON VIDEO */}
          {info.tautan && (
            <button
              onClick={() => onOpenTautan(info.tautan!)}
              className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}