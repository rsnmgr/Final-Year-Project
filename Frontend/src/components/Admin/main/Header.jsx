import React, { useState, useEffect, useContext } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { LoginContext } from '../../ContextProvider/Context';
import { useNavigate } from 'react-router-dom';
import DropDown from './DropDown';
import io from 'socket.io-client';
import { IoNotifications } from "react-icons/io5";
import Notification from './Notification';

const API_URL = import.meta.env.VITE_API_URL;

export default function Header({ toggleSidebar, profileClick, profile, setProfile, title, setSidebar }) {
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const userId = loginData?.validUser?._id;
  const socket = io(`${API_URL}`);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(false);

  // Toggle notification panel and ensure profile dropdown is closed
  const notificationToggle = () => {
    setNotification(!notification);
    setProfile(false); // Close profile dropdown when opening notifications
  };

  // Toggle profile dropdown and ensure notification panel is closed
  const handleProfileClick = () => {
    setProfile(!profile);
    setNotification(false); // Close notifications when opening the profile dropdown
  };

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
        <div className='flex items-center space-x-3'>
          {/* Notification Icon with Badge */}
          <div className="relative cursor-pointer" onClick={notificationToggle}>
            <label className="absolute -top-1 -right-1 text-xs text-white bg-green-900 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer">
              4
            </label>
            <IoNotifications size={24} />
          </div>

          {/* Profile Icon */}
          <div onClick={handleProfileClick} className='cursor-pointer'>
            {userData && userData.image ? (
              <img src={`${API_URL}/${userData.image}`} alt="" className='w-6 h-6 rounded-full border border-gray-400 object-cover' />
            ) : (
              <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-400">
                {userData?.name?.[0]}
              </h1>
            )}
          </div>
        </div>
      </div>

      {/* Profile Dropdown Menu */}
      {profile && (
        <div className='absolute right-0 top-0 bg-gray-900 h-screen border-l border-gray-600 rounded-l-2xl p-4 z-50'>
          <DropDown profileClick={handleProfileClick} setSidebar={setSidebar} userData={userData} />
        </div>
      )}

      {/* Notification Panel */}
      {notification && (
      <div className='absolute right-0 md:right-10 top-12 md:w-1/2 lg:w-1/4 bg-gray-900  md:h-[66%] border-l border-y border-gray-600 md:rounded-l-2xl z-50 flex flex-col'> 
        {/* Header */}
        <Notification setNotification={setNotification}/>
      </div>
      )}

    </div>
  );
}
