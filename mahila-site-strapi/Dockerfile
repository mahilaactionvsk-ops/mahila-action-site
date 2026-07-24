FROM node:20-alpine AS build

RUN apk add --no-cache python3 make g++ gcc libc-dev

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache vips-dev

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/public ./public

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

EXPOSE 1337

CMD ["npm", "run", "start"]
