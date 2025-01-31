FROM node:10

# Create app directory
WORKDIR /app/ts-server

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .
RUN npm run build-ts

EXPOSE 8002
CMD [ "npm", "start" ]
