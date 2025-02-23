const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: 'https://storage-devolvedai.s3.amazonaws.com/common/logo/user.png' }, // Default image if not provided
    badge: { type: String, default: 'newbie' }, // Default badge if not provided
    password: { type: String, default: '' },
    passwordUpdateTimestamp: { type: Date, default: Date.now }, // Set to current date if not provided
    otp: { type: String },
    otpCreatedAt: { type: Date }, // Timestamp when the OTP is created
    referralCode: { type: String, default: 'N/A' }, // Default referral code if not provided
    referredBy: { type: String, default: 'N/A' }, // Default value if not provided
    token: { type: String },
    emailVerified: { type: Boolean, default: false },
    userBlocked: { type: Boolean, default: false },
    loggedIn: { type: Boolean, default: false },
    deviceId: [{ type: String }],
    competitionsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CompetitionParticipant' }],
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
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