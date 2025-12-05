import { WallhavenService } from './wallhaven-service.js';
import { WallpaperManager } from './wallpaper-manager.js';

const wallhavendService = new WallhavenService();
new WallpaperManager(wallhavendService);
