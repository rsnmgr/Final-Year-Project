import Customer from "../../model/customer/customer.js";

export const addCustomer = async (req, res) => {
  const { name, phone, adminId, tableId, friendCode } = req.body;

  if (!adminId || !tableId) {
    return res.status(400).json({ message: "adminId and tableId are required" });
  }

  try {
    // Check if the table is already booked with the same adminId and tableId
    const bookedTable = await Customer.findOne({ tableId, adminId, status: "booked" });

    if (bookedTable) {
      // If friendCode matches, create a new user
      if (friendCode) {
        if (bookedTable.friendCode === friendCode) {
          const newFriend = new Customer({
            name: name || "Friend",
            phone: phone || "Unknown",
            adminId,
            tableId,
            status: "booked",
          });

          const token = await newFriend.generateAuthToken();

          return res.status(201).json({
            message: "Friend successfully added to the table",
            token,
          });
        } else {
          return res.status(400).json({ message: "Friend code does not match" });
        }
      } else {
        return res.status(400).json({ message: "This table is already booked, you can access it using a friend code" });
      }
    }

    // Check if a customer with the same phone number and adminId exists
    if (phone) {
      const existingCustomer = await Customer.findOne({ phone, adminId });
      if (existingCustomer) {
        return res.status(400).json({
          message: "Customer with this phone number already exists for this admin",
        });
      }
    }

    // Create a new customer if no existing customer is found
    const newCustomer = new Customer({
      name: name || "Unknown",
      phone: phone || "Unknown",
      adminId,
      tableId,
      status: "booked",
    });

    const token = await newCustomer.generateAuthToken();

    res.status(201).json({
      message: "Customer added successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};




export const validCustomer = async (req, res) => {
  try {
    const validUser = await Customer.findById(req.userId);

    if (!validUser) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    res.status(200).json({ status: 200, validUser });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error", error });
  }
};
