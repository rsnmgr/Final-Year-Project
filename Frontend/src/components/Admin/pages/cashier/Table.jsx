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

  // Fetch only "Active" tables
  useEffect(() => {
    if (!AdminId) return;

    const fetchTables = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tables/${AdminId}`);
        const activeTables = response.data.tables.filter(table => table.status === "Active"); // Fetch only Active tables
        setTables(activeTables);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();

    // Listen for real-time table updates via socket.io
    socket.on("tableUpdated", fetchTables);
    socket.on("tableAdded", fetchTables);
    socket.on("tableDeleted", fetchTables);

    // Cleanup function
    return () => {
      socket.off("tableUpdated", fetchTables);
      socket.off("tableAdded", fetchTables);
      socket.off("tableDeleted", fetchTables);
    };
  }, [AdminId]);

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
          tables.map((table, index) => (
            <div
              key={table._id || index}
              className="border-dotted border-2 border-gray-600 bg-gray-800 flex justify-center items-center cursor-pointer"
            >
              <div className="relative w-16 h-16 flex flex-col justify-center items-center">
                <h1 className='text-xs'>20 Min</h1>
                <h1 className='text-xs'>{table.name}</h1>
                <h1 className='text-xs'>200</h1>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 col-span-3 md:col-span-6 text-center">No active tables</p>
        )}
      </div>
    </div>
  );
}
