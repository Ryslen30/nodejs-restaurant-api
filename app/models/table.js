const mongoose = require('mongoose');
const { Schema } = mongoose;

const TableSchema =  new Schema({
    tableNumber: {
        type: String,
        required: [true, 'Table number is required'],
        unique: true,
        trim: true
    },
    ipAddress: {
        type: Schema.Types.ObjectId,
        ref: 'Device', 
        unique: true, // Crucial: A device can only be on ONE table
        required: false,
        
    },
    status: {
        type: String,
        enum: ['Vacant', 'Occupied', 'Needs Cleaning'],
        default: 'Vacant'
    },
    currentOrder: {
        // A reference to the single active order at this table (if occupied)
        type: Schema.Types.ObjectId,
        ref: 'Order', 
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Table', TableSchema);