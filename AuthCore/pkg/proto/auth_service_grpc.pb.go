// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             v3.21.12
// source: pkg/proto/auth_service.proto

package proto

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// AuthServerServiceClient is the client API for AuthServerService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type AuthServerServiceClient interface {
	AuthorizeToken(ctx context.Context, in *UserToken, opts ...grpc.CallOption) (*UserInfo, error)
}

type authServerServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewAuthServerServiceClient(cc grpc.ClientConnInterface) AuthServerServiceClient {
	return &authServerServiceClient{cc}
}

func (c *authServerServiceClient) AuthorizeToken(ctx context.Context, in *UserToken, opts ...grpc.CallOption) (*UserInfo, error) {
	out := new(UserInfo)
	err := c.cc.Invoke(ctx, "/proto.AuthServerService/AuthorizeToken", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// AuthServerServiceServer is the server API for AuthServerService service.
// All implementations must embed UnimplementedAuthServerServiceServer
// for forward compatibility
type AuthServerServiceServer interface {
	AuthorizeToken(context.Context, *UserToken) (*UserInfo, error)
	mustEmbedUnimplementedAuthServerServiceServer()
}

// UnimplementedAuthServerServiceServer must be embedded to have forward compatible implementations.
type UnimplementedAuthServerServiceServer struct {
}

func (UnimplementedAuthServerServiceServer) AuthorizeToken(context.Context, *UserToken) (*UserInfo, error) {
	return nil, status.Errorf(codes.Unimplemented, "method AuthorizeToken not implemented")
}
func (UnimplementedAuthServerServiceServer) mustEmbedUnimplementedAuthServerServiceServer() {}

// UnsafeAuthServerServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to AuthServerServiceServer will
// result in compilation errors.
type UnsafeAuthServerServiceServer interface {
	mustEmbedUnimplementedAuthServerServiceServer()
}

func RegisterAuthServerServiceServer(s grpc.ServiceRegistrar, srv AuthServerServiceServer) {
	s.RegisterService(&AuthServerService_ServiceDesc, srv)
}

func _AuthServerService_AuthorizeToken_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(UserToken)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(AuthServerServiceServer).AuthorizeToken(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/proto.AuthServerService/AuthorizeToken",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(AuthServerServiceServer).AuthorizeToken(ctx, req.(*UserToken))
	}
	return interceptor(ctx, in, info, handler)
}

// AuthServerService_ServiceDesc is the grpc.ServiceDesc for AuthServerService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var AuthServerService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "proto.AuthServerService",
	HandlerType: (*AuthServerServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "AuthorizeToken",
			Handler:    _AuthServerService_AuthorizeToken_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "pkg/proto/auth_service.proto",
}