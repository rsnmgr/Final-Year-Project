import React, { useState, useContext } from 'react';
import { GiRoundTable } from "react-icons/gi";
import { MdOutlineMenu } from "react-icons/md";
import { CustomerContext } from '../ContextProvider/CustomerContext';

import Side from './Side';
export default function Header() {
  const { tableData ,AdminId, tableId} = useContext(CustomerContext);
  const [sidebar,setSidebar] = useState();

  return (
    <div className="relative flex justify-between items-center p-2">
      {/* Logo Section */}
      <div>
        <h1 className="text-xl font-bold">Foody</h1>
      </div>

      {/* Table Info Section */}
      <div className="flex items-center space-x-2">
        <GiRoundTable size={24} />
        <span className="text-sm font-medium">{tableData ? tableData.table.name : 'Loading...'}</span>
      </div>

      {/* Menu Icon Section */}
      <div className='cursor-pointer' onClick={()=>setSidebar(true)}>
        <MdOutlineMenu size={24} />
      </div>
      {sidebar && (
      <div className='absolute bg-gray-900 right-0 top-0 w-1/2 md:w-1/5 h-screen z-50 rounded-l-2xl border-l border-gray-700'>
        <Side setSidebar={setSidebar}/>
      </div>
      )}
    </div>
  );
}
