import React, { useState } from 'react';
import Pending from "./kitchen/Pending";
import Preparing from "./kitchen/Preparing";
import Complete from "./kitchen/Complete";

export default function Kitchen() {
  const [status, setStatus] = useState("Pending");

  return (
    <div className='p-3'>
      <div className='flex justify-between items-center border-b border-gray-600 py-2'>
        <h1>Current Order Details</h1>
        <div className='flex justify-between items-center space-x-3'> 
          <button 
            onClick={() => setStatus("Pending")} 
            className='p-1 px-3 rounded-sm bg-red-900 cursor-pointer hover:bg-red-800'
          >
            Pending
          </button>
          <button 
            onClick={() => setStatus("Preparing")} 
            className='p-1 px-3 rounded-sm bg-yellow-900 cursor-pointer hover:bg-yellow-800'
          >
            Preparing
          </button>
          <button 
            onClick={() => setStatus("Complete")} 
            className='p-1 px-3 rounded-sm bg-green-900 cursor-pointer hover:bg-green-800'
          >
            Complete
          </button>
        </div>
      </div>
      <div className='mt-3'>
        {status === "Pending" && <Pending />}
        {status === "Preparing" && <Preparing />}
        {status === "Complete" && <Complete />}
      </div>
    </div>
  );
}
