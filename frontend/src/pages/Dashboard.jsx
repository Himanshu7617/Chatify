import React from 'react'
import Header from '../components/Header'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {4
    const navigate = useNavigate();

  return (
    <div>
        <Header/>
        <main className=' h-fit w-full p-6 flex justify-center items-center flex-wrap '>
            <div onClick={() => { navigate('/chatrandom')}} className=' w-4/5 md:w-3/5 lg:w-2/5 h-fit py-20 px-4 m-4 flex justify-center items-center text-xl md:text-2xl lg:text-3xl cursor-pointer hover:border-4 hover-scale-1.4 hover:border-red-700 bg-red-300 rounded-sm md:rounded-lg lg:rounded-3xl'>chat random</div>
            <div onClick={() => { navigate('/chatspecific')}} className=' w-4/5 md:w-3/5 lg:w-2/5 h-fit py-20 px-4 m-4 flex justify-center items-center text-xl md:text-2xl lg:text-3xl cursor-pointer hover:border-4 hover-scale-1.4 hover:border-pink-700 bg-pink-300 rounded-sm md:rounded-lg lg:rounded-3xl'>chat specific</div>
            <div onClick={() => { navigate('/chatmultiple')}} className=' w-4/5 md:w-3/5 lg:w-2/5 h-fit py-20 px-4 m-4 flex justify-center items-center text-xl md:text-2xl lg:text-3xl cursor-pointer hover:border-4 hover-scale-1.4 hover:border-blue-700 bg-blue-300 rounded-sm md:rounded-lg lg:rounded-3xl'>chat multiple</div>
            
        </main>
    </div>
  )
}

export default Dashboard