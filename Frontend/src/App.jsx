import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages routes
import Landing from './pages/landing';
import Login from './pages/login';
import Register from './pages/register';
import Super from './pages/superAdmin';
import Admin from './pages/admin';
import Menu from './pages/Menu';
import Error from './pages/error';
export default function App() {
  return (
    <div className='bg-gray-950 text-slate-300 h-screen'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/super" element={<Super />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/menu" element={<Menu />} /> 
          <Route path="*" element={<Error />} /> 
        </Routes>
      </BrowserRouter>
    </div>
  );
}
