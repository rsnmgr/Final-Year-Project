import Customer from "../../model/customer/Customer.js";

export const addCustomer = async (req, res) => {
  const { name, phone, adminId, tableId } = req.body;

  try {
    // Directly create a new customer without checking if the phone number exists
    const customer = new Customer({
      name,
      phone,
      adminId,
      tableId,
    });

    await customer.save();

    // Generate auth token for the new customer
    const token = await customer.generateAuthToken();
    res.status(201).json({ customer, token });
  } catch (error) {
    console.error("Error registering customer:", error);
    res.status(500).json({ message: "Server error during registration" });
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


export const getCustomer = async (req, res) => {
  try {
    const { AdminId } = req.params; // Extract AdminId from params

    // Fetch customers based on the AdminId
    const customers = await Customer.find({ adminId: AdminId });

    if (!customers.length) {
      return res.status(404).json({ message: "No customers found for this admin" });
    }

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error fetching customers" });
  }
};
