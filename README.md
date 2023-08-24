# Personal Modular Discord Bot

This project is a personal modular Discord bot that uses the discord.js library and integrates multiple custom bots for various functionalities, including interacting with OpenAI's ChatGPT API.

## Features

- ChatGPTBot: A bot that interacts with OpenAI's ChatGPT API to provide AI-generated responses.
- MirrorBot: Mirror, mirror on the wall, who's the coolest of us all?

## Setup

1. Clone the repository.
2. Run `npm install` to install the required dependencies.
3. Create a `.env` file in the root directory and add the following variables:
```sh
BOT_TOKEN=your_discord_bot_token
CHATGPT_API_KEY=your_openai_api_key
CHATGPT_ORGANIZATION_ID=your_openai_organization_id
```
Replace `your_discord_bot_token` with your Discord bot's token, `your_openai_api_key` with your OpenAI API key, and `your_openai_organization_id` with your OpenAI organization ID.
4. Run `node index.js` to start the bot.

## Usage

### ChatGPTBot

To interact with the ChatGPTBot, use the `!chatgpt` command followed by your query in a text channel where the bot is present. For example:

```
!chatgpt What is the capital of France?
```

The bot will respond with an AI-generated answer.

## Customization

To add a new custom bot, create a new bot class in the `src/bots` folder, implementing the desired functionality. Import the new bot class in `index.js`, create an instance of the new bot, and register it with the `BotRegistrar` instance.

## Contributing

Feel free to submit pull requests with new features, improvements, or bug fixes. Please ensure your code follows the project's style and is well-documented.

## License

This project is released under the [MIT License](https://opensource.org/licenses/MIT).
