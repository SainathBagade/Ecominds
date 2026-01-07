const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a school name'],
            unique: true,
            trim: true,
        },
        schoolID: {
            type: String,
            required: [true, 'Please add a school ID'],
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        contactEmail: {
            type: String,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please add a valid email',
            ],
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('School', schoolSchema);
