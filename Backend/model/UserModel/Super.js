import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';
const superSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},
    address:{type: String, required: true},
    image:{type: String},
    password: {type: String, require:true},
    role: {type: String,default:'super'},
    tokens: [
      {
          token: {
              type: String,
          }
      }
  ],
});
// password hash
superSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcryptjs.hash(this.password, 12);
    }
    next();
  });

  // token generate
  superSchema.methods.generateAuthToken = async function() {
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
  
const SuperAdmin = mongoose.model('SuperAdmin', superSchema);
export default SuperAdmin;