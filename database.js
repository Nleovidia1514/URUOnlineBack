const mongoose = require('mongoose');

const {mongoDbUrl} = require('./configuration/config');

mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then( db => console.log('Connected to DB'))
.catch( err => console.error(err));