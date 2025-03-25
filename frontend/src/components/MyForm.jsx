import React, { useEffect, useState } from 'react';
import { socket } from '../socket';

export default function MyForm() {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msges, setMsges] = useState([]);

  
    useEffect(()=> {
        socket.on('new-msg', (msg) => {
            setMsges(prev => [...prev, msg]);
        })
    },[msges])
  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);



    socket.timeout(5000).emit('create-something', value, () => {
      setIsLoading(false);
    });
  }

  return (
    <form onSubmit={ onSubmit }>
        {msges && msges.map((i, idx) => {
            return <p key={idx}> {i}</p>
        })}
      <input className='outline-3 outline-black m-4  ' onChange={ e => setValue(e.target.value) } />

      <button className='inline bg-black text-white p-4 m-4 rounded-sm ' type="submit" disabled={ isLoading }>Submit</button>
    </form>
  );
}