FROM node:carbon
WORKDIR /app

# dependencies
COPY package*.json ./
RUN npm i

# Copy app 
COPY . .

COPY .env.example .env

EXPOSE 9001

CMD [ "npm", "run", "start:dev"]