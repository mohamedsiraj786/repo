const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser'); // Import body-parser middleware
const cors = require("cors")
const axios = require('axios')

const app = express();
app.use(cors())
const PORT = 3000;

// Connect to MongoDB
const mongoURI = 'mongodb+srv://siraj:2FJ63FMlPnQHHpcT@cluster0.xxdhvm1.mongodb.net/My_AI_assistant?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


// Parse JSON bodies
app.use(bodyParser.json());

app.use(express.json())

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define user schema and model


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
}, { collection: 'credential' });
const User = mongoose.model('Credential', userSchema);


const todoSchema = new mongoose.Schema({
  record: String
},  { collection: 'todo' });
const todo = mongoose.model('todo', todoSchema);




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

app.post('/addTodo', async (req, res)=> {

  const data = req.body
  
  console.log(data, "data")

  try {
    const newRecord = new todo({ "record": data.todo })
    await newRecord.save()
    res.status(201).json(newRecord)
  }
  catch(error) 
  {
    res.status(501).json({error: "error "})
  }
})


app.get('/getTodo', async (req, res )=> {

  try
  {
    const records = await todo.find()

    res.json(records)
  }

  catch (error) 
  {
    res.status(501).json({message: "fetch to failed"})
  }
})

app.delete('/deleteTodo/:record', async (req, res) => {
  try {
    const record = req.params.record;

    // Delete the record from the "todo" collection
    const deletedRecord = await todo.deleteOne({ record: record });
    console.log(deletedRecord, "deleted Record")

    // Check if the record was found and deleted successfully
    if (deletedRecord.deletedCount === 1) {
      // Record was successfully deleted
      // Send a success response with the deleted record
      res.status(200).json({ message: 'Record deleted successfully', deletedRecord });
    } else {
      // Record with the given record value was not found
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/chatbard', async (req, res) => {
  try {
      const userInput = req.body.messages[0].content; // Extract the user's message from the request body
      console.log(userInput, "user data")

      // Send the user's message to the Bard AI API
      const bardApiResponse = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
          contents: [
              {
                  parts: [
                      {
                          text:  `${userInput}  when ever iam asking something to u , you just pronouns my name : Siraj , just for my reference`
                      }
                  ]
              }
          ]
      }, {
          params: {
              key: 'AIzaSyDdjRGSIZ1oaCm_I9dbQhVP_tU6AvT2-YM' // Replace 'YOUR_BARD_AI_API_KEY' with your actual Bard AI API key
          }
      });

      const responseData = bardApiResponse.data;
      const text = responseData.candidates[0].content.parts[0].text;

      console.log(text, "test")

        // Send only the text property back to the client
        res.json( text );
  } catch (error) {
      console.error('Error handling chatbard request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
