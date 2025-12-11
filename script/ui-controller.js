import { settings } from './settings.js';

class UIController {
	constructor() {
		this.overlay = document.getElementById('overlay');
		this.infoText = document.getElementById('infoText');
		this.wallhavenLink = document.getElementById('wallhaven-link');
		this.errorMessage = document.getElementById('error-message');
		this.loadingSpinner = document.getElementById('loading-spinner');
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

	updateWallpaperInfo({ id, url, resolution, category, purity }) {
		this.infoText.textContent = `${id} | ${resolution} | ${category} | ${purity}`;
		this.wallhavenLink.href = url;
	}
}

export { UIController };
