#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const fs = require('fs');
let tokenType;
const { name, i, token, g } = argv;
if (token == 'dotenv') {
    tokenType = 'dotenv';
} else if (token == 'config') {
    tokenType = 'config';
} else {
	tokenType = 'dotenv';
}
const fileName = name.replace('.js', '');
if (i) {
const fileContent = `
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');
${tokenType === 'dotenv' ? 'require(\'dotenv\').config();' : 'const config = require(\'./config.json\');'}
const token = ${tokenType === 'dotenv' ? 'process.env.TOKEN' : 'config.token'};
const { Collection } = require('discord.js')
// change these intents to your needs
const client = new Client({ intents: [GatewayIntentBits.GUILDS, GatewayIntentBits.GUILD_MESSAGES] });
client.commands = new Collection();

client.on('ready', async () => {
	console.log(\`Logged in as \${client.user.tag}!\`);
});

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(\`[WARNING] The command at \${filePath} is missing a required "data" or "execute" property.\`);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, async (...args) => await event.execute(...args));
	} else {
		client.on(event.name, async (...args) => await event.execute(...args));
	}
}

client.login(token);
`;
let eventInteractionCreate = `
const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(\`No command matching \${interaction.commandName} was found.\`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(\`Error executing \${interaction.commandName}\`);
			console.error(error);
		}
	} 
	},
};
`

let slashCommandDeploy = `
const { REST, Routes } = require('discord.js');
${tokenType === 'dotenv' ? 'require(\'dotenv\').config();' : 'const config = require(\'./config.json\');'}
const clientId = ${tokenType === 'dotenv' ? 'process.env.CLIENT_ID' : 'config.clientId'};
const guildId = ${tokenType === 'dotenv' ? 'process.env.GUILD_ID' : 'config.guildId'};
const token = ${tokenType === 'dotenv' ? 'process.env.TOKEN' : 'config.token'};

const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(\`./commands/\${file}\`);
	commands.push(command.data.toJSON());
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(\`Started refreshing \${commands.length} application (/) commands.\`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(\`Success! ✔ reloaded \${data.length} application (/) commands.\`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(\`\${error}\`);
	}
})();
`
let packageJson = `
{
    "dependencies": {
      "discord.js": "^14.6.0",
      "dotenv": "^16.0.3"
    },
    "scripts": {
      "start": "node ${fileName}.js",
      "slash": "node slash.js"
    }
  }
  
`;
let env = `
TOKEN=your token here
CLIENT_ID=your client id
GUILD_ID=your guild id
OWNER_ID=your owner id
`
let config = `
{
    "token": "your token",
    "clientId": "your client id",
    "guildId": "your guild id",
    "ownerId": "your owner id"
}
`
let gitignore = `
node_modules
.env
config.json
`
// create a folder called event and create a file called interactionCreate.js
try {
    if (!fs.existsSync('./events')) {
      fs.mkdirSync('./events');
    } else if (!fs.existsSync('./commands')) {
      fs.mkdirSync('./commands');
    }
  } catch (err) {
    console.error(err);
  }
fs.writeFileSync('./events/interactionCreate.js', eventInteractionCreate);
fs.writeFileSync(`${fileName}.js`, fileContent);
fs.writeFileSync('slash.js', slashCommandDeploy);
fs.writeFileSync('package.json', packageJson);
if (tokenType === 'dotenv') {
fs.writeFileSync('.env', env);
} else {
fs.writeFileSync('config.json', config);
}
if (g) {
fs.writeFileSync('.gitignore', gitignore);
}
console.log('Done! Successfully generated your new Discord.js v14 project!');
console.log('Make sure to run npm i before you start your bot!');
console.log('Also make sure to add your token to the .env file or config.json file!');
} else {
const fileContent = `
const { Client, GatewayIntentBits } = require('discord.js');
${tokenType === 'dotenv' ? 'require(\'dotenv\').config();' : 'const config = require(\'./config.json\');'}
const token = ${tokenType === 'dotenv' ? 'process.env.TOKEN' : 'config.token'};
// change these intents to your needs
const client = new Client({ intents: [GatewayIntentBits.GUILDS, GatewayIntentBits.GUILD_MESSAGES] });

client.on('ready', async () => {
	console.log(\`Logged in as \${client.user.tag}!\`);
});

client.login(token);
`;
let packageJson = `
{
    "dependencies": {
      "discord.js": "^14.6.0",
      "dotenv": "^16.0.3"
    },
    "scripts": {
      "start": "node ${fileName}.js"
    }
  }
  
`;
let env = `
TOKEN=your token here
`
let config = `
{
    "token": "your token"
}
`
let gitignore = `
node_modules
.env
config.json
`

fs.writeFileSync(`${fileName}.js`, fileContent);
fs.writeFileSync('package.json', packageJson);
if (tokenType === 'dotenv') {
fs.writeFileSync('.env', env);
} else {
fs.writeFileSync('config.json', config);
}
if (g) {
fs.writeFileSync('.gitignore', gitignore);
}

console.log('Done! Successfully generated your new Discord.js v14 project!');
console.log('Make sure to run npm i before you start your bot!');
console.log('Also make sure to add your token to the .env file or config.json file!');
}
