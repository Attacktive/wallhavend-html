import { CONFIG, CONSTANTS } from './config.js';

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

		return await this.fetchNewWallpapers();
	}

	/**
	 * @param {string | unknown[]} source
	 * @returns {string | unknown}
	 */
	pickRandomElement(source) {
		return source[Math.floor(Math.random() * source.length)];
	}

	/**
	 * @returns {string}
	 */
	generateQuery() {
		const keywords = CONFIG.searchQuery.split(/\s*,\s*/);

		return this.pickRandomElement(keywords);
	}

	/**
	 * @returns {string}
	 */
	generateSeed() {
		const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		let seed = '';
		for (let i = 0; i < CONSTANTS.SEED_LENGTH; i++) {
			seed += this.pickRandomElement(characters);
		}

		return seed;
	}

	async fetchNewWallpapers() {
		const params = new URLSearchParams({
			q: this.generateQuery(),
			categories: CONFIG.categories,
			purity: CONFIG.purity,
			ratios: CONFIG.ratios,
			sorting: 'random',
			seed: this.generateSeed()
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
