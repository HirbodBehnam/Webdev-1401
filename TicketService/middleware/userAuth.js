const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = `${__dirname}/proto/auth_service.proto`;

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const AuthService = grpc.loadPackageDefinition(packageDefinition).proto.AuthServerService;

const client = new AuthService(
  'localhost:21901',
  grpc.credentials.createInsecure(),
);
const validateToken = (req, res, next) => {
  console.log('headers', req.headers);
  const token = req.headers.authorization.substring(7);
  console.log('token', token);
  client.AuthorizeToken({ token }, (err, response) => {
    if (response) {
      req.user = response;
      console.log('response', response);
      next();
    } else {
      res.json({ msg: 'invalid token' });
    }
  });
};
module.exports = validateToken;
