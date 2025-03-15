import React, { useState, useEffect, useContext } from 'react';
import { LoginContext } from '../../../ContextProvider/Context';
import axios from 'axios';
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Preparing() {
  const [orders, setOrders] = useState([]);
  const [tableData, setTableData] = useState({});
  const [modal, setModal] = useState({ open: false, type: null, orderHistoryId: null, tableId: null });
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/fetch-orders/${userId}`);
        const filteredOrders = response.data.orders?.filter(order =>
          order.OrderHistory.some(history => history.itemsStatus === "accepted")
        ) || [];
        setOrders(filteredOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();

    socket.on("orderAdded", fetchOrders);
    socket.on("orderUpdated", fetchOrders);
    socket.on("orderRemoved", fetchOrders);
    socket.on("orderHistoryRemoved", fetchOrders);
    socket.on("orderItemRemoved", fetchOrders);

    return () => {
      socket.off("orderAdded", fetchOrders);
      socket.off("orderUpdated", fetchOrders);
      socket.off("orderRemoved", fetchOrders);
      socket.off("orderHistoryRemoved", fetchOrders);
      socket.off("orderItemRemoved", fetchOrders);
    };
  }, [userId]);

  useEffect(() => {
    const fetchTableData = async (tableId) => {
      if (tableData[tableId] || !userId) return;
      try {
        const response = await axios.get(`${API_URL}/api/tables/${userId}/${tableId}`);
        setTableData(prev => ({ ...prev, [tableId]: response.data }));
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    orders.forEach(order => order.OrderHistory.forEach(history => {
      if (history.itemsStatus === "accepted") {
        fetchTableData(order.tableId);
      }
    }));
  }, [orders, userId, tableData]);

  const handleAction = async () => {
    if (!modal.orderHistoryId || !modal.tableId) return;
    
    const endpoint = modal.type === 'cancel'
      ? `${API_URL}/api/update-order-status/${userId}/${modal.tableId}/${modal.orderHistoryId}`
      : `${API_URL}/api/update-order-status/${userId}/${modal.tableId}/${modal.orderHistoryId}`;
    
    const method = modal.type === 'cancel' ? "PUT" : "PUT";
    const data = modal.type === 'cancel' ? { newStatus: "pending" } : { newStatus: "ready" };
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: modal.type === 'cancel' ? null : JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(`Order has been ${modal.type === 'cancel' ? 'canceled' : 'marked as ready'}.`);
        setOrders(prevOrders => prevOrders.map(order => ({
          ...order,
          OrderHistory: order.OrderHistory.filter(history => history._id !== modal.orderHistoryId)
        })));
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to process the request.");
    }

    setModal({ open: false, type: null, orderHistoryId: null, tableId: null });
  };
  

  return (
    <div className="h-[70vh] md:h-[80vh]">
      <ToastContainer />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto">
        {orders
          .flatMap(order => 
            order.OrderHistory.filter(history => history.itemsStatus === "accepted").map(history => ({
              ...history,
              tableId: order.tableId,  // Include tableId for sorting reference
            }))
          )
          .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate)) // Sort by order date (oldest first)
          .map(history => (
            <div key={history._id} className="bg-gray-900 p-2 border-y border-blue-500 rounded-lg shadow-lg">
              <div className="flex justify-between items-center bg-gray-900 p-3 border-b-2 border-gray-500">
                <h1 className="text-white font-semibold">Table: {tableData[history.tableId]?.table?.name || "Loading..."}</h1>
                <p className="text-gray-400 text-sm">{new Date(history.orderDate).toLocaleTimeString()}</p>
              </div>
              <div className="overflow-auto max-h-56">
                <table className="w-full text-sm text-white">
                  <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr className="flex justify-between px-3 py-2 border-b-2 border-gray-700">
                      <th className="flex-1 text-left">Item</th>
                      <th className="flex-1 text-center">Quantity</th>
                      <th className="flex-1 text-right">Units</th>
                    </tr>
                  </thead>
                  <tbody className="block h-40 overflow-y-auto">
                    {history.items.map((item, i) => (
                      <tr key={i} className="flex justify-between px-3 py-2 border-b border-gray-800">
                        <td className="flex-1 text-left">{item.name}</td>
                        <td className="flex-1 text-center">{item.quantity}</td>
                        <td className="flex-1 text-right">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center bg-gray-900 gap-2 border-t border-gray-500 p-2">
                <button className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded-md transition-all" 
                  onClick={() => setModal({ open: true, type: 'cancel', orderHistoryId: history._id, tableId: history.tableId })}>
                  Cancel Order
                </button>
                <button className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-md transition-all" 
                  onClick={() => setModal({ open: true, type: 'ready', orderHistoryId: history._id, tableId: history.tableId })}>
                  Mark as Ready
                </button>
              </div>
            </div>
          ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">Confirm {modal.type === 'cancel' ? 'Cancel' : 'Mark as Ready'}</h2>
            <p className="text-gray-400">Are you sure you want to {modal.type === 'cancel' ? 'cancel' : 'mark as ready'} this order?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-600 px-4 py-2 rounded-md" onClick={() => setModal({ open: false, type: null, orderHistoryId: null, tableId: null })}>No</button>
              <button className={`px-4 py-2 rounded-md ${modal.type === 'cancel' ? 'bg-red-600' : 'bg-green-600'} text-white`} onClick={handleAction}>
                Yes, {modal.type === 'cancel' ? 'Cancel' : 'Mark as Ready'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
