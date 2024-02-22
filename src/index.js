const { Client, Events, GatewayIntentBits, Collection, SlashCommandBuilder } = require('discord.js');
const { fetchInformations } = require('./minecraft.js');
const data = require('../resources/data.json');

const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});
client.commands = new Collection();

async function updateChannel(channel) {
	const status = await fetchInformations(data.bot.serverIP).catch(_ => null);
	const name = status != null ? `🟢-online︱${status.players.online}` : '🔴-offline';

	channel.setName(name).catch(console.error);
}

client.on(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	const guild = await client.guilds.fetch(data.bot.guildID).catch(_ => null);
	if (guild == null) return console.error('Failed to fetch the guild');

	const channel = await guild.channels.fetch(data.bot.channelID).catch(_ => null);
	if (channel == null) return console.error('Failed to fetch the channel');

	// Setup commands
	client.commands.set('players', {
		data: new SlashCommandBuilder()
			.setName('players')
			.setDescription('Shows the player list'),
		async execute(interaction) {
			const status = await fetchInformations(data.bot.serverIP).catch(_ => null);
			const players = status != null ? `# 👥 __Players online__\n${status.players.sample.map(p => `- ${p.name}`).join('\n')}` : '😔 No players online';

			await interaction.reply(players);
		}
	});

	updateChannel(channel);
	setInterval(() => updateChannel(channel), 10_000);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (command == null) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(data.discord.token);