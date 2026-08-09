FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

COPY server.js ./

# Schedule lives here. Mount a volume or it is lost on restart.
RUN mkdir -p /app/data
ENV DATA_FILE=/app/data/devices.json
VOLUME ["/app/data"]

EXPOSE 8787
USER node
CMD ["node", "server.js"]
