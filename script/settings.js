class Settings {
	static #CONSTANTS = {
		DELAY_TO_DISPLAY_ERROR: 5000,
		DELAY_TO_RETRY: 1000,
		MAX_RETRIES: 3,
		SEED_LENGTH: 6,
		PROXY_SERVER: 'https://api.codetabs.com/v1/proxy/',
		WALLHAVEN_API_SERVER: 'https://wallhaven.cc/api/v1/search',
		DEFAULT_KEYWORDS: 'landscape, autumn, winter, nature',
		DEFAULT_WALLPAPER_DURATION: 60_000,
		DEFAULT_SCALING: 'contain',
		DEFAULT_SHOW_OVERLAY: true,
		DEFAULT_DEBUG: false
	};

	/**
	 * Refer to https://wallhaven.cc/help/api for the Wallhaven API
	 * @type {Partial<WallhavenParameters>}
	 */
	static #DEFAULT_SETTINGS = {
		categories: '100',
		purity: '100',
		sorting: 'random',
		ratios: '16x9'
	};

	/**
	 * @type {ClientParameters}
	 */
	#rawParameters;

	constructor() {
		const urlParams = new URLSearchParams(location.search);
		this.#rawParameters = Object.fromEntries(urlParams);
	}

	/**
	 * @returns {WallhavendSettings}
	 */
	#getWallhavendSettings() {
		console.debug('[getWallhavendSettings] from parameters from end user', this.#rawParameters);

		const { searchQuery, updateInterval, scaling, showOverlay, debug } = this.#rawParameters;

		return { searchQuery, updateInterval, scaling, showOverlay, debug };
	}

	/**
	 * @returns {WallhavenParameters} the default settings plus user overridess
	 */
	getEffectiveSettings() {
		console.debug('[getEffectiveSettings] from parameters from end user', this.#rawParameters);

		const { categories, purity, sorting, ratios } = Settings.#DEFAULT_SETTINGS;

		return {
			categories,
			purity,
			sorting,
			ratios,
			...this.#rawParameters
		};
	}

	/**
	 * @returns {string}
	 */
	getSearchQuery() {
		return this.#getWallhavendSettings().searchQuery ?? Settings.#CONSTANTS.DEFAULT_KEYWORDS;
	}

	/**
	 * @returns {number}
	 */
	getUpdateInterval() {
		return this.#getWallhavendSettings().updateInterval ?? Settings.#CONSTANTS.DEFAULT_WALLPAPER_DURATION;
	}

	/**
	 * @returns {ImageScaling}
	 */
	getScaling() {
		return this.#getWallhavendSettings().scaling ?? Settings.#CONSTANTS.DEFAULT_SCALING;
	}

	/**
	 * @returns {boolean}
	 */
	toShowOverlay() {
		return this.#getWallhavendSettings().showOverlay ?? Settings.#CONSTANTS.DEFAULT_SHOW_OVERLAY;
	}

	/**
	 * @returns {boolean}
	 */
	toDebug() {
		return this.#getWallhavendSettings().debug ?? Settings.#CONSTANTS.DEFAULT_DEBUG;
	}

	getDelayToDisplayError() {
		return Settings.#CONSTANTS.DELAY_TO_DISPLAY_ERROR;
	}

	getDelayToRetry() {
		return Settings.#CONSTANTS.DELAY_TO_RETRY;
	}

	getMaxRetries() {
		return Settings.#CONSTANTS.MAX_RETRIES;
	}

	getSeedLength() {
		return Settings.#CONSTANTS.SEED_LENGTH;
	}

	getProxyServer() {
		return Settings.#CONSTANTS.PROXY_SERVER;
	}

	getWallhavenApiServer() {
		return Settings.#CONSTANTS.WALLHAVEN_API_SERVER;
	}
}

const settings = new Settings();

export { settings };
