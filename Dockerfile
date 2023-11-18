# use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install root dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

COPY . .

# Final stage
FROM base AS release
WORKDIR /usr/src/app


COPY --from=base /usr/src/app .

# Setup environment and run the service
ENV NODE_ENV=production
EXPOSE 3000/tcp
ENTRYPOINT [ "npm", "run", "dev:backend" ]
