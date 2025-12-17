import { settings } from './settings.js';
import { initializeUI, hideError, showError, updateWallpaperInfo, setNextWallpaperCallback } from './ui.js';

class WallpaperManager {
	constructor(service) {
		this.service = service;
		this.timer = null;
		this.currentWallpaper = undefined;
		this.isLoading = false;
		this.wallpaperHistory = [];
		this.wallpaperHistoryIndex = -1;

		this.container = document.getElementById('wallpaper-container');
		this.wallpaperImage1 = document.getElementById('wallpaper-image-1');
		this.wallpaperImage2 = document.getElementById('wallpaper-image-2');
		this.usingFirstImage = true;

		initializeUI();
		setNextWallpaperCallback(() => this.nextWallpaper());

		this.prevButton = document.getElementById('prev-wallpaper');
		this.nextButton = document.getElementById('next-wallpaper');
		this.prevButton?.addEventListener('click', () => this.showPrevious());
		this.nextButton?.addEventListener('click', () => this.showNext());
		this.updateNavButtons();

		this.applyScaling();
	}

	applyScaling() {
		if (settings.getScaling() === 'cover') {
			this.container.classList.add('cover');
		} else {
			this.container.classList.remove('cover');
		}
	}

	resetAutoUpdateTimer() {
		if (this.timer) {
			clearInterval(this.timer);
		}

		const updateInterval = settings.getUpdateInterval();
		if (updateInterval > 0) {
			this.timer = setInterval(() => this.showNext(), updateInterval);
		}
	}

	async startAutoUpdate() {
		const updateInterval = settings.getUpdateInterval();

		if (updateInterval <= 0) {
			throw new Error(`Provide a valid update interval instead of ${updateInterval}.`);
		}

		this.timer = setInterval(() => this.showNext(), updateInterval);

		return await this.showNext();
	}

	async nextWallpaper() {
		await this.showNext();
		this.resetAutoUpdateTimer();
	}

	async showNext() {
		if (this.isLoading) {
			return;
		}

		if (this.wallpaperHistoryIndex < this.wallpaperHistory.length - 1) {
			this.wallpaperHistoryIndex++;
			const wallpaper = this.wallpaperHistory[this.wallpaperHistoryIndex];
			this.currentWallpaper = wallpaper;
			await this.displayWallpaper(wallpaper);
			this.updateNavButtons();
			return;
		}

		this.isLoading = true;
		hideError();

		let maxRetries = 1;
		if (!this.currentWallpaper) {
			maxRetries = settings.getMaxRetries();
		}

		let attempt = 0;
		while (attempt < maxRetries) {
			try {
				const wallpaper = await this.service.updateWallpaper();

				if (this.wallpaperHistoryIndex < this.wallpaperHistory.length - 1) {
					this.wallpaperHistory = this.wallpaperHistory.slice(0, this.wallpaperHistoryIndex + 1);
				}

				this.wallpaperHistory.push(wallpaper);
				this.wallpaperHistoryIndex = this.wallpaperHistory.length - 1;

				this.currentWallpaper = wallpaper;
				await this.displayWallpaper(wallpaper);

				this.updateNavButtons();

				break;
			} catch (error) {
				attempt++;

				console.error(`Attempt ${attempt} failed:`, error);

				if (attempt >= maxRetries) {
					showError(error);
					console.error('Failed to update wallpaper after retries:', error);
				} else {
					console.log(`Retrying... (${attempt}/${maxRetries})`);
					await new Promise(resolve => setTimeout(resolve, settings.getDelayToRetry()));
				}
			} finally {
				this.isLoading = false;
			}
		}
	}

	async showPrevious() {
		if (this.isLoading) {
			return;
		}

		if (this.wallpaperHistoryIndex <= 0) {
			this.updateNavButtons();
			return;
		}

		this.wallpaperHistoryIndex--;
		const wallpaper = this.wallpaperHistory[this.wallpaperHistoryIndex];
		this.currentWallpaper = wallpaper;
		await this.displayWallpaper(wallpaper);
		this.updateNavButtons();
	}

	updateNavButtons() {
		if (this.prevButton) {
			this.prevButton.disabled = this.wallpaperHistoryIndex <= 0;
		}
	}

	/**
	 * @param {WallpaperResponse} wallpaper
	 * @returns {Promise<void>}
	 */
	displayWallpaper(wallpaper) {
		const { id, resolution } = wallpaper;
		const imagePath = this.service.getCachedImageUrl(wallpaper);

		return new Promise((resolve, reject) => {
			let tempImage = new Image();

			const cleanupTempImage = () => {
				tempImage.onload = null;
				tempImage.onerror = null;
				tempImage = null;
			};

			tempImage.addEventListener(
				'load',
				() => {
					let currentImage;
					let nextImage;
					if (this.usingFirstImage) {
						currentImage = this.wallpaperImage1;
						nextImage = this.wallpaperImage2;
					} else {
						currentImage = this.wallpaperImage2;
						nextImage = this.wallpaperImage1;
					}

					nextImage.src = imagePath;

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

					updateWallpaperInfo(wallpaper);

					console.debug(`Displaying: ID=${id}, Resolution=${resolution}`);

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

			tempImage.src = imagePath;
		});
	}
}

export { WallpaperManager };
