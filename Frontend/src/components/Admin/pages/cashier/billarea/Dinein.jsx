import React, { useContext, useState, useEffect } from "react";
import { FaUsersLine } from "react-icons/fa6";
import { IoIosStar } from "react-icons/io";
import { LoginContext } from '../../../../ContextProvider/Context';
import axios from "axios";
import moment from 'moment';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dinein({ setSelectedTable }) {
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const [tableData, setTableData] = useState(null);
  const [orderData, setOrderData] = useState({ items: [], totalOrderAmount: 0 });
  const [discount, setDiscount] = useState(0); // Discount percentage

  const tableId = localStorage.getItem("selectedTableId");

  useEffect(() => {
    if (!AdminId || !tableId) return;

    setOrderData({ items: [], totalOrderAmount: 0 });

    const fetchOrderData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fetch-orders/${AdminId}/${tableId}`);
        const data = await response.json();
        const orders = data.orders?.OrderHistory || [];

        const aggregatedItems = orders.reduce((acc, order) => {
          order.items.forEach(item => {
            const key = `${item.name}-${item.size}`;
            if (acc[key]) {
              acc[key].quantity += item.quantity;
              acc[key].subtotal += item.price * item.quantity;
            } else {
              acc[key] = { ...item, subtotal: item.price * item.quantity };
            }
          });
          return acc;
        }, {});

        const items = Object.values(aggregatedItems);
        const totalOrderAmount = data.orders?.totalOrderAmount || 0;
        const orderDate = data.orders?.orderDate || null;

        setOrderData({ items, totalOrderAmount, orderDate });
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    const fetchTableData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tables/${AdminId}/${tableId}`);
        setTableData(response.data);
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchOrderData();
    fetchTableData();
  }, [AdminId, tableId]);

  // Calculate total after applying percentage discount
  const totalAfterDiscount = (orderData.totalOrderAmount - (orderData.totalOrderAmount * discount / 100)).toFixed(2);

  return (
    <div className="relative flex flex-col">
      <div className="flex justify-between items-center border-b border-gray-800 py-1">
        <ul className="flex justify-between items-center">
          <li className="p-2 px-6 border border-gray-700 text-sm cursor-pointer">{tableData?.table?.name || "N/A"}</li>
          <li className="p-2 px-6 border border-gray-700 text-sm cursor-pointer"><FaUsersLine size={20} /></li>
          <li className="p-2 px-6 border border-gray-700 text-sm cursor-pointer"><IoIosStar size={20} /></li>
        </ul>
        <span>{orderData.orderDate ? moment(orderData.orderDate).format('hh:mm:ss A') : ""}</span>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-x-auto">
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="text-xs uppercase bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-center">Price</th>
              </tr>
            </thead>
          </table>

          {/* Scrollable Wrapper for Table Body */}
          <div className="h-[30vh] md:h-[45vh] overflow-y-auto">
            <table className="w-full text-sm text-left table-fixed">
              <tbody className="bg-gray-900">
                {orderData.items.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-2 text-center text-gray-500">
                      This table is blank.
                    </td>
                  </tr>
                ) : (
                  orderData.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="px-6 py-2 text-white">{item.name} ({item.size})</td>
                      <td className="px-6 py-2 text-center">{item.quantity}</td>
                      <td className="px-6 py-2 text-center">${item.subtotal.toFixed(2)}
                        <span className="block text-gray-500">${item.price.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <table className="w-full text-sm text-left table-fixed">
            <tfoot className="bg-gray-800 sticky bottom-0 z-10">
              <tr className="font-semibold text-white">
                <td className="px-6 py-2 text-base">Sub Total</td>
                <td className="px-6 py-2 text-center">{orderData.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="px-6 py-2 text-center">${orderData.totalOrderAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-900">
        <table className="w-full text-sm text-left table-fixed">
          <tfoot className="sticky bottom-0 z-10">
            <tr className="font-semibold text-white">
              <td className="px-6 py-2 text-base">Total</td>
              <td className="px-6 py-2 text-center">
                <input
                  
                  className="w-1/2 p-1 outline-none border border-gray-700 bg-gray-900 text-center text-white"
                  placeholder="Discount %"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </td>
              <td className="px-6 py-2 text-center">${totalAfterDiscount}</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment Methods */}
        <ul className="flex justify-between items-center px-6 py-2 bg-gray-800">
          <li className="flex items-center space-x-2">
            <input type="checkbox" />
            <span>Cash</span>
          </li>
          <li className="flex items-center space-x-2">
            <input type="checkbox" />
            <span>Card</span>
          </li>
          <li className="flex items-center space-x-2">
            <input type="checkbox" />
            <span>Due</span>
          </li>
          <li className="flex items-center space-x-2">
            <input type="checkbox" />
            <span>Other</span>
          </li>
          <li className="flex items-center space-x-2">
            <input type="checkbox" />
            <span>Part</span>
          </li>
        </ul>
        <div className="flex justify-between md:justify-end items-center p-2">
          <button className="md:hidden p-2 px-4 bg-gray-800 text-white" onClick={() => setSelectedTable(null)}>Back</button>
          <div className="space-x-2">
            <button className="p-2 bg-green-700 text-white">Settlement</button>
            <button className="p-2 bg-green-900 text-white">Save & Print</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
