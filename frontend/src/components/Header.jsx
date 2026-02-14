import React from 'react'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);



const Header = () => {

  useGSAP(() => {
    gsap.to('.heading', {
      backgroundColor : "black",
      color : "green", 
      borderColor : "green", 
      duration : .5, 
      repeat : -1,
      ease: "sine.inOut"
    });
  })
  return (
    <div className='flex  justify-center p-4'>
        <h1 className=' heading lg:text-6xl md:text-3xl text-2xl font-pixel border-2 rounded-lg px-8'>
         CHATRETRO
        </h1>

      </div>
  )
}

export default Header