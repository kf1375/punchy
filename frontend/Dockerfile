FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run build

# Stage 2
FROM nginx:stable-alpine

COPY --from=build /app/build /var/www/public

EXPOSE 80 443

CMD [ "nginx", "-g", "daemon off;" ]