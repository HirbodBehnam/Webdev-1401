package main

import (
	"github.com/go-redis/redis/v8"
	log "github.com/sirupsen/logrus"
	"net"
	"os"
	"strconv"
)

// getRedisOptions will get the redis options from env variables
func getRedisOptions() *redis.Options {
	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		log.Fatalln("please set REDIS_URL environmental variable")
	}
	dbID, _ := strconv.Atoi(os.Getenv("REDIS_DB"))
	username := os.Getenv("REDIS_USERNAME")
	password := os.Getenv("REDIS_PASSWORD")
	return &redis.Options{
		Addr:     redisUrl,
		DB:       dbID,
		Username: username,
		Password: password,
	}
}

func getDatabaseConnectionURL() string {
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatalln("please set DATABASE_URL environmental variable")
	}
	return dbUrl
}

func getServeData() (listen, certFile, keyFile string) {
	listen = os.Getenv("HTTP_LISTEN")
	if listen == "" {
		log.Fatalln("please set HTTP_LISTEN environmental variable")
	}
	certFile = os.Getenv("TLS_CERT")
	if certFile == "" {
		log.Fatalln("please set TLS_CERT environmental variable")
	}
	keyFile = os.Getenv("TLS_KEY")
	if keyFile == "" {
		log.Fatalln("please set TLS_KEY environmental variable")
	}
	return
}

func getGrpcListener() net.Listener {
	// Get protocol
	protocol := "tcp"
	if envProtocol := os.Getenv("GRPC_LISTEN_PROTOCOL"); envProtocol != "" {
		protocol = envProtocol
	}
	// Listen
	listenAddress := os.Getenv("GRPC_LISTEN_ADDRESS")
	if listenAddress == "" {
		log.Fatalln("please set GRPC_LISTEN_ADDRESS environmental variable")
	}
	listener, err := net.Listen(protocol, listenAddress)
	if err != nil {
		log.Fatalf("cannot listen: %s\n", err)
	}
	return listener
}
