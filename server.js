const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('Connected to database Successfully'))
  .catch((err) => console.log(err));
const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on 127.0.0.1:${port}`));
