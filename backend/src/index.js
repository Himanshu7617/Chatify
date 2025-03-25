import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = createServer(app);

//setting up socket server 

const io = new Server(server, {
    cors : 'http://localhost:5173'
});

//all socket connection record

let allSocketConnections = {

}


io.on('connection', (socket) => {

    if (socket.id) allSocketConnections[socket.id] = socket.id;

    socket.emit('totalConnections', Object.keys(allSocketConnections).length);
    //===============================Checking the connection state
    console.log(`a user connected : ${socket.id} and total users :  ${Object.keys(allSocketConnections).length}, \n ${Object.keys(allSocketConnections)}`);
    
    socket.on('disconnect', () => {
        delete allSocketConnections[socket.id]

        io.emit('totalConnections', Object.keys(allSocketConnections).length);
        console.log(`a user disconnected : ${socket.id} and total users :  ${Object.keys(allSocketConnections).length}`);
    })

    //=======================================================================================================
    //chat random page events handling
    //=======================================================================================================

    //making room for random chat 
    function connectTwoRandomUsers () {
        let allConnectionIDs = Object.entries(allSocketConnections);
        allConnectionIDs = allConnectionIDs.filter((id) => id !== 'undefined')
        
        // two sockets
        const partnerID = allConnectionIDs.shift()[0];

        delete allSocketConnections[socket.id];
        delete allSocketConnections[partnerID];

        
        socket.to(partnerID).emit('partnerID', {
            title : "partnerID", 
            value : socket.id
        })
        
        socket.emit('partnerID', {
            title : 'partnerID', 
            value : partnerID
        })
       

    }
    if(Object.keys(allSocketConnections).length >= 2) { 
        connectTwoRandomUsers()
    }

    //sending messages 
    socket.on('newMessage', ({partnerID , message}) => {
        socket.to(partnerID).emit('newMessage', message);
    })
    socket.on('userTyping', ({partnerID, userTyping}) => {
        socket.to(partnerID).emit('userTyping', {userTyping : userTyping});
    })
    socket.on('disconnecting', ({ partnerID}) => {
        console.log('i am running', partnerID)
        // socket.emit('totalConnections',  Object.keys(allSocketConnections).length);

        if(!(partnerID in allSocketConnections) && partnerID !== undefined ) {
            allSocketConnections[partnerID] = partnerID;
            if(Object.keys(allSocketConnections).length >= 2) { 
                connectTwoRandomUsers()
            }
        }
    })



    //=======================================================================================================
    //chat specific page events handling
    //=======================================================================================================

    
    
    
    

  });
  


server.listen(3000, () => {
    console.log("server is running at http://localhost:3000");
})
