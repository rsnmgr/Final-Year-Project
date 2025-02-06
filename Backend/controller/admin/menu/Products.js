import fs from "fs";
import path from "path";
import Products from "../../../model/Admin/Menu/Products.js"; // Adjust the import path accordingly
import { io } from "../../../server.js";

// Helper function to delete a file
const deleteImageFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting image:", err);
    }
  });
};

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { AdminId, name, category, discount, status } = req.body;
    let { units } = req.body;

    console.log("Received Data:", req.body); // Debugging

    // Ensure 'units' is parsed correctly from string to an array
    if (typeof units === "string") {
      try {
        units = JSON.parse(units);
      } catch (error) {
        return res.status(400).json({ message: "Invalid units format" });
      }
    }

    if (!Array.isArray(units)) {
      return res.status(400).json({ message: "'units' must be an array" });
    }

    const image = req.file ? req.file.path : null;
    let productEntry = await Products.findOne({ AdminId });

    const newProduct = { name, category, units, discount, status, image };

    if (productEntry) {
      productEntry.products.push(newProduct);
    } else {
      productEntry = new Products({
        AdminId,
        products: [newProduct],
      });
    }

    await productEntry.save();

    io.emit("productAdded", productEntry); // Notify clients via Socket.io

    res
      .status(200)
      .json({ message: "Product added successfully", productEntry });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all products for a specific AdminId
export const getProducts = async (req, res) => {
  try {
    const { AdminId } = req.params;

    const productEntry = await Products.findOne({ AdminId });

    if (!productEntry) {
      return res
        .status(404)
        .json({ message: "No products found for this AdminId" });
    }

    res.status(200).json({ products: productEntry.products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch a specific product by its ID
export const getProductById = async (req, res) => {
  try {
    const { AdminId, productId } = req.params;

    const productEntry = await Products.findOne({ AdminId });

    if (!productEntry) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productEntry.products.id(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a specific product
export const updateProduct = async (req, res) => {
  try {
    const { AdminId, productId } = req.params;
    let { name, category, units, discount, status } = req.body;
    const newImage = req.file ? req.file.path : null;

    // Parse units if it's a string
    if (typeof units === "string") {
      units = JSON.parse(units);
    }

    const productEntry = await Products.findOne({ AdminId });
    if (!productEntry)
      return res.status(404).json({ message: "Product not found" });

    const product = productEntry.products.id(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // If there's a new image, delete the old one
    if (newImage && product.image) deleteImageFile(product.image);

    // Update fields
    product.name = name || product.name;
    product.category = category || product.category;
    product.units = units || product.units; // Ensure units are correctly updated
    product.discount = discount || product.discount;
    product.status = status || product.status;
    product.image = newImage || product.image;

    await productEntry.save();
    io.emit("productUpdated", productEntry);
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a specific product
export const deleteProduct = async (req, res) => {
  try {
    const { AdminId, productId } = req.params;

    // Find the product entry for the given AdminId
    const productEntry = await Products.findOne({ AdminId });

    if (!productEntry) {
      return res.status(404).json({ message: "Product entry not found" });
    }

    // Remove the product from the products array
    const result = await Products.updateOne(
      { AdminId, "products._id": productId },
      { $pull: { products: { _id: productId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the product document that was removed to check for image deletion
    const removedProduct = productEntry.products.id(productId);

    // Delete the product's image file if it exists
    if (removedProduct && removedProduct.image) {
      deleteImageFile(removedProduct.image);
    }
    io.emit("productDeleted", productEntry);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
