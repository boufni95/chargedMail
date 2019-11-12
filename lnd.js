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
    var lightning = new lnrpc.Lightning('34.67.253.46:10009', creds);
    /*var request = {} 
    lightning.getInfo(request, function(err, response) {
        console.log(err)
        console.log(response);
    })*/
    return lightning
}
module.exports.addInvoice=function(lightning,memo,fallbackAddr,value,callback){
    console.log("creating invoice----------")
    var request = {
        memo:memo,
        value:value,
        fallback_addr:fallbackAddr,

    }
    lightning.addInvoice(request, function(err, response) {
        if(err){
            console.log(err)
        }
        console.log(response);
        callback(response)
    })
}

module.exports.listenInvoice= function(gmail,lightning,db,optionD){
    var localDB = require("./db.js")
    var request = { 
		settle_index: 1, 
	} 
    var call = lightning.subscribeInvoices(request)
    console.log("listening invoce:")
	call.on('data', function(response) {
		// A response was received from the server.
        //console.log(response);
        localDB.handlePayment(gmail,db,response.payment_request,"",response.r_preimage,response.amt_paid,optionD)
        
	});
	call.on('status', function(status) {
		// The current status of the stream.
	});
	call.on('end', function() {
		// The server has closed the stream.
	});
}