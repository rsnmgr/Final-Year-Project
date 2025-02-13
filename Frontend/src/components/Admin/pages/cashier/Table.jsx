import React, { useState, useEffect, useContext } from "react";
import { LoginContext } from "../../../ContextProvider/Context";
import axios from "axios"; 
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Table() {
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const [tables, setTables] = useState([]);
  const [orderDetails, setOrderDetails] = useState({}); // Store order times, amounts & status per table

  useEffect(() => {
    if (!AdminId) return;

    const fetchTables = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tables/${AdminId}`);
        const activeTables = response.data.tables.filter(table => table.status === "Active");
        setTables(activeTables);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fetch-orders/${AdminId}`);
        const orders = response.data.orders;

        const details = {};
        orders.forEach(order => {
          const tableId = order.tableId;
          if (!details[tableId]) {
            details[tableId] = { totalAmount: 0, latestOrderTime: null, orderStatus: "Blank" };
          }
          details[tableId].totalAmount += order.totalOrderAmount;

          if (order.OrderHistory && order.OrderHistory.length > 0) {
            details[tableId].latestOrderTime = new Date(order.OrderHistory[0].orderDate);
          }

          details[tableId].orderStatus = order.orderStatus || "Blank";
        });

        setOrderDetails(details);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchTables();
    fetchOrders();

    // Listen for real-time updates
    socket.on("tableUpdated", fetchTables);
    socket.on("tableAdded", fetchTables);
    socket.on("tableDeleted", fetchTables);
    socket.on("orderAdded", fetchOrders);
    socket.on("orderRemoved", fetchOrders);
    socket.on("orderHistoryRemoved", fetchOrders);

    return () => {
      socket.off("tableUpdated", fetchTables);
      socket.off("tableAdded", fetchTables);
      socket.off("tableDeleted", fetchTables);
      socket.off("orderAdded", fetchOrders);
      socket.off("orderRemoved", fetchOrders);
      socket.off("orderHistoryRemoved", fetchOrders);
    };
  }, [AdminId]);

  // Function to calculate relative time
  const getRelativeTime = (orderTime) => {
    if (!orderTime) return "";

    const diffMs = new Date() - new Date(orderTime);
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""}`;
    return `${Math.floor(diffHours / 24)} day${diffHours / 24 > 1 ? "s" : ""}`;
  };

  return (
    <div>
      {/* Table Header */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <h1>Current Active Tables</h1>
        <ul className="flex items-center">
          <li className="bg-gray-500 p-1 rounded-full mr-2"></li>
          <li className="mr-4">Blank</li>
          <li className="bg-green-500 p-1 rounded-full mr-2"></li>
          <li>Running</li>
        </ul>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {tables.length > 0 ? (
          tables.map((table, index) => {
            const orderInfo = orderDetails[table._id] || {};
            const { totalAmount, orderStatus, latestOrderTime } = orderInfo;

            const bgColor = orderStatus === "Running" ? "bg-green-900" : "bg-gray-800";

            return (
              <div
                key={table._id || index}
                className={`border-dotted border-2 border-gray-600 ${bgColor} flex justify-center items-center cursor-pointer`}
              >
                <div className="relative w-16 h-16 flex flex-col justify-center items-center">
                  {totalAmount > 0 ? (
                    <>
                      <h1 className='text-xs'>{getRelativeTime(latestOrderTime)}</h1>
                      <h1 className='text-xs'>{table.name}</h1>
                      <h1 className='text-xs text-white'>₹{totalAmount}</h1>
                    </>
                  ) : (
                    <h1 className='text-xs'>{table.name}</h1>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 col-span-3 md:col-span-6 text-center">No active tables</p>
        )}
      </div>
    </div>
  );
}
