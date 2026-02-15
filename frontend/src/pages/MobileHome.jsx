import React from 'react'
import BrickBG from '../assets/brickBackground.svg';


const MobileHome = () => {
  return (
    <div className='w-full h-full font-pixel overflow-hidden flex justify-center '>
            <img src={BrickBG} className='h-full absolute w-full object-cover z-[-1000]' />
      
      <p className='border-4 border-[#6d350f] bg-[#f1b58d] p-4 m-10'> Sorry! Only available on desktop size devices</p>
      
      </div>
  )
}

export default MobileHome