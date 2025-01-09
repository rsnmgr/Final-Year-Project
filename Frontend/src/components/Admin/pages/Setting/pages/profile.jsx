import React, { useEffect, useState, useContext, useRef } from 'react';
import { GrEdit } from 'react-icons/gr';
import io from 'socket.io-client';
import { LoginContext } from '../../../../ContextProvider/Context';
import img from '../../../../../assets/defaultImg.png';
import { toast,ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const API_URL = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { loginData } = useContext(LoginContext);
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const userId = loginData?.validUser?._id;
  const socket = io(API_URL);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userId) fetchUserData();
    socket.on('userUpdated', fetchUserData);
    return () => socket.off('userUpdated', fetchUserData);
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/fetch/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserData(data.customer);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const image = event.target.files[0];
      setSelectedImage(URL.createObjectURL(image));
      uploadImage(image);
    }
  };

  const uploadImage = async (image) => {
    if (!image || !userId) return;
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', userId);

    const response = await fetch(`${API_URL}/api/updateImage/${userId}`, { method: 'PUT', body: formData });
    if (response.ok) {
      fetchUserData();
      const data = await response.json();
      toast.success(data.message); // Show success message using Toastify
    } else {
      const data = await response.json();
      toast.error(data.message); // Show error message using Toastify
    }
  };

  const handleImageDelete = async () => {
    if (!userId) return;
    const response = await fetch(`${API_URL}/api/deleteImage/${userId}`, { method: 'DELETE' });
    if (response.ok) {
      setSelectedImage(null);
      fetchUserData();
      const data = await response.json();
      toast.success(data.message); // Show success message using Toastify
    } else {
      const data = await response.json();
      toast.error(data.message); // Show error message using Toastify
    }
  };

  const handleUpdate = async () => {
    const res = await fetch(`${API_URL}/api/update/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      const updatedData = await res.json();
      setUserData(updatedData.customer);
      toast.success(updatedData.message); // Show success message using Toastify
    } else {
      const data = await res.json();
      toast.error(data.message); // Show error message using Toastify
    }
  };

  return (
    <div >
      <h1 className="text-lg  font-extrabold border-b border-gray-500">Edit Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 py-3">
        <div className="space-y-2 order-2 md:order-1">
          {['Name', 'Email', 'Phone', 'Address', 'Restaurant'].map((field) => (
            <div key={field} className="space-y-1">
              <label>{field}</label>
              <input
                type="text"
                className="block bg-gray-950 border border-gray-700 p-1 w-full rounded"
                value={userData?.[field.toLowerCase()] || ''}
                onChange={(e) => setUserData({ ...userData, [field.toLowerCase()]: e.target.value })}
              />
            </div>
          ))}
          <button className="p-2 bg-green-800 w-full rounded" onClick={handleUpdate}>Update Profile</button>
        </div>

        <div className='order-1 md:order-2'>
          <label>Profile Picture</label>
          <div className="relative">
            <img
               src={selectedImage || userData?.image ? `${API_URL}/${userData?.image}` : img}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto object-cover"
            />
            <div
              className="flex items-center space-x-2 text-sm absolute bottom-2 left-1/3 transform -translate-x-1/3 cursor-pointer bg-gray-950 p-1 border border-gray-700 rounded-md"
              onClick={() => setShowMessageBox(!showMessageBox)}
            >
              <GrEdit size={16} /> <span>Edit</span>
            </div>
            {showMessageBox && (
              <div className="absolute left-1/4 py-1 w-48 border border-gray-700 text-sm bg-gray-950 rounded-md">
                <button className="block w-full text-left px-4 py-1 hover:bg-blue-800" onClick={() => fileInputRef.current.click()}>Upload Photo</button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <button className="block w-full text-left px-4 py-1 hover:bg-blue-800" onClick={handleImageDelete}>Delete Photo</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
