import React, { useState, useContext } from 'react';
import { GiRoundTable } from "react-icons/gi";
import { MdOutlineMenu } from "react-icons/md";
import { TableContext } from '../ContextProvider/TableContext';
export default function Header() {
  const { tableData ,AdminId,tableId} = useContext(TableContext);

  return (
    <div className="flex justify-between items-center p-2">
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
      <div className='cursor-pointer'>
        <MdOutlineMenu size={24} />
      </div>
    </div>
  );
}
