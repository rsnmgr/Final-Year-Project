import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    AdminId: { type: String, required: true },
    tableId: { type: String, required: true },
    OrderHistory: [{
        CustomerId : {type:String,rewuire:true},
        Cname:{type:String,require:true},
        Cphone:{type:String,require:true},
        items: [{
            name: { type: String, required: true },
            category: { type: String },
            size: { type: String },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            instructions: { type: String },
            image: { type: String } // Change from Number to String
        }],
        subtotal: { type: Number, required: true },
        gst: { type: Number, required: true }, // Assuming gst is a percentage
        total: { type: Number, required: true },
        orderDate: { type: Date, default: Date.now },
        itemsStatus: { type: String, default: "prepare" }
    }],
    totalOrderAmount: { type: Number, required: true },
    orderStatus: { type: String, default: "Running" },
    orderDate: { type: Date, default: Date.now },

},
    { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
