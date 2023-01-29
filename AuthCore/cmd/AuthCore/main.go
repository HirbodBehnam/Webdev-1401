package main

import (
	"AuthCore/api"
	"AuthCore/internal/database"
	"AuthCore/pkg/oauth2"
	"github.com/gin-gonic/gin"
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
	// Open database
	db, err := database.NewPostgresDatabase(getDatabaseConnectionURL())
	if err != nil {
		log.WithError(err).Fatalln("cannot initialize database")
	}
	apiServer.Database = database.NewDatabase(db)
	// Serve
	g := gin.Default()
	g.POST("/signup", apiServer.SignUpUser)
	g.POST("/login", apiServer.LoginUser)
	g.POST("/refresh", apiServer.RefreshToken)
	g.POST("/logout", apiServer.SignOutUser)
	// Done!
	err = g.RunTLS(getServeData())
	if err != nil {
		log.WithError(err).Fatalln("cannot serve server")
	}
}
