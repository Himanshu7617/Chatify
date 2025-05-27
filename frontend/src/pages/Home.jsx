import React, { useContext } from 'react'
import { globalContext } from '../context/GlobalContext'
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const Home = () => {


    const { userGuestName, setUserGuestName } = useContext(globalContext);
    const navigate = useNavigate();

    function handleChatNowEvent(e) { 
        e.preventDefault();
        if(userGuestName.length <= 0) { 
            alert("Enter guest Name first!!!");
            return ;
        }
        navigate('/dashboard')

    }
    return (
        <>
            <Header />
            <div className='h-[90vh] w-full flex justify-center items-center '>
                <div className='h-fit w-fit p-2 md:p-4 lg:p-8 gap-4 flex flex-col  border-2 border-black rounded-sm md:rounded-lg '>
            
                    <p>Guest Name : </p>
                    <input type='text' placeholder='guest name' value={userGuestName} required onChange={e => setUserGuestName(e.target.value)} />
                    <button  onClick={handleChatNowEvent} className='w-full p-4 bg-black text-white rounded-sm md:rounded-lg cursor-pointer'>Chat Now</button>
                </div>

            </div>
        </>
    )
}

export default Home