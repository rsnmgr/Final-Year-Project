import React from 'react'
import { RxCross1 } from "react-icons/rx";
import { MdOutlineMailOutline } from "react-icons/md";
import { MdPhoneInTalk } from "react-icons/md";
import { PiMapPinArea } from "react-icons/pi";
import { MdEdit } from "react-icons/md";
import img from '../../assets/defaultImg.png';
export default function DropDown() {
  return (
    <div className="absolute md:top-4 w-full h-auto md:w-[25vw] md:right-[0px] bg-gray-900 p-4 rounded-md z-50">
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
            <h1 className="text-lg font-semibold">My Profile</h1>
            <RxCross1
              size={20}
              className="cursor-pointer"
            />
          </div>

          {/* Profile Picture */}
          <div className="flex justify-between items-center">
            <div className='flex justify-start gap-3 items-center'>
                <img className='rounded-full w-12 h-12' src={img} alt="" />
                <div className='space-y-[-2px]'>
                    <span >Roshan Thapa Magar</span>
                    <span className='block text-sm'>roshanmagar@gmail.com</span>
                </div>
            </div>
            <div className=' hover:bg-gray-800 rounded-full p-1 cursor-pointer' title='Edit'>
                <MdEdit size={20}/>
            </div>
          </div>

          {/* Buttons */}
          <div className='mt-2'>
            <button className="w-full px-4 py-2 text-white bg-gray-800 rounded-sm hover:bg-red-700 transition">
              Log Out
            </button>
          </div>
    </div>
  )
}
