const mongoose = require('mongoose');
const { Schema } = mongoose;

// Customization sub-schema (Required by items.customizations)
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
}, { _id: false }); // Use _id: false for nested sub-documents if not needed

// --- Sub-schema for items within an order (Required by Order.items) ---
const OrderItemSchema = new Schema({
    product: {
        // Reference to the actual Product document (Required by items.product)
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: { 
        type: String, // Snapshot of the name (Required by items.name)
        required: true
    },
    quantity: {
        type: Number, // (Required by items.quantity)
        required: true,
        min: 1 // Matches native schema minimum: 1
    },
    priceAtOrder: {
        // Snapshot of the price (Required by items.priceAtOrder)
        type: Number, // Matches native schema bsonType: 'double'
        required: true,
        min: 0 // Matches native schema minimum: 0
    },
    customizations: [CustomizationSchema]
}, { _id: false });

const OrderSchema = new Schema({
    table: {
        // Reference to the Table model (Required field)
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    client: {
        // Field name matches native schema (client, not user)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        default: null // Matches native schema bsonType: ['objectId', 'null']
    },
    items: {
        type: [OrderItemSchema], // Matches native schema bsonType: 'array', minItems: 1
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Order items array must not be empty.'
        }
    },
    totalAmount: {
        type: Number, // Matches native schema bsonType: 'double'
        required: true,
        min: 0 // Matches native schema minimum: 0
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
        stripeId: String // Matches native schema bsonType: ['string', 'null']
    }
}, {
    timestamps: true, // Manages createdAt and updatedAt (bsonType: 'date')
    versionKey: false // CRITICAL: Prevents Mongoose from adding '__v', which violates additionalProperties: false
});

module.exports = mongoose.model('Order', OrderSchema);