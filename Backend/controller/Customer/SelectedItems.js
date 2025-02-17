import SelectedItems from "../../model/customer/SelectedItems.js"; // Adjust the path as necessary
import { io } from "../../server.js";


// Add or update selected items
export const addSelectedItems = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId, selectedItems } = req.body;

    let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (selectedItemsEntry) {
      selectedItems.forEach((newItem) => {
        const existingItem = selectedItemsEntry.selectedItems.find(
          (item) => item.name === newItem.name && item.size === newItem.size
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
        } else {
          selectedItemsEntry.selectedItems.push(newItem);
        }
      });
    } else {
      selectedItemsEntry = new SelectedItems({
        AdminId,
        tableId,
        CustomerId,
        selectedItems,
      });
    }

    await selectedItemsEntry.save();
    io.emit("ItemsAdded", selectedItemsEntry);

    res.status(201).json({
      message: "Selected items added successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    console.error("Error adding selected items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch selected items
export const fetchSelectedItems = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId } = req.params;

    const selectedItemsEntry = await SelectedItems.findOne({
      AdminId,
      tableId,
      CustomerId,
    });

    if (!selectedItemsEntry) {
      return res.status(404).json({
        message: "No selected items found for this Admin, table, and customer.",
      });
    }

    res.status(200).json({
      message: "Selected items fetched successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    console.error("Error fetching selected items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a single selected item
export const deleteSelectedItem = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId, itemId } = req.params;

    let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (!selectedItemsEntry) {
      return res.status(404).json({ message: "No selected items found." });
    }

    selectedItemsEntry.selectedItems = selectedItemsEntry.selectedItems.filter(
      (item) => item._id.toString() !== itemId
    );

    await selectedItemsEntry.save();
    io.emit("ItemsDeleted", selectedItemsEntry);

    res.status(200).json({
      message: "Selected item deleted successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    console.error("Error deleting selected item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update item instructions
export const updateItemInstructions = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId, itemId } = req.params;
    const { instructions } = req.body;

    let selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (!selectedItemsEntry) {
      return res.status(404).json({ message: "No selected items found." });
    }

    const item = selectedItemsEntry.selectedItems.id(itemId);
    if (item) {
      item.instructions = instructions;
      await selectedItemsEntry.save();
      io.emit("ItemsUpdated", selectedItemsEntry);
      res.status(200).json({
        message: "Item instructions updated successfully",
        selectedItemsEntry,
      });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error updating item instructions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update item quantity
export const updateItemQuantity = async (req, res) => {
  const { AdminId, tableId, CustomerId, itemId } = req.params;
  const { quantity } = req.body;

  try {
    const selectedItemsEntry = await SelectedItems.findOne({ AdminId, tableId, CustomerId });

    if (!selectedItemsEntry) {
      return res.status(404).send("Items not found.");
    }

    const item = selectedItemsEntry.selectedItems.id(itemId);
    if (!item) {
      return res.status(404).send("Item not found");
    }

    item.quantity = quantity;
    await selectedItemsEntry.save();
    io.emit("ItemsQtyUpdated", selectedItemsEntry);

    res.status(200).json({
      message: "Item quantity updated successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete all selected items
export const deleteAllSelectedItems = async (req, res) => {
  try {
    const { AdminId, tableId, CustomerId } = req.params;

    const selectedItemsEntry = await SelectedItems.findOne({
      AdminId,
      tableId,
      CustomerId,
    });

    if (!selectedItemsEntry) {
      return res.status(404).json({ message: "No selected items found." });
    }

    selectedItemsEntry.selectedItems = [];
    await selectedItemsEntry.save();
    io.emit("ItemsDeletedAll", selectedItemsEntry);

    res.status(200).json({
      message: "All selected items deleted successfully",
      selectedItemsEntry,
    });
  } catch (error) {
    console.error("Error deleting all selected items:", error);
    res.status(500).json({ message: "Server error" });
  }
};