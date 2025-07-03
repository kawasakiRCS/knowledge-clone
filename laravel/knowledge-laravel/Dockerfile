FROM php:8.4-fpm

# 作業ディレクトリの設定
WORKDIR /var/www/html

# システムの依存関係をインストール
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nginx \
    supervisor \
    postgresql-client \
    nodejs \
    npm

# PHP拡張をインストール
RUN docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl

# Redisサポート
RUN pecl install redis && docker-php-ext-enable redis

# Composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Nginxの設定
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Supervisorの設定
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# PHP-FPMの設定
RUN echo "clear_env = no" >> /usr/local/etc/php-fpm.d/www.conf

# アプリケーションのファイルをコピー
COPY . /var/www/html

# ファイルの所有者を設定
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 権限を設定
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ポートを公開
EXPOSE 80

# Supervisorでサービスを開始
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]