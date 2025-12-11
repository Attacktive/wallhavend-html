type ThreeBitBinary = `${0 | 1}${0 | 1}${0 | 1}`;
type ImageScaling = 'contain' | 'cover';
type SortingMethod = 'date_added' | 'relevance' | 'random' | 'views' | 'favorites' | 'toplist';
type Order = 'desc' | 'asc';
type StringValuedObject = { [key: string]: string; };

interface WallhavendSettings {
	searchQuery: string;
	updateInterval: number;
	scaling: ImageScaling;
}

interface WallhavenParameters {
	apiKey: string;
	q: string;
	categories: ThreeBitBinary;
	purity: ThreeBitBinary;
	sorting: SortingMethod;
	order: Order;
	topRange?: string;
	atleast: string;
	resolutions: string;
	ratios: string;
	colors: string;
	page: number;
	seed: string;
}

type ClientParameters = Partial<WallhavendSettings & WallhavenParameters> & StringValuedObject;

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
