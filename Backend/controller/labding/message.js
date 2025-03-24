import Message from "../../model/landing/message.js";

export const reqmessage = async(req,res)=>{
    try {
        const {name,phone,email,message} = req.body;
        const newmessage = new Message({name,phone,email,message});
        await newmessage.save();
        res.status(201).json({ success: true, message: "Message send successfully!" });
    } catch (error) {
        
    }
}

export const getmessage = async(req,res)=>{
    try {
        const messages = await Message.find();
        res.status(200).json({ success: true, messages });
    } catch (error) {
        
    }
}