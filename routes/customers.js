const express = require('express');

const {Customer, validate} = require('../models/customer');
const auth = require('../middleware/auth');
const router = express.Router();


router.post('/', auth,  async (req, res)=>{

    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });

    customer = await customer.save();
    res.send(customer);
});

router.get('/', async  (req, res)=>{
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

router.get('/:id', async (req, res)=>{
    const id = req.params.id;
    const customer = await Customer.findById(id);

    if(!customer) return res.status(404).send(`Customer with id: ${id} was not found`);

    res.send(customer);
});

router.put('/:id', auth, async (req, res)=>{
    const id = req.params.id;

    const {error} = validate(req.body);

    if(error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(id, {
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    }, {new: true});

    if (!customer) return res.status(404).send(`Customer wirh ${id} was not found!`);

    res.send(customer);
});

router.delete('/:id', auth, async (req, res)=>{
    const id = req.params.id;
    const customer = await Customer.findByIdAndRemove(id);

    if (!customer) return res.status(404).send(`Customer with id ${id} was not found!`);

    res.send(customer);
});


module.exports = router;


