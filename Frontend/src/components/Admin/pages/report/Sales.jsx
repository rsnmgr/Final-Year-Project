import { useEffect, useState, useContext } from 'react';
import { LuSearch } from 'react-icons/lu';
import { MdDelete } from 'react-icons/md';
import { LuView } from "react-icons/lu";
import { LoginContext } from '../../../ContextProvider/Context';
import { io } from "socket.io-client";
import moment from "moment";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function Sales() {
  const [openItems, setOpenItems] = useState(null);
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;
  const [sales, setSales] = useState([]);
  const [tableData, setTableData] = useState({});
  const [deleteReport, setDeleteReport] = useState();
  const [customdate, setCustomDate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Open custom date form when filter is set to "custom"
  useEffect(() => {
    if (filter === 'custom') {
      setCustomDate(true);
    }
  }, [filter]);

  useEffect(() => {
    if (!userId) return;

    const fetchReport = async () => {
      try {
        const response = await fetch(`${API_URL}/api/fetch-report/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }
        const data = await response.json();
        
        if (data && Array.isArray(data.sales)) {
          setSales(data.sales);
          data.sales.forEach(sale => {
            const { tableId } = sale;
            fetchTableName(tableId);
          });
        } else {
          console.error("Fetched data is not in the expected format:", data);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      }
    };

    const fetchTableName = async (tableId) => {
      if (tableData[tableId]) return; // If the table data is already available, don't refetch
      try {
        const response = await fetch(`${API_URL}/api/tables/${userId}/${tableId}`);
        if (response.ok) {
          const table = await response.json();
          setTableData(prev => ({ ...prev, [tableId]: table.table.name }));
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
      }
    };

    fetchReport();
    socket.on("reportAdded", fetchReport);
    socket.on("saleDeleted", fetchReport);
    return () => {
      socket.off("reportAdded", fetchReport);
      socket.off("saleDeleted", fetchReport);
    };
  }, [userId, tableData]);

  const deleteSales = async (saleId) => {
    if (!userId || !saleId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/sales/delete/${userId}/${saleId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete sale");
      }
  
      // Remove the deleted sale from the state
      setSales(prevSales => prevSales.filter(sale => sale._id !== saleId));
      setDeleteReport(false); // Close delete confirmation modal
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };

  const getFilteredSales = (sales, filter) => {
    const now = moment();
    switch (filter) {
      case 'days':
        return sales.filter(sale => moment(sale.date).isSame(now, 'day'));
      case 'weekly':
        return sales.filter(sale => 
          moment(sale.date).isSameOrAfter(now.clone().subtract(7, 'days'), 'day')
        );
      case 'monthly':
        return sales.filter(sale => 
          moment(sale.date).isSameOrAfter(now.clone().subtract(30, 'days'), 'day')
        );
      case 'custom':
        return sales.filter(sale => 
          moment(sale.date).isBetween(moment(startDate), moment(endDate), null, '[]')
        );
      default:
        return sales;
    }
  };
  

  const filteredSales = getFilteredSales(sales, filter).filter(sale => 
    tableData[sale.tableId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredSales.reduce((total, sale) => total + sale.totalAmmount, 0);

  const handleCustomFilter = () => {
    setFilter('custom');
    setCustomDate(false);
  };

  return (
    <div className='p-3'>
      <div className='flex justify-between items-center mb-4'>
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-800 outline-none rounded-lg"
            placeholder="Search by table name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select 
            name="filter" 
            id="filter" 
            className='p-2 px-3 bg-black border border-gray-800 outline-none'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="days">Days</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md h-[70vh]">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {[
                { short: 'SN', full: 'Serial Number' },
                { short: 'Table Name', full: 'Table Name' },
                { short: 'Items', full: 'Item Name' },
                { short: 'Sub Total', full: 'Sub Total' },
                { short: 'Discount %', full: 'Discount %' },
                { short: 'Discount Amount', full: 'Discount Amount' },
                { short: 'Total Amount', full: 'Total Amount' },
                { short: 'Payment Type', full: 'Payment Type' },
                { short: 'Date', full: 'Date' },
                { short: 'Action', full: 'Actions' }
              ].map(({ short, full }) => (
                <th
                  key={short}
                  className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                  title={full}
                >
                  {short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredSales.length ? filteredSales.map((sale, index) => (   
              <tr key={index} className="text-slate-200">
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{tableData[sale.tableId] || "Loading..."}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                  {sale.items.reduce((total, item) => total + item.quantity, 0)}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.SubtotalAmmount}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.Discount}%</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.DiscountAmmount}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.totalAmmount}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{sale.paymentType}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm"><span>{moment(sale.date).format("YYYY-MM-DD")}</span> <span className='block'>{moment(sale.date).format("hh:mm A")}</span></td>
                <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                  <LuView
                    className="text-2xl text-green-800 cursor-pointer"
                    title='view'
                    onClick={() => setOpenItems(sale)}
                  />
                  <MdDelete
                    title="Delete"
                    className="text-2xl text-red-800 cursor-pointer"
                    onClick={() => setDeleteReport(sale._id)} 
                  />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-gray-400">No sales reports found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal to View Sale Items */}
      {openItems && (
        <div className='absolute p-3 inset-0 flex justify-center items-center h-screen bg-opacity-70 bg-gray-950 z-50'>
          <div className='bg-gray-900 border border-gray-800 md:p-6 w-full md:w-1/3 rounded-lg'>
            <div className="bg-gray-900 p-2 border-t border-green-500 rounded-lg shadow-lg">
              <div className="flex justify-between items-center bg-gray-900 p-3 border-b-2 border-gray-500">
                <h1 className="text-white font-semibold">            {tableData[openItems.tableId] ? tableData[openItems.tableId] : ``}
                </h1>
                <p className="text-gray-400 text-sm">{new Date(openItems.date).toLocaleTimeString()}</p>
              </div>
              <div className="overflow-auto max-h-72">
                <table className="w-full text-sm text-white">
                  <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr className="flex justify-between px-3 py-2 border-b-2 border-gray-700">
                      <th className="flex-1 text-left">Item</th>
                      <th className="flex-1 text-center">Quantity</th>
                      <th className="flex-1 text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody className="block h-60 overflow-y-auto">
                    {openItems.items.map((item, idx) => (
                      <tr key={idx} className="flex justify-between px-3 py-2 border-b border-gray-800">
                        <td className="flex-1 text-left">{item.name}</td>
                        <td className="flex-1 text-center">{item.quantity}</td>
                        <td className="flex-1 text-right">{item.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center bg-gray-900 gap-2 border-t border-gray-500 p-2">
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-md transition-all" onClick={() => setOpenItems(null)}>
                  Close
                </button>
                <button className="w-full bg-green-800 hover:bg-green-700 text-white py-2 rounded-md transition-all">
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteReport && (
        <div className="absolute p-3 inset-0 flex justify-center items-center h-screen bg-opacity-70 bg-gray-950 z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">Confirm Delete</h2>
            <p className="text-gray-400">Are you sure you want to delete this report?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-800 px-4 py-2 rounded-md" onClick={() => setDeleteReport(null)}>No</button>
              <button className="px-4 py-2 rounded-md bg-red-800 text-white" onClick={() => deleteSales(deleteReport)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Choose */}
      {customdate && (
        <div className="absolute p-3 inset-0 flex justify-center items-center h-screen bg-opacity-70 bg-gray-950 z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">Confirm Filter</h2>
            <div className='flex items-center space-x-2'>
              <div className='space-y-2'>
                <label htmlFor="">Start Date</label>
                <input 
                  type="date" 
                  className='block bg-gray-900 outline-none border border-gray-800 p-2' 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <label htmlFor="">End Date</label>
                <input 
                  type="date" 
                  className='block bg-gray-900 outline-none border border-gray-800 p-2' 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-gray-800 px-4 py-2 rounded-md" onClick={() => setCustomDate(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-md bg-red-800 text-white" onClick={handleCustomFilter}>Apply Filter</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1>Total Sales Amount</h1>
        <span>{totalAmount}</span>
      </div>
    </div>
  );
}