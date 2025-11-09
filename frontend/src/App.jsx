import React from 'react'
import Dashboard from './pages/Dashboard'
import {Routes, Route} from 'react-router-dom'
import ChatRandom from './pages/ChatRandom'
import ChatSpecific from './pages/ChatSpecific'
import ChatMultiple from './pages/ChatMultiple'

import ChatRoom from './pages/ChatRoom'
import Home from './pages/Home'


const App = () => {
  return (
    <Routes>
      <Route path='/*' element={<Home/>} />
      <Route path='/home' element={<Home/>} />
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/chatrandom' element={<ChatRandom/>}/>
      <Route path='/chatspecific' element={<ChatSpecific/>}/>
      <Route path='/chatmultiple' element={<ChatMultiple/>}/>
      <Route path='/chatmultiple/:roomName/:roomID' element={<ChatRoom/>}/>
    </Routes>
  )
}

export default App