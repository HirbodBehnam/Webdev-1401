package api

import (
	"github.com/gin-gonic/gin"
	"strings"
)

// getAccessTokenFromHeaders will get the access token in the Authorization header.
// If header is empty or does not have the Bearer prefix, returns an empty string.
func getAccessTokenFromHeaders(c *gin.Context) string {
	const headerName = "Authorization"
	const prefix = "Bearer "
	header := c.Request.Header.Get(headerName)
	if !strings.HasPrefix(header, prefix) {
		return ""
	}
	return header[len(prefix):]
}
