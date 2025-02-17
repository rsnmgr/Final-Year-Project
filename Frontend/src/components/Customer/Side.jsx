import React, { useState, useContext } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CustomerContext } from '../ContextProvider/CustomerContext';

export default function Side({setSidebar}) {
  const {customerData} = useContext(CustomerContext);
  const navigate = useNavigate();
  const handleBillClick = () => {
    navigate('/menu/bill');
    setSidebar(false);
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg ">
      <div className='p-[5.5px] flex justify-between items-center border-b border-gray-700'> 
        <div className="bg-gray-700 p-2 rounded-full hover:bg-gray-800 cursor-pointer transition duration-300"onClick={()=>setSidebar(false)}>
          <FaArrowRight  />
        </div>
        <div>
          <h1>{customerData?.validUser?.friendCode}</h1>
        </div>
      </div>
      <ul>
        <li className="w-full flex justify-center p-2 cursor-pointer hover:text-gray-300 hover:bg-gray-800" onClick={handleBillClick}>My Bill</li>
      </ul>
    </div>
  );
} 