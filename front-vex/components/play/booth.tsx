"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sharedTextureLoader } from "@/components/shared/ui/LoadingManager";
import { PrimaryMaterial, createSecondaryMaterial } from "@/components/play/boothMaterials";

const textureCache = new Map<string, THREE.Texture>();

// Helper Canvas Generator untuk placeholder Poster / Video jika karya belum mengunggah poster/video
function createTextPlaceholderTexture(title: string, subtitle: string, isPoster = true): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = isPoster ? 512 : 768;
  canvas.height = isPoster ? 682 : 432;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Gradient Background Modern
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#0F172A");
    grad.addColorStop(1, "#1E293B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Text Title
    ctx.fillStyle = "#F8FAFC";
    ctx.font = isPoster ? "bold 34px sans-serif" : "bold 38px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);

    // Text Subtitle
    ctx.fillStyle = "#94A3B8";
    ctx.font = isPoster ? "20px sans-serif" : "22px sans-serif";
    ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 25);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function loadCachedTexture(
  path: string,
  onLoad: (tex: THREE.Texture) => void,
  flipY = false
) {
  if (!path) return;
  const cached = textureCache.get(path);
  if (cached) {
    onLoad(cached);
    return;
  }
  sharedTextureLoader.load(
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
    (err) => console.error("Gagal load texture:", path, err)
  );
}

// Google Drive thumbnail endpoint tidak mengirim header CORS, jadi tidak
// bisa dipakai langsung sebagai texture WebGL (beda dari <img>/<Image>
// biasa yang tidak butuh CORS). Di-proxy lewat backend sendiri supaya
// dapat header Access-Control-Allow-Origin yang benar.
function toProxiedUrl(url: string): string {
  if (!url) return url;
  // Beberapa link Google Drive muncul dalam format domain yang beda-beda
  // (drive.google.com/... ATAU lh3.googleusercontent.com/d/...), keduanya
  // sama-sama tidak kirim header CORS jadi harus di-proxy.
  const isGoogleHosted =
    url.includes("drive.google.com") || url.includes("googleusercontent.com");
  if (isGoogleHosted) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return `${base}/api/experience/proxy-image?url=${encodeURIComponent(url)}`;
  }
  if (url.startsWith("/storage/")) {
    const path = url.replace(/^\/storage\//, "");
    return `${base}/api/experience/poster/${path}`;
  }
  if (url.includes("/storage/")) {
    const parts = url.split("/storage/");
    return `${base}/api/experience/poster/${parts[1].replace(/^\//, "")}`;
  }
  return url;
}

// Rotasi tambahan (derajat, di sumbu Y) yang diterapkan SETELAH quaternion
// dari boothpoints di hall. Perlu ini karena arah "depan" pada booth.glb
// ternyata tidak sama dengan arah depan yang dimaksud objek boothpointsN
// di hall-utama.glb. Kalau booth masih menghadap arah salah, ubah angka
// ini (coba 90, -90, atau 0) sampai orientasinya pas.
const BOOTH_YAW_OFFSET_DEG = 90;
const boothYawOffsetQuat = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(0, 1, 0),
  THREE.MathUtils.degToRad(BOOTH_YAW_OFFSET_DEG)
);

type BoothProps = {
  position?: [number, number, number];
  quaternion?: [number, number, number, number];
  boothName: string;
  poster?: string;
  sampul?: string;
  tautan?: string;
  modelPath: string;
  idKarya: number;
  idKategori: number;
  cameraMode?: "first" | "third";
  mobile?: boolean;
  numBaseUrl?: string | null;
  playerPositionRef?: React.MutableRefObject<THREE.Vector3>;
  openPoster: (src: string, booth: string) => void;
  openTautan: (url: string, booth: string) => void;
};

