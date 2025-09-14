import { v4 as uuIDv4 } from "uuid";

const middlewares = {
  checkUserName: (socket, next) => {
    const userName = socket.handshake.auth.userName;

    if (!userName) {
      console.log("InvalID userName");
      return next(new Error("InvalID userName"));
    }

    socket.userName = userName;
    next();
  },

  checkUserID: (socket, allSockets, next) => {
    const userID =socket.handshake.auth.userID;


    
    if (userID && userID.length > 0) {
      socket.userID = userID[0].userID;
      return next();
    }
    const randomUserID = uuIDv4();
    socket.userID = randomUserID;
    //check for partner ID

    if (
      socket.handshake.auth.partnerID &&
      socket.handshake.auth.partnerUserName
    ) {
      socket.partnerID = socket.handshake.auth.partnerID;
      socket.partnerUserName = socket.handshake.auth.partnerUserName;
      allSockets.push({
        userID: socket.userID,
        userName: socket.userName,
        connected: true,
        partnerID: socket.partnerID,
      });
    } else {
      allSockets.push({
        userID: socket.userID,
        userName: socket.userName,
        connected: false,
        partnerID: "",
      });
    }

    next();
  },
};

export default middlewares;
