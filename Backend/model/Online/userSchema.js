import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
const keySecret = 'ldjfjaojorejoojfoajoejrfoaoohahojoehojohahojfoaohahojoeoohohohoh';
const userSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true},
    password: {type: String, required: true, trim: true},
    role: {type: String, default: 'user'},
    tokens: [
        {
            token: {
                type: String,
            }
        }
    ],
});

// Hash password before saving to the database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcryptjs.hash(this.password, 12);
    }
    next();
});

// token generate
userSchema.methods.generateAuthToken = async function(){
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

export default mongoose.model('User', userSchema);
