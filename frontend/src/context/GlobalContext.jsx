/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react"



export const globalContext = createContext(null);
  

const GlobalContext = ( {children} ) => {
  const [theme, setTheme] = useState('light');
  const [userGuestName, setUserGuestName] = useState('');
  const [chatRandomUserID, setChatRandomUserID] = useState('');
  const [chatMultipleUserID, setChatMultipleUserID] = useState('');
  const [videoChatRandomUserID, setVideoChatRandomUserID] = useState('');
  const [chatMultipleAllRooms, setChatMultipleAllRooms] = useState([]);

  const contextValues = {theme, setTheme, chatRandomUserID, setChatRandomUserID,chatMultipleAllRooms,setChatMultipleAllRooms, userGuestName, setUserGuestName, chatMultipleUserID, setChatMultipleUserID, videoChatRandomUserID, setVideoChatRandomUserID}
  return (
    <globalContext.Provider value={ contextValues}>
      {children}
    </globalContext.Provider>
  )
}

export default GlobalContext