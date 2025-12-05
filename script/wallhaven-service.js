import { CONFIG } from './config.js';
import { generateSeed, pickRandomElement } from './utils.js';

class WallhavenService {
	constructor() {
		this.urlToProxy = 'https://api.codetabs.com/v1/proxy/?quest=';
		this.urlToWallhavenApi = 'https://wallhaven.cc/api/v1/search';
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

		const urlToWallhaven = `${this.urlToWallhavenApi}?${params.toString()}`;
		console.log('About to consume the Wallhaven API:', urlToWallhaven);

		const url = `${this.urlToProxy}${encodeURIComponent(urlToWallhaven)}`;
		console.log('About to send a request to the proxy', url);

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
