import Message from "../../model/landing/message.js";

export const reqmessage = async(req,res)=>{
    try {
        const {name,email,message} = req.body;
        const newmessage = new Message({name,email,message});
        await newmessage.save();
        res.status(201).json({ success: true, message: "Message send successfully!" });
    } catch (error) {
        
    }
}