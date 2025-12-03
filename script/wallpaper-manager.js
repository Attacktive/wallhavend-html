class WallpaperManager {
	constructor(service) {
		this.service = service;
		this.timer = null;
		this.currentWallpaper = undefined;
		this.isLoading = false;

		this.container = document.getElementById('wallpaper-container');
		this.wallpaperImage = document.getElementById('wallpaper-image');
		this.overlay = document.getElementById('overlay');
		this.infoText = document.getElementById('infoText');
		this.wallhavenLink = document.getElementById('wallhaven-link');
		this.errorMessage = document.getElementById('errorMessage');
		this.loadingSpinner = document.getElementById('loadingSpinner');

		this.applyScaling();

		if (CONFIG.updateInterval > 0) {
			this.startAutoUpdate();
		}
	}

	applyScaling() {
		if (CONFIG.scaling === 'cover') {
			this.container.classList.add('cover');
		} else {
			this.container.classList.remove('cover');
		}
	}

	async startAutoUpdate() {
		this.timer = setInterval(() => this.updateWallpaper(), CONFIG.updateInterval * 1000);

		return await this.updateWallpaper();
	}

	async updateWallpaper() {
		if (this.isLoading) {
			return;
		}

		this.isLoading = true;
		this.showLoading();
		this.hideError();

		let maxRetries = 1;
		if (!this.currentWallpaper) {
			maxRetries = CONSTANTS.MAX_RETRIES;
		}

		let attempt = 0;
		while (attempt < maxRetries) {
			try {
				const wallpaper = await this.service.fetchRandomWallpaper();
				this.currentWallpaper = wallpaper;
				await this.displayWallpaper(wallpaper);
				break;
			} catch (error) {
				attempt++;
				console.error(`Attempt ${attempt} failed:`, error);

				if (attempt >= maxRetries) {
					this.showError(error.message);
					console.error('Failed to update wallpaper after retries:', error);
				} else {
					console.log(`Retrying... (${attempt}/${maxRetries})`);
					await new Promise(resolve => setTimeout(resolve, CONSTANTS.RETRY_DELAY_MS));
				}
			}
		}

		this.isLoading = false;
		this.hideLoading();
	}

	/**
	 * @typedef {Object} WallpaperResponse
	 * @property {string} id
	 * @property {string} url
	 * @property {string} short_url
	 * @property {string} path
	 * @property {string} resolution
	 * @property {string} ratio
	 * @property {string} category
	 * @property {string} purity
	 */
	/**
	 *
	 * @param {WallpaperResponse} wallpaper
	 * @returns {Promise<unknown>}
	 */
	displayWallpaper({ id, url, path, resolution, category, purity }) {
		return new Promise((resolve, reject) => {
			const tempImage = new Image();

			const cleanupTempImage = () => {
				tempImage.onload = null;
				tempImage.onerror = null;
				tempImage.src = '';
			};

			tempImage.onload = () => {
				this.wallpaperImage.src = path;
				this.wallpaperImage.style.display = 'block';
				this.infoText.textContent = `${id} | ${resolution} | ${category} | ${purity}`;
				this.wallhavenLink.href = url;

				console.log(`Displaying: ID=${id}, Resolution=${resolution}`);

				cleanupTempImage();
				resolve();
			};

			tempImage.onerror = () => {
				cleanupTempImage();
				reject(new Error('Failed to load image'));
			};

			tempImage.src = path;
		});
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

		setTimeout(() => this.hideError(), CONSTANTS.ERROR_DISPLAY_MS);
	}

	hideError() {
		this.errorMessage.classList.add('hidden');
	}
}
