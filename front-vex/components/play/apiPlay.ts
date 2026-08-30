import url from "@/lib/axios";

// ── yang sudah ada ──
export async function get3DModel(modelId: number) {
    const res = await url.get(`/api/experience/3d-models/${modelId}`)
    return res.data
}

// ── experience.tsx ──
export async function getHallModel(exhibitionId: string) {
    const res = await url.get(`/api/experience/3d-models/${exhibitionId}`)
    return res.data.model_hall
}

export async function getKaryaList(exhibitionId: string) {
    const res = await url.get(`/api/experience/karya/pameran/${exhibitionId}`)
    const data = res.data

    // Pastikan selalu array
    const karya = Array.isArray(data) ? data : (data.karya ?? data.data ?? [])
    const max_floor = data.max_floor ?? {}

    return { karya, max_floor }
}

export async function getPameranFolder(exhibitionId: string) {
    const res = await url.get(`/api/pameran/${exhibitionId}`)
    const kategori = res.data.pameran?.kode_kategori ?? "default"
    return kategori.toLowerCase().replaceAll(" ", "-")
}

export async function getGameAssets() {
    const res = await url.get("/api/experience/game-assets")
    return res.data
}
export function getPlayerModelUrl(gameAssets?: { player?: string }) {
    if (gameAssets?.player) return gameAssets.player

    const base = (url.defaults.baseURL ?? "").replace(/\/api\/?$/, "")
    return `${base}/api/experience/player-model`
}

// New — mirrors getPlayerModelUrl exactly: use the backend-provided URL if
// it comes back with game-assets, otherwise fall back to a predictable
// storage path so this doesn't hard-break if the backend field is missing.
export function getNumBaseUrl(gameAssets?: { num_base?: string }) {
    if (gameAssets?.num_base) return gameAssets.num_base

    const base = (url.defaults.baseURL ?? "").replace(/\/api\/?$/, "")
    return `${base}/api/experience/num` // ← was `${base}/storage/num`, same CORS problem
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/expo";

// ── page.tsx (ExhibitionPage) ──
export async function getPlayerName() {
    const res = await fetch(`${BASE_PATH}/api-internal/player-name`)
    const data = await res.json()
    return data.name as string
}

export async function deletePlayer(playerId: string) {
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        await fetch(`${BASE_PATH}/api-internal/player?id=${playerId}`, {
            method: "DELETE",
            signal: controller.signal,
        })
        clearTimeout(timeoutId)
    } catch {
        // Abaikan error jaringan saat delete player
    }
}

// ── PosterViewer ──

export async function getKaryaDetail(exhibitionId: string) {
    const res = await url.get(`/api/experience/karya/pameran/${exhibitionId}`)
    const data = res.data
    return (Array.isArray(data) ? data : (data.karya ?? data.data ?? [])) as any[]
}

export async function getKaryaLikeStatus(karyaId: number, token?: string) {
    const res = await url.get(`/api/karya/${karyaId}/suka`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    return res.data as { liked: boolean; total_suka: number }
}

export async function toggleKaryaLike(karyaId: number, token: string) {
    const res = await url.post(`/api/karya/${karyaId}/suka`, null, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data as { liked: boolean; total_suka: number }
}

export async function getKomentar(karyaId: number) {
    const res = await url.get(`/api/karya/${karyaId}/komentar`)
    const raw = Array.isArray(res.data) ? res.data : (res.data.komentar ?? [])
    return raw.map((k: any) => ({
        nama: k.pengguna?.nama ?? k.nama ?? "Anonim",
        isi: k.isi_komentar ?? k.isi ?? "",
    })) as { nama: string; isi: string }[]
}

export async function postKomentar(karyaId: number, isi: string, token: string) {
    const res = await url.post(
        `/api/karya/${karyaId}/komentar`,
        { isi_komentar: isi },
        { headers: { Authorization: `Bearer ${token}` } }
    )
    return res.data
}

export async function postKunjungan(exhibitionId: string | number) {
    const res = await url.post('/api/kunjungan', {
        id_pameran: exhibitionId,
    });
    return res.data;
}

