const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const data = require('../resources/data.json');

const commands = [
	(new SlashCommandBuilder().setName('players').setDescription('Shows the player list')).toJSON(),
];

const rest = new REST().setToken(data.discord.token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationCommands(data.discord.clientID),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();