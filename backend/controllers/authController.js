import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

//GENERATE JWT TOKEN

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRETE, {
        expiresIn: process.env.JWT_EXPIRE || "7d"
    });
};

// @desc Register new user
// @route POST api/auth/register
// access Public

export const register = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}

// @desc Login new user
// @route POST api/auth/login
// access Public

export const login =async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}


// @desc  Get user profile
// @route POST api/auth/profile
// access Private


export const getProfile = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}

// @desc  Update user profile
// @route POST api/auth/profile
// access Private


export const updateProfile = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}

// @desc  Change password
// @route POST api/auth/profile
// access Private


export const changePassword = async (req, res, next) => {
     try {
        
    } catch (error) {
        
    }   
}


