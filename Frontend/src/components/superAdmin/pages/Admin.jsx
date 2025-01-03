import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { RxCross1 } from "react-icons/rx";
import img from '../../../assets/defaultImg.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [selectedImage, setSelectedImage] = useState(img);
  const [formVisible, setFormVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const fileInputRef = useRef(null);
  const [inpVal, setInpVal] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    restaurant: '',
    password: '',
  });
  const [customers, setCustomers] = useState([]);

  // Fetch customers function
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fetchAll`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      } else {
        console.error('Failed to fetch customers:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInpVal({ ...inpVal, [name]: value });
  };

  const handleChooseImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleOpenForm = (customer = null) => {
    setFormVisible(true);
    if (customer) {
      setCurrentCustomerId(customer._id);
      setInpVal({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        restaurant: customer.restaurant,
        password: '', // Don't populate password for security reasons
      });
      setSelectedImage(customer.image ? `${API_URL}/${customer.image}` : img);
    } else {
      setCurrentCustomerId(null);
      setInpVal({
        name: '',
        email: '',
        phone: '',
        address: '',
        restaurant: '',
        password: '',
      });
      setSelectedImage(img);
    }
  };

  const handleDelete = (customerId) => {
    setDeleteConfirmVisible(true);
    setCurrentCustomerId(customerId);
  };

  const handleConfirmDelete = async () => {
    try {
      // Optimistically remove the customer from the local state before the deletion call
      setCustomers(prevCustomers => prevCustomers.filter(customer => customer._id !== currentCustomerId));
  
      const response = await fetch(`${API_URL}/api/delete/${currentCustomerId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        toast.success('Customer deleted successfully');
        fetchCustomers(); // Fetch customers again to make sure the data is synced with the server
      } else {
        toast.error('Failed to delete customer');
      }
    } catch (error) {
      toast.error('Error deleting customer');
      console.error('Error deleting customer:', error);
    } finally {
      setDeleteConfirmVisible(false);
      setCurrentCustomerId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(inpVal).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const fileInput = fileInputRef.current.files[0];
    if (fileInput) {
      formData.append('image', fileInput);
    }

    try {
      const response = currentCustomerId
        ? await fetch(`${API_URL}/api/update/${currentCustomerId}`, {
            method: 'PUT',
            body: formData,
          })
        : await fetch('${API_URL}/api/create', {
            method: 'POST',
            body: formData,
          });

      if (response.ok) {
        toast.success(currentCustomerId ? 'Customer updated successfully' : 'Customer added successfully');
        fetchCustomers(); // Fetch customers after add or edit
        setInpVal({
          name: '',
          email: '',
          phone: '',
          address: '',
          restaurant: '',
          password: '',
        });
        setSelectedImage(img);
        setFormVisible(false);
        setCurrentCustomerId(null);
      } else {
        toast.error('Failed to save customer');
      }
    } catch (error) {
      toast.error('Error saving customer');
      console.error('Error saving customer:', error);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <h1>My Customers</h1>
        <div className="bg-gray-700 p-2" onClick={() => handleOpenForm()}>
          <FaPlus size={16} />
        </div>
      </div>

      {/* Table Section */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-center rtl:text-right  dark:text-gray-400">
          <thead className="text-xs  uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border-b border-gray-600">
            <tr>
              <th scope="col" className="px-6 py-3">SN</th>
              <th scope="col" className="px-6 py-3">User name</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Phone</th>
              <th scope="col" className="px-6 py-3">Address</th>
              <th scope="col" className="px-6 py-3">Restaurant Name</th>
              <th scope="col" className="px-6 py-3">Image</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer, index) => (
                customer && (
                  <tr key={customer._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4 items-center text-center">{index + 1}</td>
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white items-center text-center">
                      {customer.name}
                    </th>
                    <td className="px-6 py-4 items-center text-center">{customer.email}</td>
                    <td className="px-6 py-4 items-center text-center">{customer.phone}</td>
                    <td className="px-6 py-4 items-center text-center">{customer.address}</td>
                    <td className="px-6 py-4 items-center text-center">{customer.restaurant}</td>
                    <td className="px-6 py-4 items-center text-center">
                      <img src={customer.image ? `${API_URL}/${customer.image}` : img} className="w-8 h-8 border border-gray-600" alt="Customer" />
                    </td>
                    <td className="flex items-center justify-center px-6 py-4 space-x-4">
                      <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                        <FaEdit size={16} className="inline-block" onClick={() => handleOpenForm(customer)} />
                      </a>
                      <a href="#" className="font-medium text-red-600 dark:text-red-500 hover:underline">
                        <FaTrash size={16} className="inline-block" onClick={() => handleDelete(customer._id)}/>
                      </a>
                    </td>
                  </tr>
                )
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-300">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add and Edit Form */}
      {formVisible && (
        <div className="absolute inset-0 md:flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-gray-800 md:w-1/2 p-6 rounded-md">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg  mb-4">{currentCustomerId ? 'Edit Customer' : 'Add Customer'}</h2>
              <RxCross1 size={20} className="text-white cursor-pointer" onClick={() => setFormVisible(false)} />
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name:</label>
                    <input type="text" id="name" name="name" onChange={handleChange} value={inpVal.name} className="w-full p-1 mt-1 text-gray-300 border border-gray-500 outline-none bg-gray-800" required/>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email:</label>
                    <input type="email" id="email" name="email" onChange={handleChange} value={inpVal.email} className="w-full p-1 mt-1 text-gray-300 border border-gray-500 outline-none bg-gray-800" required/>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Phone:</label>
                    <input type="tel" id="phone" name="phone" onChange={handleChange}  value={inpVal.phone}  className="w-full p-1 mt-1 text-gray-300 border border-gray-500 outline-none bg-gray-800"  required  />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-300">Address:</label>
                    <input  id="address"  name="address"  onChange={handleChange}  value={inpVal.address}  className="w-full p-1 mt-1 text-gray-300 border border-gray-500 outline-none bg-gray-800"  required
                    />
                  </div>

                  <div>
                    <label htmlFor="restaurant" className="block text-sm font-medium text-gray-300">Restaurant:</label>
                    <input  type="text"  id="restaurant"  name="restaurant"  onChange={handleChange}  value={inpVal.restaurant}  className="w-full p-1 mt-1 text-gray-300 border border-gray-500 outline-none bg-gray-800"  required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password:</label>
                    <input  type="text"  id="password"  name="password"  onChange={handleChange}  value={inpVal.password}  className="w-full p-1 mt-1 text-gray-300 border border-gray-500 outline-none bg-gray-800" required={currentCustomerId === null}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <img
                    src={selectedImage} // Display selected image
                    alt="Customer"
                    className="h-[52vh] md:w-[52vw] border border-gray-400 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    className="bg-orange-700 text-white p-2 w-full rounded-md hover:bg-orange-800"
                    onClick={handleChooseImageClick} // Trigger the file input dialog
                  >
                    Choose Image
                  </button>
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef} // Use the ref to target the file input
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange} // Update state when an image is selected
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-blue-700 text-white p-3 hover:bg-blue-800 w-full mt-6"
              >
                {currentCustomerId ? 'Update Customer' : 'Add Customer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteConfirmVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded shadow-md">
            <h2 className="text-lg  mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this customer?</p>
            <div className="flex justify-end mt-4">
              <button type="button" onClick={() => setDeleteConfirmVisible(false)} className="mr-2 bg-gray-700 p-2 rounded">Cancel</button>
              <button onClick={handleConfirmDelete} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
}
