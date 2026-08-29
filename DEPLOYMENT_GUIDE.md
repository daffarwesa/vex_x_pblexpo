# 🚀 Panduan Deployment Production (VEX-EXPO)

Panduan praktis untuk melakukan deployment **Frontend (Next.js)** dan **Backend (Laravel)** ke server VPS / Cloud (Nginx / Apache).

---

## 📁 1. Struktur Folder di Server

```
/var/www/vex-expo/
├── back-vex/       (Laravel API Backend)
├── front-vex/      (Next.js Frontend)
└── .gitignore
```

---

## ⚙️ 2. Deployment Backend (`back-vex`)

### Langkah 1: Masuk ke folder backend & pasang dependencies
```bash
cd /var/www/vex-expo/back-vex
composer install --no-dev --optimize-autoloader
```

### Langkah 2: Buat & Konfigurasi `.env`
Salin template `.env.example`:
```bash
cp .env.example .env
nano .env
```
Sesuaikan variabel berikut di `.env`:
```env
APP_NAME="V-EX"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.domain-anda.com

FRONTEND_URL=https://domain-anda.com
SANCTUM_STATEFUL_DOMAINS=domain-anda.com
SESSION_DOMAIN=.domain-anda.com
SESSION_SECURE_COOKIE=true

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vex_production
DB_USERNAME=vex_user
DB_PASSWORD=password_db_yang_kuat
```

### Langkah 3: Generate Key, Link Storage & Migrate
```bash
php artisan key:generate
php artisan storage:link
php artisan migrate --force
```

### Langkah 4: Optimasi Cache Laravel (Production)
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Langkah 5: Beri Permission Folder Storage
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## 🎨 3. Deployment Frontend (`front-vex`)

### Langkah 1: Masuk ke folder frontend & pasang dependencies
```bash
cd /var/www/vex-expo/front-vex
npm install
```

### Langkah 2: Buat `.env.local`
Salin template `.env.example`:
```bash
cp .env.example .env.local
nano .env.local
```
Sesuaikan nilainya:
```env
NEXT_PUBLIC_API_URL=https://api.domain-anda.com
NEXT_PUBLIC_STORAGE_URL=https://api.domain-anda.com/storage
NEXT_PUBLIC_REMOTE_IMAGE_DOMAINS=drive.google.com,lh3.googleusercontent.com,img.youtube.com

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Langkah 3: Build Next.js
```bash
npm run build
```

### Langkah 4: Jalankan dengan PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start npm --name "vex-frontend" -- start -- -p 3000
pm2 save
pm2 startup
```

---

## 🌐 4. Contoh Konfigurasi Nginx Reverse Proxy

### A. Frontend Nginx Block (`domain-anda.com`):
```nginx
server {
    listen 80;
    server_name domain-anda.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name domain-anda.com;

    ssl_certificate /etc/letsencrypt/live/domain-anda.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain-anda.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### B. Backend Laravel Nginx Block (`api.domain-anda.com`):
```nginx
server {
    listen 80;
    server_name api.domain-anda.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.domain-anda.com;
    root /var/www/vex-expo/back-vex/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/api.domain-anda.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.domain-anda.com/privkey.pem;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 🔄 5. Checklist Update / CI-CD
Jika ada perubahan kode di kemudian hari:
```bash
# Update Backend
cd /var/www/vex-expo/back-vex
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache

# Update Frontend
cd /var/www/vex-expo/front-vex
git pull
npm install
npm run build
pm2 restart vex-frontend
```
