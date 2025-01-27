import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { IoIosArrowUp } from "react-icons/io";
import { MdShoppingCart } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { TiMinus } from "react-icons/ti";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import io from 'socket.io-client';

import { TableContext } from "../../ContextProvider/TableContext";
const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Bag() {
  const { AdminId, tableId } = useContext(TableContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [gst, setGst] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [selectedItemInstructions, setSelectedItemInstructions] = useState("");
  const [editableInstructions, setEditableInstructions] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

 
    const fetchSelectedItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/selected-items/${AdminId}/${tableId}`);
        const { selectedItems } = response.data.selectedItemsEntry;

        if (selectedItems.length === 0) {
          setIsEmpty(true);
        } else {
          setSelectedItems(selectedItems);
          calculateTotals(selectedItems);
          setIsEmpty(false);
        }
      } catch (error) {
        console.error("Error fetching selected items:", error);
        setIsEmpty(true);
      }
    };


  const calculateTotals = (items) => {
    const newSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gstPercentage = 0; // Replace with actual GST percentage
    const newGst = (newSubtotal * gstPercentage) / 100;
    setSubtotal(newSubtotal);
    setGst(newGst);
    setTotal(newSubtotal + newGst);
  };

  const updateItemQuantity = async (itemId, quantity) => {
    try {
      await axios.put(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${itemId}/quantity`, { quantity });
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  };

  const handleQuantityChange = async (index, change) => {
    const updatedItems = [...selectedItems];
    const newQuantity = updatedItems[index].quantity + change;

    if (newQuantity > 0) {
      updatedItems[index].quantity = newQuantity;
      setSelectedItems(updatedItems);
      calculateTotals(updatedItems);
      await updateItemQuantity(updatedItems[index]._id, newQuantity);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/selected-items/${AdminId}/${tableId}/${itemToDelete._id}`);
      const updatedItems = selectedItems.filter((item) => item._id !== itemToDelete._id);
      setSelectedItems(updatedItems);
      calculateTotals(updatedItems);
      setShowModal(false);
      setIsEmpty(updatedItems.length === 0);
    } catch (error) {
      console.error("Error deleting selected item:", error);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItemInstructions(item.instructions || "No instructions available.");
    setEditingItemId(item._id);
    setEditableInstructions(item.instructions || "");
    setShowInstructions(true);
  };

  const handleInstructionsChange = (event) => {
    setEditableInstructions(event.target.value);
  };

  const handleUpdateInstructions = async () => {
    try {
      await axios.put(`${API_URL}/api/update-item-instructions/${AdminId}/${tableId}/${editingItemId}`, {
        instructions: editableInstructions,
      });
      const updatedItems = selectedItems.map((item) =>
        item._id === editingItemId ? { ...item, instructions: editableInstructions } : item
      );
      setSelectedItems(updatedItems);
      setSelectedItemInstructions(editableInstructions);
      setShowInstructions(false);
    } catch (error) {
      console.error("Error updating item instructions:", error);
    }
  };

  const handleOrderNowClick = () => {
    setShowOrderConfirmation(true);
  };

  const handleOrderConfirmation = async () => {
    setShowOrderConfirmation(false);
    setLoading(true); // Start loading
    try {
      // Place the order
      await axios.post(`${API_URL}/api/add-order`, {
        AdminId,
        tableId,
        items: selectedItems,
        subtotal,
        gst,
        total,
      });
      // Clear the cart after order placement
      await axios.delete(`${API_URL}/api/delete-selected-items/${AdminId}/${tableId}`);
      
      // Simulate a 2-second delay before navigating to the next page
      setTimeout(() => {
        setLoading(false); // End loading
        navigate(`/menu/${AdminId}/${tableId}/bill`);
      }, 1000); // 1 seconds delay
    } catch (error) {
      setLoading(false); // Stop loading in case of an error
      console.error("Error placing order:", error);
    }
  };

  useEffect(() => {
    if (AdminId) {
      fetchSelectedItems();
    }
  }, [AdminId]);

  useEffect(() => {
      socket.on('ItemsAdded', fetchSelectedItems);
      socket.on('ItemsUpdated', fetchSelectedItems);
      socket.on('ItemsDeleted', fetchSelectedItems);
      socket.on('ItemsQtyUpdated', fetchSelectedItems);
      socket.on('ItemsDeletedAll', fetchSelectedItems);
  
      // Clean up socket event listeners on unmount
      return () => {
        socket.off('ItemsAdded', fetchSelectedItems);
        socket.off('ItemsUpdated', fetchSelectedItems);
        socket.off('ItemsDeleted', fetchSelectedItems);
        socket.off('ItemsQtyUpdated', fetchSelectedItems);
        socket.off('ItemsDeletedAll', fetchSelectedItems);
      };
    }, []);

  return (
    <div className="bg-gray-900">
      <header className="grid grid-cols-3 p-2  shadow-xl">
        <IoIosArrowUp
          className="transform rotate-[-90deg] w-6 h-6 cursor-pointer"
          onClick={() => navigate(`/menu/${AdminId}/${tableId}`)}
        />
        <div className="flex items-center">
          <MdShoppingCart className="w-6 h-6" />
          <h1 className="">Order Cart</h1>
        </div>
      </header>
      <main className="p-2">
        <div className="overflow-y-auto" style={{ maxHeight: "375px" }}>
          {isEmpty ? (
            <p className="text-center  ">
              No items found in your cart.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {selectedItems.map((item, index) => (
                <div
                  key={item._id}
                  className="grid grid-cols-3 bg-gray-800 shadow-2xl p-4"
                >
                  {/* Left Section: Item Name, Category, Size, and Image */}
                  <div className="flex justify-left items-center gap-2">
                    {/* Delete Item */}
                    <div
                      className="bg-red-700 rounded-full p-1 text-white cursor-pointer"
                      onClick={() => {
                        setShowModal(true);
                        setItemToDelete(item);
                      }}
                    >
                      <RxCross2 />
                    </div>

                    {/* Item Name and Category */}
                    <div
                      onClick={() => handleItemClick(item)}
                      className="cursor-pointer"
                    >
                      <h1 className="text-sm border-b-2 border-gray-600">
                        {item.name}{item.size && `(${item.size})`}
                      </h1>
                      {/* Display Category and Size */}
                      
                      <p className="text-xs text-gray-500 hidden">{item.category}</p>
                    </div>
                  </div>

                  {/* Middle Section: Quantity Adjustment */}
                  <div className="flex justify-center items-center gap-3">
                    <div
                      className="p-1 bg-gray-700 text-white cursor-pointer"
                      onClick={() => handleQuantityChange(index, -1)}
                    >
                      <TiMinus />
                    </div>
                    <p>{item.quantity}</p>
                    <div
                      className="p-1 bg-gray-700 text-white cursor-pointer"
                      onClick={() => handleQuantityChange(index, 1)}
                    >
                      <FaPlus />
                    </div>
                  </div>

                  {/* Right Section: Price and Item Image */}
                  <div className="flex justify-end items-center gap-2">
                    <h1 >{item.price * item.quantity}</h1>
                    {/* Display Item Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 hidden rounded"
                      />
                    )}
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <footer className="flex bg-gray-800 justify-between items-center p-2 mt-4 shadow-2xl">
            <ul className="">
              <li>Subtotal</li>
              <li>GST(0%)</li>
              <li>Total</li>
            </ul>
            <ul>
              <li className="  text-sm">{subtotal}</li>
              <li className="  text-sm">{gst}</li>
              <li className=" text-md">{total}</li>
            </ul>
          </footer>
        )}
        {!isEmpty && (
          <div className="flex text-center gap-2 mt-4 shadow-2xl">
            {/* <button  className="bg-gray-700 p-2 text-slate-100  w-full">Change Table</button> */}
            <button
              className="bg-green-700 text-white p-2 w-full hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
              onClick={handleOrderNowClick}
            >
              Order Now
            </button>
          </div>
        )}
      </main>

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-md shadow-lg text-center w-[80vw] md:w-[25vw]">
            <h2 className="text-xl  mb-4">Confirm Your Order</h2>
            <p className="mb-6">Are you sure you want to place this order?</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setShowOrderConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-700 text-white p-2 rounded hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none"
                onClick={handleOrderConfirmation}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 w-[80vw] md:w-[25vw] p-6 rounded shadow-lg">
            <h2 className="text-xl  mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this item?</p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Form */}
      {showInstructions && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded shadow-lg">
            <h2 className="text-xl  mb-4">Instructions</h2>
            <textarea
              className="w-full h-40 p-2 border border-gray-500 bg-gray-900 rounded"
              value={editableInstructions}
              onChange={handleInstructionsChange}
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setShowInstructions(false)}
              >
                Close
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleUpdateInstructions}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Fully place order */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center px-2">
          <div className="bg-gray-900 border border-gray-700 p-6 w-full h-1/2 md:w-1/3 rounded shadow-lg">
            <div className="flex justify-center items-center mt-10">
              <TiTick size={72} className="text-white bg-green-700 p-2 rounded-full"/>
            </div>
            <h1 className="text-center">Success</h1>
            <p className="text-center text-gray-500">Your order has been Successfully Placed. We will let you know when it is ready!</p>
            <button className="bg-green-700 p-2 w-full mt-4" onClick={() => navigate(`/menu/${AdminId}/${tableId}/b`)}>Done</button>
          </div>
        </div>
      )}

    </div>
  );
}
