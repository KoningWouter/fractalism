export interface DispatchItem {
	id: string;
	title: string;
	excerpt: string;
	url: string;
	published: string;
}

export const fallbackDispatches: DispatchItem[] = [
	{
		id: 'dispatch-1',
		title: 'The Road to I Am the Formula',
		excerpt:
			'New essay on the site. A human language reflection on co creation, consciousness, participation in reality, and what it could mean to say I Am the Formula.',
		url: 'https://fractalisme.nl/the-road-to-i-am-the-formula/',
		published: '2026-03-28T05:27:03Z',
	},
	{
		id: 'dispatch-2',
		title: 'The effects of an extractive versus reciprocal system',
		excerpt:
			'The effects of an extractive versus reciprocal system. A Fractalism dispatch on polarity, social form, and the structures we build around consciousness.',
		url: 'https://njump.me/nevent1qqs075jsqc49yjwaq60ep3sawrugfjurqq46k3pl02e06y4ddqlyykczypk7h6xhafqpj7xnpvyef077p66r5selq2mfx7ma4mrns8j5evtwkgzqg9c',
		published: '2026-03-25T02:12:27Z',
	},
	{
		id: 'dispatch-3',
		title: 'Meme magic is real',
		excerpt:
			'A short Fractalism note on symbols, repetition, and the strange power patterns can have once they enter the field.',
		url: 'https://njump.me/nevent1qqsr4mfr25z8kgnn6y2kec0cpe7qwfeky7z2rf5s4anm525m4yyfpugzypk7h6xhafqpj7xnpvyef077p66r5selq2mfx7ma4mrns8j5evtwk8pknwp',
		published: '2026-03-23T15:02:33Z',
	},
];
