import fs from 'fs';
import path from 'path';
import Details from '../../../model/admin/staff/Details.js'; // Adjust the import path accordingly

// Helper function to delete a file
const deleteImageFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting image:", err);
        }
    });
};

// Add a new product (Staff detail)
export const addDetail = async (req, res) => {
    try {
        const { AdminId, name, category, address, phone, salary, status } = req.body;
        const image = req.file ? req.file.path : null;
        let detailEntry = await Details.findOne({ AdminId });

        if (detailEntry) {
            detailEntry.details.push({ name, category, address, phone, salary, status, image });
        } else {
            detailEntry = new Details({
                AdminId,
                details: [{ name, category, address, phone, salary, status, image }]
            });
        }

        await detailEntry.save();

        res.status(200).json({ message: 'Detail added successfully', detailEntry });
    } catch (error) {
        console.error('Error adding detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all details for a specific AdminId
export const getDetails = async (req, res) => {
    try {
        const { AdminId } = req.params;

        const detailEntry = await Details.findOne({ AdminId });

        if (!detailEntry) {
            return res.status(404).json({ message: 'No details found for this AdminId' });
        }

        res.status(200).json({ details: detailEntry.details });
    } catch (error) {
        console.error('Error fetching details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch a specific detail by its ID
export const getDetailById = async (req, res) => {
    try {
        const { AdminId, detailId } = req.params;

        const detailEntry = await Details.findOne({ AdminId });

        if (!detailEntry) {
            return res.status(404).json({ message: 'Detail not found' });
        }

        const detail = detailEntry.details.id(detailId);

        if (!detail) {
            return res.status(404).json({ message: 'Detail not found' });
        }

        res.status(200).json({ detail });
    } catch (error) {
        console.error('Error fetching detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a specific detail
export const updateDetail = async (req, res) => {
    try {
        const { AdminId, detailId } = req.params;
        const { name, category, address, phone, salary, status } = req.body;
        const newImage = req.file ? req.file.path : null;

        const detailEntry = await Details.findOne({ AdminId });

        if (!detailEntry) {
            return res.status(404).json({ message: 'Detail not found' });
        }

        const detail = detailEntry.details.id(detailId);

        if (!detail) {
            return res.status(404).json({ message: 'Detail not found' });
        }

        // If there is a new image, delete the old one
        if (newImage && detail.image) {
            deleteImageFile(detail.image);
        }

        // Update the detail fields
        detail.name = name || detail.name;
        detail.category = category || detail.category;
        detail.address = address || detail.address;
        detail.phone = phone || detail.phone;
        detail.salary = salary || detail.salary;
        detail.status = status || detail.status;
        detail.image = newImage || detail.image;

        await detailEntry.save();

        res.status(200).json({ message: 'Detail updated successfully', detail });
    } catch (error) {
        console.error('Error updating detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a specific detail
export const deleteDetail = async (req, res) => {
    try {
        const { AdminId, detailId } = req.params;

        // Find the detail entry for the given AdminId
        const detailEntry = await Details.findOne({ AdminId });

        if (!detailEntry) {
            return res.status(404).json({ message: 'Detail entry not found' });
        }

        // Remove the detail from the details array
        const result = await Details.updateOne(
            { AdminId, 'details._id': detailId },
            { $pull: { details: { _id: detailId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Detail not found' });
        }

        // Find the detail document that was removed to check for image deletion
        const removedDetail = detailEntry.details.id(detailId);
        
        // Delete the detail's image file if it exists
        if (removedDetail && removedDetail.image) {
            deleteImageFile(removedDetail.image);
        }

        res.status(200).json({ message: 'Detail deleted successfully' });
    } catch (error) {
        console.error('Error deleting detail:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
