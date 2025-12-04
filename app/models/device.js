
const mongoose = require('mongoose');
const { Schema } = mongoose;

const DeviceSchema = new Schema({
    // The IP attribute is the key identifier for the device (must be unique)
    ipAddress: { 
        type: String,
        required: [true, 'IP address is required for device registration'],
        unique: true,
        trim: true,
        // Enforce IPv4 structure validation
        match: [
            /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            'Please provide a valid IPv4 address (e.g., 192.168.1.1)'
        ]
    },
    deviceName: {
        type: String,
        required: [true, 'Device name is required'],
        unique: true,
        trim: true
        
    },
    
}, {
    timestamps: true
});

module.exports = mongoose.model('Device', DeviceSchema);