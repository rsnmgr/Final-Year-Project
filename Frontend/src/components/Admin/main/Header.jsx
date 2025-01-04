import React, { useState, useEffect, useContext } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { LoginContext } from '../../ContextProvider/Context';
import { useNavigate } from 'react-router-dom';
import DropDown from './DropDown';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

export default function Header({ toggleSidebar, profileClick, profile, title, setSidebar }) {
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const userId = loginData?.validUser?._id;
  const socket = io(`${API_URL}`);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      if (userId) {
        const res = await fetch(`${API_URL}/api/fetch/${userId}`, {
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
    fetchUserData();

    socket.on('userUpdated', fetchUserData);
    socket.on('userDeleted', fetchUserData);

    return () => {
      socket.off('userUpdated', fetchUserData);
      socket.off('userDeleted', fetchUserData);
    };
  }, [userId]);

  return (
    <div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
          <GiHamburgerMenu size={20} onClick={toggleSidebar} className='cursor-pointer' />
          <h1>{title}</h1>
        </div>
        <div onClick={profileClick} className='cursor-pointer'>
          {userData && userData.image ? (
            <img src={`${API_URL}/${userData.image}`} alt="" className='w-6 h-6 rounded-full border border-gray-400 object-cover' />
          ) : (
            <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-400">
              {userData?.name?.[0]}
            </h1>
          )}
        </div>
      </div>
      {profile && (
        <div className='absolute right-0 top-0 bg-gray-900 h-screen border-l border-gray-600 rounded-l-2xl p-4 z-50'>
          <DropDown profileClick={profileClick} setSidebar={setSidebar} userData={userData} />
        </div>
      )}
    </div>
  );
}
