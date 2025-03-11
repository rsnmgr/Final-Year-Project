import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerContext } from "../../ContextProvider/CustomerContext";
import moment from "moment";
import { MdOutlineAutoDelete } from "react-icons/md";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Bill() {
  const navigate = useNavigate();
  const { customerData, AdminId, tableId } = useContext(CustomerContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [deleteOrderForm, setDeleteOrderForm] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetch-orders/${AdminId}/${tableId}`);
      const data = await response.json();
      if (response.ok) {
        // If no orders found, ensure orders is an empty array
        setOrders(data.orders.OrderHistory || []);
      } else {
        // Handle error in response
        setOrders([]);
      }
    } catch (error) {
      // console.error("Error fetching orders:", error);
      setOrders([]); // Set orders to empty array in case of error
    }
  };

  useEffect(() => {
    if (AdminId && tableId) fetchOrders(); // Ensure both AdminId and tableId are valid
  }, [AdminId, tableId]);

  useEffect(() => {
    socket.on("orderAdded", fetchOrders);
    socket.on("orderUpdated", fetchOrders);
    socket.on("orderRemoved", fetchOrders);
    socket.on("orderHistoryRemoved", fetchOrders);
    socket.on("orderItemRemoved", fetchOrders); // Refresh when item is deleted
    return () => {
      socket.off("orderAdded", fetchOrders);
      socket.off("orderUpdated", fetchOrders);
      socket.off("orderRemoved", fetchOrders);
      socket.off("orderHistoryRemoved", fetchOrders);
      socket.off("orderItemRemoved", fetchOrders);
    };
  }, []);

  const deleteOrderItem = async (orderHistoryId, itemId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/order/item/delete/${AdminId}/${tableId}/${orderHistoryId}/${itemId}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (response.ok) {
        // The socket listener will take care of updating the order list after an item is deleted
        setDeleteOrderForm(null);
      } else {
        // console.error("Failed to delete item:", data.message);
      }
    } catch (error) {
      // console.error("Error deleting item:", error);
    }
  };

  const handleDeleteOrderItem = (orderHistoryId, itemId) => {
    // Make sure to delete the item from the backend and refresh
    deleteOrderItem(orderHistoryId, itemId);
  };

  return (
    <div>
      <div className="space-y-4">
        <p className="text-center p-4 text-xl">Your Total Orders</p>
        <h1 className="text-center">${orders.reduce((acc, order) => acc + order.total, 0)}</h1>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "375px" }}>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500">No orders found</p>
          ) : (
            orders.map((order) => (
              <div className="relative" key={order._id}>
                <div
                  className="flex justify-between items-center bg-gray-900 p-3 mt-2 rounded-md cursor-pointer"
                  onClick={() => setExpandedOrderId((prev) => (prev === order._id ? null : order._id))}
                >
                  <div className="text-xs">
                    <div className="flex justify-between items-center">
                      <label>{moment(order.orderDate).format("hh:mm A")}</label>
                      <h1 className={`underline ${order.itemsStatus === "prepare" ? "text-gray-500" : "text-green-700"}`}>
                        {order.itemsStatus}
                      </h1>
                    </div>
                    <h1>{order._id}</h1>
                  </div>
                  <div>{order.items.length} Items</div>
                  <div>${order.total}</div>
                </div>

                {expandedOrderId === order._id && (
                  <div className="p-4 bg-gray-800 mt-2 rounded-md">
                    <h3 className="mb-2">Order Details:</h3>
                    <ul className="space-y-2">
                      {order.items.map((item) => (
                        <li key={item._id} className="flex justify-between items-center gap-2">
                          <span>{item.name} ({item.size})</span>
                          <span>{item.quantity} x {item.price}</span>
                          {order.itemsStatus === "pending" && (
                            <span>
                              <button
                                className="text-red-600 hover:text-red-800"
                                aria-label="Delete item"
                                onClick={() => setDeleteOrderForm({ orderHistoryId: order._id, itemId: item._id })}
                              >
                                <MdOutlineAutoDelete size={20} />
                              </button>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between p-4 gap-2">
          <button className="p-2 w-full bg-gray-900" onClick={() => navigate(`/menu`)}>NEW ORDER</button>
          <button className="p-2 w-full bg-green-800">PAID</button>
        </div>
      </div>

      {deleteOrderForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center p-4 justify-center">
          <div className="bg-gray-900 border border-gray-700 w-full md:w-1/3 p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this item?</p>
            <div className="flex justify-between items-center space-x-2">
              <button className="bg-gray-800 p-2 w-full" onClick={() => setDeleteOrderForm(null)}>Cancel</button>
              <button className="bg-red-800 p-2 w-full" onClick={() => handleDeleteOrderItem(deleteOrderForm.orderHistoryId, deleteOrderForm.itemId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
