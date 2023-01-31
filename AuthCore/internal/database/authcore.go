package database

import (
	"AuthCore/pkg/proto"
	"context"
	"github.com/go-faster/errors"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type Database struct {
	db *pgxpool.Pool
}

func NewDatabase(db *pgxpool.Pool) Database {
	return Database{db}
}

// InvalidCredentialsErr is returned from AuthUser if username or password is invalid
var InvalidCredentialsErr = errors.New("invalid credentials")

// SignUpUser will sign up a user in database
func (db Database) SignUpUser(ctx context.Context, email, phone, firstName, secondName, password string, gender Gender) error {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	_, err := db.db.Exec(ctx, "INSERT INTO user_account (email, phone_number, gender, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4, $5, $6)",
		email, phone, gender.String(), firstName, secondName, hashedPassword)
	return err
}

// AuthUser authorizes a user by its email and password.
// It returns the user ID of the user if successful.
// It might return InvalidCredentialsErr if username or password is invalid
func (db Database) AuthUser(ctx context.Context, email, password string) (int64, error) {
	// Query database
	var userID int64
	var hashedPassword string
	err := db.db.QueryRow(ctx, "SELECT user_id, password_hash FROM user_account WHERE email=$1", email).Scan(&userID, &hashedPassword)
	if err == pgx.ErrNoRows {
		return 0, InvalidCredentialsErr
	}
	if err != nil {
		return 0, errors.Wrap(err, "cannot query row")
	}
	// Check password
	if bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)) != nil {
		return 0, InvalidCredentialsErr
	}
	return userID, nil
}

// GetUserData will get all of someone's shit from database
func (db Database) GetUserData(ctx context.Context, userID int64) (*proto.UserInfo, error) {
	// Query data
	var genderString string
	result := new(proto.UserInfo)
	err := db.db.QueryRow(ctx, "SELECT email, phone_number, gender, first_name, last_name FROM user_account WHERE user_id=$1", userID).
		Scan(&result.Email, &result.PhoneNumber, &genderString, &result.FirstName, &result.LastName)
	if err != nil {
		return nil, err
	}
	// Finalize
	result.UserId = userID
	var gender Gender
	_ = gender.UnmarshalText([]byte(genderString))
	switch gender {
	case GenderMale:
		result.Gender = proto.Gender_MALE
	case GenderFemale:
		result.Gender = proto.Gender_FEMALE
	}
	return result, nil
}
