"use client";

import { useGLTF, Text, Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import Booth, { toProxiedUrl } from "./Booth";
import Player from "./Player";
import CameraSwitcher from "./CameraSwitcher";
import { sharedTextureLoader } from "@/components/shared/ui/LoadingManager";
import { getHallMaterial } from "@/components/play/BoothMaterials";

import { getHallModel, getKaryaList, getPameranFolder, getGameAssets, getPlayerModelUrl, getNumBaseUrl } from "@/components/play/apiPlay";

type RemotePlayer = {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  updatedAt: number;
};

type Props = {
  exhibitionId: string;
  mobile: boolean;
  playerId: string;
  playerName: string;
  openPoster: (src: string, booth: string) => void;
  openTautan: (url: string, booth: string) => void;
  controlsLocked: boolean;
  soundOn: boolean;
  // Mode kamera (first/third person) — sekarang di-lift ke ExhibitionPage
  // (page.tsx) supaya Crosshair (yang cuma boleh tampil pas first-person)
  // dan tombol "ganti sudut pandang" di HUD mobile juga bisa baca/ubahnya
  // dari luar <Canvas>. Tombol C via <CameraSwitcher> tetap jalan normal,
  // dia cuma butuh fungsi setter-nya.
  cameraMode: "first" | "third";
  setCameraMode: React.Dispatch<React.SetStateAction<"first" | "third">>;
  // Dipanggil tiap label "Tekan E untuk ..." berubah (atau null kalau lagi
  // nggak ada target dalam jangkauan), supaya ExhibitionPage bisa nampilin
  // hint-nya sebagai HUD di luar <Canvas>.
  onInteractHint?: (hint: { label: string } | null) => void;
  // Dipanggil tiap status sprint (Shift / toggle sprint HP + lagi gerak)
  // berubah, supaya ExhibitionPage bisa nampilin overlay animasi sprint di
  // luar <Canvas> (lihat SprintOverlay di page.tsx).
  onSprintChange?: (sprinting: boolean) => void;
  mobileMove?: React.MutableRefObject<{ w: boolean; a: boolean; s: boolean; d: boolean }>;
  // Toggle sprint & tombol lompat dari HUD mobile (lihat MobileHUD di
  // page.tsx) — diteruskan apa adanya ke <Player>.
  mobileSprint?: React.MutableRefObject<boolean>;
  mobileJump?: React.MutableRefObject<boolean>;
  lookDelta?: React.MutableRefObject<{ x: number; y: number }>;
  // Dipanggil sekali, saat fetch data awal (hall model, karya list, folder)
  // selesai dan ExperienceInner siap mulai dirender. ExhibitionPage memakai
  // ini sebagai fase pertama dari total progress loading (lihat ringkasan
  // pembagian fase di ExhibitionPage).
  onDataReady?: () => void;
};

/* ===================== */
/* SHARED TEXTURE CACHE  */
/* Avoids re-downloading/re-decoding the same texture URL    */
/* across booths, panels, and floor switches.                */
/* ===================== */

const textureCache = new Map<string, THREE.Texture>();

function loadCachedTexture(
  loader: THREE.TextureLoader,
  path: string,
  onLoad: (tex: THREE.Texture) => void,
  flipY = false
) {
  const cached = textureCache.get(path);
  if (cached) {
    onLoad(cached);
    return;
  }
  loader.load(
    path,
    (tex) => {
      tex.flipY = flipY;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      textureCache.set(path, tex);
      onLoad(tex);
    },
    undefined,
    () => { }
  );
}

function disposeMaterial(obj: any) {
  const mat = obj.material as THREE.MeshBasicMaterial | undefined;
  if (!mat) return;
  // Note: we intentionally do NOT dispose mat.map here, since textures are
  // shared via textureCache and may still be referenced by other meshes.
  mat.dispose?.();
}

/* ===================== */
/* WRAPPER — fetch dulu  */
/* ===================== */

export default function Experience(props: Props) {
  const [hallModel, setHallModel] = useState<string | null>(null);
  const [karyaList, setKaryaList] = useState<any[] | null>(null);
  const [folder, setFolder] = useState<string | null>(null);

  const notifiedRef = useRef(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      getHallModel(props.exhibitionId).catch(() => null),
      getKaryaList(props.exhibitionId).then(({ karya }) => karya).catch(() => []),
      getPameranFolder(props.exhibitionId).catch(() => "default"),
    ]).then(([hall, karya, fld]) => {
      if (!active) return;
      setHallModel(hall);
      setKaryaList(karya || []);
      setFolder(fld || "default");
    });

    return () => {
      active = false;
    };
  }, [props.exhibitionId]);

  // Tunggu KETIGANYA selesai di-fetch secara lengkap sebelum me-mount scene 3D
  const ready = !!hallModel && !!folder && karyaList !== null;

  useEffect(() => {
    if (!ready || notifiedRef.current) return;
    notifiedRef.current = true;
    props.onDataReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready) return null;

  return (
    <ExperienceInner
      {...props}
      hallModel={hallModel}
      karyaList={karyaList}
      folder={folder}
    />
  );
}

