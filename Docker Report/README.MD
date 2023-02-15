# راه اندازی داکر
## Nginx and Static Site
در ابتدا می‌خواهیم که به کمک nginx ساخت خود را به صورت static بالا بیاوریم. برای اینکار از یک داکرفایل استفاده می‌کنیم که به صورت زیر است:
```dockerfile
FROM nginx:stable-alpine
COPY Frontend/default.conf /etc/nginx/conf.d/default.conf
COPY Frontend/*.html /usr/share/nginx/html/
COPY Frontend/src/ /usr/share/nginx/html/src/
COPY Frontend/assets/ /usr/share/nginx/html/assets/
COPY Frontend/dist/ /usr/share/nginx/html/dist/
```
در خط اول آن از image رسمی nginx و تگ مخصوص به نسخه‌ی stable و alpine استفاده می‌کنیم.
دلیل استفاده از نسخه‌ی alpine سبک بودن آن است.
در ادامه فایل‌های سایت را در دایکتوری مخصوص به فایل‌های استاتیک کپی می‌کنیم. همچنین یک فایل کانفیگ را نیز برای nginx می‌سازیم و آنرا درست می‌کنیم. فعلا در این فایل کانفیگ محتوایات زیر قرار دارد:
```
server {
    listen 80;

    location / {
        charset utf-8;
        root /usr/share/nginx/html;
    }
}
```

در این کانفیگ صرفا مشخص کرده‌ایم که nginx بر روی پورت 80 گوش کند و در عین حال هر درخواستی برای هر path را از دایرکتوری
`/usr/share/nginx/html` serve کند.

در انتها نیز یک فایل
docker compose
ایجاد می‌کنیم. محتوایات این فایل به صورت زیر است:
```yaml
version: "3"

services:
  nginx:
    restart: on-failure
    build:
      context: ./
      dockerfile: ./Frontend/Dockerfile
    ports:
      - "8000:80"
```
در این فایل یک سرویس به نام
nginx
تعریف می‌کنیم که که عملا داکر فایل
`Frontend/Dockerfile`
را استفاده می‌کند و پورت ۸۰ کانتینر را به ۸۰۰۰ کامپیوتر هاست مپ می‌کند.