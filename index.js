const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var projectInfoRAW = fs.readFileSync("private/projectInfo.json");
var projectInfo = JSON.parse(projectInfoRAW)
console.log(projectInfo)
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'private/token.json';

// Load client secrets from a local file.
fs.readFile('private/creds.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
        console.log(`- ${label.id}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
  //watchGmail(gmail);
  listen(gmail)
}
async function watchGmail(gmail){
    const res = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          // Replace with `projects/${PROJECT_ID}/topics/${TOPIC_NAME}`
          topicName: projectInfo.topicName
        },
        labelIds: [
            "SENT"
        ],
        labelFilterAction:"include"
      });
      
      console.log(res.data);
}
function stopWatch(gmail){
    gmail.users.stop({
        userId:'me'
    })
}
function listen(gmail){
    // Imports the Google Cloud client library
    const {PubSub} = require('@google-cloud/pubsub');

    // Creates a client
    const pubsub = new PubSub({
        projectId: projectInfo.projectId,
        keyFilename: 'private/credsPubSub.json'
    });

    /**
     * TODO(developer): Uncomment the following lines to run the sample.
     */
    const subscriptionName = projectInfo.pullSubName;
    const timeout = 60;

    // References an existing subscription
    const subscription = pubsub.subscription(subscriptionName);

    // Create an event handler to handle messages
    let messageCount = 0;
    var lastHystoryId = 0;
    const messageHandler = message => {
        //console.log(message);
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${message.attributes}`);
    var dataOBJ = JSON.parse(message.data)
    var historyId = dataOBJ.historyId
    console.log(`\hID: ${historyId}`);
    gmail.users.history.list({
        userId:"me",
        
            startHistoryId:lastHystoryId == 0 ? historyId : lastHystoryId,

        
    }).then(res =>{
        console.log(res.data)
        //TODO:ERROR res.data.historyId
        lastHystoryId = res.data.historyId;
        if(res.data.history){
            res.data.history.forEach(element => {
                console.log("entering ")
                if(element.messages){
                    console.log("mexs: ")
                    element.messages.forEach(el =>{
                        console.log(el)
                        if(el.id){
                            var messageId = el.id
                            var threadId = el.threadId
                            
                            //if in the history list there is a message id, get the message
                            //It is not needed to read the message, we just need the id to reply to it
                            gmail.users.messages.get({
                                userId:"me",
                                id:el.id
                            }).then(resMex => {
                                console.log(resMex.data)
                                if(resMex.data.payload){
                                    if(resMex.data.payload.header){
                                        resMex.data.payload.header.forEach(head => {console.log(head)})
                                    }
                                    if(resMex.data.payload.body){
                                        console.log(resMex.data.payload.body)
                                    }
                                }
                            })
                        }
                    })
                }
                if(element.messagesAdded){
                    console.log("mexs added: ")
                    element.messagesAdded.forEach(el =>{
                        console.log(el)
                        
                    })
                }
            });
        }
    })
    
    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();
    };

    // Listen for new messages until timeout is hit
    subscription.on(`message`, messageHandler);

    setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`${messageCount} message(s) received.`);
    }, timeout * 2000);
}