const express = require('express');
const connectDB = require('./utils/db');
const app = express();


connectDB();

app.use(express.json({extended : false}))
 
app.use('/api/users', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profiles', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> console.log(`server is listening on port ${PORT}`));

