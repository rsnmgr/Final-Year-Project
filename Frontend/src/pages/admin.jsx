import React, { useState,useEffect, useContext } from 'react';
import {useNavigate} from 'react-router-dom';


import {LoginContext} from '../components/ContextProvider/Context';

export default function Admin() {
  const {loginData, setLoginData} = useContext(LoginContext)
  const navigate = useNavigate();
  const Admin = async()=>{
    let token = localStorage.getItem("TokenFoodMe");
    const res = await fetch("http://localhost:8000/api/validUser",{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      }
    });
    const data = await res.json();
    if(res.status === 401 || !data || data.validUser.role !== "admin"){
      navigate("*");
    }else{
      setLoginData(data);
      navigate("/admin");
    }
  }
  useEffect(()=>{
    Admin();
  },[])
  return (
    <div className="flex w-full">
      I am admin
    </div>
  );
}
