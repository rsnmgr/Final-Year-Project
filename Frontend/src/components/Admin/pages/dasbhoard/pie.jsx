import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { LoginContext } from "../../../ContextProvider/Context";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL); // Make sure the backend allows this origin

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const colors = ["#FF8042", "#0088FE", "#00C49F", "#FFBB28", "#FF6384", "#36A2EB", "#AA66CC"];

const PieChartComponent = () => {
  const [data, setData] = useState([]);
  const { loginData } = useContext(LoginContext);
  const AdminId = loginData?.validUser?._id;

  const fetchAndProcessPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/purchases/${AdminId}`);
      const allPurchases = response.data.purchases || [];

      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      const dayTotals = Array(7).fill(0);

      allPurchases.forEach((purchase) => {
        const purchaseDate = new Date(purchase.dateOfPurchase);
        if (purchaseDate >= sevenDaysAgo && purchaseDate <= now) {
          const dayIndex = purchaseDate.getDay();
          dayTotals[dayIndex] += purchase.totalPrice;
        }
      });

      const chartData = dayTotals.map((value, index) => ({
        name: weekDays[index],
        value,
        color: colors[index],
      }));

      setData(chartData);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  useEffect(() => {
    fetchAndProcessPurchases();

    // Listen for real-time updates
    socket.on("purchaseAdded", (data) => {
      console.log("Purchase added", data);
      fetchAndProcessPurchases(); // Refetch on add
    });

    socket.on("purchaseUpdated", (data) => {
      console.log("Purchase updated", data);
      fetchAndProcessPurchases(); // Refetch on update
    });

    // Cleanup listener on unmount
    return () => {
      socket.off("purchaseAdded");
      socket.off("purchaseUpdated");
    };
  }, [AdminId]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulative = 0;

  const getPath = (value) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    cumulative += value;
    const endAngle = (cumulative / total) * 2 * Math.PI;

    const x1 = 200 + 120 * Math.cos(startAngle);
    const y1 = 200 + 120 * Math.sin(startAngle);
    const x2 = 200 + 120 * Math.cos(endAngle);
    const y2 = 200 + 120 * Math.sin(endAngle);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return {
      d: `M200,200 L${x1},${y1} A120,120 0 ${largeArcFlag},1 ${x2},${y2} Z`,
      midAngle: (startAngle + endAngle) / 2,
    };
  };

  cumulative = 0;

  return (
    <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 p-4 border border-gray-600 rounded-xl shadow-md bg-gray-800 text-white">
      <h2 className="absolute top-0 left-0 p-6">Pie Chart for Last Week's Purchases</h2>

      <ul className="text-sm md:text-base space-y-2 order-2 md:order-1 grid grid-cols-4 md:grid-cols-1 gap-4">
        {data.map((entry, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name} 
          </li>
        ))}
      </ul>

      <svg width={400} height={400} viewBox="0 0 400 400" className="order-1 md:order-2">
        {data.map((entry, index) => {
          const { d, midAngle } = getPath(entry.value);
          const percentage = total ? ((entry.value / total) * 100).toFixed(1) : 0;

          const labelX = 200 + 90 * Math.cos(midAngle);
          const labelY = 200 + 90 * Math.sin(midAngle);

          return (
            <g key={index}>
              <path d={d} fill={entry.color} stroke="#fff" strokeWidth="2" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#fff"
                fontSize="12"
              >
                {percentage}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PieChartComponent;
