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
        // The IP address of the tablet assigned to this table
        type: String,
        required: [false, 'IP address is required for tablet mapping'],
        unique: true,
        trim: true
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
    timestamps: true
});

module.exports = mongoose.model('Table', TableSchema);