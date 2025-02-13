import Units from '../../../model/admin/menu/Units.js'; // Adjust the import path accordingly
import { io } from '../../../server.js';

// Helper function to fetch units by AdminId
const findUnitsByAdminId = async (AdminId) => {
    return await Units.findOne({ AdminId });
};

// Add a new unit
export const addUnit = async (req, res) => {
    try {
        const { AdminId, name, status } = req.body;
        let unitEntry = await findUnitsByAdminId(AdminId);

        if (unitEntry) {
            unitEntry.units.push({ name, status });
        } else {
            unitEntry = new Units({
                AdminId,
                units: [{ name, status }]
            });
        }

        await unitEntry.save();
        io.emit('unitAdded', unitEntry);

        res.status(201).json({ message: 'Unit added successfully', unitEntry });
    } catch (error) {
        console.error('Error adding unit:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch all units for a specific AdminId
export const getUnits = async (req, res) => {
    try {
        const { AdminId } = req.params;
        const unitEntry = await findUnitsByAdminId(AdminId);

        if (!unitEntry) {
            return res.status(404).json({ message: 'No units found for this AdminId' });
        }

        res.status(200).json({ units: unitEntry.units });
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch a specific unit by its ID
export const getUnitById = async (req, res) => {
    try {
        const { AdminId, unitId } = req.params;
        const unitEntry = await findUnitsByAdminId(AdminId);

        if (!unitEntry) {
            return res.status(404).json({ message: 'Unit entry not found' });
        }

        const unit = unitEntry.units.id(unitId);

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        res.status(200).json({ unit });
    } catch (error) {
        console.error('Error fetching unit:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a specific unit
export const updateUnit = async (req, res) => {
    try {
        const { AdminId, unitId } = req.params;
        const { name, status } = req.body;

        const unitEntry = await findUnitsByAdminId(AdminId);

        if (!unitEntry) {
            return res.status(404).json({ message: 'Unit entry not found' });
        }

        const unit = unitEntry.units.id(unitId);

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        unit.name = name || unit.name;
        unit.status = status || unit.status;

        await unitEntry.save();
        io.emit('unitUpdated', unitEntry);

        res.status(200).json({ message: 'Unit updated successfully', unit });
    } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a specific unit
export const deleteUnit = async (req, res) => {
    try {
        const { AdminId, unitId } = req.params;
        const unitEntry = await findUnitsByAdminId(AdminId);

        if (!unitEntry) {
            return res.status(404).json({ message: 'Unit entry not found' });
        }

        const unitIndex = unitEntry.units.findIndex(unit => unit._id.toString() === unitId);

        if (unitIndex === -1) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        unitEntry.units.splice(unitIndex, 1);
        await unitEntry.save();
        io.emit('unitDeleted', unitEntry);

        res.status(200).json({ message: 'Unit deleted successfully' });
    } catch (error) {
        console.error('Error deleting unit:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
