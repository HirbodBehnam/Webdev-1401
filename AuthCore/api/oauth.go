package api

import (
	"AuthCore/internal/database"
	"AuthCore/pkg/oauth2"
	"github.com/gin-gonic/gin"
	"github.com/go-faster/errors"
	"github.com/jackc/pgx/v5/pgconn"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
)

// SignUpUser will sign up the user
func (api *API) SignUpUser(c *gin.Context) {
	// Get the form
	var request signupRequest
	if err := c.Bind(&request); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse{cannotParseBodyErr + ": " + err.Error()})
		return
	}
	// Parse gender
	var gender database.Gender
	err := gender.UnmarshalText([]byte(request.Gender))
	if err != nil {
		c.JSON(http.StatusBadRequest, errorResponse{cannotParseBodyErr + ": cannot parse gender"})
		return
	}
	// Insert into database
	err = api.Database.SignUpUser(c.Request.Context(), request.Email, request.Phone, request.FirstName, request.SecondName, request.Password, gender)
	// Check for duplicate
	if pgErr, ok := err.(*pgconn.PgError); ok {
		if pgErr.Code == "23505" {
			c.JSON(http.StatusConflict, errorResponse{userExistsErr})
			return
		}
	}
	// General error
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse{internalServerErrorText})
		log.WithError(err).WithField("request", request).Error("cannot signup user")
		return
	}
	// Done
	c.JSON(http.StatusOK, gin.H{})
	return
}

// LoginUser must be called to log in the user with their username and password
func (api *API) LoginUser(c *gin.Context) {
	// Get the form
	var request loginRequest
	if err := c.Bind(&request); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse{Error: cannotParseBodyErr})
		return
	}
	// Check username and password
	userID, err := api.Database.AuthUser(c.Request.Context(), request.Email, request.Password)
	if errors.Is(err, database.InvalidCredentialsErr) {
		c.JSON(http.StatusForbidden, errorResponse{Error: database.InvalidCredentialsErr.Error()})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse{internalServerErrorText})
		log.WithError(err).WithField("request", request).Error("cannot authorize user")
		return
	}
	// Create redis entry
	accessToken, refreshToken, err := api.Oauth.Store(userID, AccessTokenTTL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse{internalServerErrorText})
		log.WithError(err).WithField("request", request).Error("cannot store user auth tokens")
		return
	}
	// Done!
	c.JSON(http.StatusOK, loginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TTL:          int64(AccessTokenTTL / time.Second),
	})
}

// RefreshToken will give the user a new access token.
// It will also increase the TTL of refresh token in cache
func (api *API) RefreshToken(c *gin.Context) {
	// Get the refresh token
	var request refreshTokenRequest
	if err := c.BindQuery(&request); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse{cannotParseBodyErr})
		return
	}
	// Refresh
	newToken, err := api.Oauth.Refresh(request.RefreshToken, AccessTokenTTL)
	if err == oauth2.NotFound {
		c.JSON(http.StatusForbidden, errorResponse{"invalid refresh token"})
		return
	}
	// Send tokens
	c.JSON(http.StatusOK, loginResponse{
		AccessToken:  newToken,
		RefreshToken: request.RefreshToken,
		TTL:          int64(AccessTokenTTL / time.Second),
	})
}

// SignOutUser will simply sign the user out from site.
// It works based on access token in headers.
func (api *API) SignOutUser(c *gin.Context) {
	accessToken := getAccessTokenFromHeaders(c)
	err := api.Oauth.Delete(accessToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse{internalServerErrorText})
		log.WithError(err).WithField("access_token", accessToken).Error("cannot sign out user")
		return
	}
	c.JSON(http.StatusOK, gin.H{})
	return
}
