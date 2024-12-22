import React, { useState,useEffect,useContext } from 'react';
import {useNavigate} from 'react-router-dom';
import {LoginContext} from '../components/ContextProvider/Context';

/* Components */
import Sidebar from '../components/superAdmin/Sidebar';
import Header from '../components/superAdmin/Header';
/* My Pages */
import Dashboard from '../components/superAdmin/pages/Dashboard';
import Admin from '../components/superAdmin/pages/Admin';
import UsersInfo from '../components/superAdmin/pages/UserInfo';
import Setting from '../components/superAdmin/pages/Setting';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [sidebar,setSidebar] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard'); // Track current page
  const [headerTitle, setHeaderTitle] = useState('Dashboard'); // Track header title
  const {loginData, setLoginData} = useContext(LoginContext)

  const toggleSidebar =()=>{
    setSidebar(!sidebar);
  }
  const SuperAdmin = async()=>{
    let token = localStorage.getItem("TokenFoodMe");
    const res = await fetch("http://localhost:8000/api/validUser",{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      }
    });
    const data = await res.json();
    if(res.status === 401 || !data || data.validUser.role !== "super"){
      navigate("*");
    }else{
      setLoginData(data);
      navigate("/super");
    }
  }
  useEffect(()=>{
    SuperAdmin();
  },[])

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setHeaderTitle(page); // Set header title to the selected page
  };

  return (
    <div className='flex w-full'>
      <div className={`top-0 left-0 transition-all duration-500 overflow-hidden bg-gray-900  h-screen ${!sidebar ? "-translate-x-full md:translate-x-0 absolute md:relative w-0  md:w-[15vw]": "translate-x-0 md:-translate-x-full absolute md:relative w-1/2 md:w-0"}`}>
        <Sidebar setSidebar={setSidebar} handlePageChange={handlePageChange} currentPage={currentPage}/>
      </div>
      <div className='w-full'>
        <div className='p-3 shadow-md'>
          <Header toggleSidebar={toggleSidebar} title={headerTitle}/>
        </div>
        <div className='p-3 h-[92vh] overflow-y-auto'>
          {/* Render the current page component */}
          {currentPage === 'Dashboard' && <Dashboard />}
          {currentPage === 'My Admin' && <Admin />}
          {currentPage === 'Users Info' && <UsersInfo />}
          {currentPage === 'Settings' && <Setting />}
        </div>
      </div>
    </div>
  );
}
