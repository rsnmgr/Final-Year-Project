import Customer from "../../model/customer/customer.js";

export const addCustomer = async (req, res) => {
  const { name, phone, adminId, tableId } = req.body;

  if (!adminId || !tableId) {
    return res
      .status(400)
      .json({ message: "adminId and tableId are required" });
  }

  try {
    let existingCustomer = await Customer.findOne({ phone });

    if (existingCustomer) {
      // If customer already exists with the same phone, generate token and return
      const token = await existingCustomer.generateAuthToken();

      return res.status(200).json({
        message: "Customer already exists, token generated",
        token,
      });
    }

    // If customer does not exist, create a new customer
    const newCustomer = new Customer({
      name,
      phone,
      adminId,
      tableId,
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
    let validUser;

    if (await Customer.findOne({ _id: req.userId })) {
      validUser = await Customer.findOne({ _id: req.userId });
    } else {
      // If user is not found in any model

      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // If user is found, send a successful response

    res.status(200).json({ status: 200, validUser });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Server error", error });
  }
};
