# ChargedMail
### Requirements:
- GCP Project info
- Gmail API key
- PubSub API key
- 
- 
### Required extra files
private/creds.json: file with the API key for GMAIL
#### to check the .json validity before running verify it has the following structure:
{
    "installed":{
        "client_id":"",
        "project_id":"",
        "auth_uri":"",
        "token_uri":"",
        "auth_provider_x509_cert_url":"",
        "client_secret":"",
        "redirect_uris":[""]
    }
}

private/credsPubSub.json: file with the API key for PubSub
#### to check the .json validity before running verify it has the following structure:
{
  "type": "service_account",
  "project_id": "",
  "private_key_id": "",
  "private_key": "",
  "client_email": "",
  "client_id": "",
  "auth_uri": "",
  "token_uri": "",
  "auth_provider_x509_cert_url": "",
  "client_x509_cert_url": ""
}

private/projectInfo.json: info in GCP project must contain:"ProjectId","topicName","pullSubName"
#### to check the .json validity before running verify it has the following structure:
{
    "ProjectId":"",
    "topicName":"",
    "pullSubName":""
}

private/lnd.cert:tls certificate for lnd
private/admin.macaroon: macaroon file for lnd
private/rpc.proto: proto file for the Lnd grpc

make sure that all those files are present before you start, in the private folder, during execution in the private folder will be also stored the user token and the database
also make sure you have created the labels "Unpaid" and "Paid" before you start the service

you can start chargedMail with npm start, then connect to the web panel at http://localhost:8254/ set up message and cost, and start the service

now you can set an email as "Unpaid" and a payment request and an address will be generated and sent to the sender, the email will become "Paid" once the request or the on chain addr are paid