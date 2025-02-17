import React, { useState, useEffect } from 'react';
import { IoIosArrowForward } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";

export default function Info() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { AdminId, tableId } = useParams();
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [friendCode, setFriendCode] = useState(["", "", "", ""]);
  const [isFriendOpen, setFriendOpen] = useState(false);
  const [friendName, setFriendName] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle friend code input with auto-focus
  const handleFriendCodeChange = (e, index) => {
    const value = e.target.value;

    if (/^\d?$/.test(value)) {
      const newFriendCode = [...friendCode];
      newFriendCode[index] = value;
      setFriendCode(newFriendCode);

      // Move focus to the next input if not empty and not the last input
      if (value && index < friendCode.length - 1) {
        document.getElementById(`friendCode-${index + 1}`).focus();
      }
    }
  };

  // Handle backspace to move to the previous input
  const handleFriendCodeKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !friendCode[index] && index > 0) {
      document.getElementById(`friendCode-${index - 1}`).focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert('Please fill in both fields!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/add-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          adminId: AdminId,
          tableId: tableId
        })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('customerToken', data.token);
        alert('Customer added successfully!');
        navigate('/menu');
      } else {
        alert(data.message || 'Failed to add customer.');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Handle skip button
  const handleSkip = async () => {
    try {
      const response = await fetch(`${API_URL}/api/add-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: AdminId, tableId: tableId })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('customerToken', data.token);
        navigate('/menu');
      } else {
        alert(data.message || 'Failed to add customer.');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Handle Friend Code Submission
  const handleFriendSubmit = async (e) => {
    e.preventDefault();
    if (!friendName) {
      alert('Please enter your name.');
      return;
    }
    const friendCodeStr = friendCode.join("");
    try {
      const response = await fetch(`${API_URL}/api/add-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: AdminId,
          tableId: tableId,
          friendCode: friendCodeStr,
          name: friendName
        })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('customerToken', data.token);
        alert('Friend successfully added to the table!');
        navigate('/menu');
      } else {
        alert(data.message || 'Failed to add friend.');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('An error occurred. Please try again.');
    }
    setFriendOpen(false);
  };

  const customer = async () => {
    const token = localStorage.getItem("customerToken");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/valid-customer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      const data = await res.json();

      if (res.status === 200 && data?.validUser?.role === 'customer') {
        navigate("/menu");
      }
    } catch (error) {
      console.error('Error during customer validation:', error);
    }
  };

  useEffect(() => {
    customer();
  }, []);

  return (
    <div className='w-full h-full flex justify-center items-center p-3'>
      <form onSubmit={handleSubmit}>
        <div className='space-y-3 md:border border-gray-700 md:p-8'>
          <h1 className='text-xl text-center mb-4'>Welcome to Digital Online Menu Service</h1>

          {/* Name Input */}
          <div className='relative space-y-2'>
            <label htmlFor="name">Enter Your Full Name</label>
            <input
              type="text"
              name='name'
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className='block outline-none bg-gray-950 border border-gray-700 w-full p-2'
              required
            />
          </div>

          {/* Phone Input */}
          <div className='relative space-y-2'>
            <label htmlFor="phone">Enter Your Mobile Number</label>
            <input
              type="text"
              name='phone'
              placeholder="98XXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              className='block outline-none bg-gray-950 border border-gray-700 w-full p-2'
              required
            />
          </div>

          {/* Submit Button */}
          <button type='submit' className='p-2 bg-green-900 w-full hover:bg-green-800 transition duration-300'>
            LET'S GO
          </button>

          <div className='flex justify-between items-center'>
            <div onClick={() => setFriendOpen(true)} className='cursor-pointer'>
              <p>Friend Code</p>
            </div>
            <span
              className='flex justify-between items-center underline cursor-pointer mt-2'
              onClick={handleSkip}
            >
              <p>Skip</p>
              <IoIosArrowForward size={20} />
            </span>
          </div>
        </div>
      </form>

      {/* Friend Code Modal */}
      {isFriendOpen && (
        <div className='fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 p-2'>
          <form onSubmit={handleFriendSubmit} className='p-6 bg-gray-950 md:w-1/4 space-y-4 border border-gray-700'>
            <h1 className='text-center text-lg'>Enter Your Friend Code</h1>
            <div>
              <input
                type="text"
                className='py-2 bg-gray-950 border-b border-gray-800 outline-none w-full'
                placeholder='Enter Your Name'
                required
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
              />
            </div>
            <div className='grid grid-cols-4 gap-4'>
              {friendCode.map((code, index) => (
                <input
                  key={index}
                  id={`friendCode-${index}`}
                  type="text"
                  maxLength={1}
                  value={code}
                  onChange={(e) => handleFriendCodeChange(e, index)}
                  onKeyDown={(e) => handleFriendCodeKeyDown(e, index)}
                  className='p-2 bg-gray-950 border border-gray-800 outline-none text-center rounded-md'
                  required
                />
              ))}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <button type="button" className='p-2 bg-gray-800 w-full' onClick={() => setFriendOpen(false)}>
                Cancel
              </button>
              <button type="submit" className='p-2 bg-green-800 w-full'>
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
