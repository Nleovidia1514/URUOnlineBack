const mongoose = require('mongoose');

const { DB_URL: mongoDbUrl } = process.env;

mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then( db => console.log('Connected to DB'))
.catch( err => console.error(err));