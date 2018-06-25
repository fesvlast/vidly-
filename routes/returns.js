const express = require('express');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const {Rental} = require('../models/rental');
const {Movie} = require('../models/movie');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');


const router = express.Router();

let validateReturns = function (req) {
    const schema = ({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required(),
    });
    return Joi.validate(req, schema);
};




router.post('/', [auth, validate(validateReturns)], async(req, res)=>{

    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if(!rental) return res.status(404).send('Rental not found');

    if(rental.dateReturned) return res.status(400).send('Return already processed.');

    rental.return();
    await rental.save();

    await Movie.update({_id: rental.movie._id}, {
        $inc: {numberInStock: 1}
    });

    return res.send(rental);

});

module.exports = router;

