const mongoose = require('mongoose');
const { Schema } = mongoose;


// custumization 

const CustomizationSchema = new Schema({
    type: {
        // E.g., 'Spiciness', 'Topping', 'Preparation'
        type: String,
        required: true,
        trim: true
    },
    value: {
        // E.g., 'Extra Hot', 'Add Bacon', 'Well Done'
        type: String,
        required: true,
        trim: true
    }
});

// --- Sub-schema for items within an order ---
const OrderItemSchema = new Schema({
    product: {
        // Reference to the actual Product document
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: { 
        type: String, // Snapshot of the name
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtOrder: {
        // CRUCIAL: Snapshot of the price when the order was placed
        type: Number,
        required: true
    },
    customizations: [CustomizationSchema]
});

const OrderSchema = new Schema({
    table: {
        // Reference to the Table model from which the order originated
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    client: {
        // Reference to the User model, null if a non-client placed the order
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    items: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        // The order lifecycle for kitchen/staff
        type: String,
        enum: ['Pending', 'Processing', 'Ready', 'Served', 'Waiting Payment', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    paymentDetails: {
        method: {
            type: String,
            enum: ['Cash', 'Stripe', 'None'],
            default: 'None'
        },
        status: {
            type: String,
            enum: ['Unpaid', 'Pending', 'Completed', 'Failed'],
            default: 'Unpaid'
        },
        stripeId: String // ID for Stripe transaction tracking
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);