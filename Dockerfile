# build stage
FROM node:21-alpine
WORKDIR /usr/app
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build:frontend --base=/admin
RUN yarn build:backend
RUN yarn install --production --frozen-lockfile

# run stage
FROM node:21-alpine
WORKDIR /usr/app
COPY --from=0 /usr/app .

CMD node --enable-source-maps dist/backend/app.js