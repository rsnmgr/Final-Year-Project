import Category from '../../../model/admin/menu/Category.js'; // Adjust the import path accordingly
import { io } from '../../../server.js';

// Helper function to fetch category by AdminId
const findCategoryByAdminId = async (AdminId) => {
    return await Category.findOne({ AdminId });
};

// Add a new category
export const addCategory = async (req, res) => {
    try {
        const { AdminId, name, status } = req.body;
        let categoryEntry = await findCategoryByAdminId(AdminId);

        if (categoryEntry) {
            categoryEntry.category.push({ name, status });
        } else {
            categoryEntry = new Category({
                AdminId,
                category: [{ name, status }]
            });
        }

        await categoryEntry.save();
        io.emit('categoryAdded', categoryEntry);

        res.status(201).json({ message: 'Category added successfully', categoryEntry });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all categories for a specific AdminId
export const getCategories = async (req, res) => {
    try {
        const { AdminId } = req.params;
        const categoryEntry = await findCategoryByAdminId(AdminId);

        if (!categoryEntry) {
            return res.status(404).json({ message: 'No categories found for this AdminId' });
        }

        res.status(200).json({ categories: categoryEntry.category });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch a specific category by its ID
export const getCategoryById = async (req, res) => {
    try {
        const { AdminId, categoryId } = req.params;
        const categoryEntry = await findCategoryByAdminId(AdminId);

        if (!categoryEntry) {
            return res.status(404).json({ message: 'Category entry not found' });
        }

        const category = categoryEntry.category.id(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a specific category
export const updateCategory = async (req, res) => {
    try {
        const { AdminId, categoryId } = req.params;
        const { name, status } = req.body;

        const categoryEntry = await findCategoryByAdminId(AdminId);

        if (!categoryEntry) {
            return res.status(404).json({ message: 'Category entry not found' });
        }

        const category = categoryEntry.category.id(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = name || category.name;
        category.status = status || category.status;

        await categoryEntry.save();
        io.emit('categoryUpdated', categoryEntry);

        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a specific category
export const deleteCategory = async (req, res) => {
    try {
        const { AdminId, categoryId } = req.params;
        const categoryEntry = await findCategoryByAdminId(AdminId);

        if (!categoryEntry) {
            return res.status(404).json({ message: 'Category entry not found' });
        }

        const categoryIndex = categoryEntry.category.findIndex(cat => cat._id.toString() === categoryId);

        if (categoryIndex === -1) {
            return res.status(404).json({ message: 'Category not found' });
        }

        categoryEntry.category.splice(categoryIndex, 1);
        await categoryEntry.save();
        io.emit('categoryDeleted', categoryEntry);

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
