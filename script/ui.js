import { settings } from './settings.js';
import { copyToClipboard } from './utils.js';

let overlay, overlayToggle, infoText, wallhavenLink, nextWallpaperButton, errorMessage, toastMessage, loadingSpinner;

function getElements() {
	if (!overlay) {
		overlay = document.getElementById('overlay');
		overlayToggle = document.getElementById('overlay-toggle');
		infoText = document.getElementById('info-text');
		wallhavenLink = document.getElementById('wallhaven-link');
		nextWallpaperButton = document.getElementById('next-wallpaper');
		errorMessage = document.getElementById('error-message');
		toastMessage = document.getElementById('toast-message');
		loadingSpinner = document.getElementById('loading-spinner');
	}
}

function initializeUI() {
	getElements();

	if (!settings.toShowOverlay()) {
		overlay.classList.add('hidden');
		return;
	}

	const storedCollapsed = localStorage.getItem('overlayCollapsed');
	if (storedCollapsed === 'true') {
		overlay.classList.add('collapsed');
	}

	const updateToggleLabel = () => {
		const isCollapsed = overlay.classList.contains('collapsed');
		if (overlayToggle) {
			overlayToggle.textContent = isCollapsed? '🔺': '🔻';
			overlayToggle.title = isCollapsed? 'Expand': 'Collapse';
			overlayToggle.setAttribute('aria-label', isCollapsed? 'Expand': 'Collapse');
		}
	};

	updateToggleLabel();

	if (overlayToggle) {
		overlayToggle.addEventListener(
			'click',
			() => {
				overlay.classList.toggle('collapsed');
				localStorage.setItem('overlayCollapsed', overlay.classList.contains('collapsed')? 'true': 'false');
				updateToggleLabel();
			}
		);
	}
}

function showLoading() {
	getElements();
	loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
	getElements();
	loadingSpinner.classList.add('hidden');
}

function showError(message) {
	getElements();
	errorMessage.textContent = message;
	errorMessage.classList.remove('hidden');

	setTimeout(() => hideError(), settings.getDelayToDisplayError());
}

function hideError() {
	getElements();
	errorMessage.classList.add('hidden');
}

function showToast(message) {
	getElements();
	toastMessage.textContent = message;
	toastMessage.classList.remove('hidden', 'error');

	setTimeout(() => toastMessage.classList.add('shown'), 10);
	setTimeout(() => hideToast(), 3000);
}

function showErrorToast(message) {
	getElements();
	toastMessage.textContent = message;
	toastMessage.classList.remove('hidden');
	toastMessage.classList.add('error');

	setTimeout(() => toastMessage.classList.add('shown'), 10);
	setTimeout(() => hideToast(), 3000);
}

function hideToast() {
	getElements();
	toastMessage.classList.remove('shown');

	setTimeout(
		() => {
			toastMessage.classList.add('hidden');
			toastMessage.classList.remove('error');
		},
		300
	);
}

let currentLinkHandler = null;
let currentNextWallpaperHandler = null;

function updateWallpaperInfo({ id, url, resolution, category, purity }) {
	getElements();

	infoText.textContent = `${id} | ${resolution} | ${category} | ${purity}`;
	wallhavenLink.textContent = url;

	if (currentLinkHandler !== null) {
		wallhavenLink.removeEventListener('click', currentLinkHandler);
	}

	currentLinkHandler = async () => {
		try {
			await copyToClipboard(url);
			showToast('Link copied to clipboard!');
		} catch (error) {
			showErrorToast('Failed to copy link');
		}
	};

	wallhavenLink.addEventListener('click', currentLinkHandler);
}

function setNextWallpaperCallback(callback) {
	getElements();

	if (currentNextWallpaperHandler !== null) {
		nextWallpaperButton.removeEventListener('click', currentNextWallpaperHandler);
	}

	currentNextWallpaperHandler = callback;
	nextWallpaperButton.addEventListener('click', currentNextWallpaperHandler);
}

export {
	initializeUI,
	showLoading,
	hideLoading,
	showError,
	hideError,
	showToast,
	showErrorToast,
	hideToast,
	updateWallpaperInfo,
	setNextWallpaperCallback
};
