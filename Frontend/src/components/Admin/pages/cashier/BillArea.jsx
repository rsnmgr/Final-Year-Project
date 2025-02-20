import React,{useContext, useState,useEffect} from 'react'
import { LoginContext } from '../../../ContextProvider/Context';
import io from 'socket.io-client';
// Page
import Dinein from './billarea/Dinein';
import TakeAway from './billarea/TableBooking';
import Delivery from './billarea/Delivary';
import TableBooking from './billarea/TableBooking';

export default function BillArea({setSelectedTable}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const socket = io(API_URL);
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;
  const [userData,setUserData] = useState();
  const [selectedTab, setSelectedTab] = useState('dinein');

  const renderSelectedPage = () => {
    switch (selectedTab) {
      case 'dinein':
        return <Dinein setSelectedTable={setSelectedTable}/>;
      case 'takeaway':
        return <TakeAway />;
      case 'delivery':
        return <Delivery />;
      case 'tablebooking':
        return <TableBooking />;
      default:
        return <Dinein />;
    }
  };

  const fetchUserData = async ()=>{
    try {
      const res = await fetch(`${API_URL}/api/fetch/${userId}`);
      if(res.ok){
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      console.log("Error fetching user data",error)
    }
  }
  useEffect(() => {
      if (userId) fetchUserData();
      socket.on('userUpdated', fetchUserData);
      return () => socket.off('userUpdated', fetchUserData);
    }, [userId]);
  return (
    <div>
      <div className='border border-gray-800 p-1'>
        <div className=''>
          <div className='hidden md:flex flex-col justify-center items-center border-b border-gray-800 '>
          <h1>{userData?.customer?.restaurant}</h1>
          <h2>{userData?.customer?.name}({userData?.customer?.address})</h2>
        </div>
        <div className='grid grid-cols-4  border-b border-gray-800'>
          <button className={`border border-gray-800 p-2 ${selectedTab === 'dinein' ? "bg-gray-900":""}`}onClick={() => setSelectedTab('dinein')}>Dine In</button>
          <button className={`border border-gray-800 p-2 ${selectedTab === 'takeaway' ? "bg-gray-800":""}`}onClick={() => setSelectedTab('takeaway')}>Take Away</button>
          <button className={`border border-gray-800 p-2 ${selectedTab === 'delivery' ? "bg-gray-800":""}`}onClick={() => setSelectedTab('delivery')}>Delivery</button>
          <button className={`border border-gray-800 p-2 ${selectedTab === 'tablebooking' ? "bg-gray-800":""}`}onClick={() => setSelectedTab('tablebooking')}>Table Booking</button>
        </div>
      </div>
      <div>
        {renderSelectedPage()}
      </div>
      </div>
    </div>
  )
}
