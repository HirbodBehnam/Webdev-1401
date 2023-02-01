const grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = __dirname + "/proto/auth.proto";

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

const validateToken =  (req, res, next) => {
    console.log("headers", req.headers);
    const token = req.headers.authorization.substring(7);
    console.log("token", token);
    client.AuthorizeToken({ token: token }, (err, response) => {
        console.log(response)
        console.log(err)
        if(response){
            req.user = response;
            next()
        } else {
            res.json({msg:"invalid token"});
        }

    });
}
module.exports = validateToken;