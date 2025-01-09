import React from 'react';
import Header from '../components/Customer/Header';
import Main from '../components/Customer/Main';
import Bag from '../components/Customer/pages/Bag';
import Bill from '../components/Customer/pages/Bill';
import {Route,Routes} from 'react-router-dom';
export default function Menu() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <Header />
      </div>

      {/* Main Content Section */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/bag' element={<Bag />} />
          <Route path='/bill' element={<Bill />} />
        </Routes>
      </div>
    </div>
  );
}
