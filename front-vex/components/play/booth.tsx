"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sharedTextureLoader } from "@/components/shared/ui/LoadingManager";
import { PrimaryMaterial, createSecondaryMaterial } from "@/components/play/boothMaterials";

const textureCache = new Map<string, THREE.Texture>();

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
  if (url.includes("drive.google.com")) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return `${base}/api/experience/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

// Rotasi tambahan (derajat, di sumbu Y) yang diterapkan SETELAH quaternion
// dari boothpoints di hall. Perlu ini karena arah "depan" pada booth.glb
// ternyata tidak sama dengan arah depan yang dimaksud objek boothpointsN
// di hall-utama.glb. Kalau booth masih menghadap arah salah, ubah angka
// ini (coba 90, -90, atau 0) sampai orientasinya pas.
const BOOTH_YAW_OFFSET_DEG = 180;
const boothYawOffsetQuat = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(0, 1, 0),
  THREE.MathUtils.degToRad(BOOTH_YAW_OFFSET_DEG)
);

type BoothProps = {
  position?: [number, number, number];
  quaternion?: [number, number, number, number];
  boothName: string;
  poster: string;
  sampul: string;
  tautan?: string;
  modelPath: string;
  idKarya?: any;
  idKategori?: any;
  cameraMode?: "first" | "third";
  mobile?: boolean;
  openPoster: (src: string, booth: string) => void;
  openTautan: (url: string, booth: string) => void;
};

export default function Booth({
  position = [0, 0, 0],
  quaternion = [0, 0, 0, 1],
  boothName, poster, sampul, tautan, modelPath,
  idKarya, idKategori, cameraMode, mobile,
  openPoster, openTautan,
}: BoothProps) {
  const gltf = useGLTF(modelPath);
  const scene = useMemo(() => gltf.scene.clone(), [gltf]);

  // Gabungkan quaternion asli dari boothpoints DENGAN offset yaw tetap,
  // supaya arah depan booth.glb sinkron dengan arah yang dimaksud hall.
  const quaternionObj = useMemo(() => {
    const base = new THREE.Quaternion(...quaternion);
    return base.multiply(boothYawOffsetQuat);
  }, [quaternion]);

  const posterMesh = useRef<THREE.Mesh | null>(null);
  const sampulMesh = useRef<THREE.Mesh | null>(null);
  const numCanvasTex = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    scene.traverse((obj: any) => {
      if (!obj.isMesh) return;
      if (obj.name?.toLowerCase().includes("collider")) {
        obj.visible = false;
        obj.userData.collider = true;
      }
    });
    posterMesh.current = scene.getObjectByName("PanelPoster") as THREE.Mesh;
    sampulMesh.current = scene.getObjectByName("PanelVideo") as THREE.Mesh;
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

    if (!numMesh || idKarya == null) return;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 140px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(idKarya), canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    tex.needsUpdate = true;

    numCanvasTex.current?.dispose();
    numCanvasTex.current = tex;

    ((numMesh as any).material as THREE.Material)?.dispose?.();
    (numMesh as any).material = new THREE.MeshBasicMaterial({
      map: tex,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
  }, [scene, idKarya]);

  useEffect(() => {
    return () => {
      numCanvasTex.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!poster || !posterMesh.current) return;
    let cancelled = false;
    loadCachedTexture(toProxiedUrl(poster), (tex) => {
      if (cancelled || !posterMesh.current) return;
      (posterMesh.current.material as THREE.Material)?.dispose?.();
      posterMesh.current.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    });
    return () => { cancelled = true; };
  }, [poster, scene]);

  useEffect(() => {
    if (!sampul || !sampulMesh.current) return;
    let cancelled = false;
    loadCachedTexture(toProxiedUrl(sampul), (tex) => {
      if (cancelled || !sampulMesh.current) return;
      (sampulMesh.current.material as THREE.Material)?.dispose?.();
      sampulMesh.current.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    }, true);
    return () => { cancelled = true; };
  }, [sampul, scene]);

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
      <primitive object={scene} position={[0, 0, -1.2]} onClick={handleClick} />
    </group>
  );
}