FROM node:16
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV TZ="Europe/Budapest"
COPY package.json /usr/src/app/package.json
COPY .env /usr/src/app/.env
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm install
COPY . /usr/src/app
RUN npm run build
CMD npm run start:prod
