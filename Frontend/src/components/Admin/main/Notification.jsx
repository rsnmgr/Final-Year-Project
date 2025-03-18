import React from "react";
import { RxCross2 } from "react-icons/rx";
import { IoLogoTableau } from "react-icons/io5";

export default function Notification({ setNotification }) {
  return (
    <div>
      <div className="flex justify-between items-center p-2 px-4  border-b border-gray-600">
        <h1>Notification</h1>
        <RxCross2
          size={20}
          className="cursor-pointer"
          onClick={() => setNotification(false)}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Example Notification Item */}
        <div className="flex px-4 space-x-3 border-b border-gray-600 py-2 hover:bg-gray-800 cursor-pointer">
          <IoLogoTableau size={20} />
          <div className="text-sm text-gray-300">
            <p className="leading-tight mb-0.5">
              A New table order (Table T1) has been placed
            </p>
            <span className="text-[12px] text-gray-400 block -mt-0.5">
              March 10, 2025 at 10:37 AM
            </span>
          </div>
        </div>
        {/* Add more notifications here */}
      </div>
    </div>
  );
}



// import React, { useState, useEffect, useContext, useRef } from "react";
// import { RxCross2 } from "react-icons/rx";
// import { IoLogoTableau } from "react-icons/io5";
// import axios from "axios";
// import io from "socket.io-client";
// import { LoginContext } from "../../ContextProvider/Context";
// import notificationSound from "../../../assets/notification.wav";

// const API_URL = import.meta.env.VITE_API_URL;
// const socket = io(API_URL);

// export default function Notification({ setNotification }) {
//   const { loginData } = useContext(LoginContext);
//   const AdminId = loginData?.validUser?._id;
//   const [notifications, setNotifications] = useState([]);
//   const [tables, setTables] = useState({}); // Store tables as { tableId: tableName }

//   const audioRef = useRef(new Audio(notificationSound)); // Create audio element

//   // Function to play the notification sound
//   const playNotificationSound = () => {
//     if (audioRef.current) {
//       audioRef.current.currentTime = 0; // Reset to start
//       audioRef.current
//         .play()
//         .catch((error) => console.error("Audio play failed:", error));
//     }
//   };

//   useEffect(() => {
//     if (!AdminId) return;

//     const fetchTables = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/api/tables/${AdminId}`);
//         if (Array.isArray(response.data?.tables)) {
//           const tableMap = response.data.tables.reduce((acc, table) => {
//             acc[table._id] = table.name;
//             return acc;
//           }, {});
//           setTables(tableMap);
//         }
//       } catch (error) {
//         console.error("Error fetching tables:", error);
//       }
//     };

//     const fetchOrders = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/api/orders/${AdminId}`);
//         if (Array.isArray(response.data?.orders)) {
//           let formattedNotifications = [];

//           response.data.orders.forEach((order) => {
//             const tableId = order.tableId;
//             const tableName = tables[tableId] || "Unknown Table";

//             if (order.OrderHistory && order.OrderHistory.length > 0) {
//               const sortedHistory = order.OrderHistory.sort(
//                 (a, b) => new Date(a.orderDate) - new Date(b.orderDate)
//               );

//               sortedHistory.forEach((history, index) => {
//                 formattedNotifications.push({
//                   tableId,
//                   tableName,
//                   message:
//                     index === 0
//                       ? `A new order has been placed on Table ${tableName}`
//                       : `Added order has been placed on Table ${tableName}`,
//                   timestamp: history.orderDate,
//                   type: index === 0 ? "newOrder" : "addedOrder",
//                 });
//               });
//             }
//           });

//           formattedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//           setNotifications(formattedNotifications);
//         }
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       }
//     };

//     fetchTables();
//     fetchOrders();

//     const handleOrderAdded = (orderData) => {
//       setNotifications((prevNotifications) => {
//         const newNotification = {
//           tableId: orderData.tableId,
//           tableName: tables[orderData.tableId] || "Unknown Table",
//           message: `A new order has been placed on Table ${tables[orderData.tableId] || "Unknown Table"}`,
//           timestamp: new Date().toISOString(),
//           type: "newOrder",
//         };

//         const isDuplicate = prevNotifications.some(
//           (notif) => notif.tableId === newNotification.tableId && notif.timestamp === newNotification.timestamp
//         );

//         if (!isDuplicate) {
//           playNotificationSound(); // Play sound for new notifications
//           return [newNotification, ...prevNotifications];
//         }

//         return prevNotifications;
//       });
//     };

//     socket.on("orderAdded", handleOrderAdded);

//     return () => {
//       socket.off("orderAdded", handleOrderAdded);
//     };
//   }, [AdminId, tables]);

//   return (
//     <div>
//       <div className="flex justify-between items-center p-2 px-4 border-b border-gray-600">
//         <h1>Notification</h1>
//         <RxCross2 size={20} className="cursor-pointer" onClick={() => setNotification(false)} />
//       </div>

//       <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[524px]">
//         {notifications.length > 0 ? (
//           notifications.map((notif, index) => (
//             <div
//               key={index}
//               className="flex px-4 space-x-3 border-b border-gray-600 py-2 hover:bg-gray-800 cursor-pointer"
//             >
//               <IoLogoTableau size={20} className={notif.type === "newOrder" ? "text-green-400" : "text-yellow-400"} />
//               <div className="text-sm text-gray-300">
//                 <p className="leading-tight mb-0.5">{notif.message}</p>
//                 <span className="text-[12px] text-gray-400 block -mt-0.5">
//                   {new Date(notif.timestamp).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-gray-400 py-4">No new notifications</p>
//         )}
//       </div>
//     </div>
//   );
// }
