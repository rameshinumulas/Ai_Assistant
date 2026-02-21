import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

//GENERATE JWT TOKEN

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d"
    });
};

// @desc Register new user
// @route POST api/auth/register
// access Public

export const register = async (req, res, next) => {
    try {
        console.log('caling here', req.body);
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }] });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error:
                    userExists.email === email
                        ? 'Email already exists'
                        : 'Username already exists',
                statusCode: 400
            });
        }
        // Create new user
        const user = await User.create({
            username: username,
            email,
            password
        });
        // Generate token
        const token = generateToken(user._id);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token
            },
            message: 'User registered successfully',
        });
    } catch (error) {
        // console.log(error, 'error');
        next(error);
    }
}

// @desc Login new user
// @route POST api/auth/login
// access Public

export const login =async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password',
                statusCode: 400
            });
        }
        // check for user include password for comparison
        const user = await User.findOne({ email }).select('+password');
        console.log(user, 'user');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401
            });
        }
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401
            });
        }
        // Generate token
        const token = generateToken(user._id);
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
            token,
            message: 'User logged in successfully'
            });
    } catch (error) {
        next(error);
    }
}


// @desc  Get user profile
// @route POST api/auth/profile
// access Private


export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
        });
    }
    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    });
    } catch (error) {
        next(error);
    }
}

// @desc  Update user profile
// @route POST api/auth/profile
// access Private


export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profileImage } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
        });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;
    await user.save();

    res.status(200).json({
        success: true,
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        },
        message: 'Profile updated successfully'
    });
    } catch (error) {
        next(error);
    }
}

// @desc  Change password
// @route POST api/auth/profile
// access Private


export const changePassword = async (req, res, next) => {
     try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current and new password',
                statusCode: 400
            });
        }
        // check if current password matches
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect',
                statusCode: 401
            });
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }   
}


