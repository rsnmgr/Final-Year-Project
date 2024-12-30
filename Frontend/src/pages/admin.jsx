import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../components/ContextProvider/Context';

/* Components */
import Sidebar from '../components/Admin/main/Sidebar';
import Header from '../components/Admin/main/Header';

/* My Pages */
import Dashboard from '../components/admin/pages/Dashboard';
import Table from '../components/admin/pages/Tables';
import Cashier from '../components/Admin/pages/Cashier';
import Kitchen from '../components/admin/pages/Kitchen';
import Setting from '../components/admin/pages/Setting';
import Profile from '../components/Admin/pages/Profile';


/* Menu */
import MenuCategory from '../components/Admin/pages/menu/MenuCategory';
import MenuProduct from '../components/Admin/pages/menu/MenuProduct';

/* Staff */
import StaffCategory from '../components/Admin/pages/staff/staffCategory';
import StaffDetails from '../components/Admin/pages/staff/StaffDetails';

/* Report */
import Sales from '../components/Admin/pages/report/Sales';
import Purchase from '../components/Admin/pages/report/Purchase';

export default function Admin() {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard'); // Track current page
  const [headerTitle, setHeaderTitle] = useState('Dashboard'); // Track header title
  const { loginData, setLoginData } = useContext(LoginContext);
  // Profile Drop Down
  const [profile,setProfile] = useState();
    const profileClick =()=>{
      setProfile(!profile);
      setSidebar(false);
    }
  // Toggle Side Bar
  const toggleSidebar = () => {
    setSidebar(!sidebar);
    setProfile(false);
  };

  const admin = async () => {
    let token = localStorage.getItem("TokenFoodMe");
    const res = await fetch("http://localhost:8000/api/validUser", {
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
      navigate("/admin");
    }
  };

  useEffect(() => {
    admin();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setHeaderTitle(page); // Set header title to the selected page
  };

  return (
    <div className="flex w-full">
      <div
        className={`border-r border-gray-600 rounded-2xl md:rounded-none top-0 left-0 transition-all duration-500 overflow-hidden bg-gray-900 h-screen ${
          !sidebar
            ? "-translate-x-full md:translate-x-0 absolute md:relative w-0 md:w-[15vw]"
            : "translate-x-0 md:-translate-x-full absolute md:relative w-[70%] md:w-0"
        }`}
      >
        <Sidebar setSidebar={setSidebar} handlePageChange={handlePageChange} currentPage={currentPage} />
      </div>
      <div className="w-full">
        <div className="p-3 shadow-md">
          <Header toggleSidebar={toggleSidebar} profileClick={profileClick} profile={profile} title={headerTitle} handlePageChange={handlePageChange}/>
        </div>
        <div className="p-3 h-[92vh] overflow-y-auto">
          {/* Render the current page component */}
          {currentPage === 'Dashboard' && <Dashboard />}
          {currentPage === 'Table' && <Table />}
          {currentPage === 'Cashier' && <Cashier />}
          {currentPage === 'Kitchen' && <Kitchen />}
          {currentPage === 'Category' && <MenuCategory />}
          {currentPage === 'Product' && <MenuProduct />}
          {currentPage === 'Staff Category' && <StaffCategory />}
          {currentPage === 'Staff Detail' && <StaffDetails />}
          {currentPage === 'Salse' && <Sales />}
          {currentPage === 'Purchase' && <Purchase />}
          {currentPage === 'Profile' && <Profile/>}
          {currentPage === 'Setting' && <Setting/>}
        </div>
      </div>
    </div>
  );
}
