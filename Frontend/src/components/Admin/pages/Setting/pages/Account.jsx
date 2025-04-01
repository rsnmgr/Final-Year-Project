import { useState, useContext } from 'react';
import { LoginContext } from '../../../../ContextProvider/Context';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const API_URL = import.meta.env.VITE_API_URL;

export default function Admin() {
  const { loginData } = useContext(LoginContext);
  const userId = loginData?.validUser?._id;
  console.log(userId);

  // State to store old password, new password, and confirm password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ setErrorMessage] = useState('');

  // Function to handle form submission
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/updatePassword/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();

      // Show the backend message only
      if (response.ok) {
        toast.success(data.message || 'Password updated successfully');
        handleClearFields(); // Clear fields after success
      } else {
        toast.error(data.message || 'Error updating password');
        setErrorMessage(data.message || 'Error updating password'); // Set error message
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error('An error occurred while updating the password.');
    }
  };

  // Function to clear input fields
  const handleClearFields = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(''); // Clear error message when fields are cleared
  };

  return (
    <div className='px-4 py-4 md:px-12'>
      <h1 className='text-lg'>Account Setting</h1>
      <div className='grid md:grid-cols-2 gap-2 md:gap-4 mt-4'>
        <div>
          <label htmlFor="old" className="block text-sm font-medium text-gray-300">Old Password</label>
          <input
            type="password" // Changed to "password" for security
            id="old"
            name="old"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full p-1 mt-1 text-gray-500 border border-gray-700 outline-none bg-gray-900"
            required
          />
        </div>
        
        <div className='md:col-span-2 grid grid-cols-2 gap-4'>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">New Password</label>
            <input
              type="password" // Changed to "password" for security
              id="password"
              name="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-1 mt-1 text-gray-500 border border-gray-700 outline-none bg-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="cpassword" className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <input
              type="password" // Changed to "password" for security
              id="cpassword"
              name="cpassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-1 mt-1 text-gray-500 border border-gray-700 outline-none bg-gray-900"
              required
            />
          </div>
        </div>
      </div>
      <div className='space-x-2 mt-4'>
        <button
          className='p-2 bg-gray-800 hover:bg-gray-900 px-4 rounded-sm border border-gray-800'
          onClick={handleUpdatePassword}
        >
          Update
        </button>
        <button
          className='p-2 hover:bg-gray-800 px-4 rounded-sm border border-gray-800'
          onClick={handleClearFields}
        >
          Clear
        </button>
      </div>
      <ToastContainer /> {/* Add ToastContainer here to render notifications */}
    </div>
  );
}
