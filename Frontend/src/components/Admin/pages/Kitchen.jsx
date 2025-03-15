import React, { useState, useEffect, useContext } from 'react';
import Pending from "./kitchen/Pending";
import Preparing from "./kitchen/Preparing";
import Complete from "./kitchen/Complete";
import axios from "axios";
import { io } from "socket.io-client";
import { LoginContext } from "../../ContextProvider/Context";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Kitchen() {
  const [status, setStatus] = useState("Pending");
  const [orderCounts, setOrderCounts] = useState({ pending: 0, preparing: 0, complete: 0 });
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;

  useEffect(() => {
    if (!userId) return;

    const fetchOrderCounts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fetch-orders/${userId}`);
        const orders = response.data.orders || [];

        const counts = { pending: 0, preparing: 0, complete: 0 };
        orders.forEach(order => {
          order.OrderHistory.forEach(history => {
            if (history.itemsStatus === "pending") counts.pending++;
            else if (history.itemsStatus === "accepted") counts.preparing++;
            else if (history.itemsStatus === "ready") counts.complete++;
          });
        });

        setOrderCounts(counts);
      } catch (error) {
        console.error("Error fetching order counts:", error);
      }
    };

    fetchOrderCounts();

    // Real-time updates with Socket.io
    socket.on("orderAdded", fetchOrderCounts);
    socket.on("orderUpdated", fetchOrderCounts);
    socket.on("orderRemoved", fetchOrderCounts);
    socket.on("orderHistoryRemoved", fetchOrderCounts);

    return () => {
      socket.off("orderAdded", fetchOrderCounts);
      socket.off("orderUpdated", fetchOrderCounts);
      socket.off("orderRemoved", fetchOrderCounts);
      socket.off("orderHistoryRemoved", fetchOrderCounts);
    };
  }, [userId]);

  return (
    <div className='p-3'>
      <div className='flex md:justify-between items-center border-b border-gray-600 py-2'>
        <h1 className='hidden md:block'>Current Order Details</h1>
        <div className='flex justify-between items-center space-x-3'> 
          <button 
            onClick={() => setStatus("Pending")} 
            className='p-1 px-3 rounded-sm bg-yellow-500 text-black cursor-pointe'
          >
            Pending ({orderCounts.pending})
          </button>
          <button 
            onClick={() => setStatus("Preparing")} 
            className='p-1 px-3 rounded-sm bg-blue-500 text-black cursor-pointer'
          >
            Preparing ({orderCounts.preparing})
          </button>
          <button 
            onClick={() => setStatus("Complete")} 
            className='p-1 px-3 rounded-sm bg-green-500 text-black cursor-pointer'
          >
            Complete ({orderCounts.complete})
          </button>
        </div>
      </div>
      <div className='mt-3'>
        {status === "Pending" && <Pending />}
        {status === "Preparing" && <Preparing />}
        {status === "Complete" && <Complete />}
      </div>
    </div>
  );
}
