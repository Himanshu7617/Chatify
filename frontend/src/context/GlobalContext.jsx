/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react"



export const globalContext = createContext(null);
  

const GlobalContext = ( {children} ) => {
  const [theme, setTheme] = useState('light');
  const [userGuestName, setUserGuestName] = useState('');
  const [chatRandomUserID, setChatRandomUserID] = useState('');
  const [chatMultipleUserID, setChatMultipleUserID] = useState('');
  const [chatMultipleAllRooms, setChatMultipleAllRooms] = useState([]);
  const TOTAL_IMAGES_FOR_HOME_PAGE = 16;

  const contextValues = {TOTAL_IMAGES_FOR_HOME_PAGE, theme, setTheme, chatRandomUserID, setChatRandomUserID,chatMultipleAllRooms,setChatMultipleAllRooms, userGuestName, setUserGuestName, chatMultipleUserID, setChatMultipleUserID, }
  return (
    <globalContext.Provider value={ contextValues}>
      {children}
    </globalContext.Provider>
  )
}

export default GlobalContext