import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the CustomerContext
export const CustomerContext = createContext();

export function CustomerContextProvider({ children }) {
  const [customerData, setCustomerData] = useState(""); // State for customer data
  const API_URL = import.meta.env.VITE_API_URL;
  const [tableData, setTableData] = useState(null);
  const AdminId = customerData?.validUser?.adminId;
  const tableId = customerData?.validUser?.tableId;
  const Cname = customerData?.validUser?.name;
  const Cphone = customerData?.validUser?.phone;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tables/${AdminId}/${tableId}`);
        setTableData(response.data); // Update the state with fetched data
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    if (AdminId && tableId) {
      fetchData(); // Fetch data only if parameters are available
    }
  }, [AdminId, tableId]);
  
  return (
    <CustomerContext.Provider value={{ customerData, setCustomerData ,tableData,AdminId, tableId,Cname,Cphone}}>
      {children}
    </CustomerContext.Provider>
  );
}
