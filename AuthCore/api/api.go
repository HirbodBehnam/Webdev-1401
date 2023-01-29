package api

import (
	"AuthCore/internal/database"
	"AuthCore/pkg/oauth2"
)

type API struct {
	Oauth    oauth2.Oauth2
	Database database.Database
}
