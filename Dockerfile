# Use an updated base image with the correct Node.js version
FROM some-image-with-node-16-or-higher as base
WORKDIR /usr/src/app

# Optionally install Node.js and npm if the base image doesn't have them
# USER root
# RUN apt-get update && apt-get install -y nodejs npm
# USER bun

# Install root dependencies
# Make sure the user has permission to create directories
COPY package.json package-lock.json ./
USER root
RUN npm install --frozen-lockfile
USER bun

COPY . .

# Final stage
FROM base AS release
WORKDIR /usr/src/app

COPY --from=base /usr/src/app .

# Setup environment and run the service
ENV NODE_ENV=production
EXPOSE 3000/tcp
ENTRYPOINT [ "npm", "run", "dev:backend" ]
