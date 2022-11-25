# discordjs-v14-generator
A discord.js v14 code generator. (I was getting lazy ok???)


**Arguments**
```
generate14 --name=index.js --i=true --token=dotenv --g=true
```

**Name** \
The name of the main bot file.

**i** \
Adds on a Slash command handler. (with events.)
Leave out the --i completly if you don\t want it.
(Why wouldn't you???)

**Token** \
The type of token you want implemented.
So far there are only two types:
```
-- token=dotenv
-- token=config
```
I suggest using dotenv. It's safer.

**g** \
Adds on a gitignore file.
Leave out the --g completly if you don't want it.
