# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /front

# Копируем только зависимости — для кэширования
COPY package*.json ./
RUN npm ci

# Копируем весь код
COPY . .

# Собираем (создаст папку `dist`)
RUN npm run build


# Production: лёгкий Nginx для отдачи статики
FROM nginx:alpine

# Копируем собранный сайт из builder-стадии
COPY --from=builder /front/dist /usr/share/nginx/html

# Важно для SPA (чтобы /profile, /settings и т.д. работали)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80