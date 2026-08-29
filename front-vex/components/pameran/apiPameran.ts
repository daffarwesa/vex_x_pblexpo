import url from '@/lib/axios';

// =============================================================================
// CLIENT-SIDE CACHE & REQUEST DEDUPLICATION (Mencegah antrian request di server)
// =============================================================================
const pameranCache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL = 3 * 60 * 1000; // 3 menit

export function clearPameranCache(specificKey?: string) {
    if (specificKey) {
        pameranCache.delete(specificKey);
    } else {
        pameranCache.clear();
    }
}

export async function GetPameran(forceRefresh = false) {
    const cacheKey = 'pameran_list';
    const now = Date.now();
    const cached = pameranCache.get(cacheKey);

    // 1. Gunakan cache jika masih valid
    if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    // 2. Request deduplication: Jika request sedang berjalan, jangan buat request baru
    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    const promise = (async () => {
        try {
            const res = await url.get("/api/pameran");
            pameranCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
            return res.data;
        } finally {
            inFlightRequests.delete(cacheKey);
        }
    })();

    inFlightRequests.set(cacheKey, promise);
    return promise;
}

export async function GetDetailPameran(slug: string, forceRefresh = false) {
    const cacheKey = `pameran_${slug}`;
    const now = Date.now();
    const cached = pameranCache.get(cacheKey);

    if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    const promise = (async () => {
        try {
            const res = await url.get(`/api/pameran/${slug}`);
            pameranCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
            return res.data;
        } finally {
            inFlightRequests.delete(cacheKey);
        }
    })();

    inFlightRequests.set(cacheKey, promise);
    return promise;
}

export async function PostPameran(formData: FormData) {
    clearPameranCache();
    const res = await url.post(`/api/auth/pameran`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
}

export async function UpdatePameran(idOrSlug: string | number, formData: FormData) {
    clearPameranCache();
    const res = await url.post(`/api/auth/pameran/${idOrSlug}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
}

export async function DeletePameran(idOrSlug: string | number) {
    clearPameranCache();
    const res = await url.delete(`/api/auth/pameran/${idOrSlug}`);
    return res.data;
}