import { CONFIG, CONSTANTS } from './config.js';
import { generateSeed, getProxiedUrl, pickRandomElement } from './utils.js';

class WallhavenService {
	constructor() {
		this.cachedWallpapers = [];
	}

	async fetchRandomWallpaper() {
		if (this.cachedWallpapers.length > 0) {
			return this.cachedWallpapers.shift();
		}

		const keyword = pickRandomElement(CONFIG.searchQuery.split(/\s*,\s*/));

		return await this.fetchNewWallpapers(keyword);
	}

	/**
	 * @param {string} keyword
	 * @returns {Promise<WallpaperResponse[]>}
	 */
	async fetchNewWallpapers(keyword) {
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
			throw new Error(`API request failed: ${response.status} ${response.statusText}`);
		}

		const { data } = await response.json();

		if (!data?.length) {
			throw new Error('No wallpapers found matching your criteria');
		}

		this.cachedWallpapers = data;
		console.log(`Fetched ${this.cachedWallpapers.length} wallpapers`);

		return this.cachedWallpapers.shift();
	}
}

export { WallhavenService };
