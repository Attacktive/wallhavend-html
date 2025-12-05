interface WallpaperResponse {
	id: string;
	url: string;
	short_url: string;
	path: string;
	resolution: string;
	ratio: string;
	category: string;
	purity: string;
}

type ThreeBitBinary = '000' | '001' | '010' | '011' | '100' | '101' | '110' | '111';
type ImageScaling = 'contain' | 'cover';
