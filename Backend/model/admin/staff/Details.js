import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';
const detailSchema = new mongoose.Schema({
    AdminId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    address:{ type: String,required: true},
    phone: { type: String, required: true },
    salary: { type: String ,required: true },
    status: { type: String, required: true },
    image: { type: String },
    password: { type: String, required: true },
    tokens: [
        {
            token: {
                type: String,
            }
        }
    ],
    role: { type: String, default: 'staff' },
    date: { type: Date, default: Date.now },
});

detailSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcryptjs.hash(this.password, 12);
    }
    next();
  });

  // token generate
  detailSchema.methods.generateAuthToken = async function() {
    try {
        let token123 = jwt.sign({_id: this._id}, keySecret, {
            expiresIn: '30d'
        });
        this.tokens = this.tokens.concat({ token: token123 });
        await this.save();
        return token123;
    } catch (error) {
        console.error("Error generating token:", error);
        throw error; // Rethrow the error for handling upstream
    }
  }
const Details = mongoose.model('StaffDetails', detailSchema);

export default Details;
