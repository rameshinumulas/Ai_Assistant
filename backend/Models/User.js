import mongoose from "mongoose";
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'Please provide username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+S/, 'Please provide valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide Password'],
        unique: true,
        lowercase: true,
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    profileImages: {
        type: String,
        default: null
    }
}, {
    timestamps: true
})

// Hash password before save

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// compare password method

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

