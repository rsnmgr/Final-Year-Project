import React, { useState,useEffect,useContext } from 'react'
/* React Icons */
import { GiHamburgerMenu } from "react-icons/gi";
import DropDown from './DropDown';
import io from 'socket.io-client';

/* Import Default Image */
import img from '../../../assets/defaultImg.png';
import { LoginContext } from '../../ContextProvider/Context';
export default function Header({toggleSidebar,profileClick,profile,title,handlePageChange}) {
  const {loginData, setLoginData} = useContext(LoginContext)
  const [userData, setUserData] = useState(null);
  const userId = loginData?.validUser?._id;
  const socket = io(`http://localhost:8000`);
  const fetchUserData = async () => {
    try {
      if (userId) {
        const res = await fetch(`http://localhost:8000/api/fetch/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data.customer);
        } else {
          console.error("Error fetching user data");
        }
      }
    } catch (error) {
      console.error("Fetch user data failed", error);
    }
  };
  useEffect(() => {
    fetchUserData(); // Initial fetch

    socket.on('userUpdated', fetchUserData); // Fetch data on user update
    socket.on('userDeleted', fetchUserData); // Fetch data on user

    return () => {
      socket.off('userUpdated', fetchUserData); // Cleanup the event listener
      socket.off('userDeleted', fetchUserData); // Cleanup the event listener
    };
  }, [userId]);
  return (
    <div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
            <GiHamburgerMenu size={20} onClick={toggleSidebar}  className='cursor-pointer'/>
            <h1 >{title}</h1>
        </div>
        <div onClick={profileClick} className='cursor-pointer'>
          {userData && userData.image ? (
            <img src={`http://localhost:8000/${userData.image}`} alt="" className='w-6 h-6 rounded-full bg-gray-800 object-cover'/>
          ) : (
            <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-600">
              {userData?.name?.[0]}
            </h1>
          )}
        </div>
        
      </div>
      {profile &&(
      <div className='absolute  right-0 top-0 bg-gray-900 h-screen border-l border-gray-600 rounded-l-2xl p-4'>
        <DropDown profileClick={profileClick} handlePageChange={handlePageChange} userData={userData}/>
      </div>
      )}
    </div>
  )
}
