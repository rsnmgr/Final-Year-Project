import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';
// Create User Schema
const adminSchema = new mongoose.Schema({
    name:{type:"string",required:true},
    email:{type:"string",required:true},
    phone:{type:"string",required:true},
    address:{type:"string",required:true},
    restaurant:{type:"string",required:true},
    password:{type:"string"},
    image:{type:"string"},
    role:{type:"string",default:"admin"},
    status:{type:"string",default:'Active'},
    tokens: [
      {
          token: {
              type: String,
          }
      }
  ],
},
  {timestamps:true}
);

//Hash Password before saving to database

adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcryptjs.hash(this.password, 12);
    }
    next();
  });

  adminSchema.methods.generateAuthToken = async function(){
    try {
        let token123 = jwt.sign({_id:this._id},keySecret,{
            expiresIn: '7d'
        });
        this.tokens = this.tokens.concat({token: token123});
        await this.save();
        return token123;
    } catch (error) {
        response.status(422).json(error);
    }
}

export default mongoose.model('Admin',adminSchema);