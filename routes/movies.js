const express = require('express');

const {Movie, validate} = require('../models/movie');
const {Genre} = require('../models/genre');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res)=>{

    const {error} = validate(res.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(400).send('Invalid genre ID');

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    await movie.save();
    res.send(movie);
});

router.get('/', async(req, res) =>{
    const movies = await Movie.find().sort('title');
    res.send(movies);
});

router.get('/:id', async (req, res)=>{
    const id = req.params.id;
    const movie = await Movie.findById(id);

    if(!movie) return res.status(404).send(`Movie with id: ${id} was not found`);
    res.send(movie);
});

router.put('/:id', auth, async (req, res)=>{
    const id = req.params.id;
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send(`Invalid genre!`);

    const movie = await Movie.findByIdAndUpdate(id, {
        title: req.body.title,
        genre: {
            _id: genre._id.toString(),
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    }, {new: true});

    if (!movie) return res.status(404).send(`Movie with ID: ${id} was not found`);

    res.send(movie);
});

router.delete('/:id', auth, async(req, res)=>{
    const id = req.params.id;
    const movie = await Movie.findByIdAndRemove(id);

    if(!movie) return res.status(404).send(`Movie with ID: ${id} was not found`);

    res.send(movie);
});

module.exports = router;

