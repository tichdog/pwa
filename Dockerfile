# Этап 1: Сборка приложения
FROM node:22-alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build --configuration=production

# Этап 2: Запуск приложения
FROM nginx:alpine

# Копируем собранное приложение в nginx
# Важно: копируем из /app/dist/pwa/browser/
COPY --from=build /app/dist/pwa/browser /usr/share/nginx/html

# Копируем настройки nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]