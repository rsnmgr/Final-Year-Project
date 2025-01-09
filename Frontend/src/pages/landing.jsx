import React, { useState, useEffect } from 'react';
import { GiHamburgerMenu } from "react-icons/gi";
import { LuUtensilsCrossed } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import '../App.css'

// Landing pages components
import Home from '../components/Landing/Home';
import About from '../components/Landing/About';
import Feature from '../components/Landing/Feature';
import Services from '../components/Landing/Services';
import Contact from '../components/Landing/Contact';
const API_URL = import.meta.env.VITE_API_URL;

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    validateUserRole(); // Validate user on component mount
  }, []);

  const openMenu = () => {
    setMenu(!menu);
  };

  const handleScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    if (menu) {
      setMenu(false);
    }
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      if (userRole === 'admin') {
          navigate("/admin");
      } else if (userRole === 'super') {
          navigate("/super");
      } else {
          navigate("/");
      }
  } else {
      navigate("/login");
  }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const validateUserRole = async () => {
    try {
      const token = localStorage.getItem("TokenFoodMe");
      const res = await fetch(`${API_URL}/api/validUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        }
      });
      const data = await res.json();
      if (res.status === 401 || !data) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
        setUserRole(data.validUser.role);
      }
    } catch (error) {
      // console.error("Error validating user role", error);
      // navigate("*");
    }
  };

  return (
    <div className='h-[100vh]'>
      <header className=' p-4 md:px-16 h-[10vh] flex justify-between items-center'>
        <h1 className='text-lg md:text-xl font-extrabold'>
          FOODS <span className='text-orange-600'>ME</span>
        </h1>
        <div className='md:hidden'>
          <GiHamburgerMenu size={20} onClick={openMenu} className='cursor-pointer' />
          <nav
            className={`fixed top-0 right-0 h-screen w-[60%] sm:w-1/2 bg-gray-800 
                        transform ${menu ? 'translate-x-0' : 'translate-x-full'} 
                        transition-transform duration-500 ease-in-out opacity-${menu ? '100' : '0'} z-50`}
          >
            <div className='flex justify-between items-center p-3 shadow-md'>
              <h1 className='underline cursor-pointer' onClick={handleRegisterClick}>Register</h1>
              <LuUtensilsCrossed size={20} onClick={openMenu} className='cursor-pointer' />
            </div>
            <ul className='text-center'>
              <li className='cursor-pointer hover:bg-gray-900 p-3' onClick={() => handleScrollTo('home')}>Home</li>
              <li className='cursor-pointer hover:bg-gray-900 p-3' onClick={() => handleScrollTo('about')}>About</li>
              <li className='cursor-pointer hover:bg-gray-900 p-3' onClick={() => handleScrollTo('feature')}>Feature</li>
              <li className='cursor-pointer hover:bg-gray-900 p-3' onClick={() => handleScrollTo('services')}>Services</li>
              <li className='cursor-pointer hover:bg-gray-900 p-3' onClick={() => handleScrollTo('contact')}>Contact</li>
              <li className='p-2 border-y cursor-pointer' onClick={handleLoginClick}>Login</li>
              <li className='p-2 border-b px-3 cursor-pointer' onClick={()=>navigate("/register")}>Sign up</li>
            </ul>
          </nav>
        </div>
        <ul className='hidden md:flex items-center space-x-4'>
          <li className='cursor-pointer' onClick={() => handleScrollTo('home')}>Home</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('about')}>About</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('feature')}>Feature</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('services')}>Services</li>
          <li className='cursor-pointer' onClick={() => handleScrollTo('contact')}>Contact</li>
          <li className='cursor-pointer' onClick={handleLoginClick}>Sign in</li>
          <li className='p-1 text-sm border px-3 rounded-md cursor-pointer' onClick={()=>navigate("/register")}>Sign up</li>
        </ul>
      </header>
      <main className='p-4 md:px-16 h-[90vh] overflow-y-auto'>
        <section id='home'><Home /></section>
        <section id='about'><About /></section>
        <section id='feature'><Feature /></section>
        <section id='services'><Services /></section>
        <section id='contact'><Contact /></section>
      </main>
    </div>
  );
}
