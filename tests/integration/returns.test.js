const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');

const {Rental} = require('../../models/rental');
const {User} = require('../../models/user');
const {Movie} =require('../../models/movie');

describe('/api/returns', ()=>{

    let server;
    let customerId;
    let movieId;
    let rental ;
    let movie;
    let token;

    const exec = ()=>{
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token )
            .send({customerId, movieId});
    };

    beforeEach( async()=>{
        server = require('../../index');

        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: "12345678",
            dailyRentalRate: 2,
            genre: { name: '123456'},
            numberInStock: 10
        });
        await movie.save();

        rental = new Rental({
            customer:{
                _id: customerId ,
                name: "Test name",
                phone: '1234567'
            },
            movie: {
                _id: movieId,
                title: 'Test movie',
                dailyRentalRate: 2
            }
        });

        await rental.save();
    });

    afterEach(async ()=>{
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    it('should return 401 if client is not logged in', async()=>{
        token = '';
        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async ()=>{
        customerId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async ()=>{
        movieId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for this customer/movie', async ()=>{
        await Rental.remove({});
        const res = await exec();
        expect(res.status).toBe(404);
    });

    it('should Return 400 if rental already processed', async ()=>{
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);

    });

    it('should return 200 if we have a valid request', async ()=>{

        const res = await exec();
        expect(res.status).toBe(200);

    });

    it('should set the return date is input is valid', async ()=>{
        await exec();

        const rentalInDb = await Rental.findById(rental._id);

        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 *1000);

    });

    it('should set the rentalFee if input is valid', async ()=>{

        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        await exec();

        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('should the movie stock if input is valid', async ()=>{

        await exec();

        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental if input is valid', async ()=>{

        const res = await exec();
        await Rental.findById(rental._id);

        expect(Object.keys(res.body))
            .toEqual(expect.arrayContaining(['dateOut', 'dateReturned','rentalFee','customer', 'movie']))
    });

});