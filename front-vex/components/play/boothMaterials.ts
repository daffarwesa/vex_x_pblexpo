import * as THREE from "three";

/* ============================================================= */
/* PRIMARY MATERIAL                                               */
/* Shader toon-style (hard threshold, bukan gradient) — SAMA untuk */
/* semua booth apapun kategorinya. Dibuat SEKALI di module-level   */
/* (bukan di dalam komponen) supaya semua booth share instance     */
/* material yang sama persis, hemat memory & konsisten.            */
/* ============================================================= */

const toonVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const toonFragmentShader = `
  uniform vec3 lightDirection;
  uniform vec3 colorLow;
  uniform vec3 colorHigh;
  uniform float threshold;
  varying vec3 vNormal;
  void main() {
    float diffuse = max(dot(normalize(vNormal), normalize(lightDirection)), 0.0);
    vec3 color = diffuse > threshold ? colorHigh : colorLow;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const PrimaryMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
    colorLow: { value: new THREE.Color(0x000000) }, // hitam
    colorHigh: { value: new THREE.Color(0xffffff) }, // putih
    threshold: { value: 0.0 },
  },
  vertexShader: toonVertexShader,
  fragmentShader: toonFragmentShader,
});

/* ============================================================= */
/* SECONDARY COLORS — per id_kategori                             */
/* Sesuai tabel kategori di database. Kalau nambah/ubah kategori   */
/* di database, tinggal update map ini juga.                       */
/* ============================================================= */

export const KATEGORI_COLORS: Record<number, string> = {
  1: "#00BCD4",  // IOT - Internet of Things
  2: "#3F51B5",  // WEB - Aplikasi Berbasis Web dan Mobile
  3: "#E91E63",  // ANV - Animasi dan Videografi
  4: "#4CAF50",  // JCS - Jaringan dan Cybersecurity
  5: "#FF9800",  // OTO - Sistem Otomasi
  6: "#9C27B0",  // RAI - Robotics and Artificial Intelligence
  7: "#795548",  // TTG - Teknologi Tepat Guna
  8: "#607D8B",  // PRF - Proses Fabrikasi / Manufacturing
  9: "#8BC34A",  // PDF - Produk Fabrikasi / Manufacturing
  10: "#FFC107", // KDS - Konsep Desain
  11: "#F44336", // LJU - Layanan dan Jasa Usaha
  12: "#009688", // KTI - Karya Tulis Ilmiah
};

const DEFAULT_SECONDARY_COLOR = "#9E9E9E"; // abu-abu, fallback kalau id_kategori nggak ada di map

export function getSecondaryColor(idKategori: number | string | null | undefined): THREE.Color {
  const key = Number(idKategori);
  const hex = KATEGORI_COLORS[key] ?? DEFAULT_SECONDARY_COLOR;
  return new THREE.Color(hex);
}

/* ============================================================= */
/* SECONDARY MATERIAL (toon) — per id_kategori                    */
/* Sama teknik hard-threshold-nya kayak PrimaryMaterial, tapi      */
/* colorHigh = warna kategori asli, colorLow = versi gelapnya.     */
/* Di-cache per id_kategori: booth dengan kategori sama SHARE satu */
/* instance material yang sama (bukan bikin baru tiap dipanggil).  */
/*                                                                  */
/* PENTING: karena instance-nya shared, JANGAN dispose() material  */
/* ini dari komponen Booth. Kalau di-dispose, semua booth lain yang */
/* pakai kategori sama ikut rusak (GPU resource-nya hilang).       */
/* ============================================================= */

const SHADE_FACTOR = 0.35; // seberapa gelap sisi "shadow"-nya (0 = hitam total, 1 = sama kayak colorHigh)

const secondaryMaterialCache = new Map<string, THREE.ShaderMaterial>();

export function createSecondaryMaterial(
  idKategori: number | string | null | undefined
): THREE.ShaderMaterial {
  const key = Number(idKategori);
  const cacheKey = KATEGORI_COLORS[key] ? String(key) : "default";

  const cached = secondaryMaterialCache.get(cacheKey);
  if (cached) return cached;

  const colorHigh = getSecondaryColor(idKategori);
  const colorLow = colorHigh.clone().multiplyScalar(SHADE_FACTOR);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      lightDirection: { value: (PrimaryMaterial.uniforms.lightDirection.value as THREE.Vector3).clone() },
      colorLow: { value: colorLow },
      colorHigh: { value: colorHigh },
      threshold: { value: 0.0 },
    },
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
  });

  secondaryMaterialCache.set(cacheKey, material);
  return material;
}