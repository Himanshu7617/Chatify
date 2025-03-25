import { createContext, useState } from "react"



export const globalContext = createContext(null);
  

const GlobalContext = ( {children} ) => {
  const [theme, setTheme] = useState('light');


  const contextValues = {theme, setTheme}
  return (
    <globalContext.Provider value={ contextValues}>
      {children}
    </globalContext.Provider>
  )
}

export default GlobalContext