package api

import (
	"AuthCore/internal/database"
	"AuthCore/pkg/oauth2"
	"AuthCore/pkg/proto"
	"context"
	log "github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type GrpcServer struct {
	proto.AuthServerServiceServer
	Oauth    oauth2.Oauth2
	Database database.Database
}

// AuthorizeToken will authorize a token for other microservices.
// Errors include:
//
// * codes.NotFound with error message of "token": Token is invalid
// * codes.Internal with error message of "cannot get user data"
func (api GrpcServer) AuthorizeToken(ctx context.Context, token *proto.UserToken) (*proto.UserInfo, error) {
	// At first get the user ID from token
	userID, err := api.Oauth.Get(token.Token)
	if err != nil {
		return nil, status.Error(codes.NotFound, "token")
	}
	// Get the database
	info, err := api.Database.GetUserData(ctx, userID)
	if err != nil {
		log.WithError(err).WithField("userID", userID).Error("cannot get user data")
		return nil, status.Error(codes.Internal, "cannot get user data")
	}
	// Done
	return info, nil
}
