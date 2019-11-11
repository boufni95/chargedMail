module.exports.init=function(){
    var fs = require('fs');
    var grpc = require('grpc');
    var lnrpc = grpc.load('private/rpc.proto').lnrpc;
    process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'
    var lndCert = fs.readFileSync('private/lnd.cert');
    var sslCreds = grpc.credentials.createSsl(lndCert);
    var macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
        var macaroon = fs.readFileSync("private/admin.macaroon").toString('hex');
        var metadata = new grpc.Metadata()
        metadata.add('macaroon', macaroon);
        callback(null, metadata);
    });
    var creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
    var lightning = new lnrpc.Lightning('35.192.104.101:10009', creds);
    /*var request = {} 
    lightning.getInfo(request, function(err, response) {
        console.log(err)
        console.log(response);
    })*/
    return lightning
}
