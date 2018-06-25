const express = require('express');

const {Genre, validateGenre} = require('../models/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncMiddleware = require('../middleware/async');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const router = express.Router();

router.get('/', asyncMiddleware( async (req, res) =>{
   // throw new Error('Could not get the genres');
    const genres = await Genre.find().sort('name');
    res.send(genres);
}));

router.get('/:id', validateObjectId,  async(req, res)=>{
    const genre = await Genre.findById(req.params.id);

    if (!genre){
        return  res.status(404).send(`Genre with id=${req.params.id} is not found!`);
    }
    res.send(genre);
});

router.post('/', [auth, validate(validateGenre)], asyncMiddleware( async (req, res) =>{

    let genre = new Genre(
        {
            name: req.body.name
        });
    genre = await genre.save();
    res.send(genre);
}));

router.put('/:id', [validateObjectId, auth, validate(validateGenre)], asyncMiddleware(async(req, res)=>{

    const genre = await Genre.findByIdAndUpdate(req.params.id, {
        name: req.body.name
    }, {new: true});

    if(!genre){
        return res.status(404).send(`Gender with id= ${req.params.id} is not found!`);
    }
    res.send(genre);
}));

router.delete('/:id', [validateObjectId, auth, admin], asyncMiddleware(async(req, res) =>{

    const genre = await Genre.findByIdAndRemove(req.params.id);

    if(!genre){
        res.status(404).send(`Genre with id=${req.params.id} is not found!`);
    }

    res.send(genre);
}));

module.exports = router;

