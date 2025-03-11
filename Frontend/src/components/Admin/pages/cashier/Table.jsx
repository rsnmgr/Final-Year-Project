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

    const fetchData = async () => {
      try {
        const [tableResponse, orderResponse] = await Promise.all([
          axios.get(`${API_URL}/api/tables/${AdminId}`),
          axios.get(`${API_URL}/api/orders/${AdminId}`)
        ]);

        setTables(tableResponse.data.tables || []);
        setOrders(orderResponse.data.orders || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const handleOrderAdded = (orderData) => {
      setOrders(prevOrders => {
        const existingOrderIndex = prevOrders.findIndex(order => order.tableId === orderData.tableId);
        if (existingOrderIndex === -1) {
          return [...prevOrders, orderData];
        }
        return prevOrders.map(order => (order.tableId === orderData.tableId ? orderData : order));
      });
    };

    const handleOrderRemoved = ({ tableId }) => {
      setOrders(prevOrders => prevOrders.filter(order => order.tableId !== tableId));
      setTables(prevTables => prevTables.map(table =>
        table._id === tableId ? { ...table, statusClass: 'bg-gray-500' } : table
      ));
    };

    const handleOrderItemRemoved = (removedData) => {
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.tableId === removedData.tableId) {
            const updatedHistory = order.OrderHistory.map(history => {
              if (history._id === removedData.orderHistoryId) {
                // Remove the item from history
                const updatedItems = history.items.filter(item => item._id !== removedData.itemId);
                
                // Recalculate subtotal, GST, and total
                const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const newGst = newSubtotal * 0.13;
                const newTotal = newSubtotal + newGst;
    
                return { ...history, items: updatedItems, subtotal: newSubtotal, gst: newGst, total: newTotal };
              }
              return history;
            }).filter(history => history.items.length > 0); // Remove empty histories
    
            // Recalculate totalOrderAmount for the order
            const newTotalOrderAmount = updatedHistory.reduce((sum, history) => sum + history.total, 0);
    
            return { ...order, OrderHistory: updatedHistory, totalOrderAmount: newTotalOrderAmount };
          }
          return order;
        });
      });
    };
    

    socket.on('orderAdded', handleOrderAdded);
    socket.on('orderRemoved', handleOrderRemoved);
    socket.on('orderItemRemoved', handleOrderItemRemoved);
    socket.on('orderHistoryRemoved', handleOrderRemoved);

    return () => {
      socket.off('orderAdded', handleOrderAdded);
      socket.off('orderRemoved', handleOrderRemoved);
      socket.off('orderItemRemoved', handleOrderItemRemoved);
      socket.off('orderHistoryRemoved', handleOrderRemoved);
    };
  }, [AdminId]);

  const getTableDetails = (tableId) => {
    const tableOrder = orders.find(order => order.tableId === tableId);
    const table = tables.find(table => table._id === tableId);

    if (!table) return { statusClass: 'bg-gray-800', tableName: 'Unknown' };

    let statusClass = 'bg-gray-800';
    let totalOrderAmount = tableOrder?.totalOrderAmount || 0;
    let tableName = table.name || 'Unknown';

    if (tableOrder?.orderStatus === 'Running') {
      statusClass = 'bg-red-800';
    }

    return { statusClass, totalOrderAmount, tableName };
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
                  onClick={() => onTableSelect(table._id)}
                >
                  <div className='relative w-16 h-16 flex flex-col justify-center items-center'>
                    <h1 className='text-xs'>12m</h1>
                    <h1 className='text-xs'>{tableName}</h1>
                    {totalOrderAmount > 0 && <h1 className='text-xs'>{totalOrderAmount}</h1>}
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
}