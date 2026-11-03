FROM php:8.3-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
      libjpeg-dev libpng-dev libwebp-dev \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install gd mysqli \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
COPY . .
RUN mkdir -p uploads/pengaduan

ENV PHP_CLI_SERVER_WORKERS=4
EXPOSE 10000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t /var/www/html"]