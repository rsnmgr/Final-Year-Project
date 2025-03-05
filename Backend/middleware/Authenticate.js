import jwt from 'jsonwebtoken';
import Admin from "../model/UserModel/Admin.js";
import Super from '../model/UserModel/Super.js';
import Online from "../model/Online/userSchema.js";
import Customer from "../model/customer/Customer.js";
import Staff from "../model/admin/staff/Details.js";
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ status: 401, message: "Unauthorized, no token provided" });
        }

        // Verify the JWT token
        const verifytoken = jwt.verify(token, keySecret);

        // Check each schema to find the user
        let rootUser;
        if ((rootUser = await Admin.findOne({ _id: verifytoken._id }))) {
            req.userRole = "Admin"; // Optional: Attach user role if needed
        } else if ((rootUser = await Super.findOne({ _id: verifytoken._id }))) {
            req.userRole = "Super";
        } else if ((rootUser = await Online.findOne({ _id: verifytoken._id }))) {
            req.userRole = "Online";
        }
        else if ((rootUser = await Customer.findOne({ _id: verifytoken._id }))) {
            req.userRole = "Customer";
        }else if ((rootUser = await Staff.findOne({ _id: verifytoken._id }))) {
            req.userRole = "Staff";
        }

        // If the user isn't found in any schema, throw an error
        if (!rootUser) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        // Attach user details to request object
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;

        next();
    } catch (error) {
        res.status(401).json({ status: 401, message: "Unauthorized, invalid token" });
    }
};
