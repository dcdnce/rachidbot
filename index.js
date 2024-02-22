const Discord = require('discord.js');
const { fetchInformations } = require('./minecraft.js');
const data = require('./data.json');

const client = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
	]
});

async function updateChannel(channel) {
	const status = await fetchInformations(data.bot.serverIP).catch(_ => null);
	const name = status != null ? `🟢-online︱${status.players.online}` : '🔴-offline';

	channel.setName(name).catch(console.error);
}


client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	const guild = await client.guilds.fetch(data.bot.guildID).catch(_ => null);
	if (guild == null) return console.error('Failed to fetch the guild');

	const channel = await guild.channels.fetch(data.bot.channelID).catch(_ => null);
	if (channel == null) return console.error('Failed to fetch the channel');


	updateChannel(channel);
	setInterval(() => updateChannel(channel), 10_000);
});

client.login(data.discord.token);