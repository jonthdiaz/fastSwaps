FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install --dev

COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]
