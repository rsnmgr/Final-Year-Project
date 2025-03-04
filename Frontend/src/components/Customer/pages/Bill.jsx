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
  const [deleteOrderForm, setDeleteOrderForm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [hideDeleteIcon, setHideDeleteIcon] = useState({}); // To track which order's delete icon should be hidden
  const CustomerId = customerData?.validUser?._id;
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/fetch-orders/${AdminId}/${tableId}`
      );
      const data = await response.json();
      if (response.ok) setOrders(data.orders.OrderHistory || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (AdminId) fetchOrders();
  }, [AdminId, tableId]);

  useEffect(() => {
    socket.on("orderUpdated", fetchOrders);
    socket.on("orderHistoryRemoved", fetchOrders);
    return () => {
      socket.off("orderUpdated");
      socket.off("orderHistoryRemoved");
    };
  }, []);

  useEffect(() => {
    const newHideDeleteIcon = {};
    const currentTime = Date.now(); // Current time in milliseconds

    orders.forEach((order) => {
      const orderDate = moment(order.orderDate).valueOf(); // Convert orderDate to a timestamp
      const hideTime = orderDate + 60000; // Add 60 seconds to the order date

      // If current time is greater than or equal to the hide time, hide the delete icon
      if (currentTime >= hideTime) {
        newHideDeleteIcon[order._id] = true;
      } else {
        newHideDeleteIcon[order._id] = false;
        // Set timeout for orders that are still within the 1-minute window
        const timeout = setTimeout(() => {
          setHideDeleteIcon((prev) => ({ ...prev, [order._id]: true }));
        }, hideTime - currentTime);
        // Cleanup timeout on component unmount or when orders change
        return () => clearTimeout(timeout);
      }
    });

    setHideDeleteIcon(newHideDeleteIcon); // Update the state
  }, [orders]);

  const handleDelete = async () => {
    // Prevent deletion if the delete icon is hidden
    if (!hideDeleteIcon[orderToDelete]) {
      try {
        const response = await fetch(
          `${API_URL}/api/delete-order-id/${AdminId}/${tableId}/${orderToDelete}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          setDeleteOrderForm(false);
          fetchOrders();
        }
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    } else {
      console.log("Order cannot be deleted as time has expired.");
    }
  };

  return (
    <div>
      <div className="bg-gray-900 space-y-4">
        <p className="text-center p-4 text-xl">Your Total Orders</p>
        <h1 className="text-center">
          ${orders.reduce((acc, order) => acc + order.total, 0)}
        </h1>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "375px" }}>
          {orders.map((order) => (
            <div className="relative " key={order._id}>
              <div
                className="flex justify-between items-center bg-gray-800 p-3 mt-2 rounded-md cursor-pointer"
                onClick={() =>
                  setExpandedOrderId((prev) =>
                    prev === order._id ? null : order._id
                  )
                }
              >
                <div className="text-xs">
                  <div className="flex justify-between items-center">
                    <label>
                      {moment(order.orderDate).format("hh:mm A")}{" "}
                    </label>
                    <h1
                      className={`underline ${
                        order.itemsStatus === "prepare"
                          ? "text-gray-500"
                          : "text-green-700"
                      }`}
                    >
                      {order.itemsStatus}
                    </h1>
                  </div>
                  <h1>{order._id}</h1>
                </div>
                <div>{order.items.length} Items</div>
                <div>${order.total}</div>
              </div>

              {/* Show the delete icon if it's not hidden */}
              {!hideDeleteIcon[order._id] && (
                <div
                  className="absolute top-0 right-0 h-full flex justify-center items-center text-red-700 cursor-pointer"
                  onClick={() => {
                    setDeleteOrderForm(true);
                    setOrderToDelete(order._id);
                  }}
                >
                  <span className="bg-gray-900 p-2 border border-red-700 rounded-full">
                    <MdOutlineAutoDelete />
                  </span>
                </div>
              )}

              {expandedOrderId === order._id && (
                <div className="p-4 bg-gray-900 mt-2 rounded-md">
                  <h3 className="mb-2">Order Details:</h3>
                  <ul>
                    {order.items.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center mb-1"
                      >
                        <span>
                          {item.name}({item.size})
                        </span>
                        <span>
                          {item.quantity} x ${item.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between p-4 gap-2">
          <button
            className="p-2 w-full bg-gray-950"
            onClick={() => navigate(`/menu`)}
          >
            NEW ORDER
          </button>
          <button className="p-2 w-full bg-green-800">PAID</button>
        </div>
      </div>

      {deleteOrderForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 w-[80vw] md:w-[25vw] p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this order?</p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setDeleteOrderForm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDelete}
                disabled={hideDeleteIcon[orderToDelete]} // Disable delete if the icon is hidden
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
