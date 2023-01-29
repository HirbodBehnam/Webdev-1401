package oauth2

import "time"

type Storage interface {
	Store(userID int64, ttl time.Duration) (accessToken, refreshToken string, err error)
	Get(accessToken string) (userID int64, err error)
	Delete(accessToken string) error
	Refresh(refreshToken string, ttl time.Duration) (newAccessToken string, err error)
}
