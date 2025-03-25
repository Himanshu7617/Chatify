import { io } from 'socket.io-client';

const URL = 'http://localhost:3000';


export const socket = io(URL, {
    reconnectionAttempts : 10, 
    reconnectionDelay : 2000,
    autoConnect : false,
})