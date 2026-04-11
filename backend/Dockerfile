FROM php:8.1-apache

RUN a2dismod mpm_event mpm_worker && \
    a2enmod mpm_prefork rewrite

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html
