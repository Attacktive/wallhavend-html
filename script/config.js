/**
 * @typedef {'000' | '001' | '010' | '011' | '100' | '101' | '110' | '111'} ThreeBitBinary
 * @typedef {'contain' | 'cover'} ImageScaling
 */

/**
 * Refer to https://wallhaven.cc/help/api for the Wallhaven API
 * @type {{searchQuery: string, categories: ThreeBitBinary, purity: ThreeBitBinary, ratios?: string, apiKey?: string, updateInterval: number, scaling: ImageScaling}}
 */
const CONFIG = {
	searchQuery: 'autumn, winter, nature, landscape',
	categories: '100',
	purity: '100',
	ratios: '16x9',
	apiKey: '',
	updateInterval: 60,
	scaling: 'contain'
};

const CONSTANTS = Object.freeze({
	RETRY_DELAY_MS: 1000,
	ERROR_DISPLAY_MS: 5000,
	MAX_RETRIES: 3,
	SEED_LENGTH: 6
});
