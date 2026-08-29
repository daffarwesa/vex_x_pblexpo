import * as THREE from "three";

/* ============================================================= */
/* TOON SHADER — dipakai bareng oleh Primary, Secondary, dan Hall  */
/* ============================================================= */

const toonVertexShader = `
  varying vec3 vNormal;
  void main() {
    // World-space normal (BUKAN normalMatrix, yang relatif ke kamera).
    // lightDirection uniform juga world-space, jadi keduanya harus di
    // space yang sama supaya arah cahaya tidak ikut berubah saat kamera
    // muter/geser.
    vNormal = normalize(mat3(modelMatrix) * normal);
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

const DEFAULT_LIGHT_DIR = new THREE.Vector3(1, 0.8, 0.3).normalize();
const SHADE_FACTOR = 0.9; // seberapa gelap sisi "shadow" — 0 = hitam total, 1 = sama kayak colorHigh

// Factory generic: bikin (atau ambil dari cache) toon material dari 1 warna hex.
// colorLow otomatis dihitung sebagai versi gelap dari colorHigh.
const toonMaterialCache = new Map<string, THREE.ShaderMaterial>();

function createToonMaterial(hex: string): THREE.ShaderMaterial {
  const cached = toonMaterialCache.get(hex);
  if (cached) return cached;

  const colorHigh = new THREE.Color(hex);
  const colorLow = colorHigh.clone().multiplyScalar(SHADE_FACTOR);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      lightDirection: { value: DEFAULT_LIGHT_DIR.clone() },
      colorLow: { value: colorLow },
      colorHigh: { value: colorHigh },
      threshold: { value: 0.0 },
    },
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
    side: THREE.DoubleSide,
  });

  toonMaterialCache.set(hex, material);
  return material;
}

/* ============================================================= */
/* PRIMARY MATERIAL — hitam/putih, sama untuk semua booth          */
/* ============================================================= */

export const PrimaryMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightDirection: { value: DEFAULT_LIGHT_DIR.clone() },
    colorLow: { value: new THREE.Color(0xf0f0f0) },
    colorHigh: { value: new THREE.Color(0xffffff) },
    threshold: { value: 0.0 },
  },
  vertexShader: toonVertexShader,
  fragmentShader: toonFragmentShader,
  side: THREE.DoubleSide,
});

/* ============================================================= */
/* SECONDARY COLORS — per id_kategori (booth)                     */
/* ============================================================= */

export const KATEGORI_COLORS: Record<number, string> = {
  1: "#00BCD4",  // IOT
  2: "#3F51B5",  // WEB
  3: "#E91E63",  // ANV
  4: "#4CAF50",  // JCS
  5: "#FF9800",  // OTO
  6: "#9C27B0",  // RAI
  7: "#795548",  // TTG
  8: "#607D8B",  // PRF
  9: "#8BC34A",  // PDF
  10: "#FFC107", // KDS
  11: "#F44336", // LJU
  12: "#009688", // KTI
};

const DEFAULT_SECONDARY_COLOR = "#9E9E9E";

export function getSecondaryColor(idKategori: number | string | null | undefined): THREE.Color {
  const key = Number(idKategori);
  const hex = KATEGORI_COLORS[key] ?? DEFAULT_SECONDARY_COLOR;
  return new THREE.Color(hex);
}

// PENTING: instance-nya shared per kategori (lewat cache di createToonMaterial).
// JANGAN dispose() material ini dari komponen Booth — booth lain kategori
// sama ikut kena kalau di-dispose.
export function createSecondaryMaterial(
  idKategori: number | string | null | undefined
): THREE.ShaderMaterial {
  const key = Number(idKategori);
  const hex = KATEGORI_COLORS[key] ?? DEFAULT_SECONDARY_COLOR;
  return createToonMaterial(hex);
}

/* ============================================================= */
/* HALL COLORS — objek "white" / "blue" / "red" / "maroon" di hall-utama.glb */
/* Sama teknik toon-nya, warna fix (bukan per-kategori).           */
/* ============================================================= */

export const HALL_COLORS: Record<string, string> = {
  white: "#FFFFFF",
  blue: "#2196F3",
  red: "#ff0000",
  maroon: "#ff0000", // alias — kalau di glb namanya "maroon" bukan "red"
};

// Cache otomatis lewat createToonMaterial — tiap nama warna cukup 1 instance,
// dipakai bareng-bareng oleh semua objek hall dengan nama itu.
export function getHallMaterial(name: string): THREE.ShaderMaterial | null {
  const hex = HALL_COLORS[name.toLowerCase()];
  if (!hex) return null;
  return createToonMaterial(hex);
}