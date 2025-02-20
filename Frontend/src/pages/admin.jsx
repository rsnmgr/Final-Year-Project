import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LoginContext } from '../components/ContextProvider/Context';

/* Components */
import Sidebar from '../components/Admin/main/Sidebar';
import Header from '../components/Admin/main/Header';

/* Pages */
import Dashboard from '../components/admin/pages/Dashboard';
import Table from '../components/admin/pages/Tables';
import Cashier from '../components/Admin/pages/Cashier';
import Kitchen from '../components/admin/pages/Kitchen';
import Setting from '../components/admin/pages/Setting';
import Profile from '../components/Admin/pages/Profile';

/* Menu */
import MenuCategory from '../components/Admin/pages/menu/MenuCategory';
import MenuProduct from '../components/Admin/pages/menu/MenuProduct';
import Units from '../components/Admin/pages/menu/units';

/* Staff */
import StaffCategory from '../components/Admin/pages/staff/staffCategory';
import StaffDetails from '../components/Admin/pages/staff/StaffDetails';

/* Report */
import Sales from '../components/Admin/pages/report/Sales';
import Purchase from '../components/Admin/pages/report/Purchase';

const API_URL = import.meta.env.VITE_API_URL;

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebar, setSidebar] = useState(false);
  const { loginData, setLoginData } = useContext(LoginContext);

  // Profile Drop Down
  const [profile, setProfile] = useState(false);

  const profileClick = () => {
    setProfile(!profile);
    setSidebar(false);
  };

  // Toggle Sidebar
  const toggleSidebar = () => {
    setSidebar(!sidebar);
    setProfile(false);
  };

  const admin = async () => {
    const token = localStorage.getItem("TokenFoodMe");
    const res = await fetch(`${API_URL}/api/validUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    const data = await res.json();
    if (res.status === 401 || !data || data.validUser.role !== 'admin') {
      navigate("*");
    } else {
      setLoginData(data);
      navigate("/admin/dashboard");
    }
  };

  useEffect(() => {
    admin();
  }, []);

  // Map paths to titles
  const getPageTitle = (path) => {
    switch (path) {
      case "/admin/dashboard":
        return "Dashboard";
      case "/admin/table":
        return "Table";
      case "/admin/cashier":
        return "Cashier";
      case "/admin/kitchen":
        return "Kitchen";
      case "/admin/menu/category":
        return "Menu Category";
      case "/admin/menu/product":
        return "Menu Product";
      case "/admin/menu/units":
        return "Units";
      case "/admin/staff/category":
        return "Staff Category";
      case "/admin/staff/detail":
        return "Staff Detail";
      case "/admin/report/sales":
        return "Sales Report";
      case "/admin/report/purchase":
        return "Purchase Report";
      case "/admin/profile":
        return "Profile";
      case "/admin/settings":
        return "Setting";
      default:
        return "Dashboard";
    }
  };

  const headerTitle = getPageTitle(location.pathname);

  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <div
        className={`rounded-2xl md:rounded-none top-0 left-0 transition-all duration-500 overflow-hidden bg-gray-900 h-screen z-50 ${
          !sidebar
            ? "-translate-x-full lg:translate-x-0 absolute lg:relative w-0 lg:w-[20vw]"
            : "translate-x-0 lg:-translate-x-full absolute lg:relative w-[70%] lg:w-0"
        }`}
      >
        <Sidebar setSidebar={setSidebar} />
      </div>
      {/* Main Content */}
      <div className="w-full">
        <div>
          <div className="p-3 shadow-md border-b border-gray-800">
            <Header
              toggleSidebar={toggleSidebar}
              profileClick={profileClick}
              profile={profile}
              title={headerTitle}
              setSidebar={setSidebar}
            />
          </div>
        </div>
        <div className="overflow-y-auto">
          {/* Page Routes */}
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="table" element={<Table />} />
            <Route path="cashier" element={<Cashier />} />
            <Route path="kitchen" element={<Kitchen />} />
            <Route path="menu/category" element={<MenuCategory />} />
            <Route path="menu/product" element={<MenuProduct />} />
            <Route path="menu/units" element={<Units />} />
            <Route path="staff/category" element={<StaffCategory />} />
            <Route path="staff/detail" element={<StaffDetails />} />
            <Route path="report/sales" element={<Sales />} />
            <Route path="report/purchase" element={<Purchase />} />
            <Route path="profile" element={<Profile />} />
            
            {/* Nested Route for Settings */}
            <Route path="settings/*" element={<Setting />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
