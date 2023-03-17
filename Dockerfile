FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

# Install app dependencies
COPY package.json /usr/src/bot
RUN npm install

# Copy over bot code
COPY . /usr/src/bot

# Bundle app source
COPY . .

CMD [ "node", "bot.js" ]