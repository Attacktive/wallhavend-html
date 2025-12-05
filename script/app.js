import { WallhavenService } from './wallhaven-service.js';
import { WallpaperManager } from './wallpaper-manager.js';

const wallhavenService = new WallhavenService();
const wallpaperManager = new WallpaperManager(wallhavenService);
await wallpaperManager.startAutoUpdate();
