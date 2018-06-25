const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/playground')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const authorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String
});

const Author = mongoose.model('Author', authorSchema);

const Course = mongoose.model('Course', new mongoose.Schema({
    name: String,
    authors: [ authorSchema]
}));

async function createCourse(name, authors) {
  const course = new Course({
    name, 
    authors
  }); 
  
  const result = await course.save();
  console.log(result);
}

async function listCourses() { 
  const courses = await Course.find();
  console.log(courses);
}
 async function updateAuthor(courseId) {
     const course = await Course.update({_id: courseId}, {
       $unset:{
         'author': '',
       }});
 }

 async function addAuthor(courseId, author) {
     const course = await Course.findById(courseId);
     course.authors.push(author);

     course.save();
 }

 async function removeAuthor(courseId, authorId) {
     const course = await Course.findById(courseId);
     const author = course.authors.id(authorId);
     author.remove();
     course.save();
 }

/*createCourse('Node Course', [
    new Author({name: 'Mosh'}),
    new Author({name: 'John'})
]);*/
//updateAuthor('5b2811ed52c8d937a89cc8de');

removeAuthor('5b290bf74f98992490949945', '5b290c26e63272190028645e');


