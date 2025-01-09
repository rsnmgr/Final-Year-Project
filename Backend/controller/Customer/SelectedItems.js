import SelectedItems from '../../model/customer/SelectedItems.js'; // Adjust the path as necessary
import { io } from '../../server.js';

export const addSelectedItems = async (req, res) => {
    try {
        const { AdminId, tableId, selectedItems } = req.body;
        // Find existing document by AdminId and tableId
        let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId });

        if (selectedItemsEntry) {
            // If document exists, update quantities or add new items
            selectedItems.forEach((newItem) => {
                // Check if an item with the same name already exists
                const existingItem = selectedItemsEntry.selectedItems.find(item => item.name === newItem.name);

                if (existingItem) {
                    // If the item with the same name exists, increase the quantity
                    existingItem.quantity += newItem.quantity;
                } else {
                    // If the item doesn't exist, add it as a new object
                    selectedItemsEntry.selectedItems.push(newItem);
                }
            });
        } else {
            // If document doesn't exist, create a new one
            selectedItemsEntry = new SelectedItems({
                AdminId,
                tableId,
                selectedItems
            });
        }

        // Save the updated document to the database
        await selectedItemsEntry.save();
        io.emit('ItemsAdded', selectedItemsEntry);

        res.status(201).json({ message: 'Selected items added successfully', selectedItemsEntry });
    } catch (error) {
        console.error('Error adding selected items:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Controller to fetch selected items
export const fetchSelectedItems = async (req, res) => {
    try {
        const { AdminId, tableId } = req.params;
        
        // Find selected items for a specific AdminId and tableId
        const selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId });

        if (!selectedItemsEntry) {
            return res.status(404).json({ message: 'No selected items found for this Admin and table.' });
        }

        res.status(200).json({ message: 'Selected items fetched successfully', selectedItemsEntry });
    } catch (error) {
        console.error('Error fetching selected items:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const deleteSelectedItem = async (req, res) => {
    try {
        const { AdminId, tableId, itemId } = req.params;

        // Find the document by AdminId and tableId
        let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId });

        if (!selectedItemsEntry) {
            return res.status(404).json({ message: 'No selected items found for this Admin and table.' });
        }

        // Filter out the item to be deleted by its _id
        selectedItemsEntry.selectedItems = selectedItemsEntry.selectedItems.filter(item => item._id.toString() !== itemId);

        // Save the updated document after removing the item
        await selectedItemsEntry.save();
        io.emit('ItemsDeleted', selectedItemsEntry);

        res.status(200).json({ message: 'Selected item deleted successfully', selectedItemsEntry });
    } catch (error) {
        console.error('Error deleting selected item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// In your controller file (e.g., selectedItemsController.js)
export const updateItemInstructions = async (req, res) => {
    try {
        const { AdminId, tableId, itemId } = req.params;
        const { instructions } = req.body;
        // Find the document by AdminId and tableId
        let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId });

        if (!selectedItemsEntry) {
            return res.status(404).json({ message: 'No selected items found for this Admin and table.' });
        }

        // Find the item and update its instructions
        const item = selectedItemsEntry.selectedItems.id(itemId);
        if (item) {
            item.instructions = instructions;
            await selectedItemsEntry.save();
            io.emit('ItemsUpdated', selectedItemsEntry);
            res.status(200).json({ message: 'Item instructions updated successfully', selectedItemsEntry });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        console.error('Error updating item instructions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateItemQuantity = async (req, res) => {
    const { adminId, tableId, itemId } = req.params;
    const { quantity } = req.body;

    try {
        // Find the document by AdminId and tableId
        const selectedItemsEntry = await SelectedItems.findOne({ AdminId: adminId, tableId });

        if (!selectedItemsEntry) {
            return res.status(404).send('Items not found for this Admin and table');
        }

        // Find the item by itemId in the selectedItems array
        const item = selectedItemsEntry.selectedItems.id(itemId);
        if (!item) {
            return res.status(404).send('Item not found');
        }

        // Update the quantity
        item.quantity = quantity;

        // Save the updated document
        await selectedItemsEntry.save();
        io.emit('ItemsQtyUpdated', selectedItemsEntry);

        res.status(200).json({ message: 'Item quantity updated successfully', selectedItemsEntry });
    } catch (error) {
        res.status(500).send('Error updating item quantity');
    }
};


export const deleteAllSelectedItems = async (req, res) => {
    try {
        const { AdminId, tableId } = req.params;

        // Find the document by AdminId and tableId
        const selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId });

        if (!selectedItemsEntry) {
            return res.status(404).json({ message: 'No selected items found for this Admin and table.' });
        }

        // Remove all selected items
        selectedItemsEntry.selectedItems = [];

        // Save the updated document
        await selectedItemsEntry.save();
        io.emit('ItemsDeletedAll', selectedItemsEntry);

        res.status(200).json({ message: 'All selected items deleted successfully', selectedItemsEntry });
    } catch (error) {
        console.error('Error deleting all selected items:', error);
        res.status(500).json({ message: 'Server error' });
    }
};