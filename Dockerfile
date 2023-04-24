###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 As development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json  tsconfig*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci

# Bundle app source
COPY . .

###################
# BUILD FOR PRODUCTION
###################

FROM node:18 As build

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --from=development /usr/src/app/node_modules ./node_modules

COPY . .

RUN npx prisma generate

# Run the build command which creates the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

RUN npm prune --production && npm cache clean --force

###################
# PRODUCTION
###################

FROM node:18 As production

WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/prisma ./prisma

CMD npm run start:prod
