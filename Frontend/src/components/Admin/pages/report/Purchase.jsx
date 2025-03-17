import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdDelete, MdModeEdit } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa';
import { LuSearch } from 'react-icons/lu';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import image from '../../../../assets/defaultImg.png'; // Placeholder image
import { LoginContext } from "../../../ContextProvider/Context";

const API_URL = import.meta.env.VITE_API_URL;

export default function Purchase() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [selectedImage, setSelectedImage] = useState(image);
  const [formData, setFormData] = useState({
    supplierName: '',
    itemName: '',
    quantity: '',
    pricePerUnit: '',
    totalPrice: '',
    paymentStatus: 'Pending', // Default value
    dateOfPurchase: ''
  });
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (AdminId) {
      fetchPurchases();
    }
  }, [AdminId]);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/purchases/${AdminId}`);
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      // toast.error('Failed to fetch purchases.');
    }
  };

  const handleToggleModal = (purchase = null) => {
    setShowModal(!showModal);
    if (purchase) {
      setFormData({
        supplierName: purchase.supplierName,
        itemName: purchase.itemName,
        quantity: purchase.quantity,
        pricePerUnit: purchase.pricePerUnit,
        totalPrice: purchase.totalPrice,
        paymentStatus: purchase.paymentStatus,
        dateOfPurchase: purchase.dateOfPurchase.slice(0, 10) // Formatting date for input
      });
      setSelectedImage(`${API_URL}/${purchase.image}`);
      setSelectedPurchase(purchase);
    } else {
      setFormData({
        supplierName: '',
        itemName: '',
        quantity: '',
        pricePerUnit: '',
        totalPrice: '',
        paymentStatus: 'Pending', // Default to 'Pending'
        dateOfPurchase: ''
      });
      setSelectedImage(image); // Reset image to placeholder
      setSelectedPurchase(null);
    }
  };

  const handleDeleteClick = (purchase) => {
    setSelectedPurchase(purchase);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/api/purchases/${AdminId}/${selectedPurchase._id}`);
      fetchPurchases();
      setShowDeleteConfirm(false);
      setSelectedPurchase(null);
      toast.success('Purchase deleted successfully.');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error('Failed to delete purchase.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedPurchase(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value
      };

      if (name === 'quantity' || name === 'pricePerUnit') {
        const quantity = parseFloat(updatedData.quantity) || 0;
        const pricePerUnit = parseFloat(updatedData.pricePerUnit) || 0;
        updatedData.totalPrice = (quantity * pricePerUnit).toFixed(2);
      }

      return updatedData;
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append form data
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Append image if available
    if (fileInputRef.current.files[0]) {
      data.append('image', fileInputRef.current.files[0]);
    }
  
    // Append AdminId to form data
    data.append('AdminId', AdminId);
    
    try {
      if (selectedPurchase) {
        // Update existing purchase
        await axios.put(`${API_URL}/api/purchases/${AdminId}/${selectedPurchase._id}`, data);
        toast.success('Purchase updated successfully.');
      } else {
        // Add new purchase
        await axios.post(`${API_URL}/api/purchases`, data);
        toast.success('Purchase added successfully.');
      }
      fetchPurchases(); // Refresh purchase list
      handleToggleModal(); // Close modal
    } catch (error) {
      console.error('Error submitting purchase:', error);
      toast.error('Failed to submit purchase.');
    }
  };

  const calculateTotalPurchaseAmount = () => {
    return purchases.reduce((total, purchase) => total + parseFloat(purchase.totalPrice || 0), 0).toFixed(2);
  };

  useEffect(() => {
    return () => {
      if (selectedImage !== image) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  return (
    <div className='p-3'>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header with Search and Add Purchase Button */}
      <div className='flex justify-between items-center mb-4'>
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-300 rounded-lg"
            placeholder="Search by item name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className='p-2 bg-gray-700 text-white border w-auto'
          title='Add Purchase'
          onClick={() => handleToggleModal()}
        >
          <FaPlus />
        </button>
      </div>

      {/* Purchase Table */}
      <div className="overflow-x-auto h-[70vh]">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              {[
                { short: 'SN', full: 'Serial Number' },
                { short: 'Name', full: 'Supplier Name' },
                { short: 'Items', full: 'Item Name' },
                { short: 'Qty', full: 'Quantity' },
                { short: 'Per Unit', full: 'Price Per Unit' },
                { short: 'Total', full: 'Total Price' },
                { short: 'Img', full: 'Image' },
                { short: 'Status', full: 'Status' },
                { short: 'Date', full: 'Date of Purchase' },
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
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {purchases.filter(purchase => purchase.itemName.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              purchases.filter(purchase => purchase.itemName.toLowerCase().includes(searchTerm.toLowerCase())).map((purchase, index) => (
                <tr key={purchase._id} className="text-slate-200">
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{purchase.supplierName}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{purchase.itemName}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{purchase.quantity}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">${purchase.pricePerUnit}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">${purchase.totalPrice}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    <img
                      src={`${API_URL}/${purchase.image}` || image}
                      alt="Purchase"
                      className="w-8 h-8 rounded-md object-cover mx-auto"
                    />
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{purchase.paymentStatus}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{purchase.dateOfPurchase.slice(0, 10)}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                    <MdModeEdit
                      className="text-2xl text-green-700 cursor-pointer"
                      title='Edit'
                      onClick={() => handleToggleModal(purchase)}
                    />
                    <MdDelete
                      title='Delete'
                      className="text-2xl text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(purchase)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-100">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='flex justify-start items-center'>
        <h1 className="text-white">Total Purchase Amount: ${calculateTotalPurchaseAmount()}</h1>
      </div>

      {/* Add/Edit Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-2xl w-full h-[72vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-white">{selectedPurchase ? 'Edit Purchase' : 'Add Purchase'}</h1>
              <RxCross2
                title='Close'
                size={25}
                className="cursor-pointer text-white"
                onClick={() => handleToggleModal()}
              />
            </div>

            <form className='mt-4' onSubmit={handleSubmit}>
              <div className='grid md:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  {['supplierName', 'itemName', 'quantity', 'pricePerUnit', 'dateOfPurchase'].map((field) => (
                    <div key={field} className='relative'>
                      <label className='block text-sm font-medium text-white mb-1 capitalize'>
                        {field.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </label>
                      <input
                        type={field === 'dateOfPurchase' ? 'date' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                        required
                      />
                    </div>
                  ))}

                  <div className='relative'>
                    <label className='block text-sm font-medium text-white mb-1'>Status</label>
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                      className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>

                  <div className='relative'>
                    <label className='block text-sm font-medium text-white mb-1'>Total Price</label>
                    <input
                      type="text"
                      name="totalPrice"
                      value={formData.totalPrice}
                      readOnly
                      className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  {selectedImage && (
                    <img src={selectedImage} alt="Selected" className='object-cover w-full h-[42vh] rounded-md' />
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className='hidden'
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className='p-2 bg-green-700 text-white w-full'
                  >
                    Browse Image
                  </button>
                  <button type="submit" className='p-2 bg-gray-700 text-white w-full'>
                    {selectedPurchase ? 'Update' : 'Submit'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold text-white">Confirm Deletion</h1>
              <RxCross2
                size={25}
                className="cursor-pointer text-white"
                onClick={handleDeleteCancel}
              />
            </div>
            <p className="text-white mb-4">Are you sure you want to delete the purchase <strong>{selectedPurchase?.itemName}</strong>?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="p-1 bg-red-600 text-white w-auto"
              >
                Delete
              </button>
              <button
                onClick={handleDeleteCancel}
                className="p-1 bg-gray-600 text-white w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}