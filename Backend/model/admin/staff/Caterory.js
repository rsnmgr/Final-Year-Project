import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    AdminId: { type: String, required: true },
    category: [{
        name: { type: String, required: true },
    }]
});

const Category = mongoose.model('StaffCategory', categorySchema);

export default Category;
