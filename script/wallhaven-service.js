import { CONFIG, CONSTANTS } from './config.js';
import { generateSeed, getProxiedUrl, shuffleArray } from './utils.js';

class WallhavenService {
	constructor() {
		this.cachedWallpapers = [];
	}

	async fetchRandomWallpaper() {
		if (this.cachedWallpapers.length > 0) {
			return this.cachedWallpapers.shift();
		}

		const keywords = CONFIG.searchQuery.split(/\s*,\s*/);

		return await this.fetchWallpapersFromAllKeywords(keywords);
	}

	/**
	 * Fetch wallpapers from all keywords simultaneously and merge results
	 * @param {string[]} keywords
	 * @returns {Promise<WallpaperResponse>}
	 */
	async fetchWallpapersFromAllKeywords(keywords) {
		let wallpapers = [];

		try {
			const wallpaperPromises = keywords
				.map(keyword => keyword.trim())
				.map(keyword => this.fetchWallpapersForKeyword(keyword));

			const responses = await Promise.allSettled(wallpaperPromises);

			wallpapers = responses
				.map(({ value }) => value)
				.filter(({ length }) => length > 0)
				.flatMap(wallpaper => wallpaper);
		} catch (error) {
			console.error('Error fetching wallpapers from all keywords:', error);
			throw error;
		}

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
		const params = new URLSearchParams({
			q: keyword,
			categories: CONFIG.categories,
			purity: CONFIG.purity,
			ratios: CONFIG.ratios,
			sorting: 'random',
			seed: generateSeed()
		});

		if (CONFIG.apiKey) {
			params.append('apikey', CONFIG.apiKey);
		}

		const urlToWallhaven = `${CONSTANTS.WALLHAVEN_API_SERVER}?${params.toString()}`;
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
