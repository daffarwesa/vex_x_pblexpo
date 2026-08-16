FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for node-gyp or alpine builds
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install packages
RUN npm install

# Copy application source
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "dev"]
