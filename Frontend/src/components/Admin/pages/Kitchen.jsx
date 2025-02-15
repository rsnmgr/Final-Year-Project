import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { LoginContext } from "../../ContextProvider/Context";
import { RxCross2 } from "react-icons/rx";
import io from "socket.io-client"; // Import Socket.IO client

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

const OrderItem = ({ order, tableName, onReady }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mt-2">
      <h1>Table: {tableName || "Unknown"}</h1>
      <date>{moment(order.orderDate).format("MMMM D, YYYY h:mm A")}</date>
      <button
        className="py-1 px-2 bg-gray-700 text-white"
        onClick={() => onReady(order._id)}
      >
        Ready
      </button>
    </div>
    <table className="w-full table-auto border-2 border-gray-700 mb-4">
      <thead className="bg-black text-white border-b border-gray-500">
        <tr>
          <th className="p-2 text-left">Item</th>
          <th className="p-2 text-center border-x border-gray-500">Units</th>
          <th className="p-2 text-center border-x border-gray-500">Qty</th>
        </tr>
      </thead>
      <tbody className="bg-black bg-opacity-50 border-x border-b border-gray-500">
        {order.items.map((food, itemIndex) => (
          <tr key={itemIndex}>
            <td className="p-2 text-left">
              <h1>{food.name}</h1>
              {food.instructions && (
                <p className="text-xs text-gray-500">{food.instructions}</p>
              )}
            </td>
            <td className="p-2 text-center">{food.size}</td>
            <td className="p-2 text-center">{food.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ConfirmationModal = ({ onClose, onConfirm }) => {
  const modalRef = useRef(null);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
      <div ref={modalRef} className="bg-black p-6 border-2 border-gray-700">
        <h1>Are you sure this table Order Ready?</h1>
        <div className="flex justify-end items-center mt-4">
          <button className="p-1 bg-gray-700 px-3" onClick={onClose}>
            Cancel
          </button>
          <button className="p-1 bg-green-700 ml-2 px-3" onClick={onConfirm}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Kitchen_Area() {
  const [orders, setOrders] = useState([]);
  const [tableNames, setTableNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrderHistoryId, setSelectedOrderHistoryId] = useState(null);
  const [backendMessage, setBackendMessage] = useState("");

  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;

  // Fetch orders and table names from the server
  const fetchOrders = async () => {
    try {
      const { data: orderData } = await axios.get(
        `${API_URL}/api/fetch-orders/${AdminId}`
      );
      if (orderData?.orders?.length > 0) {
        setOrders(orderData.orders);

        const tablePromises = orderData.orders.map((order) =>
          axios
            .get(`${API_URL}/api/tables/${AdminId}/${order.tableId}`)
            .then((response) => ({
              tableId: order.tableId,
              tableName: response.data.table.name || "Unknown",
            }))
        );

        const tableDataArray = await Promise.all(tablePromises);
        const tableNameMap = tableDataArray.reduce(
          (acc, { tableId, tableName }) => {
            acc[tableId] = tableName;
            return acc;
          },
          {}
        );

        setTableNames(tableNameMap);
      } else {
        setOrders([]);
        setBackendMessage("No orders found.");
      }
    } catch (error) {
      console.error("Error fetching orders or table info:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (AdminId) {
      fetchOrders();

      // Set up socket listener for new orders
      socket.on("orderAdded", fetchOrders); // Call fetchOrders when a new order is added
      socket.on("orderRemoved", fetchOrders);
      socket.on("orderHistoryRemoved", fetchOrders);
      // Clean up the socket listener on component unmount
      return () => {
        socket.off("orderAdded", fetchOrders);
        socket.off("orderRemoved", fetchOrders);
        socket.off("orderHistoryRemoved", fetchOrders);
      };
    }
  }, [AdminId]);

  useEffect(() => {
    if (backendMessage) {
      const timer = setTimeout(() => setBackendMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [backendMessage]);

  const handleMarkAsReady = async (orderId, orderHistoryId) => {
    try {
      await axios.put(
        `${API_URL}/api/update-order-status/${AdminId}/${
          orders.find((order) => order._id === orderId)?.tableId
        }/${orderHistoryId}`,
        {
          newStatus: "ready",
        }
      );
      await fetchOrders(); // Refetch orders after marking as ready
      setBackendMessage("Order marked as ready.");
      setSelectedOrderHistoryId(null);
    } catch (error) {
      setBackendMessage("Error updating order status.");
      console.error("Error updating order status:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      {orders.length === 0 ? (
        <p className="flex justify-center items-center h-[80vh]">
          No Current Order Found
        </p>
      ) : (
        orders.map((order, orderIndex) => (
          <div
            key={orderIndex}
            className="grid grid-cols-2 gap-3 w-full md:col-span-4"
          >
            {order.OrderHistory.map((history, historyIndex) => (
              <OrderItem
                key={historyIndex}
                order={history}
                tableName={tableNames[order.tableId]}
                onReady={setSelectedOrderHistoryId}
              />
            ))}
          </div>
        ))
      )}

      {selectedOrderHistoryId && (
        <ConfirmationModal
          onClose={() => setSelectedOrderHistoryId(null)}
          onConfirm={() => {
            const order = orders.find((order) =>
              order.OrderHistory.some(
                (history) => history._id === selectedOrderHistoryId
              )
            );
            if (order) {
              handleMarkAsReady(order._id, selectedOrderHistoryId);
            } else {
              console.error("Order not found for the selected history ID");
            }
          }}
        />
      )}

      {backendMessage && (
        <div className="fixed right-4 bottom-4 border-2 border-gray-700">
          <div className="flex justify-between px-3 items-center p-2 bg-gray-900">
            <h1 className="text-white mr-3">{backendMessage}</h1>
            <RxCross2
              size={20}
              className="cursor-pointer text-white"
              onClick={() => setBackendMessage("")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