/* ===================== */
/* INNER                 */
/* ===================== */

function ExperienceInner({
  exhibitionId,
  playerId,
  playerName,
  openPoster,
  openTautan,
  controlsLocked,
  soundOn,
  mobile,
  cameraMode,
  setCameraMode,
  onInteractHint,
  onSprintChange,
  mobileMove,
  mobileSprint,
  mobileJump,
  lookDelta,
  hallModel,
  karyaList,
  folder,
}: Props & { hallModel: string; karyaList: any[]; folder: string }) {
  const [audioUrls, setAudioUrls] = useState({ bgm: "", footstep: "", jump: "" });
  const [playerModelUrl, setPlayerModelUrl] = useState<string | null>(null);
  const [numBaseUrl, setNumBaseUrl] = useState<string | null>(null);
  const [walking, setWalking] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);

  // Posisi player saat ini (di-update tiap frame dari Player lewat prop
  // setPosition), dipakai ThirdPersonInteract buat cek jarak ke panel —
  // pakai ref (bukan state) supaya update per-frame nggak nge-trigger
  // re-render ExperienceInner.
  const playerPositionRef = useRef(new THREE.Vector3());

  const isViewingMedia = !controlsLocked;

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const footRef = useRef<HTMLAudioElement | null>(null);
  const jumpRef = useRef<HTMLAudioElement | null>(null);
  // Pakai sharedTextureLoader (lihat loadingManager.ts) supaya texture panel
  // display & panel poster di hall ikut terhitung di useProgress() drei,
  // sama seperti texture poster/sampul booth di booth.tsx.
  const loader = useRef(sharedTextureLoader);

  const { scene } = useGLTF(hallModel);
  const { gl, camera } = useThree();

  /* ===================== */
  /* SHADER WARMUP & PRECOMPILE (Hilangkan Stutter Saat Masuk) */
  /* ===================== */
  useEffect(() => {
    if (scene && gl && camera) {
      // Pre-compile seluruh shader program di GPU sebelum player mulai gerak
      try {
        gl.compile(scene, camera);
      } catch {}
    }
  }, [scene, gl, camera]);

  /* ===================== */
  /* HALL MATERIALS: WHITE / BLUE / RED / MAROON                          */
  /* Objek di hall-utama.glb dengan nama-nama warna ini diberi toon        */
  /* shader material yang sama tekniknya dengan Primary/Secondary booth.   */
  /* ===================== */
  useEffect(() => {
    scene.traverse((obj: any) => {
      if (!obj.isMesh) return;
      const mat = getHallMaterial(obj.name?.toLowerCase() || "");
      if (mat) obj.material = mat;
    });
  }, [scene]);

  /* ===================== */
  /* AUDIO + PLAYER MODEL  */
  /* ===================== */

  useEffect(() => {
    getGameAssets()
      .then((data) => {
        setAudioUrls({ bgm: data.bgm, footstep: data.footstep, jump: data.jump });
        // Model badan player (player.glb). Lihat getPlayerModelUrl() di
        // apiPlay.ts: pakai field `player` dari response ini kalau ada,
        // atau fallback ke path storage default.
        setPlayerModelUrl(getPlayerModelUrl(data));
        // Base URL folder angka booth (1.png .. 144.png). Lihat getNumBaseUrl()
        // di apiPlay.ts: pakai field `num_base` dari response ini kalau ada,
        // atau fallback ke path storage default.
        setNumBaseUrl(getNumBaseUrl(data));
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!audioUrls.bgm || !audioUrls.footstep || !audioUrls.jump) return;
    bgmRef.current = Object.assign(new Audio(audioUrls.bgm), { loop: true, volume: 0.35 });
    footRef.current = Object.assign(new Audio(audioUrls.footstep), { loop: true, volume: 0.55 });
    jumpRef.current = Object.assign(new Audio(audioUrls.jump), { volume: 0.75 });
    return () => {
      if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current.src = ""; }
      if (footRef.current) { footRef.current.pause(); footRef.current.src = ""; }
      if (jumpRef.current) { jumpRef.current.pause(); jumpRef.current.src = ""; }
    };
  }, [audioUrls]);

  useEffect(() => {
    if (!bgmRef.current) return;
    if (soundOn) {
      bgmRef.current.volume = isViewingMedia ? 0.08 : 0.35;
      bgmRef.current.play().catch(() => { });
    } else {
      bgmRef.current.pause();
      footRef.current?.pause();
    }
  }, [soundOn, isViewingMedia]);

  useEffect(() => {
    if (!footRef.current) return;
    if (soundOn && walking && controlsLocked && !jumping) {
      footRef.current.play().catch(() => { });
    } else {
      footRef.current.pause();
      footRef.current.currentTime = 0;
    }
  }, [soundOn, walking, controlsLocked, jumping]);

  useEffect(() => {
    if (!jumpRef.current || !soundOn || !jumping) return;
    footRef.current?.pause();
    if (footRef.current) footRef.current.currentTime = 0;
    jumpRef.current.currentTime = 0;
    jumpRef.current.play().catch(() => { });
  }, [jumping, soundOn]);

  /* ===================== */
  /* MULTIPLAYER           */
  /* ===================== */

  useEffect(() => {
    let cancelled = false;
    let failCount = 0;

    const load = async () => {
      // Jika server Redis mati berulang kali, kurangi frekuensi fetch agar tidak lag
      if (failCount > 3) return;

      try {
        const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");
        const res = await fetch(`${basePath}/api-internal/player`);
        if (!res.ok) {
          failCount++;
          return;
        }
        const data: RemotePlayer[] = await res.json();
        if (cancelled || !Array.isArray(data)) return;
        failCount = 0; // reset saat berhasil

        const now = Date.now();
        const filtered = data.filter((p) => p && p.id !== playerId && now - p.updatedAt < 999999);

        setRemotePlayers((prev) => {
          if (prev.length !== filtered.length) return filtered;
          for (let i = 0; i < filtered.length; i++) {
            const a = prev[i];
            const b = filtered[i];
            if (
              !a ||
              a.id !== b.id ||
              a.x !== b.x ||
              a.y !== b.y ||
              a.z !== b.z ||
              a.rotation !== b.rotation
            ) {
              return filtered;
            }
          }
          return prev;
        });
      } catch {
        failCount++;
      }
    };

    load();
    const iv = setInterval(load, 500); // 500ms lebih stabil & hemat CPU
    return () => { cancelled = true; clearInterval(iv); };
  }, [playerId]);

  /* ===================== */
  /* TEXTURE HELPER        */
  /* ===================== */

  const loadTextureSafe = useCallback((path: string, onLoad: (tex: THREE.Texture) => void, flipY = false) => {
    loadCachedTexture(loader.current, path, onLoad, flipY);
  }, []);

  /* ===================== */
  /* DISPLAY TEXTURES      */
  /* ===================== */

  useEffect(() => {
    scene.traverse((obj: any) => {
      if (!obj.isMesh) return;
      const name = obj.name?.toLowerCase() || "";

      const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/+$/, "");

      if (name.startsWith("paneldisplay")) {
        const num = parseInt(name.replace("paneldisplay", "")[1]);
        if (!isNaN(num)) loadTextureSafe(`${basePath}/prodi/${folder}/${num}.png`, (tex) => {
          disposeMaterial(obj);
          obj.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        });
      }
      if (name === "panel") {
        loadTextureSafe(`${basePath}/prodi/${folder}/${folder}.png`, (tex) => {
          disposeMaterial(obj);
          obj.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        });
      }
      if (name.startsWith("panelposter")) {
        // Sama seperti booth: ambil angka di akhir nama objek
        // ("panelposter12" -> 12) dan cocokkan langsung ke id_stan.
        const match = name.match(/(\d+)$/);
        const stanNumber = match ? parseInt(match[1], 10) : null;
        if (stanNumber == null) return;

        const karya = karyaList.find((k) => {
          const kStanNumber = parseInt(String(k.id_stan).replace(/\D/g, ""), 10);
          return kStanNumber === stanNumber;
        }) ?? null;

        if (karya?.poster) {
          const posterUrl = karya.poster.includes("drive.google.com") || karya.poster.includes("googleusercontent.com")
            ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/experience/proxy-image?url=${encodeURIComponent(karya.poster)}`
            : karya.poster;

          loadTextureSafe(posterUrl, (tex) => {
            disposeMaterial(obj);
            obj.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
          }, true);
        }
      }
    });
  }, [scene, folder, loadTextureSafe, karyaList]);

  /* ===================== */
  /* BOOTH POINTS          */
  /* ===================== */

  const boothPoints = useMemo(() => {
    const result: any[] = [];
    scene.updateMatrixWorld(true);
    scene.traverse((obj: any) => {
      const lower = obj.name?.toLowerCase() || "";
      if (lower.startsWith("booth")) {
        // Ambil angka di akhir nama objek, mis. "boothpoints12" -> 12,
        // "boothpoints144" -> 144. Ini yang dicocokkan ke id_stan.
        const match = lower.match(/(\d+)$/);
        const stanNumber = match ? parseInt(match[1], 10) : null;
        if (stanNumber == null) return;

        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        obj.getWorldPosition(pos);
        obj.getWorldQuaternion(quat);
        result.push({
          name: obj.name,
          stanNumber,
          position: [pos.x, pos.y, pos.z],
          quaternion: [quat.x, quat.y, quat.z, quat.w],
        });
        obj.visible = false;
        obj.raycast = () => null;
      }
      if (lower.includes("collider")) {
        obj.visible = false;
        obj.traverse((child: any) => { child.visible = false; if (child.isMesh) child.userData.collider = true; });
      }
    });
    return result;
  }, [scene]);

  /* ===================== */
  /* BOOTH MATCHING        */
  /* Sekarang 1:1 — boothpointsN di hall dicocokkan langsung ke karya yang  */
  /* id_stan-nya = N. Tidak ada lagi konsep zona/lantai untuk booth, karena */
  /* semua 144 titik sudah ada sekaligus di satu scene.                    */
  /* ===================== */

  const visibleBooths = useMemo(() => {
    return boothPoints
      .map((item) => {
        const karya = karyaList.find((k) => {
          // id_stan dari API formatnya "Stan 1", "Stan 12", dst — ambil angkanya saja.
          const stanNumber = parseInt(String(k.id_stan).replace(/\D/g, ""), 10);
          return stanNumber === item.stanNumber;
        }) ?? null;

        return { item, karya };
      })
      .filter(({ karya }) => karya && karya.model_path);
  }, [boothPoints, karyaList]);

  // Preload booth GLTF models as soon as we know which ones are needed,
  // so switching floors doesn't stall on model parsing.
  useEffect(() => {
    visibleBooths.forEach(({ karya }) => {
      if (karya?.model_path) {
        useGLTF.preload(karya.model_path);
      }
    });
  }, [visibleBooths]);

  return (
    <>
      <ambientLight intensity={2.2} />
      <directionalLight position={[10, 15, 10]} intensity={3} />
      <pointLight position={[0, 8, 0]} intensity={2} />

      <primitive object={scene} />

      {visibleBooths.map(({ item, karya }) => (
        <Booth
          key={item.name}
          boothName={karya.booth_name}
          idKarya={karya.id_karya}
          idKategori={karya.id_kategori}
          position={item.position}
          quaternion={item.quaternion}
          poster={karya.poster}
          sampul={karya.sampul}
          tautan={karya.tautan}
          modelPath={karya.model_path}
          cameraMode={cameraMode}
          mobile={mobile}
          numBaseUrl={numBaseUrl}
          playerPositionRef={playerPositionRef}
          openPoster={openPoster}
          openTautan={openTautan}
        />
      ))}

      {remotePlayers.map((player) => (
        <RemotePlayerMesh key={player.id} player={player} modelUrl={playerModelUrl} />
      ))}

      {/* Tombol C untuk toggle first/third person. Dikunci (disabled) saat
          controlsLocked false — mis. lagi lihat poster/video/menu ESC —
          supaya tombol C nggak nyelonong ganti kamera di tengah UI lain. */}
      <CameraSwitcher disabled={!controlsLocked} setMode={setCameraMode} />

      {/* Interaksi tombol E, cuma aktif pas desktop + third-person (lihat
          catatan di Booth.handleClick — di situ klik langsung di-skip
          untuk kombinasi yang sama). */}
      <ThirdPersonInteract
        active={!mobile && cameraMode === "third" && controlsLocked}
        playerPosition={playerPositionRef}
        openPoster={openPoster}
        openTautan={openTautan}
        onHintChange={onInteractHint}
      />

      <Player
        mode={cameraMode}
        controlsLocked={controlsLocked}
        setWalking={setWalking}
        setJumping={setJumping}
        setSprinting={onSprintChange}
        mobileMove={mobileMove}
        mobileSprint={mobileSprint}
        mobileJump={mobileJump}
        lookDelta={lookDelta}
        playerId={playerId}
        playerName={playerName}
        playerModelUrl={playerModelUrl}
        setPosition={(pos) => playerPositionRef.current.set(pos.x, pos.y, pos.z)}
      />
    </>
  );
}

/* ===================== */
/* THIRD-PERSON INTERACT */
/* Ganti klik jadi tombol E khusus desktop third-person — di sana nggak ada */
/* crosshair/reticle buat nunjuk, dan mouse dipakai buat nengok terus.      */
/*                                                                          */
/* Sebelumnya ini raycast dari kamera lurus ke tengah layar (kayak         */
/* crosshair FPS) — makanya hint "Tekan E" nggak pernah muncul walau udah  */
/* deket panel: kamera third-person harus PERSIS ngarah ke panel dulu,     */
/* padahal nggak ada reticle buat bantu nunjuk ke situ. Sekarang diganti   */
/* jadi murni PROXIMITY: tiap panel/objek ber-tag userData.interact di-cek */
/* jaraknya ke posisi player (bukan ke kamera), yang terdekat dalam radius */
/* INTERACT_RANGE itu yang jadi target — jadi beneran "muncul kalau        */
/* deket", bukan "muncul kalau pas nunjuk".                                */
/*                                                                          */
/* Catatan: pengecekan occlusion (collider dinding) sengaja tidak dipakai  */
/* lagi di sini — collider di-set visible=false, dan sejak three.js r72    */
/* Raycaster memang men-skip objek invisible sama sekali (bukan cuma di    */
/* renderer), jadi cek `userData.collider` di raycast versi lama itu tidak */
/* pernah kena apa pun. Radius proximity yang kecil (INTERACT_RANGE)       */
/* sudah cukup mencegah hint muncul dari booth tetangga di seberang        */
/* tembok pada praktiknya.                                                 */
/* ===================== */

const INTERACT_RANGE = 3.5; // meter — seberapa "deket" baru dianggap dalam jangkauan

function ThirdPersonInteract({
  active,
  playerPosition,
  openPoster,
  openTautan,
  onHintChange,
}: {
  active: boolean;
  playerPosition: React.MutableRefObject<THREE.Vector3>;
  openPoster: (src: string, booth: string) => void;
  openTautan: (url: string, booth: string) => void;
  onHintChange?: (hint: { label: string } | null) => void;
}) {
  const { scene: world } = useThree();

  // Daftar semua object ber-tag userData.interact di scene, di-scan ulang
  // secara periodik (bukan tiap frame — traverse seluruh scene itu relatif
  // berat) supaya booth yang baru mount (mis. setelah ganti lantai) ikut
  // kedeteksi tanpa perlu prop tambahan dari luar.
  const interactables = useRef<THREE.Object3D[]>([]);
  const lastHintRef = useRef<string | null>(null);
  const currentTargetRef = useRef<{ data: any } | null>(null);
  const checkTimer = useRef(0);
  const worldPosScratch = useRef(new THREE.Vector3());

  useEffect(() => {
    const scan = () => {
      const found: THREE.Object3D[] = [];
      world.traverse((obj: any) => {
        if (obj?.userData?.interact) found.push(obj);
      });
      interactables.current = found;
    };

    scan();
    const iv = setInterval(scan, 1500);
    return () => clearInterval(iv);
  }, [world]);

  const findTarget = useCallback(() => {
    const playerPos = playerPosition.current;
    let nearestObj: THREE.Object3D | null = null;
    let nearestDist = INTERACT_RANGE;

    for (const obj of interactables.current) {
      obj.getWorldPosition(worldPosScratch.current);
      const dist = worldPosScratch.current.distanceTo(playerPos);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestObj = obj;
      }
    }

    return nearestObj ? { data: (nearestObj as any).userData.interact } : null;
  }, [playerPosition]);

  // Update hint teks "Tekan E" tiap ~120ms, bukan tiap frame.
  useFrame((_, delta) => {
    if (!active) {
      currentTargetRef.current = null;
      return;
    }
    checkTimer.current += delta;
    if (checkTimer.current < 0.12) return;
    checkTimer.current = 0;

    const target = findTarget();
    currentTargetRef.current = target;

    if (!onHintChange) return;
    const label = target
      ? target.data.type === "video"
        ? `Tonton video`
        : `Lihat poster`
      : null;

    if (label !== lastHintRef.current) {
      lastHintRef.current = label;
      onHintChange(label ? { label } : null);
    }
  });

  useEffect(() => {
    if (!active) {
      if (lastHintRef.current !== null) {
        lastHintRef.current = null;
        onHintChange?.(null);
      }
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyE") return;
      const target = currentTargetRef.current;
      if (!target) return;
      if (target.data.type === "poster") openPoster(target.data.src, target.data.boothName);
      if (target.data.type === "video") openTautan(target.data.url, target.data.boothName);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, openPoster, openTautan]);

  return null;
}

function RemotePlayerMesh({ player, modelUrl }: { player: RemotePlayer; modelUrl: string | null }) {
  const groupRef = useRef<THREE.Group>(null!);
  const currentPos = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const targetPos = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const currentRot = useRef(player.rotation);
  const targetRot = useRef(player.rotation);

  useEffect(() => {
    targetPos.current.set(player.x, player.y, player.z);
    targetRot.current = player.rotation;
  }, [player.x, player.y, player.z, player.rotation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    currentPos.current.lerp(targetPos.current, 1 - Math.exp(-10 * delta));
    groupRef.current.position.copy(currentPos.current);
    currentRot.current = THREE.MathUtils.lerp(currentRot.current, targetRot.current, 1 - Math.exp(-10 * delta));
    groupRef.current.rotation.y = currentRot.current;
  });

  return (
    <group ref={groupRef}>
      {modelUrl ? (
        <RemotePlayerModel url={modelUrl} />
      ) : (
        // Fallback capsule kalau URL model belum siap / gagal load. Tetap
        // ditandai isPlayer supaya tidak ikut dianggap collider/lantai oleh
        // player.tsx (jadi tetap bisa saling tembus walau fallback).
        // Offset -1.5 disamakan dengan badan player sendiri di player.tsx
        // (lihat playerMesh.position.y -= 1.5 di sana) — sebelumnya beda
        // (-1 di sini vs -1.5 di badan sendiri), jadi tinggi karakter yang
        // sama keliatan beda antara di layar sendiri vs di layar teman.
        <mesh position={[0, -1.5, 0]} userData={{ isPlayer: true }}>
          <capsuleGeometry args={[0.8, 1.8, 4, 8]} />
          <meshStandardMaterial color="cyan" transparent opacity={0.7} />
        </mesh>
      )}
      {/* Billboard supaya nametag SELALU menghadap kamera, lepas dari
          rotation.y group di atas (yang ngikutin arah hadap karakter).
          Sebelumnya Text ikut muter bareng badan, jadi kelihatan kepotong/
          kebalik pas karakter nengok ke arah tertentu. */}
      {/* <Billboard position={[0, 1, 0]}>
        <Text fontSize={0.28} color="black" anchorX="center" anchorY="middle">
          {player.name}
        </Text>
      </Billboard> */}
    </group>
  );
}

// Badan remote player pakai player.glb. Di-clone per instance (bukan pakai
// scene hasil useGLTF langsung) karena useGLTF men-cache & mengembalikan
// object3D YANG SAMA untuk URL yang sama — kalau tidak di-clone, semua
// remote player akan berbagi satu object3D dan cuma yang terakhir mount
// yang keliatan posisinya benar.
function RemotePlayerModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj: any) => {
      // Tag semua mesh badan player supaya scan collider/floor di
      // player.tsx otomatis mengabaikannya — ini yang membuat antar player
      // saling tembus, sementara collider hall/booth tetap menghalangi.
      obj.userData.isPlayer = true;
    });
    return clone;
  }, [scene]);

  // Offset -1.5 (bukan -1) supaya konsisten dengan badan player sendiri di
  // player.tsx (playerMesh.position.y -= 1.5) — lihat catatan di atas.
  return <primitive object={cloned} position={[0, -1.5, 0]} />;
}