import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LoginContext } from '../../../ContextProvider/Context';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Table({ onTableSelect }) {
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch tables
  const fetchTables = async () => {
    try {
      const tableResponse = await axios.get(`${API_URL}/api/tables/${AdminId}`);
      if (Array.isArray(tableResponse.data?.tables)) {
        setTables(tableResponse.data.tables);
      } else {
        console.error('Unexpected tables format:', tableResponse.data);
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const orderResponse = await axios.get(`${API_URL}/api/orders/${AdminId}`);
      if (Array.isArray(orderResponse.data?.orders)) {
        setOrders(orderResponse.data.orders);
      } else {
        console.error('Unexpected orders format:', orderResponse.data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (!AdminId) return;

    // Fetch tables and orders on component mount or when AdminId changes
    fetchTables();
    fetchOrders();

    // Socket event listeners
    const handleOrderAdded = (orderData) => {
      setOrders((prevOrders) => {
        if (Array.isArray(orderData)) {
          return [...prevOrders, ...orderData];
        } else {
          const existingOrderIndex = prevOrders.findIndex(
            (order) => order.tableId === orderData.tableId
          );
          if (existingOrderIndex === -1) {
            return [...prevOrders, orderData];
          } else {
            const updatedOrders = [...prevOrders];
            updatedOrders[existingOrderIndex] = orderData;
            return updatedOrders;
          }
        }
      });
    };

    const handleOrderRemoved = (orderData) => {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.tableId !== orderData.tableId)
      );
    };

    const handleOrderItemRemoved = async (removedData) => {
      // Refetch the order data from the server
      await fetchOrders();
    };

    const handleOrderHistoryRemoved = (removedData) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order?.tableId === removedData.tableId) {
            const updatedHistory = order.OrderHistory?.filter(
              (history) => history._id !== removedData.orderId
            ) ?? [];
            const newTotalAmount = updatedHistory.reduce(
              (acc, history) => acc + (history.total || 0),
              0
            );
            return { ...order, OrderHistory: updatedHistory, totalOrderAmount: newTotalAmount };
          }
          return order;
        })
      );
    };

    socket.on('orderAdded', handleOrderAdded);
    socket.on('orderRemoved', handleOrderRemoved);
    socket.on('orderItemRemoved', handleOrderItemRemoved);
    socket.on('orderHistoryRemoved', handleOrderHistoryRemoved);

    return () => {
      socket.off('orderAdded', handleOrderAdded);
      socket.off('orderRemoved', handleOrderRemoved);
      socket.off('orderItemRemoved', handleOrderItemRemoved);
      socket.off('orderHistoryRemoved', handleOrderHistoryRemoved);
    };
  }, [AdminId]);

  const getTableDetails = (tableId) => {
    const tableOrder = orders.find((order) => order.tableId === tableId);
    const table = tables.find((table) => table._id === tableId);

    if (!table) return { statusClass: 'bg-gray-800', tableName: 'Unknown' };

    let statusClass = 'bg-gray-800'; // Default status for blank tables
    let totalOrderAmount = null;
    let tableName = table.name || 'Unknown';

    if (tableOrder) {
      totalOrderAmount = tableOrder.totalOrderAmount;
      if (tableOrder.orderStatus === 'Running') {
        statusClass = 'bg-red-800';
      }
    }

    return { statusClass, totalOrderAmount, tableName };
  };

  const handleTableClick = (tableId) => {
    localStorage.setItem('selectedTableId', tableId);
    onTableSelect(tableId);
  };

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <h1>Current Table</h1>
        <ul className="flex items-center">
          <li className="bg-gray-800 p-1.5 rounded-full mr-2"></li>
          <li className="mr-4">Blank</li>
          <li className="bg-red-800 p-1.5 rounded-full mr-2"></li>
          <li>Running</li>
        </ul>
      </div>
      <div className="overflow-auto h-[80vh]">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {tables.length > 0 ? (
            tables.map((table) => {
              const { statusClass, totalOrderAmount, tableName } = getTableDetails(table._id);
              return (
                <div
                  key={table._id}
                  className={`border-dotted border-2 border-gray-900 ${statusClass} flex justify-center items-center cursor-pointer`}
                  onClick={() => handleTableClick(table._id)}
                >
                  <div className="relative w-16 h-16 flex flex-col justify-center items-center">
                    {/* <h1 className="text-xs">12m</h1> */}
                    <h1 className="text-xs">{tableName}</h1>
                    {totalOrderAmount !== null && totalOrderAmount !== 0 ? (
                      <h1 className="text-xs">{totalOrderAmount}</h1>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No tables available</p>
          )}
        </div>
      </div>
    </div>
  );
}