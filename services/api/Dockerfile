FROM node:20-alpine AS deps
WORKDIR /api
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /api
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /api/dist ./dist
COPY migrations ./migrations
EXPOSE 8080
CMD ["node", "dist/server.js"]
