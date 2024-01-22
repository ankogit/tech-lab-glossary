# Используем официальный образ Nginx
FROM nginx:alpine

# Удаляем стандартную конфигурацию Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Копируем файлы HTML и CSS в директорию по умолчанию Nginx
COPY ./src /usr/share/nginx/html

# Копируем файл конфигурации Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Команда для запуска Nginx в foreground режиме
CMD ["nginx", "-g", "daemon off;"]

