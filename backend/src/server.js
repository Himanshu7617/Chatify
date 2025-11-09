import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import registerChatRandomSocket from "./sockets/chatRandom.js";
import registerChatMultipleSocket from "./sockets/chatMultiple.js";
import registerChatSpecificSocket from "./sockets/chatSpecific.js";

const app = express();
const server = createServer(app); // needed to create http server for socket.io

// setting up socket server

const io = new Server(server, {
    cors : "http://localhost:5173", 
});

//registering to respective namespaces 

registerChatRandomSocket(io);
registerChatMultipleSocket(io);;
registerChatSpecificSocket(io);


server.listen(3000, () => { 
    console.log("Server is running on port 3000");
});

