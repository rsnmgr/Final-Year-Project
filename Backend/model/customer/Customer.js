import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
const keySecret =
  "ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh";
const customerSchema = new mongoose.Schema({
  name: { type: "string" },
  phone: { type: "string" },
  adminId: { type: "string", required: true },
  tableId: { type: "string", required: true },
  role: { type: "string", default: "customer" },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

// token generate
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

export default mongoose.model("Customer", customerSchema);
