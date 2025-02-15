import Order from "../../model/customer/AddOrder.js";
import { io } from "../../server.js";
// Controller to add a new order
export const addOrder = async (req, res) => {
  try {
    const { AdminId, tableId,Cname,Cphone, items, subtotal, gst, total } = req.body;
    // Create a new order object with order details
    const newOrder = {
      Cname : Cname || "Unknown",
      Cphone : Cphone || "Unknown",
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

    // Step 2: Iterate over orders and filter each OrderHistory by itemsStatus 'prepare'
    const filteredOrders = orders
      .map((order) => {
        const filteredHistory = order.OrderHistory.filter(
          (history) => history.itemsStatus === "prepare"
        );

        // Step 3: Only return orders where there are items with 'prepare' status
        if (filteredHistory.length > 0) {
          return {
            ...order._doc, // Spread the order details
            OrderHistory: filteredHistory, // Replace the OrderHistory with filtered results
          };
        }
        return null;
      })
      .filter((order) => order !== null); // Remove null orders where no items are 'prepare'

    // Step 4: Respond with filtered orders
    if (filteredOrders.length === 0) {
      return res
        .status(404)
        .json({ message: 'No orders with itemsStatus "prepare" found' });
    }

    return res.status(200).json({ orders: filteredOrders });
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
