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




export default router;
