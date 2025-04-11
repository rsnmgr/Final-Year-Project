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

        // Find the user
        let rootUser = await Admin.findOne({ _id: verifytoken._id }) ||
                       await Super.findOne({ _id: verifytoken._id }) ||
                       await Online.findOne({ _id: verifytoken._id }) ||
                       await Customer.findOne({ _id: verifytoken._id }) ||
                       await Staff.findOne({ _id: verifytoken._id });

        if (!rootUser) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        // Check if the token exists in the user's stored tokens
        const isTokenValid = rootUser.tokens.some((t) => t.token === token);

        if (!isTokenValid) {
            return res.status(401).json({ status: 401, message: "Unauthorized, token mismatch" });
        }

        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;

        next();
    } catch (error) {
        res.status(401).json({ status: 401, message: "Unauthorized, invalid token" });
    }
};
