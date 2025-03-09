import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { LoginContext } from "../../../ContextProvider/Context";
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Table({ onTableSelect }) {
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!AdminId) return;

    // Fetch tables and orders
    const fetchTablesAndOrders = async () => {
      try {
        const tableResponse = await axios.get(`${API_URL}/api/tables/${AdminId}`);
        if (Array.isArray(tableResponse.data.tables)) {
          setTables(tableResponse.data.tables);
        } else {
          console.error('Unexpected tables format:', tableResponse.data);
          setTables([]);
        }

        const orderResponse = await axios.get(`${API_URL}/api/orders/${AdminId}`);
        if (Array.isArray(orderResponse.data.orders)) {
          setOrders(orderResponse.data.orders);
        } else {
          console.error('Unexpected orders format:', orderResponse.data);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchTablesAndOrders();

    // Socket event listeners for order updates
    const handleOrderAdded = (orderData) => {
      if (Array.isArray(orderData)) {
        setOrders(prevOrders => [...prevOrders, ...orderData]);
      } else {
        setOrders(prevOrders => {
          const existingOrderIndex = prevOrders.findIndex(order => order.tableId === orderData.tableId);
          if (existingOrderIndex === -1) {
            return [...prevOrders, orderData];
          } else {
            const updatedOrders = [...prevOrders];
            updatedOrders[existingOrderIndex] = orderData;
            return updatedOrders;
          }
        });
      }
    };

    const handleOrderRemoved = (orderData) => {
      setOrders(prevOrders => prevOrders.filter(order => order.tableId !== orderData.tableId));
      setTables(prevTables =>
        prevTables.map(table =>
          table._id === orderData.tableId ? { ...table, statusClass: 'bg-gray-500' } : table
        )
      );
    };

    const handleOrderHistoryRemoved = (removedData) => {
      // Update orders when order history is removed
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.tableId === removedData.tableId) {
            const updatedHistory = order.OrderHistory.filter(history => history._id !== removedData.orderId);
            
            // Recalculate the totalOrderAmount after removal
            const newTotalAmount = updatedHistory.reduce((acc, history) => acc + history.total, 0);
            return { ...order, OrderHistory: updatedHistory, totalOrderAmount: newTotalAmount };
          }
          return order;
        });
      });
    };

    socket.on('orderAdded', handleOrderAdded);
    socket.on('orderRemoved', handleOrderRemoved);
    socket.on('orderHistoryRemoved', handleOrderHistoryRemoved); // Listen for order history removal

    return () => {
      socket.off('orderAdded', handleOrderAdded);
      socket.off('orderRemoved', handleOrderRemoved);
      socket.off('orderHistoryRemoved', handleOrderHistoryRemoved); // Cleanup the socket listener
    };
  }, [AdminId]);



  // Get table details based on its current order status
  const getTableDetails = (tableId) => {
    const tableOrder = orders.find(order => order.tableId === tableId);
    const table = tables.find(table => table._id === tableId);

    if (!table) return { statusClass: 'bg-gray-800', tableName: 'Unknown' };

    let statusClass = 'bg-gray-800';
    let totalOrderAmount = null;
    let tableName = table.name || 'Unknown';

    if (tableOrder) {
      totalOrderAmount = tableOrder.totalOrderAmount;
      if (tableOrder.orderStatus === 'Running') {
        statusClass = 'bg-red-800';
      }
    }

    return {
      statusClass,
      totalOrderAmount,
      tableName,
    };
  };

  const handleTableClick = (tableId) => {
    localStorage.setItem('selectedTableId', tableId);
    onTableSelect(tableId); // Update parent component (UserInfo)
  };

  return (
    <div className='p-3'>
      <div className='flex justify-between items-center mb-4'>
        <h1>Current Table</h1>
        <ul className='flex items-center'>
          <li className='bg-gray-500 p-1.5 rounded-full mr-2'></li>
          <li className='mr-4'>Blank</li>
          <li className='bg-red-800 p-1.5 rounded-full mr-2'></li>
          <li>Running</li>
        </ul>
      </div>
      <div className='overflow-auto h-[80vh]'>
        <div className='grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4'>
          {tables.length > 0 ? (
            tables.map((table) => {
              const { statusClass, totalOrderAmount, tableName } = getTableDetails(table._id);
              return (
                <div
                  key={table._id}
                  className={`border-dotted border-2 border-gray-900 ${statusClass} flex justify-center items-center cursor-pointer`}
                  onClick={() => handleTableClick(table._id)}
                >
                  <div className='relative w-16 h-16 flex flex-col justify-center items-center'>
                    <h1 className='text-xs'>12m</h1>
                    <h1 className='text-xs'>{tableName}</h1>
                    {totalOrderAmount && <h1 className='text-xs'>{totalOrderAmount}</h1>}
                  </div>
                </div>
              );
            })
          ) : (
            <p className='text-gray-500'>No tables available</p>
          )}
        </div>
      </div>
     
    </div>
  );
};
