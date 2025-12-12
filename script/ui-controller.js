import { settings } from './settings.js';
import { copyToClipboard } from './utils.js';

class UIController {
	constructor() {
		this.overlay = document.getElementById('overlay');
		this.infoText = document.getElementById('info-text');
		this.debugPanel = document.getElementById('debug-panel');
		this.debugText = document.getElementById('debug-text');
		this.wallhavenLink = document.getElementById('wallhaven-link');
		this.errorMessage = document.getElementById('error-message');
		this.toastMessage = document.getElementById('toast-message');
		this.loadingSpinner = document.getElementById('loading-spinner');

		this.onClickLink = null;

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
			this.debugText.textContent = text;
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

	showToast(message) {
		this.toastMessage.textContent = message;
		this.toastMessage.classList.remove('hidden', 'error');

		setTimeout(() => this.toastMessage.classList.add('shown'), 10);
		setTimeout(() => this.hideToast(), 3000);
	}

	showErrorToast(message) {
		this.toastMessage.textContent = message;
		this.toastMessage.classList.remove('hidden');
		this.toastMessage.classList.add('error');

		setTimeout(() => this.toastMessage.classList.add('shown'), 10);
		setTimeout(() => this.hideToast(), 3000);
	}

	hideToast() {
		this.toastMessage.classList.remove('shown');

		setTimeout(
			() => {
				this.toastMessage.classList.add('hidden');
				this.toastMessage.classList.remove('error');
			},
			300
		);
	}

	/**
	 * @param {WallpaperResponse} wallpaperResponse
	 */
	updateWallpaperInfo({ id, url, resolution, category, purity }) {
		this.infoText.textContent = `${id} | ${resolution} | ${category} | ${purity}`;
		this.wallhavenLink.textContent = url;

		if (this.onClickLink !== null) {
			this.wallhavenLink.removeEventListener('click', this.onClickLink);
		}

		this.onClickLink = async () => {
			try {
				await copyToClipboard(url);
				this.showToast('Link copied to clipboard!');
			} catch (error) {
				this.showErrorToast('Failed to copy link');
			}
		};

		this.wallhavenLink.addEventListener('click', this.onClickLink);
	}
}

export { UIController };
