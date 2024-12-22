import User from '../../model/Online/userSchema.js';
import Admin from '../../model/UserModel/Admin.js';
import Super from '../../model/UserModel/Super.js';
import bcryptjs from 'bcryptjs';
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password' });
    }

    try {
        // Check in User model
        let userValid = await User.findOne({ email: email });
        let role = 'user'; // Default role

        if (!userValid) {
            // If not found in User, check Admin model
            userValid = await Admin.findOne({ email: email });
            role = 'admin'; // Change role if found in Admin model
        }

        if (!userValid) {
            // If not found in Admin, check Super model
            userValid = await Super.findOne({ email: email });
            role = 'super'; // Change role if found in Super model
        }

        // If user is found in any model
        if (userValid) {
            const isMatch = await bcryptjs.compare(password, userValid.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect password' });
            } else {
                // Token generation
                const token = await userValid.generateAuthToken();

                // Cookie generation
                res.cookie("userCookie", token, {
                    expires: new Date(Date.now() + 9000000),
                    httpOnly: true
                });

                const result = {
                    userValid,
                    token,
                    role // Include role in the response
                }
                res.status(201).json({ status: 201, result ,message: "Login successful" });
            }
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(401).json({ message: 'Internal server error' });
    }
}



export const validUser = async (req, res) => {
    try {
        let validUser;

        // Check if the user exists in the Admin model
        if (await Admin.findOne({ _id: req.userId })) {
            validUser = await Admin.findOne({ _id: req.userId });
        } else if (await Super.findOne({ _id: req.userId })) {
            // If not found in Admin, check in Super model
            validUser = await Super.findOne({ _id: req.userId });
        } else if (await User.findOne({ _id: req.userId })) {
            // If not found in Super, check in Online User model
            validUser = await User.findOne({ _id: req.userId });
        } else {
            // If user is not found in any model
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        // If user is found, send a successful response
        res.status(200).json({ status: 200, validUser });
    } catch (error) {
        res.status(500).json({ status: 500, message: "Server error", error });
    }
};


export const logOut = async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((currentElement) => {
            return currentElement.token !== req.token;
        });

        res.clearCookie("userCookie", { path: "/" });

        await req.rootUser.save();

        res.status(201).json({ status: 201, message: "Logged out successfully" });
    } catch (error) {
        console.error(error); // Logs error to console for debugging
        res.status(401).json({ status: 401, error: "Logout failed" });
    }
};
