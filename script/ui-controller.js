import { settings } from './settings.js';

class UIController {
	constructor() {
		this.overlay = document.getElementById('overlay');
		this.infoText = document.getElementById('info-text');
		this.debugPanel = document.getElementById('debug-panel');
		this.debugText = document.getElementById('debug-text');
		this.wallhavenLink = document.getElementById('wallhaven-link');
		this.errorMessage = document.getElementById('error-message');
		this.loadingSpinner = document.getElementById('loading-spinner');

		if (!settings.toShowOverlay()) {
			this.overlay.classList.add('hidden');
		}

		if (settings.toDebug()) {
			this.debugPanel.classList.remove('hidden');
		}
	}

	/**
	 * @param {string} text
	 */
	setDebugText(text) {
		if (settings.toDebug()) {
			this.debugPanel.textContent = text;
		}
	}

	showLoading() {
		this.loadingSpinner.classList.remove('hidden');
	}

	hideLoading() {
		this.loadingSpinner.classList.add('hidden');
	}

	showError(message) {
		this.errorMessage.textContent = message;
		this.errorMessage.classList.remove('hidden');

		setTimeout(() => this.hideError(), settings.getDelayToDisplayError());
	}

	hideError() {
		this.errorMessage.classList.add('hidden');
	}

	/**
	 * @param {WallpaperResponse} wallpaperResponse
	 */
	updateWallpaperInfo({ id, url, resolution, category, purity }) {
		this.infoText.textContent = `${id} | ${resolution} | ${category} | ${purity}`;
		this.wallhavenLink.href = url;
	}
}

export { UIController };
