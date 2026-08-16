#!/usr/bin/env bash
set -e

# Change directory to backend root
cd /var/www/html

# Create .env if not exists
if [ ! -f .env ]; then
  if [ -f .env.docker ]; then
    echo "Creating .env from .env.docker..."
    cp .env.docker .env
  elif [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
  fi
fi

# Install composer dependencies if vendor doesn't exist
if [ ! -d "vendor" ]; then
  echo "Vendor directory not found. Running composer install..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate application key if missing
if ! grep -q "^APP_KEY=base64:" .env; then
  echo "Generating application key..."
  php artisan key:generate --force
fi

# Create storage symlink
php artisan storage:link --force || true

# Wait for MySQL database to be ready
echo "Waiting for MySQL database ($DB_HOST:$DB_PORT)..."
until nc -z -v -w30 "$DB_HOST" "$DB_PORT" 2>/dev/null || (echo > /dev/tcp/"$DB_HOST"/"$DB_PORT") 2>/dev/null; do
  echo "Database is unavailable - sleeping 2 seconds"
  sleep 2
done
echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
php artisan migrate --force || true

# Ensure proper permissions
chmod -R 775 storage bootstrap/cache || true
chown -R www-data:www-data storage bootstrap/cache || true

echo "Backend setup complete. Starting PHP-FPM..."
exec "$@"
