import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* React Icons */
import { RxDashboard, RxCross2 } from "react-icons/rx";
import { GiTabletopPlayers } from "react-icons/gi";
import { MdCountertops } from "react-icons/md";
import { FaKitchenSet, FaChevronDown, FaUsers } from "react-icons/fa6";
import { TbReportSearch } from "react-icons/tb";

export default function Sidebar({ setSidebar }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleItemClick = (path) => {
    navigate(path); // Navigate to the selected page
    setSidebar(false); // Close the sidebar on small screens
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div>
      <div className="flex justify-between lg:justify-start p-3 shadow-md">
        <h1>Food Me</h1>
        <RxCross2 size={20} onClick={() => setSidebar(false)} className="lg:hidden cursor-pointer" />
      </div>
      <ul>
        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            isActive('/admin/dashboard') ? 'bg-gray-800 text-white' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('/admin/dashboard')}
        >
          <RxDashboard size={18} />
          <span>Dashboard</span>
        </li>

        {/* Menu Dropdown */}
        <li className="flex flex-col border-y border-gray-600">
          <div
            className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-600"
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
                  isActive('/admin/menu/category') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('/admin/menu/category')}
              >
                Category
              </li>
              <li
                className={`p-3 cursor-pointer ${
                  isActive('/admin/menu/units') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('/admin/menu/units')}
              >
                Units
              </li>
              <li
                className={`p-3 cursor-pointer ${
                  isActive('/admin/menu/product') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('/admin/menu/product')}
              >
                Product
              </li>
            </ul>
          )}
        </li>

        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            isActive('/admin/table') ? 'bg-gray-800 text-white' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('/admin/table')}
        >
          <GiTabletopPlayers size={18} />
          <span>Tables</span>
        </li>

        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            isActive('/admin/cashier') ? 'bg-gray-800 text-white' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('/admin/cashier')}
        >
          <MdCountertops size={18} />
          <span>Cashier</span>
        </li>
        <li
          className={`flex items-center p-3 space-x-3 cursor-pointer ${
            isActive('/admin/kitchen') ? 'bg-gray-800 text-white' : 'bg-gray-900'
          }`}
          onClick={() => handleItemClick('/admin/kitchen')}
        >
          <FaKitchenSet size={18} />
          <span>Kitchen</span>
        </li>

        {/* Staff Dropdown */}
        <li className="flex flex-col border-y border-gray-600">
          <div
            className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-600"
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
                  isActive('/admin/staff/category') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('/admin/staff/category')}
              >
                Category
              </li>
              <li
                className={`p-3 cursor-pointer ${
                  isActive('/admin/staff/detail') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('/admin/staff/detail')}
              >
                Details
              </li>
            </ul>
          )}
        </li>

        {/* Reports Dropdown */}
        <li className="flex flex-col border-b border-gray-600">
          <div
            className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-600"
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
                  isActive('/admin/report/sales') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('/admin/report/sales')}
              >
                Sales
              </li>
              <li
                className={`p-3 cursor-pointer ${
                  isActive('/admin/report/purchase') ? 'bg-gray-800 text-white' : 'bg-gray-900'
                }`}
                onClick={() => handleItemClick('/admin/report/purchase')}
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
