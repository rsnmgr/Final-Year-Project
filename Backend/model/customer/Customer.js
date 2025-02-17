// customer.js (model definition)
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const keySecret = "ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh";

const customerSchema = new mongoose.Schema(
  {
    name: { type: "string" },
    phone: { type: "string" },
    adminId: { type: "string", required: true },
    tableId: { type: "string", required: true },
    role: { type: "string", default: "customer" },
    status: { type: "string", default: "booked" },
    friendCode: { 
      type: "string", 
      default: () => Math.floor(1000 + Math.random() * 9000).toString() 
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

customerSchema.methods.generateAuthToken = async function () {
  try {
    let token123 = jwt.sign({ _id: this._id }, keySecret, {
      expiresIn: "7d",
    });

    this.tokens = this.tokens.concat({ token: token123 });

    await this.save();

    return token123;
  } catch (error) {
    response.status(422).json(error);
  }
};

// Check if the model already exists
const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
