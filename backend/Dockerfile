FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libmariadb-dev \
    libmariadb-dev-compat \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_mysql mysqli pdo

WORKDIR /var/www/html

COPY . /var/www/html/

RUN chmod -R 755 /var/www/html

EXPOSE 8080

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
