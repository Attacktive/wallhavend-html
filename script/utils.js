import { settings } from './settings.js';

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
 * @returns {string} Seed for Wallhaven API that matches <code>[a-zA-z0-9]{6}</code>
 */
function generateSeed() {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

	let seed = '';
	for (let i = 0; i < settings.getSeedLength(); i++) {
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
	const proxiedUrl = `${settings.getProxyServer()}?quest=${encodedDestination}`;

	console.debug('proxied url', proxiedUrl);

	return proxiedUrl;
}

function copyToClipboardLegacy(content) {
	const textarea = document.createElement('textarea');
	textarea.value = content;

	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';

	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();

	try {
		document.execCommand('copy');
	} finally {
		document.body.removeChild(textarea);
	}
}

async function copyToClipboard(content) {
	try {
		await navigator.clipboard.writeText(content);
	} catch (error) {
		console.error('Failed to copy to the clipboard', error);

		try {
			copyToClipboardLegacy(content);
		} catch (nestedError) {
			console.error('Failed to copy to the clipboard using an old-fashioned way, too', nestedError);
			throw nestedError;
		}
	}
}

export { pickRandomElement, shuffleArray, generateSeed, getProxiedUrl, copyToClipboard };
