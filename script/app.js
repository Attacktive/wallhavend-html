import { WallhavendService } from './wallhavend-service.js';
import { WallpaperManager } from './wallpaper-manager.js';

const wallhavendService = new WallhavendService();
new WallpaperManager(wallhavendService);
