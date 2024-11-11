const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: 'https://storage-devolvedai.s3.amazonaws.com/common/logo/user.png' },
    password: { type: String, required: true },
    passwordUpdateTimestamp: { type: Date, default: Date.now }, // Set to current date if not provided
    token: { type: String }, // auth token
    emailVerified: { type: Boolean, default: false },
    userBlocked: { type: Boolean, default: false },
    loggedIn: { type: Boolean, default: false },
    consent: { type: Boolean, default: true },
    firstLoginAt: { type: Date }, // Track first login timestamp
    lastLoginAt: { type: Date },  // Track last login timestamp
},{
    timestamps: true // This enables the createdAt and updatedAt fields
});

// Middleware to set firstLoginAt and lastLoginAt
UserSchema.pre('save', function (next) {
    if (this.isModified('loggedIn') && this.loggedIn) {
        if (!this.firstLoginAt) {
            this.firstLoginAt = new Date(); // Set first login
        }
        this.lastLoginAt = new Date(); // Always set last login
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);