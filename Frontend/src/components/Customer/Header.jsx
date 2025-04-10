import { useState, useContext } from 'react';
import { GiRoundTable } from "react-icons/gi";
import { MdOutlineMenu } from "react-icons/md";
import { CustomerContext } from '../ContextProvider/CustomerContext';
import { IoIosNotifications } from "react-icons/io";

import Side from './Side';
import Notification from './Notification';
export default function Header() {
  const { tableData ,AdminId, tableId} = useContext(CustomerContext);
  const [sidebar,setSidebar] = useState();
  const [notification, setNotification] = useState(false);
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
      <div className='flex items-center space-x-2'>
        {/* Notification Section */}
        <div className="relative cursor-pointer" onClick={() => setNotification(!notification)}>
          <label className="absolute -top-1 -right-1 text-xs text-white bg-red-900 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer">
            0
          </label>
          <IoIosNotifications size={24} />
        </div>
        {/* Menu Icon Section */}
        <div className='cursor-pointer' onClick={()=>setSidebar(true)}>
          <MdOutlineMenu size={24} />
        </div>
      </div>
      {sidebar && (
      <div className='absolute bg-gray-900 right-0 top-0 w-1/2 md:w-1/5 h-screen z-50 rounded-l-2xl border-l border-gray-700'>
        <Side setSidebar={setSidebar}/>
      </div>
      )}
      {/* Notification Section */}
      {notification && (
      <div className='absolute right-0 md:right-10 top-12 md:w-1/2 lg:w-1/4 bg-gray-900  border-l border-y border-gray-600 md:rounded-l-2xl z-50 flex flex-col'> 
          <Notification setNotification={setNotification} />
        </div>
      )}
    </div>
  );
}
