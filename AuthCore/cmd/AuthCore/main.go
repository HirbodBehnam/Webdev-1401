package main

import (
	"AuthCore/api"
	"AuthCore/pkg/oauth2"
	log "github.com/sirupsen/logrus"
)

func main() {
	var apiServer api.API
	// Create redis connection for OAuth
	oauth2Redis, err := oauth2.NewStorageFromRedis(getRedisOptions())
	if err != nil {
		log.WithError(err).Fatalln("cannot connect to redis for oauth2")
	}
	apiServer.Oauth = oauth2.NewOauth2(oauth2Redis)
	// Serve
}
