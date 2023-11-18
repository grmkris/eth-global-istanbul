# Use an updated base image with the correct Node.js version
FROM imbios/bun-node AS base

WORKDIR /usr/src/app



# Optionally install Node.js and npm if the base image doesn't have them
# USER root
# RUN apt-get update && apt-get install -y nodejs npm
# USER bun

# Install root dependencies
# Make sure the user has permission to create directories
COPY . .
RUN npm install

# Final stage
FROM base AS release
WORKDIR /usr/src/app

COPY --from=base /usr/src/app .
# Setup environment and run the service
ENV NODE_ENV=production
EXPOSE 5173/tcp
ENTRYPOINT [ "npm", "run", "dev:frontend"]
