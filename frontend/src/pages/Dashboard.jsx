import { useContext, useState, useEffect } from 'react'
import Header from '../components/Header'
import BrickBG from '../assets/brickBackground.svg'
import RoomCard from '../assets/roomCard.svg'
import { useNavigate } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { globalContext } from '../context/GlobalContext'
import { Bouncy } from 'ldrs/react'
import 'ldrs/react/Bouncy.css'

gsap.registerPlugin(useGSAP)



const Dashboard = () => {

  const navigate = useNavigate();
  const { TOTAL_IMAGES_FOR_DASHBOARD_PAGE } = useContext(globalContext);


  const [loadedCount, setLoadedCount] = useState(0);
  const allLoaded = loadedCount === TOTAL_IMAGES_FOR_DASHBOARD_PAGE;
  function onImageLoadEvent() {
    console.log("loadedCount : ", loadedCount);
    setLoadedCount(prev => prev + 1);

  }


  useGSAP(() => {
    gsap.to('.heading', {
      backgroundColor: "black",
      color: "green",
      borderColor: "green",
      duration: .5,
      repeat: -1,
      ease: "sine.inOut"
    })
  })

  useEffect(() => {
    const images = [BrickBG, RoomCard];

    let loaded = 0;

    images.forEach(src => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        loaded++;

        if (loaded === images.length) {
          setLoadedCount(images.length);
        }
      };
    });
  }, [])
  return (
    <div className='h-[100vh] w-[100vw] relative overflow-hidden'>
      {
        !allLoaded && <div className='h-full w-full bg-[#f1b58d]  z-[9999] flex justify-center items-center'>

          <Bouncy
            size="45"
            speed="1.75"
            color="brown"
          />
        </div>
      }

      <img src={BrickBG} className='h-full absolute w-full object-cover z-[-1000]' />

      <div className='flex  justify-center p-4'>
        <h1 className=' heading lg:text-6xl md:text-3xl text-2xl font-pixel border-2 rounded-lg px-8'>
          CHATRETRO
        </h1>

      </div>

      <div className=' h-fit w-full z-10 p-6 flex absolute justify-center items-center flex-wrap '>
        <div onClick={() => { navigate('/chatrandom') }} className="md:[w-26rem] w-[20rem] lg:w-[30rem] md:h-[15rem] h-[10rem] lg:h-[20rem] flex justify-center items-center  m-2 relative">
          <p className='font-pixel md:text-2xl text-xl lg:text-4xl text-amber-900'> Chat Random</p>
          <img src={RoomCard} className='absolute z-[-100] h-full w-full' alt="" />
        </div>
        <div onClick={() => { navigate('/chatspecific') }} className="md:[w-26rem] w-[20rem] lg:w-[30rem] md:h-[15rem] h-[10rem] lg:h-[20rem] flex justify-center items-center  m-2 relative">
          <p className='font-pixel md:text-2xl text-xl lg:text-4xl text-amber-900'> Chat Specific</p>
          <img src={RoomCard} className='absolute z-[-100] h-full w-full' alt="" />
        </div>
        <div onClick={() => { navigate('/chatmultiple') }} className="md:[w-26rem] w-[20rem] lg:w-[30rem] md:h-[15rem] h-[10rem] lg:h-[20rem] flex justify-center items-center m-2 relative">
          <p className='font-pixel md:text-2xl text-xl lg:text-4xl text-amber-900'> Chat Multiple</p>
          <img src={RoomCard} className='absolute z-[-100] h-full w-full' alt="" />
        </div>


      </div>
    </div>
  )
}

export default Dashboard