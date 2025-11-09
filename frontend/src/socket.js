import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';


export const socket = io(BASE_URL, {
    reconnectionAttempts : 10, 
    reconnectionDelay : 2000,
    autoConnect : false,
})

export const chatSpecificSocket = io(BASE_URL + "/chat-specific", {
    autoConnect: false,
});

export const chatRandomSocket = io(BASE_URL + "/chat-random" , {
    autoConnect: false,
});

export const chatMultipleSocket = io(BASE_URL + "/chat-multiple", { 
    autoConnect: false,
})
