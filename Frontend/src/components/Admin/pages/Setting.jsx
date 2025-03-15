import React, { useState, useEffect, useContext } from 'react';
import img from '../../../assets/defaultImg.png';
import Sidebar from './Setting/Sidebar';
import Profile from './Setting/pages/Profile';
import Account from './Setting/pages/Account';
import Notification from './Setting/pages/Notification';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../../ContextProvider/Context';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

export default function Setting() {
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const [activePage, setActivePage] = useState('Profile');
  const userId = loginData?.validUser?._id;
  const navigate = useNavigate();
  const socket = useState(() => io(API_URL))[0];

  useEffect(() => {
    if (userId) fetchUserData();
    socket.on('userUpdated', fetchUserData);
    socket.on('userDeleted', fetchUserData);
    return () => {
      socket.off('userUpdated', fetchUserData);
      socket.off('userDeleted', fetchUserData);
    };
  }, [userId, socket]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/fetch/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserData(data.customer);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const renderActivePage = () => {
    const pages = {
      Profile: <Profile />,
      Account: <Account />,
      Notification: <Notification />,
    };
    return pages[activePage] || <Profile />;
  };

  return (
    <div className="p-3 space-y-4 max-w-screen-lg">
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src={userData?.image ? `${API_URL}/${userData.image}` : img}
            alt="Profile"
            className="w-12 h-12 object-cover rounded-full border cursor-pointer"
          />
          <div>
            <span className="text-lg font-medium">{userData?.name || 'Loading...'}</span>
            <span className="block text-sm text-gray-400">Your personal account</span>
          </div>
        </div>
        <button
          className="p-1 bg-gray-900 px-3 rounded-md text-sm border border-gray-700"
          onClick={() => { navigate('/admin/profile'); setActivePage('Profile'); }}
        >
          Go to your personal profile
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4">
        <div className="w-full md:w-1/5 mb-4 md:mb-0">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        </div>
        <div className="w-full md:w-4/5">{renderActivePage()}</div>
      </div>
    </div>
  );
}
