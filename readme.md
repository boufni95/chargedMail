# ChargedMail
### Requirements:
- GCP Project info
- Gmail API key
- PubSub API key
- 
- 
### Required extra files
private/creds.json: file with the API key for GMAIL
private/credsPubSub.json: file with the API key for PubSub
private/projectInfo.json: info in GCP project must contain:"ProjectId","topicName","pullSubName"
private/lnd.cert:tls certificate for lnd
private/admin.macaroon: macaroon file for lnd
private/rpc.proto: proto file for the Lnd grpc