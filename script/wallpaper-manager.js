import { CONFIG, CONSTANTS } from './config.js';

class WallpaperManager {
	constructor(service) {
		this.service = service;
		this.timer = null;
		this.currentWallpaper = undefined;
		this.isLoading = false;

		this.container = document.getElementById('wallpaper-container');
		this.wallpaperImage1 = document.getElementById('wallpaper-image-1');
		this.wallpaperImage2 = document.getElementById('wallpaper-image-2');
		this.usingFirstImage = true;
		this.overlay = document.getElementById('overlay');
		this.infoText = document.getElementById('infoText');
		this.wallhavenLink = document.getElementById('wallhaven-link');
		this.errorMessage = document.getElementById('error-message');
		this.loadingSpinner = document.getElementById('loading-spinner');

		this.applyScaling();
	}

	applyScaling() {
		if (CONFIG.scaling === 'cover') {
			this.container.classList.add('cover');
		} else {
			this.container.classList.remove('cover');
		}
	}

	async startAutoUpdate() {
		if (CONFIG.updateInterval <= 0) {
			throw new Error(`Provide a valid update interval instead of ${CONFIG.updateInterval}.`);
		}

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
					this.showError(error);
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
	 *
	 * @param {WallpaperResponse} wallpaper
	 * @returns {Promise<unknown>}
	 */
	displayWallpaper({ id, url, path, resolution, category, purity }) {
		return new Promise((resolve, reject) => {
			let tempImage = new Image();

			const cleanupTempImage = () => {
				console.debug('cleanupTempImage');
				tempImage.onload = null;
				tempImage.onerror = null;
				tempImage = null;
			};

			tempImage.addEventListener(
				'load',
				({ target }) => {
					console.debug('Succeeded to load image ', target);

					let currentImage;
					let nextImage;
					if (this.usingFirstImage) {
						currentImage = this.wallpaperImage1;
						nextImage = this.wallpaperImage2;
					} else {
						currentImage = this.wallpaperImage2;
						nextImage = this.wallpaperImage1;
					}

					nextImage.src = path;

					if (!this.currentWallpaper || currentImage.src === 'image/default.svg') {
						nextImage.classList.add('active');
						currentImage.classList.remove('active');
					} else {
						currentImage.classList.add('fading-out');
						nextImage.classList.add('fading-in');

						setTimeout(
							() => {
								currentImage.classList.remove('fading-out', 'active');
								nextImage.classList.remove('fading-in');
								nextImage.classList.add('active');
							},
							1600
						);
					}

					this.usingFirstImage = !this.usingFirstImage;

					this.infoText.textContent = `${id} | ${resolution} | ${category} | ${purity}`;
					this.wallhavenLink.href = url;

					console.log(`Displaying: ID=${id}, Resolution=${resolution}`);

					cleanupTempImage();
					resolve();
				}
			);

			tempImage.addEventListener(
				'error',
				(errorEvent) => {
					console.error('Failed to load image', errorEvent);

					cleanupTempImage();

					const error = errorEvent.error ?? new Error('Failed to load image for an unknown reason! 💀');
					reject(error);
				}
			);

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

export { WallpaperManager };
