import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import img from '../assets/login.png';
import { FaUser, FaLock, FaFacebook, FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles
const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate
  const [inpval, setInpval] = useState({
    email: '',
    password: '',
  });

  const setVal = (e) => {
    setInpval({ ...inpval, [e.target.name]: e.target.value });
  };
  const checkValidUser = async () => {
    const token = localStorage.getItem("TokenFoodMe");
    if (!token) return; // If no token is found, do nothing
  
    const res = await fetch(`${API_URL}/api/validUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    const data = await res.json();
  
    // Check for valid user and handle redirection based on role
    if (res.status === 401 || !data || !data.validUser) {
      navigate("/login"); // Redirect to login if the user is not valid
    } else {
      // Redirect users based on their roles
      const { role } = data.validUser;
      if (role === 'admin') {
        navigate("/admin/dashboard");
      } else if (role === 'super') {
        navigate("/super");
      } else if (role === 'user') {
        navigate("/user");
      } else {
        navigate('*'); // Fallback route
      }
    }
  };
  
  const loginuser = async (e) => {
    e.preventDefault();
    const data = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inpval),
    });
    const res = await data.json();

    // Display message with Toastify
    if (res.status === 201) {
      localStorage.setItem("TokenFoodMe", res.result.token);
      if (res.result.userValid.role === "admin") {
        navigate('/admin');
      } else if (res.result.userValid.role === "super") {
        navigate('/super');
      } else if (res.result.userValid.role === "user") {
        navigate('/user');
      } else {
        navigate('*');
      }
      toast.success(res.message); // Display success toast
    } else {
      toast.error(res.message); // Display error toast
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegisterRedirect = () => {
    navigate('/register'); // Navigate to the register page
  };

  useEffect(() => {
    checkValidUser(); // Check if a valid user is already logged in
  }, []);
  return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='grid grid-cols-1 md:grid-cols-2 bg-gray-700 rounded-lg shadow-lg w-full max-w-4xl mx-4'>
        
        {/* Image Section */}
        <div className='relative hidden md:flex justify-center items-center'>
          <img src={img} alt="Login Illustration" className='h-[80vh] object-cover rounded-l-lg' />
          <h2 className='absolute top-36 right-16 text-orange-500 font-extrabold text-xl'>FOOD ME</h2>
        </div>

        {/* Form Section */}
        <div className='flex flex-col justify-center items-center p-6 bg-gray-800 text-white rounded-r-lg shadow-lg'>
          <h2 className='text-3xl font-bold mb-6'>Login</h2>
          
          <form className='flex flex-col gap-4 w-full max-w-xs' onSubmit={loginuser}>
            {/* Username Input */}
            <div className='flex items-center border border-gray-500 p-3 rounded-md bg-gray-700'>
              <FaUser className='text-gray-400 mr-3' />
              <input
                type='text'
                placeholder='Email'
                name='email'
                value={inpval.email}
                onChange={setVal}
                className='outline-none w-full bg-transparent text-white'
                required
              />
            </div>

            {/* Password Input */}
            <div className='flex items-center border border-gray-500 p-3 rounded-md bg-gray-700'>
              <FaLock className='text-gray-400 mr-3' />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Password'
                name='password'
                value={inpval.password}
                onChange={setVal}
                className='outline-none w-full bg-transparent text-white'
                required
              />
              <button type='button' onClick={togglePasswordVisibility} className='ml-3'>
                {showPassword ? (
                  <FaEye className='text-gray-400' />
                ) : (
                  <FaEyeSlash className='text-gray-400' />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button type='submit' className='bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 w-full'>
              Login
            </button>
          </form>

          {/* Divider */}
          <div className='flex items-center my-4 w-full max-w-xs'>
            <hr className='flex-grow border-gray-500' />
            <span className='mx-2 text-gray-400'>or</span>
            <hr className='flex-grow border-gray-500' />
          </div>

          {/* Social Login */}
          <div className='flex flex-col gap-3 w-full max-w-xs'>
            {/* Facebook Login */}
            <button className='flex items-center justify-center gap-3 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 w-full'>
              <FaFacebook />
              Login with Facebook
            </button>
            {/* Google Login */}
            <button className='flex items-center justify-center gap-3 bg-red-500 text-white p-3 rounded-md hover:bg-red-600 w-full'>
              <FaGoogle />
              Login with Google
            </button>
          </div>

          {/* Register Link */}
          <p className='mt-4 text-gray-400'>
            Don't have an account?{' '}
            <span 
              onClick={handleRegisterRedirect} 
              className='text-orange-500 cursor-pointer hover:underline'
            >
              Register
            </span>
          </p>
        </div>
      </div>

      {/* ToastContainer to render the toast notifications */}
      <ToastContainer />
    </div>
  );
}
