import { useContext, useEffect, useState } from 'react';
import { LuUsers } from "react-icons/lu";
import { FcSalesPerformance } from "react-icons/fc";
import axios from 'axios';
import { LoginContext } from "../../../ContextProvider/Context";

const API_URL = import.meta.env.VITE_API_URL;

export default function Card() {
    const { loginData } = useContext(LoginContext);
    const userId = loginData?.validUser?._id;
    const [staffs, setStaffs] = useState([]);
    const [purchases, setPurchases] = useState([]);  // Declare purchases state
    const [totalAmount, setTotalAmount] = useState(0);
    const [customer,setCustomer] = useState([]);
    
    const fetchStaff = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/details/${userId}`);
            setStaffs(response.data.details);
        } catch (error) {
            console.error("Error fetching staff details:", error);
        }
    };

    const fetchCustomer = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/get-customer/${userId}`);
            setCustomer(response.data);
        } catch (error) {
            console.error("Error fetching staff details:", error);
        }
    };

    const fetchTotalAmount = async () => {
        try {
            const response = await fetch(`${API_URL}/api/fetch-report/${userId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch report");
            }
            const data = await response.json();
            if (data && Array.isArray(data.sales)) {
                const total = data.sales.reduce((sum, sale) => sum + sale.totalAmmount, 0);
                setTotalAmount(total);
            } else {
                console.error("Fetched data is not in the expected format:", data);
            }
        } catch (error) {
            console.error("Error fetching total amount:", error);
        }
    };

    const fetchPurchases = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/purchases/${userId}`);  // Fix AdminId to userId
          setPurchases(response.data.purchases);
        } catch (error) {
          console.error('Error fetching purchases:', error);
          // toast.error('Failed to fetch purchases.');
        }
      };
    

    useEffect(() => {
        if (userId) {
            fetchStaff();
            fetchTotalAmount();
            fetchPurchases();
            fetchCustomer();
        }
    }, [userId]);

    // Calculate total purchase amount
    const calculateTotalPurchaseAmount = () => {
        return purchases.reduce((total, purchase) => total + parseFloat(purchase.totalPrice || 0), 0).toFixed(2);
    };

    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 '>
            <div className='bg-gray-800 p-6 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                    <label>Total Sales</label>
                    <span className='text-lg'><FcSalesPerformance /></span>
                </div>
                <span>{totalAmount}</span>
            </div>
            <div className='bg-gray-800 p-6 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                    <label>Total Purchase</label>
                    <span className='text-lg'>$</span>
                </div>
                <span>{calculateTotalPurchaseAmount()}</span>  {/* Correct the function call */}
            </div>
            <div className='bg-gray-800 p-6 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                    <label>Total Staff</label>
                    <span className='text-lg'><LuUsers /></span>
                </div>
                <span>+{staffs.length}</span>
            </div>
            <div className='bg-gray-800 p-6 rounded-md'>
                <div className='flex justify-between items-center mb-2'>
                    <label>Total Customer</label>
                    <span className='text-lg'><LuUsers /></span>
                </div>
                <span>+{customer.length}</span>
            </div>
        </div>
    );
}
