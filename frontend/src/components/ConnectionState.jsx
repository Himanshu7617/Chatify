import React from 'react'

const ConnectionState = ( { isConnected }) => {
  return (
    <div>
        State : {'' + isConnected}
    </div>
  )
}

export default ConnectionState