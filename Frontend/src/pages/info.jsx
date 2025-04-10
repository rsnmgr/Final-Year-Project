import  { useState, useEffect } from 'react';
import { IoIosArrowForward } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";

export default function Info() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { AdminId, tableId } = useParams();
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    </div>
  );
}
