// Author: Oliver Rodriguez

// Modules to import
const express = require("express");
const rp = require("request-promise");
const cfenv = require("cfenv");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server);
const axios = require('axios');

//Import Watson Developer Cloud SDK
const watson = require("watson-developer-cloud");
// Import service credentials

const serviceCredentials = require('./service-credentials.json');

// Get the environment variables from Cloud Foundry
const appEnv = cfenv.getAppEnv();

// Serve the static files in the /public directory
app.use(express.static(__dirname + '/public'));

// Create the Conversation object
var conversation = new watson.ConversationV1({
  username:serviceCredentials.conversation.username,
  password:serviceCredentials.conversation.password,
  url : 'https://gateway-lon.watsonplatform.net/assistant/api',
  version_date: watson.ConversationV1.VERSION_DATE_2017_05_26
});
 
var workspace = serviceCredentials.conversation.workspaceID;

var context = {};

// Create the Discovery object
var discovery = new watson.DiscoveryV1({
  username: serviceCredentials.discovery.username,
  password: serviceCredentials.discovery.password,
  version_date: watson.DiscoveryV1.VERSION_DATE_2017_04_27
});
var environmentId = serviceCredentials.discovery.environmentID;
var collectionId = serviceCredentials.discovery.collectionID;


// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

io.on('connection', function(socket) {
  console.log('a user has connected');

  // Handle incomming chat messages
  socket.on('chat message', function(msg) {

    console.log('message: ' + msg);
    io.emit('chat message', "you: " + msg);

    /*****************************
        Send text to Conversation
    ******************************/
   conversation.message({
    context: context,
    input: { text: msg },
    workspace_id: workspace
   }, function(err, response) {
       if (err) {
         console.error(err);
       } else {
         var reply = JSON.stringify(response.output.text[0], null, 2);
         context = response.context;
         var queryString = "";
         var answer = [];
         var city = "";
         if (context.best) {
          switch(context.best) {
            case "All":
             
             break;
            case "new-york-city":

             break;
            case "san-francisco":
             
             break;
            case "chicago":

            break;
          }

 
        } else if (context.list) {

        } else if (context.hotel) {

        } 
        else if (context.complain) {
				 
          var url = 'http://137.116.203.152:4041/categories';   
          axios.get(url).then((response)=>{
            var categories = response.data;
            var text = "";
            for (var i = 0; i < categories.length;i++){
              text += categories[i].name + '\n';
            }
			 
            io.emit('chat message', text);
          }).catch(err=>{
            console.log(err);
            io.emit('chat message', err.message );
          })
             
            // io.emit('chat message', "Hotel Bot: " + reply );
        
             }
      
        else {
          io.emit('chat message', "Hotel Bot: " + reply);

        }
       
  }
    });



   });
});

app.get('/', function(req, res){
  res.sendFile('index.html');
});

/*****************************
    Function Definitions
******************************/
function queryDiscovery(query, callback) {
  // Function to query Discovery
 
  discovery.query({
    environment_id: environmentId,
    collection_id: collectionId,
    aggregation: query
    }, function(err, response) {
       if (err) {
         console.error(err);
         callback(err, null);
       } else {
         //var results = JSON.stringify(response, null, 2);
        // console.log(results);
         callback(null, response);
       }
    });
}

