<p align="center">
  <a href="http://konzi.kir-dev.hu/" target="_blank"><img src="https://warp.sch.bme.hu/images/konzisite_email_header" alt="Konzisite header" /></a>
</p>

## Description

Konzisite is a web application for the students of Budapest University of Technology and Economic Faculty of Electrical Engineering and Informatics to organise consultations, study sessions where students help each other. This repository contains the backend REST API for that application, built with <a href="https://www.typescriptlang.org/" target="_blank" title="Typescript"><img src="https://github.com/get-icon/geticon/raw/master/icons/typescript-icon.svg" alt="Typescript" width="21px" height="21px"> TypeScript</a>, <a target="_blank" href="https://nestjs.com/" title="NestJS"><img src="https://github.com/get-icon/geticon/raw/master/icons/nestjs.svg" alt="NestJS" width="21px" height="21px"> NestJS</a> and <a href="https://www.prisma.io/" target="_blank" title="Prisma"><img src="https://github.com/get-icon/geticon/raw/master/icons/prisma.svg" alt="Prisma" width="21px" height="21px"> Prisma</a>. See the <a href="https://github.com/kir-dev/konzisite-frontend" target="_blank" title="Frontend repo">frontend repository here</a>. The application was developed by <a href="https://kir-dev.hu/" title="Kir-Dev" target="_blank"><img src="https://warp.sch.bme.hu/images/kir-dev-only-logo" alt="Kir-Dev" height="21px"> Kir-Dev</a>. For more information about the project, see our <a href="https://kir-dev.hu/project/konzisite/" target="_blank" title="Project page">project page</a> or <a href="https://kir-dev.hu/post/2023-03-05-az-uj-konzisite-fejlesztese/" target="_blank" title="Project page">our blogpost</a>, both in Hungarian.

## Preperation

First, start a PostgreSQL server locally on your machine.

Then create an OAuth client at [AuthSCH](https://auth.sch.bme.hu/console/index) with the following redirect address: `http://localhost:3300/auth/callback`

Finally, copy the contents of `.env.example` to a new file named `.env`. Replace the database credentials with the credentials required to connect to your local database and the AuthSCH credentials with ID and secret that AuthSCH generated for your client.

## Installation

```bash
# Install the dependencies
npm install
# Then apply the migrations
npx prisma migrate dev
# Optionally seed the databse with mock data
npm run seed
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run dev

# production mode
npm run start:prod

# running prisma studio, easy way to explore and manipulate the db
npx prisma studio
```

## Setting up a Postman collection

If you want to use Postman for testing the endpoints, you can import `postman_collection.json` from the root of the project into Postman. This will create a collection with some of the endpoints of the app already defined. To use it, create two new variables in the Environments -> Globals tab:

- `baseUrl`: the value should be the URL where the backend is running, so most likely `http://localhost:3300`
- `token`: the value should be your JWT token. You can get this by running both the backend and frontend apps. After logging in, you can copy the token from the `JWT_TOKEN` cookie.

If you add new endpoints to the collection that you think the others could use, please overwrite the `postman_collection.json` file with the export of the modified collection, and commit it.

## Docker deployment

Edit the .env file accordingly, set the exposed port to your liking.

```bash
docker-compose up --build [-d]
```
