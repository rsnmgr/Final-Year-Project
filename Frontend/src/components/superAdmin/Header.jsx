import React from 'react'
/* React Icons */
import { GiHamburgerMenu } from "react-icons/gi";

/* Import Default Image */
import img from '../../assets/defaultImg.png';
export default function Header({toggleSidebar,title}) {
  return (
    <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
            <GiHamburgerMenu size={20} onClick={toggleSidebar} className='cursor-pointer'/>
            <h1 >{title}</h1>
        </div>
        <div>
            <img src={img} alt="" className='w-6 h-6 rounded-full bg-gray-800 object-cover'/>
        </div>
    </div>
  )
}
