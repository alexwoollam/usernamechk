FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    curl \
    libcurl4-openssl-dev \
    libonig-dev \
    libxml2-dev \
    pkg-config \
    libssl-dev \
    librabbitmq-dev \ 
    && docker-php-ext-install pdo pdo_pgsql zip sockets

RUN pecl install amqp \
    && docker-php-ext-enable amqp

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /app && chmod -R 775 /app/storage /app/bootstrap/cache

CMD ["php", "artisan", "username-check:listen"]
