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

# Create start.sh script
RUN echo "#!/bin/bash" > start.sh
RUN echo "node migrate.js" >> start.sh
RUN echo "node index.js" >> start.sh

# Make start.sh executable
RUN chmod +x start.sh

# Run start.sh
CMD ["./start.sh"]