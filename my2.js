#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require('url') ;
var fs = require('fs');
var qs = require('querystring');

var globalWebSocketArray;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    var trackIndex = request.url.indexOf("track");
    if(request.method == 'POST')
    {
        var body="";
        request.on('data',function(data)
        {
            console.log(data);
            body += data;
        });
        request.on('end',function(){
            var post = qs.parse(body);
            console.log(body);
            var localJson = JSON.parse(body);
            console.log(localJson);
            console.log(localJson['userName']);
            for(var i = 0 ; i<globalArray.length ; i++)
            {

                var msg = localJson.lat +","+localJson.lng+","+localJson.userName;
                console.log("sending it to socket "+i);
                globalArray[i].sendUTF(msg);

            }
            response.end(msg);

        });
    }
    else
    {
        if(trackIndex>=0) // if the request has track lat and lng as query parameters
        {
            var queryObject = url.parse(request.url,true).query;
            console.log(queryObject);
            for(var i = 0 ; i<globalArray.length ; i++)
            {
                  
                var msg = queryObject.lat +","+queryObject.lng; 
                console.log("sending it to socket "+i);
                globalArray[i].sendUTF(msg);        
             
            }
	    response.end(msg);
        }
        else
        {
        
             response.setHeader("Content-type","text/html");
             response.setHeader("Access-Control-Allow-Origin", "*");
             response.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
             fs.readFile("./welcomePage.html",function(err,data){
                console.log(data);
                response.end(data);
                
             });
        
        
        }
    }
    response.writeHead(200);
});
server.listen(9000, function() {
    console.log((new Date()) + ' Server is listening on port 9000');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

globalArray = [];

function removeSocket(soc)
{
    var index = globalArray.indexOf(soc);
    if(index>=0)
    {
        globalArray.splice(index,1);
        console.log("socket removed successfully...");
    }
}

wsServer.on('request', function(request) {
   

    var connection = request.accept('echo-protocol', request.origin);
    globalArray.push(connection);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);     
            for(var i = 0 ; i<globalArray.length ; i++)
            {
                
                if(globalArray[i]!=connection)
                {
                    console.log("sending it to socket "+i);
                    globalArray[i].sendUTF(message.utf8Data);        
                }
            }
            //connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        removeSocket(connection);
    });
});