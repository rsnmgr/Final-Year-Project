import React, { useState } from 'react';
/* React Icons */
import { RxDashboard, RxCross2 } from "react-icons/rx";
import { GiTabletopPlayers } from "react-icons/gi";
import { MdCountertops } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { FaKitchenSet, FaChevronDown,FaUsers } from "react-icons/fa6";
import { TbReportSearch } from "react-icons/tb";

export default function Sidebar({ setSidebar, handlePageChange, currentPage }) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleItemClick = (page) => {
    handlePageChange(page); // Update the current page
    setSidebar(false); // Close the sidebar on small screens
  };

  return (
    <div>
      <div className="flex justify-between md:justify-start p-3 shadow-md">
        <h1>Food Me</h1>
        <RxCross2 size={20} onClick={() => setSidebar(false)} className="md:hidden cursor-pointer" />
      </div>
      <ul>
        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            currentPage === 'Dashboard' ? 'bg-gray-800' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('Dashboard')}
        >
          <RxDashboard size={18} />
          <span>Dashboard</span>
        </li>

        {/* Menu Dropdown */}
        <li className="flex flex-col border-t border-gray-600">
          <div
            className={`flex items-center justify-between p-3 cursor-pointer ${
              activeDropdown === 'Menu' ? 'border-b border-gray-600' : 'border-b border-gray-600'
            }`}
            onClick={() => toggleDropdown('Menu')}
          >
            <div className="flex items-center space-x-3">
              <FaKitchenSet size={18} />
              <span>Menu</span>
            </div>
            <FaChevronDown
              className={`transform transition-transform duration-300 ${
                activeDropdown === 'Menu' ? 'rotate-180' : ''
              }`}
            />
          </div>
          {activeDropdown === 'Menu' && (
            <ul className="ml-6">
              <li
                className={`p-3 cursor-pointer ${
                  currentPage === 'Category' ? 'bg-gray-800' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('Category')}
              >
                Category
              </li>
              <li
                className={`p-3 cursor-pointer ${
                  currentPage === 'Product' ? 'bg-gray-800' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('Product')}
              >
                Product
              </li>
            </ul>
          )}
        </li>

        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            currentPage === 'Table' ? 'bg-gray-800' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('Table')}
        >
          <GiTabletopPlayers size={18} />
          <span>Tables</span>
        </li>

        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            currentPage === 'Cashier' ? 'bg-gray-800' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('Cashier')}
        >
          <MdCountertops size={18} />
          <span>Cashier</span>
        </li>
        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            currentPage === 'Kitchen' ? 'bg-gray-800' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('Kitchen')}
        >
          <FaKitchenSet size={18} />
          <span>Kitchen</span>
        </li>

        {/* Staff Dropdown */}
        <li className="flex flex-col border-y border-gray-600">
          <div
            className={`flex items-center justify-between p-3 cursor-pointer ${
              activeDropdown === 'Staff' ? 'border-b border-gray-600' : 'border-b border-gray-600'
            }`}
            onClick={() => toggleDropdown('Staff')}
          >
            <div className="flex items-center space-x-3">
              <FaUsers size={18} />
              <span>Staff</span>
            </div>
            <FaChevronDown
              className={`transform transition-transform duration-300 ${
                activeDropdown === 'Staff' ? 'rotate-180' : ''
              }`}
            />
          </div>
          {activeDropdown === 'Staff' && (
            <ul className="ml-6">
              <li
                className={`p-3 cursor-pointer ${
                  currentPage === 'Staff Category' ? 'bg-gray-800' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('Staff Category')}
              >
                Staff Category
              </li>
              <li
                className={`p-3 cursor-pointer ${
                  currentPage === 'Staff Detail' ? 'bg-gray-800' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('Staff Detail')}
              >
                Staff Details
              </li>
            </ul>
          )}
        </li>

        {/* Reports Dropdown */}
        <li className="flex flex-col border-b border-gray-600">
          <div
            className={`flex items-center justify-between p-3 cursor-pointer ${
              activeDropdown === 'Reports' ? 'border-b border-gray-600' : 'border-b border-gray-600'
            }`}
            onClick={() => toggleDropdown('Reports')}
          >
            <div className="flex items-center space-x-3">
              <TbReportSearch size={18} />
              <span>Reports</span>
            </div>
            <FaChevronDown
              className={`transform transition-transform duration-300 ${
                activeDropdown === 'Reports' ? 'rotate-180' : ''
              }`}
            />
          </div>
          {activeDropdown === 'Reports' && (
            <ul className="ml-6">
              <li
                className={`p-3 cursor-pointer ${
                  currentPage === 'Salse' ? 'bg-gray-800' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('Salse')}
              >
                Salse
              </li>
              <li
                className={`p-3 cursor-pointer ${
                  currentPage === 'Purchase' ? 'bg-gray-800' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('Purchase')}
              >
                Purchase
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}
