import React, { useContext, useEffect } from 'react'
import { globalContext } from '../context/GlobalContext'
import Header from '../components/Header';
import homeScenery from '../assets/homeSceneryWithoutBranches.png';
import homeSceneryBG from '../assets/homeGrayBG.png';
import Branch1 from '../assets/Branches/branch1.png';
import Branch2 from '../assets/Branches/branch2.png';
import Branch3 from '../assets/Branches/branch3.png';
import Branch4 from '../assets/Branches/branch4.png';
import Branch5 from '../assets/Branches/branch5.png';
import Branch6 from '../assets/Branches/branch6.png';
import Branch7 from '../assets/Branches/branch7.png';
import Branch8 from '../assets/Branches/branch8.png';
import Branch9 from '../assets/Branches/branch9.png';
import Branch10 from '../assets/Branches/branch10.png';
import Branch11 from '../assets/Branches/branch11.png';
import BigBoard from '../assets/bigBoard.png';
import SmallBoard from '../assets/smallBoard.png';
import rock from '../assets/rock.png';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const DesktopHome = () => {


    const { userGuestName, setUserGuestName } = useContext(globalContext);
    const navigate = useNavigate();
    

    function handleChatNowEvent(e) {
        e.preventDefault();
        if (userGuestName.length <= 0) {
            alert("Enter guest Name first!!!");
            return;
        }
        localStorage.setItem('userGuestName', userGuestName);
        navigate('/dashboard')

    }

  

    useGSAP(() => {
        gsap.fromTo(
            '.branch-1',
            {
                rotation: 10,
                transformOrigin: 'top right',
            },
            {
                rotation: -10,
                duration: 5.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-2',
            {
                rotation: 10,
                transformOrigin: 'top right',
            },
            {
                rotation: -10,
                duration: 7.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-3',
            {
                rotation: 10,
                transformOrigin: 'top right',
            },
            {
                rotation: -10,
                duration: 6.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-4',
            {
                rotation: 7,
                transformOrigin: 'top right',
            },
            {
                rotation: -6,
                duration: 5.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-5',
            {
                rotation: 2,
                transformOrigin: 'top ',
            },
            {
                rotation: -4,
                duration: 5.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-6',
            {
                rotation: 1,
                transformOrigin: 'top right',
            },
            {
                rotation: -1,
                duration: 5.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-7',
            {
                rotation: 6,
                transformOrigin: 'top left',
            },
            {
                rotation: -5,
                duration: 5.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-8',
            {
                rotation: 1,
                transformOrigin: 'top left',
            },
            {
                rotation: -1,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-9',
            {
                rotation: 1,
                transformOrigin: 'top left',
            },
            {
                rotation: -1,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
        gsap.fromTo(
            '.branch-10',
            {
                rotation: 0.2,
                transformOrigin: 'top left',
            },
            {
                rotation: -0.2,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            }
        );
    });

    return (
        <div className='h-[100vh] w-full flex relative    justify-center items-center overflow-hidden overflow-y-hidden'>
            {/**Branches */}
            <div className='h-[100vh] pointer-events-none  w-fit relative flex  justify-center '>
                <div className='h-[50%] w-full flex absolute z-50 '>
                    <span className='h-full w-fit branch-1 absolute  right-34 top-[-2.5rem]  '>

                        <img src={Branch1} className="object-cover h-[55vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-2 absolute right-18 top-[-2.5rem]'>
                        <img src={Branch2} className="object-cover h-[70vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-3 absolute right-28 top-[-2.5rem]'>
                        <img src={Branch3} className="object-cover h-[55vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-4 absolute right-56 top-[-2.5rem]'>
                        <img src={Branch4} className="object-cover h-[40vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-5 absolute right-[25%] '>
                        <img src={Branch5} className="object-cover h-[30vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-6 absolute  right-[40%]'>
                        <img src={Branch6} className="object-cover h-[30vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-7 absolute left-[1rem] top-[-2.5rem]'>
                        <img src={Branch7} className="object-cover h-[60vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-8 absolute left-4 top-[-2.5rem]'>
                        <img src={Branch8} className="object-cover h-[65vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-9 absolute left-40 top-[-2.5rem]'>
                        <img src={Branch9} className="object-cover h-[40vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-10 left-[20%] absolute '>
                        <img src={Branch10} className="object-cover h-[28vh]" alt="" />
                    </span>
                    <span className='h-full w-fit branch-11 left-[30%] absolute '>
                        <img src={Branch11} className="object-cover h-[10vh]" alt="" />
                    </span>

                </div>
                <img src={homeScenery} className='h-full w-full object-contain  ' alt="" />
            </div>
            <img src={homeSceneryBG} className='h-full w-full object-cover z-[-100]  absolute ' alt="" />

            {/*rock and Board */}
            <div className='w-80 h-[30rem] bottom-24 z-0 absolute'>
                <img src={BigBoard} className='scale-[0.7] absolute right-[-1rem] rotate-6 bottom-[-9.5rem]' alt="" />
                <span className='font-pixel md:text-3xl right-6 rotate-6 top-[-1rem] p-4 absolute w-fit h-fit '>

                <h1 className='text-amber-800' >CHATRETRO</h1>
                <h1 className='text-amber-800'>LET'S CHAT</h1>
                </span>
                <input value={userGuestName} onChange={(e) => {setUserGuestName(e.target.value)}} type="text" className='absolute z-[1000] top-[30%] rotate-[-12deg] h-20 w-48 left-[-1rem] text-amber-800 md:text-3xl font-pixel bg-none appearance-none outline-none ring-0 focus:ring-0 ' placeholder="Guest Name" />
                <img src={SmallBoard} className='scale-[0.7] absolute left-[-4rem] rotate-[-12deg] ' alt="" />
                
                <img src={rock} className='scale-[0.6] absolute bottom-[-4rem]' alt="" />
            </div>


            <button onClick={handleChatNowEvent} className='absolute p-4 px-8 font-pixel border-2 cursor-pointer hover:bg-green-600 bg-black  hover:opacity-100 hover:border-green-600 hover:text-white border-green-500 right-32 bottom-16 md:text-3xl md:rounded-2xl text-green-500'>START CHAT</button>

            {/* <div className='h-[90vh] w-full flex justify-center items-center '>
                <div className='h-fit w-fit p-2 md:p-4 lg:p-8 gap-4 flex flex-col  border-2 border-black rounded-sm md:rounded-lg '>

                    <p>Guest Name : </p>
                    <input type='text' placeholder='guest name' value={userGuestName} required onChange={e => setUserGuestName(e.target.value)} />
                    <button onClick={handleChatNowEvent} className='w-full p-4 bg-black text-white rounded-sm md:rounded-lg cursor-pointer'>Chat Now</button>
                </div>

            </div> */}
        </div>
    )
}

export default DesktopHome