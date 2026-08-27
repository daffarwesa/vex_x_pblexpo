import { PrimaryMaterial, createSecondaryMaterial } from "@/components/play/boothMaterials";

// ... (imports lain, type BoothProps — tetap sama seperti file asli kalian)

export default function Booth({
  position = [0, 0, 0],
  quaternion = [0, 0, 0, 1],
  boothName, poster, sampul, tautan, modelPath,
  idKarya, idKategori,
  cameraMode, mobile,
  openPoster, openTautan,
}: BoothProps) {
  const gltf = useGLTF(modelPath);
  const scene = useMemo(() => gltf.scene.clone(), [gltf]);
  const quaternionObj = useMemo(() => new THREE.Quaternion(...quaternion), [quaternion]);

  const posterMesh = useRef<THREE.Mesh | null>(null);
  const sampulMesh = useRef<THREE.Mesh | null>(null);
  const posterCanvasTex = useRef<THREE.Texture | null>(null);
  const numCanvasTex = useRef<THREE.Texture | null>(null);

  // ... (useEffect traverse poster/sampul yang sudah ada — TETAP SAMA, tidak diubah) ...

  /* ===================== */
  /* WARNA KATEGORI: PRIMARY & SECONDARY */
  /* Objek bernama "primary"/"secondary" (case-insensitive) di-warnai      */
  /* berbeda per kategori. Keduanya adalah SHARED material dari            */
  /* boothMaterials.ts — jangan dispose() di sini, karena instance-nya     */
  /* dipakai bareng oleh booth lain (primary: semua booth; secondary:      */
  /* semua booth dengan idKategori yang sama).                             */
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
  /* Objek bernama "num" diubah jadi plane bertekstur canvas: teks hitam    */
  /* (id_karya) di atas background putih.                                   */
  /* ===================== */
  useEffect(() => {
    let numMesh: THREE.Mesh | null = null;
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.name?.toLowerCase() === "num") numMesh = obj;
    });
    if (!numMesh) return;

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
    tex.needsUpdate = true;
    numCanvasTex.current?.dispose();
    numCanvasTex.current = tex;

    // Material "num" adalah instance unik per-booth (bikin baru tiap render),
    // jadi aman & wajib di-dispose sebelum diganti.
    ((numMesh as unknown) as THREE.Mesh).material &&
      ((numMesh as unknown as THREE.Mesh).material as THREE.Material).dispose?.();
    (numMesh as unknown as THREE.Mesh).material = new THREE.MeshBasicMaterial({
      map: tex,
      toneMapped: false,
    });
  }, [scene, idKarya]);

  // Dispose canvas texture "num" saat komponen unmount.
  useEffect(() => {
    return () => {
      numCanvasTex.current?.dispose();
    };
  }, []);

  // ... (sisa kode: isBlocked, handleClick, return JSX — TETAP SAMA, tidak diubah) ...
}

// getKategoriColors & hashString DIHAPUS — dead code, tidak dipakai lagi
// sejak warna kategori diambil dari KATEGORI_COLORS map di boothMaterials.ts