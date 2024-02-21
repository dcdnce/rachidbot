const Discord = require('discord.js');
const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent
	]
});
const token = 'MTIwOTg3MDIzMzcwMDAwODAxNg.GBO8as.dSLI5NitNuoOHPoS_3zif52eFAfnbR_I7lC4oA';

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

	try {
		const guild = await client.guilds.fetch('1207975897521459231');
		const channel = guild.channels.cache.get('1209873848049344512');

        setInterval(() => {
			fetch('https://api.mcstatus.io/v2/status/java/84.235.234.2')
				.then(response => {
					if (!response.ok)
						throw new Error("Failed fetching")
					return (response.json())
				}).then(async data => {
					const playersOnline = data.players.online;
					await channel.setName("Online︱" + playersOnline);
				});
         	}, 6000);
	} catch (error) {
        console.error('Erreur : ', error);
    }
});

client.on('messageCreate', msg => {
	console.log(msg.content);
    if (msg.content === '!ping') {
        msg.reply('Pong!');
    }
});

client.login(token);

