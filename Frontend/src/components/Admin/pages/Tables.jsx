import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash, FaPlus, FaQrcode } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import { LoginContext } from '../../ContextProvider/Context';
import axios from 'axios';
import QRCode from 'qrcode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const URL = import.meta.env.VITE_API_URL;

export default function Table() {
  const [form, setForm] = useState(false);
  const [deleteForm, setDeleteForm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tables, setTables] = useState([]);
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [selectedTableName, setSelectedTableName] = useState('');
  const [inpVal, setInpVal] = useState({ name: '', department: '', status: 'Active' });

  const API_URL = `${URL}/api/tables`;

  useEffect(() => {
    if (userId) fetchTables();
  }, [userId]);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      setTables(response.data.tables);
    } catch (error) {
      // toast.error(error.response?.data?.message || 'Error fetching tables');
    }
  };

  const handleInputChange = (e) => {
    setInpVal({ ...inpVal, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setInpVal({ name: '', department: '', status: 'Active' });
    setSelectedTableId(null);
    setForm(true);
  };

  const openEditForm = (table) => {
    setInpVal({ name: table.name, department: table.department, status: table.status });
    setSelectedTableId(table._id);
    setForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTableId) {
      await updateTable(selectedTableId);
    } else {
      await addTable();
    }
    setForm(false);
    fetchTables();
  };

  const addTable = async () => {
    try {
      const response = await axios.post(API_URL, { AdminId: userId, ...inpVal });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding table');
    }
  };

  const updateTable = async (tableId) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}/${tableId}`, inpVal);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating table');
    }
  };

  const confirmDeleteTable = (tableId) => {
    setSelectedTableId(tableId);
    setDeleteForm(true);
  };

  const deleteTable = async () => {
    try {
      const response = await axios.delete(`${API_URL}/${userId}/${selectedTableId}`);
      toast.success(response.data.message);
      setDeleteForm(false);
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting table');
    }
  };

  const generateQRCode = async (tableId, tableName) => {
    const url = `${window.location.origin}/menu/${userId}/${tableId}`;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url);
      setQrCodeUrl(qrCodeDataUrl);
      setSelectedTableId(tableId);
      setSelectedTableName(tableName);
    } catch (error) {
      toast.error('Error generating QR code');
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${selectedTableName}.png`;
    link.click();
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/menu/${userId}/${selectedTableId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          toast.success('URL copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          toast.error('Failed to copy URL. Please try again.');
        });
    } else {
      // Fallback for older browsers or unsupported environments
      try {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        toast.success('URL copied to clipboard');
      } catch (err) {
        console.error('Fallback failed: ', err);
        toast.error('Failed to copy URL. Please try again.');
      }
    }
  };
  

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1>Table Details</h1>
        <button className="p-2 bg-gray-950 border rounded-sm" onClick={openAddForm}>
          <FaPlus />
        </button>
      </div>
      <div className="relative overflow-x-auto mt-4 h-[78vh] overflow-y-auto">
        <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-6 py-3">Table Name</th>
              <th className="px-6 py-3">Department Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y dark:divide-gray-700">
            {tables.length ? (
              tables.map((table, index) => (
                <tr key={table._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-4 py-4 text-center">{index + 1}</td>
                  <td className="px-6 py-4 text-center">{table.name}</td>
                  <td className="px-6 py-4 text-center">{table.department}</td>
                  <td className="px-6 py-4 text-center">{table.status}</td>
                  <td className="flex items-center justify-center px-6 py-4 space-x-4">
                    <button className="text-blue-600 dark:text-blue-500" onClick={() => openEditForm(table)}>
                      <FaEdit size={16} />
                    </button>
                    <button className="text-blue-600 dark:text-blue-500" onClick={() => generateQRCode(table._id, table.name)}>
                      <FaQrcode size={16} />
                    </button>
                    <button className="text-red-600 dark:text-red-500" onClick={() => confirmDeleteTable(table._id)}>
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">No tables found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {form && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-800 z-50">
          <div className="bg-gray-950 p-8 rounded-md">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg">{selectedTableId ? 'Edit' : 'Add'} Table</h1>
                <RxCross2 size={20} className="cursor-pointer" onClick={() => setForm(false)} />
              </div>
              <div className="space-y-4">
                <div>
                  <label>Table Name</label>
                  <input type="text" name="name" value={inpVal.name} onChange={handleInputChange} className="w-full p-2 rounded-sm bg-gray-950 border border-gray-800" required />
                </div>
                <div>
                  <label>Department Name</label>
                  <input type="text" name="department" value={inpVal.department} onChange={handleInputChange} className="w-full p-2 rounded-sm bg-gray-950 border border-gray-800" />
                </div>
                <div>
                  <label>Status</label>
                  <select name="status" value={inpVal.status} onChange={handleInputChange} className="w-full p-2 rounded-sm bg-gray-950 border border-gray-800">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button className="bg-gray-800 p-2 w-full mt-4" type="submit">{selectedTableId ? 'Update' : 'Add'} Table</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {qrCodeUrl && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-800 z-50">
          <div className="relative bg-gray-950 border border-blue-700 w-full max-w-md p-8 rounded-md flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
              <RxCross2 size={20} className="cursor-pointer" onClick={() => setQrCodeUrl('')} />
              <span className="text-blue-500 cursor-pointer" onClick={downloadQRCode}>{`Download (${selectedTableName})`}</span>
            </div>
            <h1 className="text-2xl text-center mb-4">Scan Me</h1>
            <img src={qrCodeUrl} alt="QR Code" className="mb-4" />
            <input type="text" className="bg-gray-950 border border-gray-900 p-2 w-full mb-4 text-center" value={`${window.location.origin}/menu/${userId}/${selectedTableId}`} readOnly />
            <button className="bg-gray-800 p-2 w-full mb-4" onClick={copyToClipboard}>Copy URL</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteForm && (
        <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-800 z-50">
          <div className="bg-gray-950 p-8 rounded-md">
            <h1>Are you sure you want to delete this table?</h1>
            <div className="flex items-center space-x-2 mt-4">
              <button className="bg-gray-800 p-2 w-full" onClick={() => setDeleteForm(false)}>Cancel</button>
              <button className="bg-red-800 p-2 w-full" onClick={deleteTable}>Delete</button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
