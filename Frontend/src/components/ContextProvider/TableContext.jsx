// import React, { createContext, useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL;

// export const TableContext = createContext();

// export const TableProvider = ({ children }) => {
//   const { AdminId, tableId } = useParams();
//   const [tableData, setTableData] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/api/tables/${AdminId}/${tableId}`);
//         setTableData(response.data); // Update the state with fetched data
//       } catch (error) {
//         console.error("Error fetching table data:", error);
//       }
//     };

//     if (AdminId && tableId) {
//       fetchData(); // Fetch data only if parameters are available
//     }
//   }, [AdminId, tableId]);

//   return (
//     <TableContext.Provider value={{ AdminId, tableId, tableData }}>
//       {children}
//     </TableContext.Provider>
//   );
// };
