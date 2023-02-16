FROM golang:alpine
WORKDIR /usr/src/goapp
COPY AuthCore/ /usr/src/goapp/
RUN go mod tidy
RUN go build -o /authcore ./cmd/AuthCore
CMD [ "/authcore" ]
