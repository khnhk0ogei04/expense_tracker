const jwt = require('jsonwebtoken');
const User = require("../models/User");
const { cloudinary } = require("../config/cloudinary");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1h'});
}

exports.registerUser = async (req, res) => {
    const {fullName, email, password, profileImageUrl} = req.body;
    if (!fullName || !email || !password){
        return res.status(400).json({
            message: "All fields are required."
        })
    }

    try {
        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(400).json({
                message: "Email already in use."
            })
        }
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl
        });
        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        });
    } catch (error) {
        res
        .status(500)
        .json({ message: "Error registering user", error: err.message });
    }
}

exports.loginUser = async (req, res) => {
    const {email, password} = req.body; 
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required."
        });
    }
    try {
        const user = await User.findOne({email});
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }
        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({
            message: "Error logging in user",
            error: error.message
        });
    }
}

exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user info",
            error: error.message
        });
    }
}

exports.updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        
        // Get user to check if they have an existing profile image
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Delete old profile image from Cloudinary if exists
        if (user.profileImageUrl) {
            // Extract public_id from Cloudinary URL
            const urlParts = user.profileImageUrl.split('/');
            const publicIdWithExt = urlParts[urlParts.length - 1];
            const publicId = `expense-tracker/${publicIdWithExt.split('.')[0]}`;
            
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error('Error deleting old profile image:', err);
            }
        }
        
        // Update user with new profile image URL
        user.profileImageUrl = req.file.path;
        await user.save();
        
        res.status(200).json({
            message: "Profile image updated successfully",
            profileImageUrl: user.profileImageUrl
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating profile image",
            error: error.message
        });
    }
}

