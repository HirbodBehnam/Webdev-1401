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

یکی از مشکلاتی که به آن در حین ساخت داکر فایل برخوردیم کپی تمامی استراکچر بندی فولدر‌ها به صورت بازگشتی در کانتینر بود که به کمی جست و جو به 
[این](https://stackoverflow.com/q/30215830)
سوال رسیدیم و به کمک این مشکل را حل کردیم.

## Postgres
برای بالا اوردن دیتابیس postgres از دستور زیر استفاده می‌کنیم:
```bash
sudo docker run -d \
	--name some-postgres \
	-e POSTGRES_PASSWORD=1234 \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v /tmp/postgres_db:/var/lib/postgresql/data \
	postgres:alpine
```
با این کار ایمیج postgres را بالا می‌آوریم و رمز آنرا 1234 قرار می‌دهیم. همچنین برای اینکه دیتای دیتابیس بعد از down شدن ایمیج بماند مسیر
`/var/lib/postgresql/data`
در کانتینر را به
`/tmp/postgres_db`
بر روی کامپیوتر خود مپ می‌کنیم. برای سبک شدن ایمیج نیز از نسخه‌ی alpine استفاده می‌کنیم.

بعد از اجرای دستور فوق دستور
`sudo docker ps`
را اجرا می‌کنیم. خروجی چیزی شبیه به عبارت زیر است:
```
CONTAINER ID   IMAGE             COMMAND                  CREATED              STATUS              PORTS      NAMES
0d4a1429f3d1   postgres:alpine   "docker-entrypoint.s…"   About a minute ago   Up About a minute   5432/tcp   some-postgres
```
به کمک دستور
`sudo docker exec -it some-postgres /bin/sh`
یک شل بر روی داکر میگیریم. در شل ایجاد شده به کمک دستور
`su postgres`
کاربر خود را از روت به
`postgres`
تغییر می‌دهیم تا بتوانیم دیتای خود را وارد کنیم و به کمک
`psql`
کامند لاین postgres را بگیریم.
برای دسترسی به فایل‌های سیستم host کافی است که فایل‌هایی که می‌خواهیم را در مسیر
`/tmp/postgres_db`
قرار دهیم. سپس به کمک psql دیتا‌های خود را در دیتابیس وارد می‌کنیم:
```bash
psql < auth.sql
```
سپس برای import داده‌ها از پورت فروارد کردن استفاده می‌کنیم. برای این کار کانتینر قبلی را کیل می‌کنیم و یکی دیگر با پورت فروارد ایجاد می‌کنیم.
```bash
sudo docker stop some-postgres
sudo docker rm some-postgres
sudo docker run -d \
	--name some-postgres \
	-e POSTGRES_PASSWORD=1234 \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v /tmp/postgres_db:/var/lib/postgresql/data \
	-p 5432:5432 \
	postgres:alpine
```
سپس به کمک dbeaver به دیتابیس وصل می‌شویم.
![dbeaver](dbeaver.png)
### Docker Compose
برای اضافه کردن این دیتابیس به فایل
docker composeی
که در قسمت قبل ساختیم به صورت زیر عمل می‌کنیم:

```‍‍‍yaml
version: "3"

services:
  database:
    restart: on-failure
    image: postgres:alpine
    environment:
      - POSTGRES_PASSWORD=1234
      - PGDATA=/var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - "/tmp/postgres_db:/var/lib/postgresql/data"
  nginx:
    restart: on-failure
    build:
      context: ./
      dockerfile: ./Frontend/Dockerfile
    ports:
      - "8000:80"
```
## Redis
برای بالا آوردن ردیس کافی است که از دستور زیر استفاده کنیم:
```
sudo docker run --name some-redis -p 6379:6379 -d redis:alpine
```
برای وصل شدن به ردیس هم می‌توان از
`redis-cli`
استفاده کرد.
### Docker Compose
```yaml
version: "3"

services:
  database:
    restart: on-failure
    image: postgres:alpine
    environment:
      - POSTGRES_PASSWORD=1234
      - PGDATA=/var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - "/tmp/postgres_db:/var/lib/postgresql/data"
  redis:
    restart: on-failure
    image: redis:alpine
    ports:
      - "6379:6379"
  nginx:
    restart: on-failure
    build:
      context: ./
      dockerfile: ./Frontend/Dockerfile
    ports:
      - "8000:80"
```

