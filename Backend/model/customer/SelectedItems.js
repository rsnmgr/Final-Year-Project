import mongoose from 'mongoose';

const selectedItems = new mongoose.Schema({
    AdminId: { type: String, required: true },
    tableId: { type: String, required: true },
    CustomerId: {type: String, required:true},
    selectedItems: [{
      name: { type: String, required: true },
      category: { type: String },
      size: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      instructions: { type: String },
      image: { type: String } // Change from Number to String
    }]
  });
  

const SelectedItems = mongoose.model('SelectedItems', selectedItems);
export default SelectedItems;