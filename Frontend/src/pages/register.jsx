import  { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,FaPhoneAlt,FaLocationArrow } from 'react-icons/fa';
import img from '../assets/login.png';
const API_URL = import.meta.env.VITE_API_URL;
import { GrRestaurant } from "react-icons/gr";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inputValue,setInputValue] = useState({
    name:"",
    email:"",
    phone:"",
    address:"",
    estaurant:"",
    password:"",
    cpassword:"",
  });

  const setValue =(e)=>{
    const {name,value} = e.target;
    setInputValue({
      ...inputValue,
      [name]:value
    });
  }
  const navigate = useNavigate(); // Initialize useNavigate

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleRegisterSubmit = async(e) => {
    e.preventDefault();
    const data = await fetch(`${API_URL}/api/create`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputValue),
    });
    const res = await data.json();
    console.log(res);
    navigate('/login');
  };

  const handleLoginRedirect = () => {
    navigate('/login'); // Navigate to the login page
  };

  

  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='grid grid-cols-1 md:grid-cols-2 bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl mx-4 border border-gray-700'>
        
        {/* Image Section */}
        <div className='relative hidden md:flex justify-center items-center'>
          <img src={img} alt="Register Illustration" className='h-[80vh] object-cover rounded-l-lg' />
          <h2 className='absolute top-36 right-16 text-orange-500 font-extrabold text-xl'>FOOD ME</h2>
          <h2 className='absolute top-36 right-16 text-orange-500 font-extrabold text-xl'>FOOD ME</h2>
        </div>

        {/* Form Section */}
        <div className='flex flex-col justify-center items-center p-6 bg-gray-800 text-white rounded-r-lg shadow-lg'>
          <h2 className='text-3xl font-bold mb-6 text-center'>Register</h2>
          
          <form className='flex flex-col gap-2 w-full max-w-xs' onSubmit={handleRegisterSubmit}>
            {/* Username Input */}
            <div className='flex items-center border border-gray-400 p-3 rounded-md bg-gray-800'>
              <FaUser className='text-gray-500 mr-3' />
              <input
                type='text'
                name = 'name'
                onChange ={setValue}
                value ={inputValue.name}
                placeholder='Username'
                className='outline-none w-full bg-gray-800 text-white'
                required
              />
            </div>

            {/* Email Input */}
            <div className='flex items-center border border-gray-400 p-3 rounded-md bg-gray-800'>
              <FaEnvelope className='text-gray-500 mr-3' />
              <input
                type='email'
                name= 'email'
                onChange ={setValue}
                value ={inputValue.email}
                placeholder='Email'
                className='outline-none w-full bg-gray-800 text-white'
                required
              />
            </div>
            {/* Phone Input */}
            <div className='flex items-center border border-gray-400 p-3 rounded-md bg-gray-800'>
              <FaPhoneAlt className='text-gray-500 mr-3' />
              <input
                type='text'
                name= 'phone'
                onChange ={setValue}
                value ={inputValue.phone}
                placeholder='Phone'
                className='outline-none w-full bg-gray-800 text-white'
                required
              />
            </div>
            {/* Address Input */}
            <div className='flex items-center border border-gray-400 p-3 rounded-md bg-gray-800'>
              <FaLocationArrow className='text-gray-500 mr-3' />
              <input
                type='text'
                name= 'address'
                onChange ={setValue}
                value ={inputValue.address}
                placeholder='Address'
                className='outline-none w-full bg-gray-800 text-white'
                required
              />
            </div>
            {/* Restaurant Input */}
            <div className='flex items-center border border-gray-400 p-3 rounded-md bg-gray-800'>
              <GrRestaurant className='text-gray-500 mr-3' />
              <input
                type='text'
                name= 'restaurant'
                onChange ={setValue}
                value ={inputValue.restaurant}
                placeholder='Restaurant Name'
                className='outline-none w-full bg-gray-800 text-white'
                required
              />
            </div>

            {/* Password Input */}
            <div className='flex items-center border border-gray-400 p-3 rounded-md bg-gray-800'>
              <FaLock className='text-gray-500 mr-3' />
              <input
                type={showPassword ? 'text' : 'password'}
                name= 'password'
                onChange ={setValue}
                value ={inputValue.password}
                placeholder='Password'
                className='outline-none w-full bg-gray-800 text-white'
                required
              />
              <button type='button' onClick={togglePasswordVisibility} className='ml-3'>
                {!showPassword ? (
                  <FaEyeSlash className='text-gray-400' />
                ) : (
                  <FaEye className='text-gray-400' />
                )}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className='flex items-center border border-gray-400 p-3 rounded-md bg-gray-800'>
              <FaLock className='text-gray-500 mr-3' />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name='cpassword'
                onChange ={setValue}
                value ={inputValue.cpassword}
                placeholder='Confirm Password'
                className='outline-none w-full bg-gray-800 text-white'
                required
              />
              <button type='button' onClick={toggleConfirmPasswordVisibility} className='ml-3'>
                {!showConfirmPassword ? (
                  <FaEyeSlash className='text-gray-400' />
                ) : (
                  <FaEye className='text-gray-400' />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button type="submit" className='bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 w-full' onClick={handleRegisterSubmit}>
              Register
            </button>
          </form>

          <div className='mt-4 text-center'>
            <span className='text-gray-500'>Already have an account? </span>
            <span 
              onClick={handleLoginRedirect} 
              className='text-blue-500 cursor-pointer hover:underline'
            >
              Login here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
