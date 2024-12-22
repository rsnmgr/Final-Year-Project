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



export default router;
