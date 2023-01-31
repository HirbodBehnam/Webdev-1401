const grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "./proto/auth.proto";

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

let packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const authService = grpc.loadPackageDefinition(packageDefinition).AuthServerService;

const client = new authService(
    "localhost:21901",
    grpc.credentials.createInsecure()
);

const validateToken = (req, res, next) => {
    client.AuthorizeToken({ token: req.headers.authorization }, (err, response) => {
        if (err) {
            res.status(401).send("Unauthorized");
        } else {
            req.user = response;
            next();
        }
    });
}
module.exports = validateToken;