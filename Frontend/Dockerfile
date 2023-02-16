FROM nginx:stable-alpine
COPY default.conf /etc/nginx/conf.d/default.conf
COPY *.html /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
COPY assets/ /usr/share/nginx/html/assets/
COPY dist/ /usr/share/nginx/html/dist/