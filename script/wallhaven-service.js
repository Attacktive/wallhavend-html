import { settings } from './settings.js';
import { generateSeed, getProxiedUrl, shuffleArray } from './utils.js';

class WallhavenService {
	constructor() {
		/**
		 * @type {WallpaperResponse[]}
		 */
		this.cachedWallpapers = [];
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
		const keywords = settings.getSearchQuery().split(/\s*[,;|]\s*/);

		const wallpaperPromises = keywords
			.map(keyword => keyword.trim())
			.map(keyword => this.fetchWallpapersForKeyword(keyword));

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

		return this.cachedWallpapers.shift();
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
			...effectiveSettings,
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
}

export { WallhavenService };
