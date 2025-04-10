// import  { useState, useEffect, useContext } from 'react';
// import { GiHamburgerMenu } from "react-icons/gi";
// import { LoginContext } from '../../ContextProvider/Context';
// import DropDown from './DropDown';
// import io from 'socket.io-client';
// import { IoNotifications } from "react-icons/io5";
// import Notification from './Notification';

// const API_URL = import.meta.env.VITE_API_URL;

// export default function Header({ toggleSidebar, profile, setProfile, title, setSidebar }) {
//   const { loginData } = useContext(LoginContext);
//   const [userData, setUserData] = useState(null);
//   const userId = loginData?.validUser?._id;
//   const socket = io(`${API_URL}`);
//   const [notification, setNotification] = useState(false);

//   // Toggle notification panel and ensure profile dropdown is closed
//   const notificationToggle = () => {
//     setNotification(!notification);
//     setProfile(false); // Close profile dropdown when opening notifications
//   };

//   // Toggle profile dropdown and ensure notification panel is closed
//   const handleProfileClick = () => {
//     setProfile(!profile);
//     setNotification(false); // Close notifications when opening the profile dropdown
//   };

//   const fetchUserData = async () => {
//     try {
//       if (userId) {
//         const res = await fetch(`${API_URL}/api/fetch/${userId}`, {
//           method: "GET",
//           headers: { "Content-Type": "application/json" },
//         });
//         if (res.ok) {
//           const data = await res.json();
//           setUserData(data.customer);
//         } else {
//           console.error("Error fetching user data");
//         }
//       }
//     } catch (error) {
//       console.error("Fetch user data failed", error);
//     }
//   };

//   useEffect(() => {
//     fetchUserData();

//     socket.on('userUpdated', fetchUserData);
//     socket.on('userDeleted', fetchUserData);

//     return () => {
//       socket.off('userUpdated', fetchUserData);
//       socket.off('userDeleted', fetchUserData);
//     };
//   }, [userId]);

//   return (
//     <div>
//       <div className='flex justify-between items-center'>
//         <div className='flex items-center space-x-3'>
//           <GiHamburgerMenu size={20} onClick={toggleSidebar} className='cursor-pointer' />
//           <h1>{title}</h1>
//         </div>
//         <div className='flex items-center space-x-3'>
//           {/* Notification Icon with Badge */}
//           <div className="relative cursor-pointer" onClick={notificationToggle}>
//             <label className="absolute -top-1 -right-1 text-xs text-white bg-red-700 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer">
//               0
//             </label>
//             <IoNotifications size={24} />
//           </div>

//           {/* Profile Icon */}
//           <div onClick={handleProfileClick} className='cursor-pointer'>
//             {userData && userData.image ? (
//               <img src={`${API_URL}/${userData.image}`} alt="" className='w-6 h-6 rounded-full border border-gray-400 object-cover' />
//             ) : (
//               <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-400">
//                 {userData?.name?.[0]}
//               </h1>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Profile Dropdown Menu */}
//       {profile && (
//         <div className='absolute right-0 top-0 bg-gray-900 h-screen border-l border-gray-600 rounded-l-2xl p-4 z-50'>
//           <DropDown profileClick={handleProfileClick} setSidebar={setSidebar} userData={userData} />
//         </div>
//       )}

//       {/* Notification Panel */}
//       {notification && (
//       <div className='absolute right-0 md:right-10 top-12 md:w-1/2 lg:w-1/4 bg-gray-900  md:h-[66%] border-l border-y border-gray-600 md:rounded-l-2xl z-50 flex flex-col'> 
//         {/* Header */}
//         <Notification setNotification={setNotification}/>
//       </div>
//       )}

//     </div>
//   );
// }

import { useState, useEffect, useContext, useRef } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { IoNotifications } from "react-icons/io5";
import { LoginContext } from '../../ContextProvider/Context';
import DropDown from './DropDown';
import Notification from './Notification';
import SoundPlayer from '../../Notification/sound';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

