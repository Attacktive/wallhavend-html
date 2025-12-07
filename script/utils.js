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
 * @template T
 * @param {T[]} array
 * @returns {T[]} shuffled array
 */
function shuffleArray(array) {
	const clone = [...array];

	for (let i = clone.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[clone[i], clone[j]] = [clone[j], clone[i]];
	}

	return clone;
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
