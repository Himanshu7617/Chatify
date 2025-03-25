import React, { useEffect, useState} from 'react'
import Header from '../components/Header'
import { socket } from '../socket';

const ChatSpecific = () => {

  const [partnerID, setPartnerID] = useState();
  const [guestName, setGuestName] = useState();
  const [partnerGuestName, setPartnerGuestName] = useState();


  //handling socket event 

  useEffect( ( ) => {

  },[])
  //connecting to socket 
      useEffect(() => {
          function connect(socket) {
              socket.connect();
          }
          function disconnect(socket) {
  
              socket.disconnect();
  
          }
          connect(socket)
  
  
          return () => {
              disconnect(socket)
          }
      },[]); 





  return (
    <div>
        <Header/>
        still to develop

    </div>
  )
}

export default ChatSpecific