import { settings } from './settings.js';
import { showLoading, hideLoading } from './ui.js';
import { generateSeed, getProxiedUrl, normalizeForUrlSearchParams, shuffleArray } from './utils.js';

class WallhavenService {
	constructor() {
		/**
		 * @type {WallpaperResponse[]}
		 */
		this.cachedWallpapers = [];

		/**
		 * @type {Map<string, string>} Map of wallpaper ID to blob URL
		 */
		this.imageCache = new Map();
	}

	/**
	 * @returns {Promise<WallpaperResponse>}
	 */
	async updateWallpaper() {
		if (this.cachedWallpapers.length > 0) {
			return this.cachedWallpapers.shift();
		}

		return await this.fetchWallpapers();
	}

	/**
	 * Fetch wallpapers from all keywords simultaneously and merge results
	 * @returns {Promise<WallpaperResponse>}
	 */
	async fetchWallpapers() {
		showLoading();

		try {
			const keywords = settings.getSearchQuery().split(/\s*[,;|]\s*/);

			const wallpaperPromises = keywords
				.map(keyword => keyword.trim())
				.map(this.fetchWallpapersForKeyword);

			const responses = await Promise.allSettled(wallpaperPromises);

			/**
			 * @type {WallpaperResponse[]}
			 */
			const wallpapers = responses
				.filter(({ status }) => status === 'fulfilled')
				.map(({ value }) => value)
				.filter(({ length }) => length > 0)
				.flat();

			if (wallpapers.length === 0) {
				throw new Error('No wallpapers found for any of the keywords');
			}

			this.cachedWallpapers = shuffleArray(wallpapers);
			console.log(`Total wallpapers fetched from all keywords: ${this.cachedWallpapers.length}`);

			this.preloadImages(this.cachedWallpapers);

			return this.cachedWallpapers.shift();
		} finally {
			hideLoading();
		}
	}

	/**
	 * Fetch wallpapers for a single keyword
	 * @param {string} keyword
	 * @returns {Promise<WallpaperResponse[]>}
	 */
	async fetchWallpapersForKeyword(keyword) {
		const effectiveSettings = settings.getEffectiveSettings();
		let { q, seed } = effectiveSettings;

		if (!q) {
			q = keyword;
		}

		if (!seed) {
			seed = generateSeed();
		}

		const params = new URLSearchParams({
			...normalizeForUrlSearchParams(effectiveSettings),
			q,
			seed
		});

		const urlToWallhaven = `${settings.getWallhavenApiServer()}?${params.toString()}`;
		const url = getProxiedUrl(urlToWallhaven);

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`API request failed for keyword "${keyword}": ${response.status} ${response.statusText}`);
		}

		const { data } = await response.json();

		return data;
	}

	/**
	 * Preloads images and cache them as blobs for offline access
	 * @param {WallpaperResponse[]} wallpapers
	 */
	preloadImages(wallpapers) {
		this.clearImageCache();

		for (const wallpaper of wallpapers) {
			this.cacheImage(wallpaper)
				.catch((error) => console.error(`Failed to cache image ${wallpaper.id}:`, error));
		}
	}

	/**
	 * Cache a single image as blob
	 * @param {WallpaperResponse} wallpaper
	 */
	async cacheImage(wallpaper) {
		if (this.imageCache.has(wallpaper.id)) {
			return;
		}

		const response = await fetch(getProxiedUrl(wallpaper.path));
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.status}`);
		}

		const blob = await response.blob();
		const blobUrl = URL.createObjectURL(blob);

		this.imageCache.set(wallpaper.id, blobUrl);
	}

	/**
	 * Get cached blob URL for wallpaper, or original path if not cached
	 * @param {WallpaperResponse} wallpaper
	 * @returns {string}
	 */
	getCachedImageUrl(wallpaper) {
		return this.imageCache.get(wallpaper.id) || wallpaper.path;
	}

	/**
	 * Clear image cache and revoke blob URLs to free memory
	 */
	clearImageCache() {
		for (const blobUrl of this.imageCache.values()) {
			URL.revokeObjectURL(blobUrl);
		}

		this.imageCache.clear();
	}
}

export { WallhavenService };
