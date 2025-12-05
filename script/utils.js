import { CONSTANTS } from './config.js';

/**
 * @template T
 * @param {string | T[]} source
 * @returns {string | T}
 */
function pickRandomElement(source) {
	return source[Math.floor(Math.random() * source.length)];
}

/**
 * Shuffles the source array in-place.
 * @param {any[]} array
 */
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

/**
 * @returns {string} Seed for Wannhaven API that matches <code>[a-zA-z0-9]{6}</code>
 */
function generateSeed() {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	let seed = '';
	for (let i = 0; i < CONSTANTS.SEED_LENGTH; i++) {
		seed += pickRandomElement(characters);
	}

	return seed;
}

/**
 * @param {string} destination
 */
function getProxiedUrl(destination) {
	console.debug(`getProxiedUrl(${destination})`);

	const encodedDestination = encodeURIComponent(destination);
	const proxiedUrl = `${CONSTANTS.PROXY_SERVER}?quest=${encodedDestination}`;

	console.debug('proxied url', proxiedUrl);

	return proxiedUrl;
}

export { pickRandomElement, shuffleArray, generateSeed, getProxiedUrl };
