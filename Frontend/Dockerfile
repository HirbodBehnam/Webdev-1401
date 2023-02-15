FROM nginx:stable-alpine
COPY Frontend/default.conf /etc/nginx/conf.d/default.conf
COPY Frontend/*.html /usr/share/nginx/html/
COPY Frontend/src/ /usr/share/nginx/html/src/
COPY Frontend/assets/ /usr/share/nginx/html/assets/
COPY Frontend/dist/ /usr/share/nginx/html/dist/