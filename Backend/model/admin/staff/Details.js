import mongoose from 'mongoose';

const detailSchema = new mongoose.Schema({
    AdminId: { type: String, required: true },
    products: [{
        name: { type: String, required: true },
        category: { type: String, required: true },
        address:{ type: String,required: true},
        phone: { type: String, required: true },
        salary: { type: String ,required: true },
        status: { type: String, required: true },
        image: { type: String }
    }]
});

const Details = mongoose.model('StaffDetails', detailSchema);

export default Details;
