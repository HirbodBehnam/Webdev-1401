# راه اندازی داکر
## Nginx and Static Site
در ابتدا می‌خواهیم که به کمک nginx ساخت خود را به صورت static بالا بیاوریم. برای اینکار از یک داکرفایل استفاده می‌کنیم که به صورت زیر است:
```dockerfile
FROM nginx:stable-alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY *.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
COPY assets/ /usr/share/nginx/html/assets/
COPY dist/ /usr/share/nginx/html/dist/
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
      context: ./Frontend
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
```
## Redis
برای بالا آوردن ردیس کافی است که از دستور زیر استفاده کنیم:
```bash
sudo docker run --name some-redis -p 6379:6379 -d redis:alpine
```
برای وصل شدن به ردیس هم می‌توان از
`redis-cli`
استفاده کرد.
### Docker Compose
```yaml
version: "3"

services:
  redis:
    restart: on-failure
    image: redis:alpine
    ports:
      - "6379:6379"
```
## Backend
### Go
برای بالا آوردن سرویس auth core که با گو نوشته شده است در ابتدا نیاز به یک dockerfile داریم.
این داکرفایل را به صورت زیر می‌سازیم:
```dockerfile
FROM golang:alpine
WORKDIR /usr/src/goapp
COPY AuthCore/ /usr/src/goapp/
RUN go mod tidy
RUN go build -o /authcore ./cmd/AuthCore
CMD [ "/authcore" ]
```
کاری که این فایل انجام می‌دهد این است که در ابتدا بر پایه‌ی ایمیج گو یک کانتینر ایجاد می‌کند. سپس working directory را به مسیر مشخص شده تغییر می‌دهد و تمامی فایل‌های پوشه‌ی
`AuthCore`
که سورس کد‌های برنامه‌را در کانتینر کپی می‌کند. در انتها نیز با اجرا کردن دو دستور زیرش برنامه‌ را کامپایل می‌کند. در انتها نیز برنامه‌ی کامپایل شده را اجرا می‌کنیم.
#### Docker Compose
```yaml
version: "3"

services:
  authcore:
    restart: on-failure
    environment:
      - REDIS_URL=redis:6379
      - REDIS_DB=1
      - DATABASE_URL=postgres://postgres:1234@database:5432/postgres
      - HTTP_LISTEN=0.0.0.0:51691
      - GRPC_LISTEN_ADDRESS=0.0.0.0:21901
    build:
      context: ./AuthCore
    depends_on:
      - redis
      - database
```
در اینجا در ابتدا مشخص می‌کنیم که این سرویس باید به کمک داکرفایل داخل فولدر AuthCore
ساخته شود. در ادامه مشخص می‌کنیم که حتما قبل از روشن کردن این سرویس باید سرویس‌های ردیس و دیتابیس بالا و در حال اجرا باشند. در نهایت نیز environment variableهای مختص
به سرویس را ست می‌کنیم. همان طور که مشخص است لازم نیست که ای پی ایمیج ردیس را ست کنیم و صرفا با استفاده از `redis` به جای ای پی آنرا ست می‌کنیم.
### Nodejs
برای بالا آوردن ticket service که به استفاده از node js نوشته شده است متشابه با auth core
عمل می‌کنیم. داکر فایل ما به صورت زیر است:
```dockerfile
FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```
در این فایل صرفا بر پایه‌ی ایمیج node پروژه‌ی خود را build و اجرا می‌کنیم.
#### Docker compose
برای ساخت فایل
docker compose
نیز مانند go عمل می‌کنیم:
```yaml
version: "3"

services:
  ticketcore:
    restart: on-failure
    environment:
      - HOST=0.0.0.0
      - PORT=5000
      - DB_USER=postgres
      - DB_PASSWORD=1234
      - DB_DATABASE=postgres
      - DB_PORT=5432
      - DB_HOST=database
      - BANK_URL=1.1.1.1:8888
      - BANK_RECEIPT_ID=42069420
    build:
      context: ./TicketService
    depends_on:
      - database
      - authcore
```
### Nginx Reverse Proxy
برای reverse proxy کردن نیز کافی است که routeهای خود را به فایل کانفیگ nginx اضافه کنیم:
```
server {
    listen 80;

    location / {
        charset utf-8;
        root /usr/share/nginx/html;
    }

    location /ticket/ {
        add_header Access-Control-Allow-Origin $http_origin;
        proxy_pass http://ticketcore:5000/;
    }

    location /auth/ {
        add_header Access-Control-Allow-Origin $http_origin;
        proxy_pass http://authcore:51691/;
    }
}
```
یکی از مشکلاتی که به آن بر‌خوردیم این بود که زمان reverse proxy کردن خود
`/ticket/` و `auth`
در path url ظاهر می‌شدند. با کمی جست و جو متوجه شدیم که کافی است که آخرین کارکتر عبارت جلوی
proxy_path
برابر
`/`
باشد.

## Final Docker Compose File
در نهایت تمامی فایل‌های docker compose که در قسمت‌های قبل ساختیم را یکجا قرار می‌دهیم.
این فایل را می‌توانید از
[این](https://github.com/HirbodBehnam/Webdev-1401/blob/master/docker-compose.yml)
لینک مشاهده کنید.

## Locust
### Auth core
برای تست کردن لود auth core از سه تابع استفاده می‌کنیم. در ابتدای شروع برنامه به کمک تابع زیر یک یوزر جدید در سایت ایجاد می‌کنیم.
```python
def on_start(self):
    self.client.post("/auth/signup", data={
        "email": self.user,
        "password": self.password,
        "phone": random_string(),
        "first_name": random_string(),
        "second_name": random_string(),
        "gender": "m",
    })
```
`self.user` و `self.passowrd` زمان درست شدن کلاس و به صورت رندوم ساخته می‌شوند. سپس در توابع مختلف عملکرد برنامه را بررسی می‌کنیم. سه تابع زیر هر کدام قسمتی از endpointها را تست می‌کنند:
```python
@task
def login(self):
    response = self.client.post("/auth/login", data={
        "email": self.user,
        "password": self.password,
    })
@task
def logout(self):
    response = self.client.post("/auth/login", data={
        "email": self.user,
        "password": self.password,
    })
    if response.status_code != 200:
        return
    json_response = response.json()
    self.client.post("/auth/logout", headers={
        "Authorization": "Bearer " + json_response['access_token']
    })
@task
def refresh(self):
    response = self.client.post("/auth/login", data={
        "email": self.user,
        "password": self.password,
    })
    if response.status_code != 200:
        return
    json_response = response.json()
    self.client.get("/auth/refresh?refresh_token=" + json_response['refresh_token'])
```
نمودار‌های خروجی به صورت زیر هستند:
![locust-authcore-1.png](locust-authcore-1.png)
![locust-authcore-2.png](locust-authcore-2.png)
![locust-authcore-3.png](locust-authcore-3.png)
همان طور که مشخص است تا زمانی که تعداد‌های یوزر‌های همزمان حدود ۸ نفر باشد سیستم با حداکثر توان خود کار می‌کند (چرا که کامپیوتر من ۸ هسته دارد.)
وقتی که تعداد کاربر‌ها را بیشتر می‌کنیم
RPS
ما تغییری نمی‌کند و ثابت می‌ماند.