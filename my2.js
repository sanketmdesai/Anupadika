#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var mysql = require('mysql');

var connectionPool = mysql.createPool(
        {
            connectionLimit: 100,
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'trackingApp',
            debug: false,
        });

var globalWebSocketArray;
var globalWebSocketMap; // key = email/UserId and value is the websocket object
var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    var trackIndex = request.url.indexOf("track");
    if (request.method == 'POST')
    {
        var body = "";
        request.on('data', function (data)
        {
            console.log(data);
            body += data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            console.log("body received on end of the request " + body);
            var localJson = JSON.parse(body);
            console.log(localJson);
            console.log(localJson['userName']);
            console.log(localJson['EmailId']);


            /****
             * Create a SQL COnnection fetch the user and update the database
             * 
             * also fetch other ppl from the group 
             * 
             * get their sockets and send it to them 
             * 
             * you will have to create a global array of websockets to keep a track of all the clients
             * 
             * 
             */

            if (request.url.indexOf("fetchgroup") >= 0)
            {
                connectionPool.getConnection(function (err, connection) {

                    var sqlQuery = "select GroupName from Groups where GroupId in ( select GroupId from User_Group_Relation where UserId in ( (select UserId from Users where EmailId like '" + localJson['EmailId'] + "')))";

                    connection.query(sqlQuery, function (err, rows) {
                        if (err)
                        {
                            response.end("no connection pool possible coz of error");
                            return;
                        }

                        var result = "";
                        for (var i = 0; i < rows.length; i++)
                        {
                            result += JSON.stringify(rows[i]);
                            console.log(JSON.stringify(rows[i]));
                        }
                        console.log(result);
                        response.end(JSON.stringify(rows));
                        return;
                    });
                });
                return;
                //localJson["EmailId"];
            }
            else if (request.url.indexOf("fetchmembersofgroup") >= 0)
            {
               
                connectionPool.getConnection(function(err,connection){
                    var sqlQuery =  "select * from Users where UserId in"+
                                    "("+
                                        "select UserId from User_Group_Relation where GroupId in "+
                                        "("+ 
                                            "select GroupId from"+ 
                                            "("+
                                                "select * from Groups where GroupId in ("+
                                                    "select GroupId from"+  
                                                    "("+
                                                        "select * from User_Group_Relation where UserId in"+
                                                        "("+
                                                            "select UserId from Users where EmailId like '"+localJson['EmailId'] +"'"+ 
                                                        ")"+
                                                    ") as UserGroupsId"+
                                                ")"+
                                            ")as UserGroups where GroupName like '"+localJson['GroupName']+"'"+
                                        ")"+
                                    ")";
                    connection.query(sqlQuery , function(err , rows){
                        
                         if (err)
                        {
                            response.end("no connection pool possible coz of error");
                            return;
                        }

                        var result = "";
                        for (var i = 0; i < rows.length; i++)
                        {
                            result += JSON.stringify(rows[i]);
                            
                        }
                        console.log(JSON.stringify(rows));
                        response.end(JSON.stringify(rows));
                        return;
                    });
                     
                });
                return;
            }

            for (var i = 0; i < globalArray.length; i++)
            {

                var msg = localJson.lat + "," + localJson.lng + "," + localJson.userName;
                console.log("sending it to socket " + i);
                globalArray[i].sendUTF(msg);

            }
            response.end(msg);

        });
    }
    else
    {
        if (trackIndex >= 0) // if the request has track lat and lng as query parameters
        {
            var queryObject = url.parse(request.url, true).query;
            console.log(queryObject);
            for (var i = 0; i < globalArray.length; i++)
            {

                var msg = queryObject.lat + "," + queryObject.lng;
                console.log("sending it to socket " + i);
                globalArray[i].sendUTF(msg);

            }
            response.end(msg);
        }
        else
        {

            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Headers", "X-Requested-With");

            console.log("************************************************" + request.url);
            if (request.url.endsWith('.css'))
            {
                response.setHeader("Content-type", "text/css");
                fs.readFile("." + request.url, function (err, data) {
                    response.end("" + data);
                });
            }
            else if (request.url.endsWith('.js'))
            {
                response.setHeader("Content-type", "text/javascript");
                fs.readFile("." + request.url, function (err, data) {
                    response.end("" + data);
                });
            }
            else if (request.url.endsWith('.map'))
            {
                response.setHeader("Content-type", "application/json");

                fs.readFile("." + request.url, function (err, data) {
                    response.end("" + data);
                });
            }
            else if (request.url.indexOf("loginrequest") >= 0)
            {
                var queryObj = url.parse(request.url, true).query;
                console.log(queryObj.EmailId);
                console.log(queryObj.PassWd);

                connectionPool.getConnection(function (err, connection) {
                    if (err)
                    {
                        connection.release();
                        response.end("no connection pool possible coz of error");
                        return;
                    }

                    console.log("connected as id " + connection.threadId);

                    var loginQuery = "select * from Users where EmailId like '" + queryObj.EmailId + "' and password like '" + queryObj.PassWd + "'";
                    var resultString = "";
                    connection.query(loginQuery, function (err, rows) {
                        if (rows.length >= 1)
                        {
//                            response.end("Login Successfull for "+rows[0].UserName);
                            resultString = "Login Successfull for " + rows[0].UserName;
                            // response.setHeader("Content-type", "text/html");

                            fs.readFile("./welcomePage.html", function (err, data) {
                                response.end("" + data);
                            });
                            connection.release();
                            return;

                        }
                        else
                        {
                            response.end("Login FAILED for " + JSON.stringify(rows));
                            connection.release();
                            return;
                        }

                    });



                });


            }
            else
            {
                response.setHeader("Content-type", "text/html");
                console.log("Sending login page");
                fs.readFile("./Login.html", function (err, data) {
                    response.end(data);

                });
            }

        }
    }
    response.writeHead(200);
});
server.listen(9000, function () {
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
    if (index >= 0)
    {
        globalArray.splice(index, 1);
        console.log("socket removed successfully...");
    }
}

wsServer.on('request', function (request) {


    var connection = request.accept('echo-protocol', request.origin);
    globalArray.push(connection);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            for (var i = 0; i < globalArray.length; i++)
            {

                if (globalArray[i] != connection)
                {
                    console.log("sending it to socket " + i);
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
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        removeSocket(connection);
    });
});
