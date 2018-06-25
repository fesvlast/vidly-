const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model('Customer', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 256
    },
    phone: {
        type: String,
        required: true,
        minlength: 12,
        maxlength: 12
    },
    isGold: {
        type: Boolean,
        default: false
    }
}));

function validateCustomer(customer) {
    const schema = ({
        name: Joi.string().min(3).required(),
        phone: Joi.string().min(12).required(),
        isGold: Joi.boolean()
    });

    return Joi.validate(customer, schema);
}

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
