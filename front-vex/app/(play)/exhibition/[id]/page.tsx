"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

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

  // Floor switcher
  const [currentFloor, setCurrentFloor] = useState(1);
  const [maxFloor, setMaxFloor] = useState<Record<string, number>>({});
  const [karyaList, setKaryaList] = useState<any[]>([]);
  const [mapOpen, setMapOpen] = useState(false);

  // Derived from maxFloor — memoized so we don't re-spread Object.values(...)
  // on every render (and every render happens a LOT during gameplay).
  const globalMaxFloor = useMemo(
    () => Math.max(...Object.values(maxFloor), 1),
    [maxFloor]
  );
  const hasMultipleFloors = useMemo(
    () => Object.values(maxFloor).some((v) => v > 1),
    [maxFloor]
  );

  // Guard agar tidak POST kunjungan dua kali saat StrictMode di dev
  const hasTrackedVisitor = useRef(false);

  // Load karya + max_floor once & record visit
  useEffect(() => {
    if (!id) return;

    if (!hasTrackedVisitor.current) {
      hasTrackedVisitor.current = true;
      postKunjungan(id).catch(() => { });
    }

    getKaryaList(id)
      .then(({ karya, max_floor }) => {
        setKaryaList(karya);
        setMaxFloor(max_floor);
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
  // Canvas, floor switcher, map button, modals — at touch-drag frequency,
  // on the exact device class with the least CPU headroom. lookDelta was
  // already correctly a ref; mobileMove now follows the same pattern so
  // dragging the joystick no longer triggers any React re-render at all.
  // Player reads mobileMoveRef.current directly inside its useFrame loop.
  const mobileMoveRef = useRef({ w: false, a: false, s: false, d: false });
  const lookDelta = useRef({ x: 0, y: 0 });

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
    assetsLoaded && !posterOpen && !menuOpen && !embedOpen && !mapOpen && introStep === null;

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative touch-none select-none">

      {/* PORTRAIT WARNING */}
      {isMobile && isPortrait && (
        <div className="fixed inset-0 z-[999999] bg-black text-white flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Putar HP Anda</h1>
          <p className="text-white/70 text-lg">Gunakan mode landscape untuk masuk pameran 3D</p>
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
                  lookDelta={lookDelta}
                  playerId={playerId}
                  playerName={playerName}
                  currentFloor={currentFloor}
                  onDataReady={handleDataReady}
                  cameraMode={cameraMode}
                  setCameraMode={setCameraMode}
                  onInteractHint={setInteractHint}
                />
              </Suspense>
            </Canvas>
          )}

          {!isMobile && controlsLocked && cameraMode === "first" && (
            <Crosshair canvasRef={canvasRef} />
          )}

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
            <MobileHUD mobileMoveRef={mobileMoveRef} lookDelta={lookDelta} />
          )}

          {/* FLOOR SWITCHER — bottom center */}
          {controlsLocked && hasMultipleFloors && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-black/70 backdrop-blur rounded-full px-4 py-2 border border-white/15">
              <button
                onClick={() => setCurrentFloor(f => Math.max(1, f - 1))}
                disabled={currentFloor <= 1}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 text-white text-sm"
              >
                ▼
              </button>
              <span className="text-white text-sm font-bold px-2">Lantai {currentFloor}</span>
              <button
                onClick={() => setCurrentFloor(f => Math.min(globalMaxFloor, f + 1))}
                disabled={currentFloor >= globalMaxFloor}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center disabled:opacity-30 text-white text-sm"
              >
                ▲
              </button>
            </div>
          )}

          {/* TOP-RIGHT BUTTON STACK — peta selalu ada; ganti sudut pandang &
              menu cuma muncul di HP, karena di desktop udah ada tombol C
              dan ESC di keyboard buat itu. */}
          {controlsLocked && (
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
              <button
                onClick={() => { setMapOpen(true); exitPointerLockSafe(); }}
                className="w-10 h-10 rounded-xl bg-black/60 border border-white/15 text-white flex items-center justify-center text-lg"
                title="Lihat semua karya"
              >
                🗺
              </button>

              {isMobile && (
                <>
                  <button
                    onClick={() => setCameraMode((m) => (m === "first" ? "third" : "first"))}
                    className="w-10 h-10 rounded-xl bg-black/60 border border-white/15 text-white flex items-center justify-center text-lg"
                    title="Ganti sudut pandang"
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
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* LOADING SCREEN — menutupi semuanya sampai asset 3D selesai load */}
      {!assetsLoaded && (!isMobile || !isPortrait) && (
        <div className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center px-6">
          <div className="w-[280px] max-w-full space-y-4">
            <p className="text-white text-center font-bold text-lg">Memuat Pameran...</p>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-[width] duration-150 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-white/50 text-center text-sm">{Math.round(loadProgress)}%</p>
          </div>
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
              Lanjut
            </button>
            <button
              onClick={() => {
                exitPointerLockSafe();
                fetch(`/api-internal/player?id=${playerId}`, { method: "DELETE" }).catch(() => { });
                sessionStorage.removeItem("playerId");
                sessionStorage.removeItem("playerName");
                document.cookie = "username=; path=/; max-age=0";
                window.location.href = "/pameran";
              }}
              className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 font-bold transition-colors"
            >
              Keluar
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

      {/* KARYA MAP PANEL */}
      {mapOpen && (
        <KaryaMapPanel
          karyaList={karyaList}
          currentFloor={currentFloor}
          maxFloor={maxFloor}
          onFloorChange={setCurrentFloor}
          onSelectPoster={(src, booth) => {
            setMapOpen(false);
            openPoster(src, booth);
          }}
          onClose={() => {
            setMapOpen(false);
            relockPointer();
          }}
        />
      )}

      {/* INTRO — STEP 1: KONTROL */}
      {introStep === "controls" && (
        <div className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center px-4">
          <div className="w-[480px] max-w-full rounded-2xl bg-zinc-900 border border-white/10 p-8 text-white space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">Panduan Kontrol</h1>
              <p className="text-white/40 text-xs">Pelajari cara menjelajahi pameran</p>
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
                      <span className="text-white/70">Bergerak</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                        SPACE
                      </kbd>
                      <span className="text-white/70">Loncat</span>
                    </div>
                  </div>

                  <div className="flex items-center bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <span className="text-white/70">Gerakkan mouse untuk melihat sekitar, klik untuk berinteraksi</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                      ESC
                    </kbd>
                    <span className="text-white/70">Buka menu pengaturan</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                      C
                    </kbd>
                    <span className="text-white/70">Ganti sudut pandang (first/third person)</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 hover:bg-white/[0.07] rounded-xl p-3 transition-colors">
                    <kbd className="px-3 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center font-bold text-[11px] shrink-0">
                      E
                    </kbd>
                    <span className="text-white/70">Berinteraksi (khusus mode third person)</span>
                  </div>
                </>
              )}

              {isMobile && (
                <>
                  <div className="flex items-center bg-white/5 rounded-xl p-3">
                    <span className="text-white/70">Joystick kiri untuk bergerak</span>
                  </div>
                  <div className="flex items-center bg-white/5 rounded-xl p-3">
                    <span className="text-white/70">Joystick kanan untuk melihat sekitar</span>
                  </div>
                  <div className="flex items-center bg-white/5 rounded-xl p-3">
                    <span className="text-white/70">Ketuk objek untuk berinteraksi</span>
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
                Lewati
              </button>
              <button
                onClick={() => setIntroStep("welcome")}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition-colors"
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTRO — STEP 2: SELAMAT BERKUNJUNG */}
      {introStep === "welcome" && (
        <div className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center">
          <div className="w-[420px] max-w-[92%] rounded-2xl bg-zinc-900 border border-white/10 p-8 text-white text-center space-y-5">
            <h1 className="text-3xl font-bold">Selamat Berkunjung!</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Jelajahi pameran virtual ini, kunjungi setiap booth, dan nikmati karya-karya terbaik yang telah dipersembahkan.
            </p>
            <button
              onClick={() => {
                setIntroStep(null);
                relockPointer();
              }}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-lg transition-colors"
            >
              Mulai Jelajahi
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
  const dataReadyRef = useRef(dataReady);

  useEffect(() => {
    dataReadyRef.current = dataReady;
  }, [dataReady]);

  // Subscribe manual ke progress store milik drei (zustand-based)
  useEffect(() => {
    const unsub = useProgress.subscribe((state) => {
      const { progress, active } = state;

      onProgress(progress);

      if (firedRef.current) return;
      if (!dataReadyRef.current) return;

      // Selesai jika tidak aktif lagi atau progress mencapai 100%
      if (!active || progress >= 100) {
        firedRef.current = true;
        onLoaded();
      }
    });

    return () => unsub();
  }, [onLoaded, onProgress]);

  // Safety fallback: jika data siap, pastikan loading tetap selesai
  // dan tidak stuck jika Drei tidak memicu event un-active
  useEffect(() => {
    if (!dataReady) return;

    const t = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onLoaded();
      }
    }, 1200);

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
}: {
  mobileMoveRef: React.MutableRefObject<{ w: boolean; a: boolean; s: boolean; d: boolean }>;
  lookDelta: React.MutableRefObject<{ x: number; y: number }>;
}) {
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
    </>
  );
}

/* ======================= */
/* KARYA MAP PANEL         */
/* ======================= */

const ZONES = ["a", "b", "c", "d"];
const ZONE_LABELS: Record<string, string> = { a: "Kelas A", b: "Kelas B", c: "Kelas C", d: "Kelas D" };

function KaryaMapPanel({
  karyaList,
  currentFloor,
  maxFloor,
  onFloorChange,
  onSelectPoster,
  onClose,
}: {
  karyaList: any[];
  currentFloor: number;
  maxFloor: Record<string, number>;
  onFloorChange: (f: number) => void;
  onSelectPoster: (src: string, booth: string) => void;
  onClose: () => void;
}) {
  const [activeZone, setActiveZone] = useState(ZONES[0]);

  const globalMax = useMemo(
    () => Math.max(...Object.values(maxFloor), 1),
    [maxFloor]
  );

  const karyaInView = useMemo(
    () =>
      karyaList
        .filter((k) => (k.kelas ?? "") === activeZone)
        .sort((a, b) => a.id_karya - b.id_karya)
        .slice((currentFloor - 1) * 6, currentFloor * 6),
    [karyaList, activeZone, currentFloor]
  );

  // Fill empty slots to always show 6
  const slots = useMemo(
    () => Array.from({ length: 6 }, (_, i) => karyaInView[i] ?? null),
    [karyaInView]
  );

  return (
    <div className="fixed inset-0 z-[99998] bg-black/90 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
        <h1 className="text-white font-bold text-lg">Peta Pameran</h1>
        <button onClick={onClose} className="text-white/70 hover:text-white text-xl font-bold">✕</button>
      </div>

      {/* ZONE TABS */}
      <div className="flex gap-2 px-5 pt-4 shrink-0">
        {ZONES.map((z) => (
          <button
            key={z}
            onClick={() => setActiveZone(z)}
            className={`px-4 h-9 rounded-full text-sm font-bold transition-colors ${activeZone === z
              ? "bg-white text-black"
              : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
          >
            {ZONE_LABELS[z]}
          </button>
        ))}
      </div>

      {/* FLOOR SWITCHER */}
      {globalMax > 1 && (
        <div className="flex items-center gap-3 px-5 pt-3 shrink-0">
          <span className="text-white/50 text-xs">Lantai:</span>
          {Array.from({ length: globalMax }, (_, i) => i + 1).map((f) => (
            <button
              key={f}
              onClick={() => onFloorChange(f)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${currentFloor === f ? "bg-blue-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* GRID — 6 slots */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {slots.map((karya, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
              {karya ? (
                <>
                  {karya.poster ? (
                    <Image
                      src={karya.poster}
                      alt={karya.judul}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                      No Poster
                    </div>
                  )}
                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-bold leading-tight line-clamp-2">{karya.judul}</p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {ZONE_LABELS[activeZone]} · Slot {i + 1}
                    </p>
                  </div>

                  {/* TERBAIK BADGE */}
                  {karya.is_terbaik && (
                    <div className="absolute top-2 right-2 w-18 h-18">
                      <Image src="/icon/Medalion.svg" alt="Karya Terbaik" fill className="object-contain" />
                    </div>
                  )}

                  {/* TERBANYAK LIKES BADGE */}
                  {karya.is_terbanyak && (
                    <div className="absolute top-2 left-2 w-18 h-18">
                      <Image src="/icon/Favorite.svg" alt="Likes Terbanyak" fill className="object-contain" />
                    </div>
                  )}

                  {/* CLICK OVERLAY */}
                  {karya.poster && (
                    <button
                      onClick={() => onSelectPoster(karya.poster, karya.booth_name)}
                      className="absolute inset-0"
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">
                  Kosong
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PosterViewer({
  id,
  src,
  booth,
  onClose,
  onOpenTautan,
}: {
  id: string;
  src: string;
  booth: string;
  onClose: () => void;
  onOpenTautan: (url: string) => void;
}) {
  const [zoom, setZoom] = useState(1);

  const [info, setInfo] = useState<{
    id_karya: number | null;
    judul: string;
    deskripsi: string;
    is_terbaik: boolean;
    is_terbanyak: boolean;
    tautan: string | null;
  }>({
    id_karya: null,
    judul: "Loading...",
    deskripsi: "Loading...",
    is_terbaik: false,
    is_terbanyak: false,
    tautan: null,
  });

  /* ====================== */
  /* LOAD DATA KARYA        */
  /* ====================== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await getKaryaDetail(id);
        const norm = (s: any) => String(s ?? "").trim().toLowerCase();
        const boothNorm = norm(booth);

        const karya = res.find((k: any) =>
          norm(k.booth_name) === boothNorm ||
          norm(k.judul) === boothNorm ||
          norm(k.id_stan) === boothNorm
        );

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
  }, [id, booth]);

  const wheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((p) => Math.min(Math.max(p - e.deltaY * 0.0015, 0.5), 5));
  };

  return (
    <div className="fixed inset-0 z-[99997] bg-black/95 flex flex-row">

      {/* IMAGE */}
      <div onWheel={wheel} className="w-[55%] h-full flex items-center justify-center p-3 border-r border-white/10">
        <div style={{ transform: `scale(${zoom})` }} className="relative w-full h-full">
          <Image src={src} alt="Poster" fill draggable={false} className="object-contain" />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[45%] h-full text-white flex flex-col">

        {/* HEADER */}
        <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h1 className="font-bold text-sm lg:text-base">Detail Booth</h1>
          <button onClick={onClose} className="px-3 h-9 text-md font-bold">✕</button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* TOP */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold leading-tight">{info.judul}</h1>
            </div>

            {/* BADGE */}
            <div className="flex items-start gap-2 shrink-0">
              {info.is_terbaik && (
                <div className="relative w-12 h-12 lg:w-16 lg:h-16">
                  <Image src="/icon/Medalion.svg" alt="Karya Terbaik" fill className="object-contain" />
                </div>
              )}
              {info.is_terbanyak && (
                <div className="relative w-11 h-11 lg:w-[60px] lg:h-[60px]">
                  <Image src="/icon/Favorite.svg" alt="Terbanyak Likes" fill className="object-contain" />
                </div>
              )}
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
              Tonton Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}