package database

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresDatabase will connect to a postgres database
func NewPostgresDatabase(connectionString string) (*pgxpool.Pool, error) {
	return pgxpool.New(context.Background(), connectionString)
}
