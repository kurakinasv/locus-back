# node stage

FROM node:20-alpine as build

WORKDIR /usr/app/server

COPY package.json ./
COPY yarn.lock .

RUN yarn install --immutable --immutable-cache --check-cache

COPY . .

RUN yarn build 

CMD ["yarn", "start"]
