import Order from "../../model/customer/AddOrder.js";
import { io } from "../../server.js";
// Controller to add a new order
export const addOrder = async (req, res) => {
  try {
    const { AdminId, tableId,CustomerId, items, subtotal, gst, total } = req.body;
    // Create a new order object with order details
    const newOrder = {
      items,
      subtotal,
      gst,
      total,
    };

    // Check if an order already exists for the given AdminId and tableId
    let order = await Order.findOne({ AdminId, tableId });

    if (!order) {
      // If no order exists, create a new order with OrderHistory array and totalOrderAmount
      order = new Order({
        AdminId,
        tableId,
        CustomerId,
        OrderHistory: [newOrder],
        totalOrderAmount: total, // Initialize totalOrderAmount with the first order's total
      });
    } else {
      // If order exists, push new order details into OrderHistory array
      order.OrderHistory.push(newOrder);

      // Calculate the new totalOrderAmount
      const totalAmount = order.OrderHistory.reduce(
        (acc, order) => acc + order.total,
        0
      );
      order.totalOrderAmount = totalAmount;
    }

    // Save the order
    await order.save();
    io.emit("orderAdded", order);
    return res.status(201).json({ message: "Order added successfully", order });
  } catch (error) {
    return res.status(500).json({ message: "Error adding order", error });
  }
};

export const fetchOrders = async (req, res) => {
  try {
    const { AdminId, tableId } = req.params;

    // Find orders by AdminId and tableId
    const orders = await Order.findOne({ AdminId, tableId });

    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error });
  }
};

export const fetchOrdersbyCustomerId = async (req, res) => {
  try {
    const { AdminId, tableId,CustomerId } = req.params;

    // Find orders by AdminId and tableId
    const orders = await Order.findOne({ AdminId, tableId,CustomerId });

    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error });
  }
};

export const fetchOrdersByAdminId = async (req, res) => {
  try {
    const { AdminId } = req.params;

    // Step 1: Find all orders by AdminId
    const orders = await Order.find({ AdminId });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this AdminId" });
    }

    // Step 2: Simply return all the orders, without filtering by itemsStatus
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error });
  }
};


export const OrdersTable = async (req, res) => {
  try {
    const { AdminId } = req.params;

    // Find all orders by AdminId
    const orders = await Order.find({ AdminId });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this AdminId" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error });
  }
};

// Controller to delete an order by AdminId and tableId
export const deleteOrder = async (req, res) => {
  try {
    const { AdminId, tableId } = req.params;

    // Find the order by AdminId and tableId
    const order = await Order.findOne({ AdminId, tableId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Delete the order
    await Order.deleteOne({ AdminId, tableId });
    io.emit("orderRemoved", order);

    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting order", error });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { adminId, tableId, orderId } = req.params; // Get the AdminId, tableId, and orderHistoryId from the request
  const { newStatus } = req.body; // The new status to be updated
  try {
    // Find the specific order by AdminId and tableId, and the specific OrderHistory object by its _id
    const order = await Order.findOne({
      AdminId: adminId,
      tableId: tableId,
      "OrderHistory._id": orderId,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the specific OrderHistory object and update its itemsStatus
    let orderUpdated = false;
    order.OrderHistory.forEach((history) => {
      if (history._id.toString() === orderId) {
        // Update the itemsStatus for this specific OrderHistory object
        history.itemsStatus = newStatus;
        orderUpdated = true;
      }
    });

    if (!orderUpdated) {
      return res.status(404).json({ message: "Order history not found" });
    }

    // Save the updated order
    await order.save();
    io.emit("orderUpdated", order);
    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteOrderHistory = async (req, res) => {
  const { adminId, tableId, orderId } = req.params; // Extract AdminId, tableId, and OrderHistory ID from the request

  try {
    // Find the order by AdminId and tableId
    const order = await Order.findOne({ AdminId: adminId, tableId: tableId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Filter out the OrderHistory entry with the given orderId
    const initialLength = order.OrderHistory.length;
    order.OrderHistory = order.OrderHistory.filter(
      (history) => history._id.toString() !== orderId
    );

    if (order.OrderHistory.length === initialLength) {
      // No changes made, meaning the orderId was not found
      return res.status(404).json({ message: "Order history not found" });
    }

    // Recalculate the totalOrderAmount after deleting the entry
    order.totalOrderAmount = order.OrderHistory.reduce(
      (acc, history) => acc + history.total,
      0
    );

    // Save the updated order
    await order.save();

    // Emit a socket event to notify clients about the deletion
    io.emit("orderHistoryRemoved", { adminId, tableId, orderId });

    return res
      .status(200)
      .json({ message: "Order history deleted successfully", order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting order history", error });
  }
};




export const editOrderItem = async (req, res) => {
  try {
    const { adminId, tableId, orderHistoryId, itemId } = req.params;
    const updatedItem = req.body; // The new item details

    // Find the order
    const order = await Order.findOne({ AdminId: adminId, tableId: tableId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the specific order history entry
    const orderHistory = order.OrderHistory.find(
      (history) => history._id.toString() === orderHistoryId
    );

    if (!orderHistory) {
      return res.status(404).json({ message: "Order history not found" });
    }

    // Find the item inside the order history
    const item = orderHistory.items.find((item) => item._id.toString() === itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update the item's properties
    Object.assign(item, updatedItem);

    // Recalculate subtotal, gst, and total
    orderHistory.subtotal = orderHistory.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    orderHistory.total = orderHistory.subtotal + orderHistory.gst;

    // Update totalOrderAmount
    order.totalOrderAmount = order.OrderHistory.reduce((sum, history) => sum + history.total, 0);

    // Save changes
    await order.save();

    io.emit("orderItemUpdated", { adminId, tableId, orderHistoryId, itemId });

    res.status(200).json({ message: "Order item updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order item", error });
  }
};

export const deleteOrderItem = async (req, res) => {
  try {
    const { adminId, tableId, orderHistoryId, itemId } = req.params;

    // Find the order
    const order = await Order.findOne({ AdminId: adminId, tableId: tableId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the specific order history entry
    const orderHistoryIndex = order.OrderHistory.findIndex(
      (history) => history._id.toString() === orderHistoryId
    );

    if (orderHistoryIndex === -1) {
      return res.status(404).json({ message: "Order history not found" });
    }

    const orderHistory = order.OrderHistory[orderHistoryIndex];

    // Find the item to be deleted
    const itemIndex = orderHistory.items.findIndex((item) => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Remove the item
    orderHistory.items.splice(itemIndex, 1);

    // If no items remain in the order history, delete the order history entry
    if (orderHistory.items.length === 0) {
      order.OrderHistory.splice(orderHistoryIndex, 1);
    }

    // If no order history remains, delete the entire order
    if (order.OrderHistory.length === 0) {
      await Order.deleteOne({ AdminId: adminId, tableId: tableId });
      io.emit("orderRemoved", { adminId, tableId });
      return res.status(200).json({ message: "Order deleted successfully" });
    }

    // Recalculate subtotal, GST, and total for the remaining order history
    orderHistory.subtotal = orderHistory.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    orderHistory.gst = orderHistory.subtotal * 0.13;
    orderHistory.total = orderHistory.subtotal + orderHistory.gst;

    // Recalculate total order amount for the entire order
    order.totalOrderAmount = order.OrderHistory.reduce((sum, history) => sum + history.total, 0);

    // Save changes
    await order.save();

    io.emit("orderItemRemoved", { adminId, tableId, orderHistoryId, itemId });

    res.status(200).json({ message: "Order item deleted successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order item", error });
  }
};
