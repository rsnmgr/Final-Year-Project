import React, { useState, useEffect, useContext } from 'react';
import { TiMinus } from 'react-icons/ti';
import { FaPlus } from 'react-icons/fa';
import { TableContext } from '../../ContextProvider/TableContext';
import axios from 'axios';
import img from '../../../assets/defaultImg.png'; // Placeholder image
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

export default function DisplayMenu({ selectedCategory, searchQuery }) {
  const { AdminId, tableId } = useContext(TableContext);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [instruction, setInstruction] = useState('');
  const [form, setForm] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const fetchData = async () => {
    try {
      const productResponse = await axios.get(`${API_URL}/api/products/${AdminId}`);
      const activeProducts = productResponse.data.products.filter(product => product.status === 'Active');
      setProducts(activeProducts);

      const initialQuantities = {};
      activeProducts.forEach(product => {
        initialQuantities[product._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (err) {
      // console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    if (AdminId) {
      fetchData();
    }
  }, [AdminId]);

  useEffect(() => {
    socket.on('productAdded', fetchData);
    socket.on('productUpdated', fetchData);
    socket.on('productDeleted', fetchData);

    return () => {
      socket.off('productAdded', fetchData);
      socket.off('productUpdated', fetchData);
      socket.off('productDeleted', fetchData);
    };
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleIncrease = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: prevQuantities[productId] + 1,
    }));
  };

  const handleDecrease = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: prevQuantities[productId] > 1 ? prevQuantities[productId] - 1 : 1,
    }));
  };

  const handleCancel = () => {
    setForm(false);
    setSelectedFood(null);
  };

    const handleAddSelectedItems = async () => {
    try {
      const selectedItem = {
        name: selectedFood.name,
        category: selectedFood.category,
        size: selectedFood.size,
        quantity: quantities[selectedFood._id],
        price: calculatePrice(selectedFood),
        instructions: instruction,
        image: selectedFood.image,
      };

      await axios.post(`${API_URL}/api/add-selected-items`, {
        AdminId,
        tableId,
        selectedItems: [selectedItem],
      });

      // Reset quantity for the selected product after adding to the cart
      setQuantities((prevQuantities) => ({
        ...prevQuantities,
        [selectedFood._id]: 1, // Reset quantity to 1 after adding
      }));

      // Close the form after adding
      setForm(false);
      setSelectedFood(null);
    } catch (error) {
      console.error('Error adding selected items:', error);
    }
  };


  const calculatePrice = (product) => {
    return product.discount && product.discount > 0
      ? (product.price * (1 - product.discount / 100)).toFixed(2)
      : product.price;
  };

  return (
    <div className='flex flex-col items-center justify-center flex-1 p-2'>
      {filteredProducts.length === 0 ? (
        <div className='text-center text-gray-500'>No items found</div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full'>
          {filteredProducts.map((product) => (
            <div key={product._id} className=' shadow-xl bg-gray-800 pb-1 rounded-md'>
              <div className='rounded-md flex flex-col'>
                <div className='relative w-full h-30'>
                  <img
                    src={`${API_URL}/${product.image || img}`}
                    className='w-full h-[12vh] rounded-t-md object-cover'
                    alt={product.name}
                  />
                  <p className='absolute top-0 right-1 text-slate-200'>{product.size}</p>
                  <h1 className='absolute bottom-0 left-0 w-full text-center text-white bg-black bg-opacity-50 py-2'>
                    {product.name}
                  </h1>
                </div>
                <p className='text-center'>
                  {product.discount && product.discount > 0 ? (
                    <>
                      <span className='line-through text-red-500 mr-2'>${product.price}</span>
                      <span>${calculatePrice(product)}</span>
                    </>
                  ) : (
                    <span>${product.price}</span>
                  )}
                </p>
                <div className='flex items-center justify-center gap-3 mb-2'>
                  <div
                    className='p-1 bg-black bg-opacity-50 text-white cursor-pointer'
                    onClick={() => handleDecrease(product._id)}
                  >
                    <TiMinus />
                  </div>
                  <p>{quantities[product._id]}</p>
                  <div
                    className='p-1 bg-black bg-opacity-50 text-white cursor-pointer'
                    onClick={() => handleIncrease(product._id)}
                  >
                    <FaPlus />
                  </div>
                </div>
                <div
                  className='p-2 bg-gray-950 text-center text-slate-300 cursor-pointer'
                  onClick={() => {
                    setSelectedFood(product);
                    setForm(true);
                  }}
                >
                  <button>Select</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && selectedFood && (
        <div className='fixed inset-0 flex justify-center items-center h-screen bg-black bg-opacity-50'>
          <div className='p-4 bg-gray-800 rounded-md space-y-4 w-full max-w-md mx-2'>
            <div className='p-2 shadow-lg'>
              <h1 className='text-center text-xl '>{selectedFood.name}{selectedFood.size && `(${selectedFood.size})`}</h1>
            </div>
            <img
              src={`${API_URL}/${selectedFood.image || img}`}
              className='w-full h-48 rounded-md object-cover'
              alt={selectedFood.name}
            />
            <div className='flex justify-between items-center'>
              <label>Qty:</label>
              <span>{quantities[selectedFood._id]}</span>
            </div>
            <div className='flex justify-between items-center'>
              <label>Total</label>
              <span >
                Rs {((quantities[selectedFood._id] * calculatePrice(selectedFood))).toFixed(2)}
              </span>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <h1 className='text-sm text-gray-500'>Special instruction</h1>
                <div
                  className='bg-green-700 text-white p-2  hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none'
                  onClick={() => setInstruction('Add your instruction here.')}
                >
                  <FaPlus className='w-4 h-4' />
                </div>
              </div>
              {instruction && (
                <textarea
                  rows='2'
                  className='p-2 w-full outline-none bg-gray-800 border border-gray-900 text-black text-justify'
                  onChange={(e) => setInstruction(e.target.value)}
                />
              )}
            </div>
            <div className='flex space-x-2'>
              <button className='w-full bg-gray-700 p-2' onClick={handleCancel}>
                Cancel
              </button>
              <button className='bg-green-700 text-white p-2 w-full hover:bg-green-800 focus:ring-2 focus:ring-green-500 focus:outline-none' onClick={handleAddSelectedItems}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
