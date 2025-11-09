import middlewares from "../middlewares/middleware.js";

export default function registerChatSpecificSocket(io) {
  const chatSpecific = io.of("/chat-specific"); //namespace for chat specific

  let allChatSpecificSockets = []; // to keep track of all connected sockets

  chatSpecific.use(middlewares.checkUserName);
  chatSpecific.use((socket, next) =>
    middlewares.checkUserID(socket, allChatSpecificSockets, next)
  );

  chatSpecific.on("connection", (socket) => {

    //disconnect event 
    socket.on("disconnect", () => {
      const index = allChatSpecificSockets.findIndex(
        (s) => s.userID === socket.userID
      );
      if( index !== -1 && allChatSpecificSockets[index].connected && allChatSpecificSockets[index].partnerID.length() > 0) {
        socket.to(allChatSpecificSockets[index].partnerID).emit("chatSpecific-partner-disconnected", { message: "Your chat partner has disconnected." }); 
        allChatSpecificSockets.splice(index, 1);
      }
      
    });

    socket.emit("chatSpecific-user-ID", { userID: socket.userID });
    console.log(allChatSpecificSockets.map((s) => s.userID));
   
    socket.on("chatSpecific-connect-to-partner", (data) => {
        console.log("Request to connect to partnerID: ", data.partnerID);
      const partnerSocket = allChatSpecificSockets.find(
        (s) => s.userID === data.partnerID
      );

      if (!partnerSocket) {
        socket.emit("chatSpecific-error", {
          message: "Partner not found or not connected",
        });
        return;
      }

      if (partnerSocket.connected) {
        socket.emit("chatSpecific-error", {
          message: "Partner is already connected to someone else",
        });
        return;
      }

      // update both sockets as connected
      socket.connected = true;
      socket.partnerID = partnerSocket.userID;
      partnerSocket.connected = true;
      partnerSocket.partnerID = socket.userID;

      socket
        .to(partnerSocket.userID)
        .emit("chatSpecific-connected", {
          partnerID: socket.userID,
          partnerUserName: socket.userName,
        });
      socket
        .emit("chatSpecific-connected", {
          partnerID: partnerSocket.userID,
          partnerUserName: partnerSocket.userName,
        });
    });


    socket.on("chatSpecific-new-message", ({ partnerID, message }) => {
      console.log("New message for partnerID: ", partnerID);
      socket
        .to(partnerID)
        .emit("chatSpecific-new-message", { newMessage: message });
    });

    socket.on("chatSpecific-user-typing", ({ partnerID, userTyping }) => {
      socket.to(partnerID).emit("chatSpecific-user-typing", {
        userTyping: userTyping,
      });
    }); 

    // every socket is joining a room with its own ID
    socket.join(socket.userID);
  });
}