export default function Booth({
  position = [0, 0, 0],
  quaternion = [0, 0, 0, 1],
  boothName, poster, sampul, tautan, modelPath,
  idKarya, idKategori, cameraMode, mobile, numBaseUrl,
  playerPositionRef,
  openPoster, openTautan,
}: BoothProps) {
  const gltf = useGLTF(modelPath);
  const scene = useMemo(() => gltf.scene.clone(), [gltf]);

  // Jarak render & LOD texture (di HP radius lebih hemat)
  const [isInRange, setIsInRange] = useState(false);
  const [isNearForTexture, setIsNearForTexture] = useState(false);
  const boothWorldPos = useMemo(() => new THREE.Vector3(...position), [position]);

  const RENDER_RADIUS = mobile ? 22 : 32;
  const TEXTURE_RADIUS = mobile ? 14 : 22;

  useFrame((_, delta) => {
    if (!playerPositionRef?.current) return;
    const distSq = boothWorldPos.distanceToSquared(playerPositionRef.current);
    const inRange = distSq < RENDER_RADIUS * RENDER_RADIUS;
    const nearTex = distSq < TEXTURE_RADIUS * TEXTURE_RADIUS;

    if (inRange !== isInRange) setIsInRange(inRange);
    if (nearTex !== isNearForTexture) setIsNearForTexture(nearTex);
  });

  // Gabungkan quaternion asli dari boothpoints DENGAN offset yaw tetap,
  // supaya arah depan booth.glb sinkron dengan arah yang dimaksud hall.
  const quaternionObj = useMemo(() => {
    const base = new THREE.Quaternion(...quaternion);
    return base.multiply(boothYawOffsetQuat);
  }, [quaternion]);

  const posterMesh = useRef<THREE.Mesh | null>(null);
  const sampulMesh = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    posterMesh.current = null;
    sampulMesh.current = null;

    scene.traverse((obj: any) => {
      if (!obj.isMesh) return;
      // obj.userData.isBooth = true; // Tandai agar tidak pernah dianggap floor/lantai di player.tsx
      const lower = obj.name?.toLowerCase() || "";
      if (lower.includes("collider")) {
        obj.visible = false;
        obj.userData.collider = true;
      }
      if (lower === "panelposter" || lower.startsWith("panelposter")) {
        posterMesh.current = obj;
      }
      if (lower === "panelvideo" || lower.startsWith("panelvideo")) {
        sampulMesh.current = obj;
      }
    });
  }, [scene]);

  /* ===================== */
  /* WARNA KATEGORI: PRIMARY & SECONDARY */
  /* Material-nya shared/cached (lihat boothMaterials.ts), jadi TIDAK perlu */
  /* dispose material lama di sini — hindari dispose instance yang dipakai  */
  /* booth lain juga.                                                       */
  /* ===================== */
  useEffect(() => {
    scene.traverse((obj: any) => {
      if (!obj.isMesh) return;
      const name = obj.name?.toLowerCase();
      if (name === "primary") {
        obj.material = PrimaryMaterial;
      }
      if (name === "secondary") {
        obj.material = createSecondaryMaterial(idKategori);
      }
    });
  }, [scene, idKategori]);

  /* ===================== */
  /* LABEL NOMOR: OBJEK "num"                                              */
  /* Cari case-insensitive & tembus ke child kalau "num" berupa grup/empty */
  /* (bukan mesh langsung) — pola umum hasil export dari Blender.          */
  /*                                                                        */
  /* Nomornya diambil dari backend storage lewat numBaseUrl (dikirim dari  */
  /* Experience.tsx, hasil getNumBaseUrl() di apiPlay.ts) — bukan dari      */
  /* public/ dan bukan digambar ke canvas lagi. URL yang dipakai:           */
  /* `${numBaseUrl}/${idKarya}.png`.                                        */
  /* ===================== */
  useEffect(() => {
    let numMesh: THREE.Mesh | null = null;

    scene.traverse((obj: any) => {
      if (numMesh) return;
      if (obj.name?.toLowerCase() !== "num") return; // ← fix: dulu salah dibandingkan ke "Num"

      if (obj.isMesh) {
        numMesh = obj;
      } else {
        obj.traverse((child: any) => {
          if (!numMesh && child.isMesh) numMesh = child;
        });
      }
    });

    // TEMP DEBUG — remove once this is confirmed working
    console.log("[num debug]", {
      boothName,
      foundNumMesh: !!numMesh,
      idKarya,
      numBaseUrl,
    });

    if (!numMesh || idKarya == null || !numBaseUrl || !isNearForTexture) return;

    let cancelled = false;
    loadCachedTexture(`${numBaseUrl.replace(/\/$/, "")}/${idKarya}.png`, (tex) => {
      if (cancelled || !numMesh) return;
      (numMesh.material as THREE.Material)?.dispose?.();
      numMesh.material = new THREE.MeshBasicMaterial({
        map: tex,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [scene, idKarya, numBaseUrl, isNearForTexture]);

  useEffect(() => {
    if (!posterMesh.current || !isNearForTexture) return;
    let cancelled = false;

    if (!poster) {
      // Tampilkan placeholder bahasa Inggris jika poster kosong
      const fallbackTex = createTextPlaceholderTexture("NO POSTER", "No Poster Available", true);
      (posterMesh.current.material as THREE.Material)?.dispose?.();
      posterMesh.current.material = new THREE.MeshBasicMaterial({ map: fallbackTex, toneMapped: false });
      return;
    }

    const posterSrc = toProxiedUrl(poster);
    loadCachedTexture(posterSrc, (tex) => {
      if (cancelled || !posterMesh.current) return;
      (posterMesh.current.material as THREE.Material)?.dispose?.();
      posterMesh.current.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    });
    return () => { cancelled = true; };
  }, [poster, scene, isNearForTexture]);

  useEffect(() => {
    if (!sampulMesh.current || !isNearForTexture) return;
    let cancelled = false;

    if (!sampul && !tautan) {
      // Tampilkan placeholder bahasa Inggris jika video/demo belum ada
      const fallbackTex = createTextPlaceholderTexture("NO VIDEO", "No Video Available", false);
      (sampulMesh.current.material as THREE.Material)?.dispose?.();
      sampulMesh.current.material = new THREE.MeshBasicMaterial({ map: fallbackTex, toneMapped: false });
      return;
    }

    const sampulSrc = sampul ? toProxiedUrl(sampul) : toProxiedUrl(poster);
    loadCachedTexture(sampulSrc, (tex) => {
      if (cancelled || !sampulMesh.current) return;
      (sampulMesh.current.material as THREE.Material)?.dispose?.();
      sampulMesh.current.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    }, true);
    return () => { cancelled = true; };
  }, [sampul, tautan, poster, scene, isNearForTexture]);

  const { camera, scene: world } = useThree();
  const occlusionRay = useRef(new THREE.Raycaster());
  const MAX_INTERACT_DISTANCE = 8;

  const isDescendantOf = (obj: THREE.Object3D, root: THREE.Object3D) => {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      if (cur === root) return true;
      cur = cur.parent;
    }
    return false;
  };

  const isBlocked = useCallback(
    (point: THREE.Vector3, distance: number) => {
      if (distance > MAX_INTERACT_DISTANCE) return true;
      const dir = point.clone().sub(camera.position).normalize();
      occlusionRay.current.set(camera.position, dir);
      occlusionRay.current.far = Math.max(distance - 0.1, 0);
      occlusionRay.current.near = 0;
      const hits = occlusionRay.current
        .intersectObjects(world.children, true)
        .filter((h: any) => h.object?.userData?.collider && !isDescendantOf(h.object, scene));
      return hits.length > 0;
    },
    [camera, world, scene]
  );

  const handleClick = (e: any) => {
    const clicked = e?.object?.name;
    if (clicked !== "PanelPoster" && clicked !== "PanelVideo") return;
    e.stopPropagation();
    if (cameraMode === "third" && !mobile) return;
    if (isBlocked(e.point, e.distance)) return;
    if (clicked === "PanelPoster" && poster) openPoster(poster, boothName);
    if (clicked === "PanelVideo" && tautan) openTautan(tautan, boothName);
  };

  return (
    <group position={position} quaternion={quaternionObj}>
      {/* Primitive scene selalu ter-mount agar colliders terdeteksi oleh player raycast,
          tetapi child visual berat (poster, panel) hanya me-load texture saat dekat */}
      <primitive object={scene} position={[0, 0, -1.2]} onClick={handleClick} visible={isInRange} />
    </group>
  );
}
