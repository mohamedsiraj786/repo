const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

// Connect to MongoDB
const mongoURI = 'mongodb+srv://siraj:2FJ63FMlPnQHHpcT@cluster0.xxdhvm1.mongodb.net/My_AI_assistant?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define user schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,

}, { collection: 'credential' }); 

// Specify collection name
const User = mongoose.model('Credential', userSchema, 'credential'); // Specify model name and collection name

// Route to handle POST requests to check credentials
app.post('/check_credential', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in the database
    const user = await User.findOne({ username: username, password: password });

    if (user) {
      // Credentials are correct
      res.sendStatus(200); // OK status
    } else {
      // Credentials are incorrect
      res.sendStatus(401); // Unauthorized status
    }
  } catch (error) {
    console.error('Error checking credentials:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
