import React from 'react'

const Events = ({events}) => {
  return (
    <ul>
        {
            events.map((event, index) => {
                <li key={index}> {event}</li>
            })
        }
    </ul>
  )
}

export default Events