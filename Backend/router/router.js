import express from 'express';
import upload from '../middleware/multer.js'; // Import multer for image handling
import { authenticate } from '../middleware/Authenticate.js';
const router = express.Router();
//Super Admin
import {createSuper,fetchSuperById} from '../controller/UserController/Super.js';
router.post('/super', createSuper);
router.get('/fetchsuper/:id', fetchSuperById);

// Admin
import { createCustomer, fetchCustomers, fetchCustomerById, updateCustomer, deleteCustomer,updateCustomerImage,deleteCustomerImage,updateCustomerPassword } from '../controller/UserController/Admin.js';
router.post('/create', upload.single('image'), createCustomer);
router.get('/fetchAll', fetchCustomers);
router.get('/fetch/:id', fetchCustomerById);
router.put('/update/:id', upload.single('image'), updateCustomer);
router.delete('/delete/:id', deleteCustomer);
router.put('/updateImage/:id', upload.single('image'), updateCustomerImage);
router.delete('/deleteImage/:userId', deleteCustomerImage);
router.put('/updatePassword/:userId',updateCustomerPassword);

//Users
import { userRegister } from '../controller/Online/userController.js';
router.post('/register', userRegister);

// Customer
import {addCustomer,validCustomer} from '../controller/Customer/Customer.js' ;
router.post('/add-customer', addCustomer);
router.get('/valid-customer',authenticate, validCustomer);

// Multi-login
import { login,validUser,logOut } from '../controller/MultiLogin/Login.js';
router.post('/login', login);
router.get('/validUser',authenticate, validUser);
router.get('/logout', authenticate, logOut);


// Menu Category
import {addCategory,getCategories, getCategoryById,updateCategory,deleteCategory} from '../controller/admin/menu/Category.js';
router.post('/category', addCategory);
router.get('/categories/:AdminId', getCategories);
router.get('/category/:AdminId/:categoryId', getCategoryById);
router.put('/category/:AdminId/:categoryId', updateCategory);
router.delete('/category/:AdminId/:categoryId', deleteCategory);

// Menu Units
import {addUnit, getUnits, getUnitById, updateUnit, deleteUnit} from '../controller/admin/menu/Units.js';
router.post('/unit', addUnit);
router.get('/units/:AdminId', getUnits);
router.get('/unit/:AdminId/:unitId', getUnitById);
router.put('/unit/:AdminId/:unitId', updateUnit);
router.delete('/unit/:AdminId/:unitId', deleteUnit);

// Menu Product
import { addProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controller/admin/menu/Products.js';
router.post('/products', upload.single('image'), addProduct);
router.get('/products/:AdminId', getProducts);
router.get('/products/:AdminId/:productId', getProductById);
router.put('/products/:AdminId/:productId', upload.single('image'), updateProduct);
router.delete('/products/:AdminId/:productId', deleteProduct);

// Staff Category
import { addStaffCategory,getStaffCategories,getStaffCategoryById,updateStaffCategory,deleteStaffCategory } from '../controller/admin/staff/Category.js';
router.post('/staff-category',addStaffCategory);
router.get('/staff-category/:AdminId',getStaffCategories);
router.get('/staff-category/:AdminId/:categoryId', getStaffCategoryById);
router.put('/staff-category/:AdminId/:categoryId', updateStaffCategory);
router.delete('/staff-category/:AdminId/:categoryId', deleteStaffCategory);

// Staff Details
import { addDetail, getDetails, getDetailById, updateDetail, deleteDetail } from '../controller/admin/staff/Details.js';
router.post('/details', upload.single('image'), addDetail);
router.get('/details/:AdminId', getDetails);
router.get('/details/:AdminId/:detailId', getDetailById);
router.put('/details/:AdminId/:detailId', upload.single('image'), updateDetail);
router.delete('/details/:AdminId/:detailId', deleteDetail);

// Table
import {addTable,getTables,getTableById,updateTable,deleteTable} from '../controller/admin/tables/Table.js';
router.post('/tables', addTable);
router.get('/tables/:AdminId', getTables);
router.get('/tables/:AdminId/:tableId', getTableById);
router.put('/tables/:AdminId/:tableId', updateTable);
router.delete('/tables/:AdminId/:tableId', deleteTable);

// Selected Items
import { addSelectedItems,fetchSelectedItems,deleteSelectedItem,updateItemInstructions,updateItemQuantity,deleteAllSelectedItems } from '../controller/Customer/SelectedItems.js'; // Adjust the path as necessary
router.post('/add-selected-items', addSelectedItems);
router.get('/selected-items/:AdminId/:tableId', fetchSelectedItems);
router.delete('/selected-items/:AdminId/:tableId/:itemId', deleteSelectedItem);
router.put('/update-item-instructions/:AdminId/:tableId/:itemId', updateItemInstructions);
router.put('/selected-items/:adminId/:tableId/:itemId/quantity', updateItemQuantity);
router.delete('/delete-selected-items/:AdminId/:tableId', deleteAllSelectedItems);


// Order
import { addOrder, fetchOrders,fetchOrdersByAdminId,deleteOrder,updateOrderStatus,OrdersTable,deleteOrderHistory} from '../controller/Customer/AddOrder.js'; // Adjust the path as necessary
router.post('/add-order', addOrder);
router.get('/fetch-orders/:AdminId/:tableId', fetchOrders);
router.get('/fetch-orders/:AdminId', fetchOrdersByAdminId);
router.get('/orders/:AdminId', OrdersTable);

router.delete('/orders/:AdminId/:tableId', deleteOrder);
router.put('/update-order-status/:adminId/:tableId/:orderId', updateOrderStatus);
router.delete('/delete-order-id/:adminId/:tableId/:orderId', deleteOrderHistory);



export default router;
