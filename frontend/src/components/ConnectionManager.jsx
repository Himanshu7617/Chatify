import React from 'react'
import { socket } from '../socket';

const ConnectionManager = () => {
    function connect() {
        socket.connect();
    }
    function disconnect() {
        socket.disconnect();
    }
  return (
    <div>
        <button onClick={connect}>Connect</button>
        <button onClick={disconnect}>Disconnect</button>
    </div>
  )
}

export default ConnectionManager