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
			this.startAutoUpdate().then(() => {});
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
			maxRetries = 3;
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
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}
		}

		this.isLoading = false;
		this.hideLoading();
	}

	displayWallpaper(wallpaper) {
		return new Promise((resolve, reject) => {
			this.wallpaperImage.onload = () => {
				this.wallpaperImage.style.display = 'block';
				this.infoText.textContent = `${wallpaper.id} | ${wallpaper.resolution} | ${wallpaper.category} | ${wallpaper.purity}`;
				this.wallhavenLink.href = wallpaper.url;

				console.log(`Displaying: ID=${wallpaper.id}, Resolution=${wallpaper.resolution}`);
				resolve();
			};

			this.wallpaperImage.onerror = () => reject(new Error('Failed to load image'));

			this.wallpaperImage.src = wallpaper.path;
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

		setTimeout(() => this.hideError(), 5000);
	}

	hideError() {
		this.errorMessage.classList.add('hidden');
	}
}
