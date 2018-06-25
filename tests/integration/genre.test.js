const request = require('supertest');
const mongoose = require('mongoose');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
let server;

describe('/api/genres', ()=>{

    beforeEach(async()=>{
        server = require('../../index');
    });

    afterEach(async ()=>{
        await server.close();
        await Genre.remove({});
    });

    describe('GET /', ()=>{

        it('should return all genres', async ()=>{

           await Genre.collection.insertMany([
               {name: 'genre 1'},
               {name: 'genre 2'}
           ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);


            expect(res.body.some((g)=>{
                return g.name === 'genre 1';
            })).toBeTruthy();

           expect(res.body.some((g)=>{
               return g.name === 'genre 2';
           })).toBeTruthy();
       });
    });

    describe('GET /:id', ()=>{
        it('should return a genre if valid id passed', async()=>{
            let genre = await new Genre({
                name: 'Test genre'
            });
            await genre.save();

            const genreId = genre._id;
            const res = await request(server).get(`/api/genres/${genreId}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 error if id is not valid passed', async()=>{
            const genreId = "1";
            const res = await request(server).get(`/api/genres/${genreId}`);
            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with given id exists', async()=>{
            const genreId = mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/genres/${genreId}`);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /', ()=>{

        let token;
        let name;

        const exec = async()=>{
            return res = await request(server)
                .post('/api/genres')
                .set({'x-auth-token': token})
                .send({name});
        };

        beforeEach( ()=>{
            token = new User().generateAuthToken();
            name = 'genre 1';
        });

        it('should return 401 if client is not logged in', async ()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less then 5 chars', async ()=>{
            name = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more then 50 chars', async ()=>{
            name = new Array(52).join('a');
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async ()=>{
            await exec();
            const genre = await Genre.find({name: 'genre 1'});
            expect(genre).not.toBeNull();
        });

        it('should return genre if it is valid', async ()=>{
            const res = await exec();
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre 1');
        });

    });

    describe('PUT /:id', ()=>{
        let token;
        let name;
        let id;

        beforeEach(()=>{
            token = new User().generateAuthToken();
            id = mongoose.Types.ObjectId();
            name = 'Renamed genre';
        });

        const exec = ()=>{
            return request(server)
                .put(`/api/genres/${id}`)
                .set('x-auth-token', token)
                .send({name});
        };

        it('should return 401 if user is not logged in', async()=>{
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 404 if genre id is invalid', async()=>{
            id = 1234;
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 400 if genre name is invalid', async()=>{
            name = 'test';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 404 if genre with valid id not exists', async()=>{

            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should rename found genre', async()=>{
            let genre = await new Genre({
                name: 'initial genre name'
            });
            await genre.save();

            id = genre._id;
            const res = await exec();
            genre = await Genre.findById(id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', name);
            expect(genre).toHaveProperty('name', name);
        });
    });

    describe('DELETE /:id', ()=>{

        let token;
        let id;
        let name;

        beforeEach(()=>{
            token = new User().generateAuthToken();
            id = mongoose.Types.ObjectId();
            name = 'Deleted genre';
        });

        const exec = ()=>{
            return request(server)
                .delete(`/api/genres/${id}`)
                .set('x-auth-token', token);
        };

        it('should return 401 if user is not logged in', async()=>{
            token ='';
            let res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 403 if user is not admin', async()=>{
            let res = await exec();
            expect(res.status).toBe(403);
        });

        it('should return 404 if id is not valid', async()=>{
            id = 1234;
            let res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 404 if genre with id is not found', async()=>{
            token = new User({isAdmin: true}).generateAuthToken();
            let res = await exec();
            expect(res.status).toBe(404);
        });

        it('should remove found genre', async()=>{
            token = new User({isAdmin: true}).generateAuthToken();

            let genre = await new Genre({name});
            await genre.save();
            id = genre._id;

            let res = await exec();
            genre = await Genre.findById(id);

            expect(res.status).toBe(200);
            expect(genre).toBeFalsy();
        });

    })
});