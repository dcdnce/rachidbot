interface Player {
	id: string;
	name: string;
}

interface ServerStatus {
	favicon: string;
	description: {
		text: string;
	};
	players: {
		max: number;
		online: number;
		sample: Player[];
	};
	version: {
		name: string;
		protocol: number;
	};
}