import React,{useContext} from 'react'
import { RxCross1 } from "react-icons/rx";
import { MdOutlineMailOutline } from "react-icons/md";
import { MdPhoneInTalk } from "react-icons/md";
import { PiMapPinArea } from "react-icons/pi";
import { MdEdit } from "react-icons/md";
import { MdEmojiEmotions } from "react-icons/md";
import { AiOutlineUser } from "react-icons/ai";
import { PiSignOutBold } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import { LoginContext } from '../../ContextProvider/Context';
import {useNavigate} from 'react-router-dom';
import img from '../../../assets/defaultImg.png';
const API_URL = import.meta.env.VITE_API_URL;

export default function DropDown({profileClick,setSidebar,userData}) {
  const {loginData, setLoginData} = useContext(LoginContext);
  const navigate = useNavigate();
  const handleItemClick = (page) => {
    setSidebar(false);
    profileClick(false);
    navigate(page); // Navigate to the respective page
  };

  const logOutUser = async() => {
    let token = localStorage.getItem("TokenFoodMe");
    const res = await fetch(`${API_URL}/api/logout`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      }
    });
    const data = await res.json();
    if(res.status === 201){
      localStorage.removeItem("TokenFoodMe");
      navigate("/login");
    }else{
      navigate("/*");
    }
  }
  return (
    <div className='text-slate-300 text-[12px]'>
          <div className='space-y-4 border-b border-gray-500'>
          <div className="flex justify-between items-center gap-8">
            <div className='flex justify-start gap-3 items-center'>
                {userData && userData.image ? (
                  <img src={`${API_URL}/${userData.image}`} alt="" className='w-6 h-6 rounded-full bg-gray-800 object-cover border border-gray-400 cursor-pointer'/>
                  ) : (
                    <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-400 cursor-pointer">
                      {userData?.name?.[0]}
                      </h1>
                )}
                <div className='space-y-[-2px] '>
                    <span >{userData.name}</span>
                    <span className='block text-slate-400'>{userData.email}</span>
                </div>
            </div>
            <div className='hover:bg-gray-800 rounded-full p-1 cursor-pointer' title='Edit' onClick={profileClick}>
                <RxCross1 size={16}/>
            </div>
          </div>
          <div className='flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer'>
            <MdEmojiEmotions size={18} className='text-slate-400'/>
            <span>Set status</span>
          </div>
          </div>
         <div className='mt-2' >
            <div className='flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer' onClick={() => handleItemClick('/admin/profile')}>
              <AiOutlineUser size={18} />
              <span>Your Profile</span>
            </div>
            <div className='flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer' onClick={() => handleItemClick('/admin/settings/profile')}>
              <IoSettingsOutline size={18} />
              <span>Setting</span>
            </div>
            <div className='flex justify-start items-center space-x-2 p-2 hover:bg-gray-800 rounded-md cursor-pointer' onClick={logOutUser}>
              <PiSignOutBold size={18} />
              <span>Sign Out</span>
            </div>
         </div>
         
    </div>
  )
}
