import User from '../../model/Online/userSchema.js';

export const userRegister = async (req, res) => {
    const { name, email, password, cpassword } = req.body;
    if (!name || !email || !password || !cpassword) {
        return res.status(400).json({ msg: "Please enter all fields" });
    }

    try {
        const preuser = await User.findOne({ email: email });

        if (preuser) {
            return res.status(400).json({ msg: "User already registered with this email" });
        } else if (password !== cpassword) {
            return res.status(400).json({ msg: "Passwords do not match" });
        } else {
            const finalUser = new User({ name, email, password });
            await finalUser.save();
            res.json({ message: "User registered successfully" });
        }
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
}
