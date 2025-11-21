const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.01, 'Price must be greater than zero']
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category', 
        required: true
    },
    isBox: {
        type: Boolean,
        default: false
    },
    boxComponents: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    imageUrl: String 
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);