export default function Header({ toggleSidebar, profile, setProfile, title, setSidebar }) {
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [tables, setTables] = useState({});
  const userId = loginData?.validUser?._id;
  const soundRef = useRef();
  const socketRef = useRef(null);

  const notificationToggle = () => {
    setNotification(!notification);
    setProfile(false);
  };

  const handleProfileClick = () => {
    setProfile(!profile);
    setNotification(false);
  };

  const fetchUserData = async () => {
    try {
      if (userId) {
        const res = await fetch(`${API_URL}/api/fetch/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUserData(data.customer);
        }
      }
    } catch (error) {
      console.error("Fetch user data failed", error);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tables/${userId}`);
      const data = await res.json();
      if (Array.isArray(data?.tables)) {
        const tableMap = data.tables.reduce((acc, table) => {
          acc[table._id] = table.name;
          return acc;
        }, {});
        setTables(tableMap);
      }
    } catch (err) {
      console.error("Error fetching tables", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${userId}`);
      const data = await res.json();
      if (Array.isArray(data?.orders)) {
        let formattedNotifications = [];
        data.orders.forEach((order) => {
          const tableId = order.tableId;
          const tableName = tables[tableId] || "Unknown Table";

          if (order.OrderHistory?.length > 0) {
            const sortedHistory = order.OrderHistory.sort(
              (a, b) => new Date(a.orderDate) - new Date(b.orderDate)
            );

            sortedHistory.forEach((history, index) => {
              formattedNotifications.push({
                tableId,
                tableName,
                message: index === 0
                  ? `A new order has been placed on Table ${tableName}`
                  : `Added order has been placed on Table ${tableName}`,
                timestamp: history.orderDate,
                type: index === 0 ? "newOrder" : "addedOrder",
              });
            });
          }
        });

        formattedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(formattedNotifications);
      }
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchTables();
  }, [userId]);

  useEffect(() => {
    if (Object.keys(tables).length > 0) {
      fetchOrders();
    }
  }, [tables]);

  useEffect(() => {
    socketRef.current = io(API_URL);

    const handleOrderAdded = (orderData) => {
      const tableName = tables[orderData.tableId] || "Unknown Table";
      const newNotification = {
        tableId: orderData.tableId,
        tableName,
        message: `A new order has been placed on Table ${tableName}`,
        timestamp: new Date().toISOString(),
        type: "newOrder",
      };

      setNotifications((prev) => {
        const isDuplicate = prev.some(
          (notif) => notif.tableId === newNotification.tableId && notif.timestamp === newNotification.timestamp
        );
        if (!isDuplicate) {
          soundRef.current?.playSound();
          return [newNotification, ...prev];
        }
        return prev;
      });
    };

    socketRef.current.on("userUpdated", fetchUserData);
    socketRef.current.on("userDeleted", fetchUserData);
    socketRef.current.on("orderAdded", handleOrderAdded);

    return () => {
      socketRef.current.disconnect();
    };
  }, [tables]);

  return (
    <div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-3'>
          <GiHamburgerMenu size={20} onClick={toggleSidebar} className='cursor-pointer' />
          <h1>{title}</h1>
        </div>
        <div className='flex items-center space-x-3'>
          <div className="relative cursor-pointer" onClick={notificationToggle}>
            <label className="absolute -top-1 -right-1 text-xs text-white bg-red-700 rounded-full h-4 w-4 flex items-center justify-center cursor-pointer">
              {notifications.length}
            </label>
            <IoNotifications size={20} />
          </div>

          <div onClick={handleProfileClick} className='cursor-pointer'>
            {userData?.image ? (
              <img
                src={`${API_URL}/${userData.image}`}
                alt=""
                className='w-6 h-6 rounded-full border border-gray-400 object-cover'
              />
            ) : (
              <h1 className="w-8 h-8 flex justify-center items-center rounded-full object-cover text-white font-bold border border-gray-400">
                {userData?.name?.[0]}
              </h1>
            )}
          </div>
        </div>
      </div>

      <SoundPlayer ref={soundRef} />

      {profile && (
        <div className='absolute right-0 top-0 bg-gray-900 h-screen border-l border-gray-600 rounded-l-2xl p-4 z-50'>
          <DropDown profileClick={handleProfileClick} setSidebar={setSidebar} userData={userData} />
        </div>
      )}

      {notification && (
        <div className='absolute right-0 md:right-10 top-12 md:w-1/2 lg:w-1/4 bg-gray-900 md:h-[66%] border-l border-y border-gray-600 md:rounded-l-2xl z-50 flex flex-col'>
          <Notification setNotification={setNotification} notifications={notifications} />
        </div>
      )}
    </div>
  );
}