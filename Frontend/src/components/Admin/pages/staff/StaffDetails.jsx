import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdDelete, MdModeEdit } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { FaPlus } from 'react-icons/fa';
import { LuSearch } from 'react-icons/lu'; 
import image from '../../../../assets/defaultImg.png'; // Placeholder image
import { LoginContext } from "../../../ContextProvider/Context";
import { toast } from 'react-toastify'; // Import toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toastify styles

const API_URL = import.meta.env.VITE_API_URL;

export default function StaffDetails() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedImage, setSelectedImage] = useState(image);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: '', // Initially empty
    address: '',
    phone: '',
    salary: '',
    status: 'Active' // Default value
  });
  const [details, setDetails] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (AdminId) {
      fetchDetails();
      fetchCategories();
    }
  }, [AdminId]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/details/${AdminId}`);
      setDetails(response.data.details);
    } catch (error) {
      toast.error('Error fetching details.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/staff-category/${AdminId}`);
      setCategories(response.data.categories);
      if (response.data.categories.length > 0) {
        // Set the first category as the default selected category
        setFormData((prev) => ({
          ...prev,
          category: response.data.categories[0].name
        }));
      }
    } catch (error) {
      toast.error('Error fetching categories.');
    }
  };

  const handleToggleModal = (detail = null) => {
    setShowModal(!showModal);
    if (detail) {
      setFormData({
        name: detail.name,
        email: detail.email,
        password: detail.password,
        category: detail.category || '', // Ensure it's set correctly
        address: detail.address,
        phone: detail.phone,
        salary: detail.salary,
        status: detail.status || 'Active' // Default to 'Active' if not set
      });
      setSelectedImage(`${API_URL}/${detail.image}`);
      setSelectedDetail(detail);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        category: categories.length > 0 ? categories[0].name : '', // Default to first category
        address: '',
        phone: '',
        salary: '',
        status: 'Active' // Default to 'Active'
      });
      setSelectedImage(image); // Reset image to placeholder
      setSelectedDetail(null);
    }
  };

  const handleDeleteClick = (detail) => {
    setSelectedDetail(detail);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/api/details/${AdminId}/${selectedDetail._id}`);
      fetchDetails();
      setShowDeleteConfirm(false);
      setSelectedDetail(null);
      toast.success('Detail deleted successfully.');
    } catch (error) {
      console.error('Error deleting detail:', error);
      toast.error('Error deleting detail.');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSelectedDetail(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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
  
    data.append('AdminId', AdminId); // Make sure AdminId is set correctly
  
    console.log("Submitting data:", Object.fromEntries(data.entries())); // Debugging
  
    try {
      if (selectedDetail) {
        await axios.put(`${API_URL}/api/details/${AdminId}/${selectedDetail._id}`, data);
        toast.success('Detail updated successfully.');
      } else {
        await axios.post(`${API_URL}/api/details`, data);
        toast.success('Detail added successfully.');
      }
      fetchDetails();
      handleToggleModal();
    } catch (error) {
      console.error("Error submitting detail:", error.response?.data || error.message);
      toast.error('Error submitting detail.');
    }
  };
  

  useEffect(() => {
    return () => {
      if (selectedImage !== image) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  return (
    <div className='p-2'>
      {/* Header with Search and Add Detail Button */}
      <div className='flex justify-between items-center mb-4'>
        <div className="relative w-full max-w-xs">
          <LuSearch className="absolute inset-y-0 left-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none text-gray-500 w-5 h-5" />
          <input
            type="text"
            className="block w-[70%] p-3 pl-10 text-slate-200 bg-gray-900 text-sm border border-gray-300 rounded-lg"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className='p-2 bg-gray-900 text-white border w-auto'
          title='Detail Add'
          onClick={() => handleToggleModal()}
        >
          <FaPlus />
        </button>
      </div>

      {/* Detail Table */}
      <div className="overflow-x-auto h-[70vh]">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-700 sticky top-0 z-10">
            <tr>
              {['SN', 'Name','Email', 'Position', 'Address', 'Phone', 'Salary', 'Image', 'Status', 'Actions'].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider text-gray-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-800">
            {details.filter(detail => detail.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
              details.filter(detail => detail.name.toLowerCase().includes(searchTerm.toLowerCase())).map((detail, index) => (
                <tr key={detail._id} className="text-slate-200">
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.name}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.email}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.category}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.address}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">${detail.phone}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.salary}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">
                    <img
                      src={`${API_URL}/${detail.image}` || image}
                      alt="Detail"
                      className="w-8 h-8 rounded-md object-cover mx-auto"
                    />
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm">{detail.status}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap text-sm flex justify-center gap-2">
                    <MdModeEdit
                      className="text-2xl text-green-700 cursor-pointer"
                      title='Edit'
                      onClick={() => handleToggleModal(detail)}
                    />
                    <MdDelete
                      title='Delete'
                      className="text-2xl text-red-600 cursor-pointer"
                      onClick={() => handleDeleteClick(detail)}
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

      {/* Add/Edit Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-20 z-50">
          <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-2xl w-full h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-white">{selectedDetail ? 'Edit Detail' : 'Add Detail'}</h1>
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
                  {['name','email','password', 'address', 'phone', 'salary'].map((field) => (
                    <div key={field} className='relative'>
                      <label className='block text-sm font-medium text-white mb-1 capitalize'>
                        {field} <span className='text-red-500'> *</span>
                      </label>
                      <input
                        type={field === 'phone' ? 'tel' : field === 'salary' ? 'number' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleChange}
                        className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                        required
                      />
                    </div>
                  ))}

                  <div className='relative'>
                    <label className='block text-sm font-medium text-white mb-1'>
                      Position <span className='text-red-500'> *</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                      required
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='relative'>
                    <label className='block text-sm font-medium text-white mb-1'>
                      Status <span className='text-red-500'> *</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className='block p-1 bg-gray-900 px-3 border border-gray-700 outline-none w-full'
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className='space-y-4'>
                  {selectedImage && (
                    <img src={selectedImage} alt="Selected" className='object-cover w-full h-[50vh] rounded-md' />
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
                    {selectedDetail ? 'Update' : 'Submit'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="relative p-8 bg-gray-900 rounded-lg shadow-md max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold text-white">Confirm Deletion</h1>
              <RxCross2
                size={25}
                className="cursor-pointer text-white"
                onClick={handleDeleteCancel}
              />
            </div>
            <p className="text-white mb-4">Are you sure you want to delete the detail <strong>{selectedDetail?.name}</strong>?</p>
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
