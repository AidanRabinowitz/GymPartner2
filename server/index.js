const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const uri = 'mongodb+srv://aidanrabinowitz:Draro3n3L86eVpmB@cluster0.gz8wb.mongodb.net/GymPartner?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB!'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));


const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const app = express();
const port = 3000;
const cors = require('cors');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Replace this with your secret key (keep it private!)
const SECRET_KEY = 'your-secret-key';
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const MONGO_URI = process.env.MONGO_URI;
const corsOptions = {
  origin: 'http://192.168.0.20:3000/', // Replace with your React Native app's IP address if it's running in a simulator or device
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
app.use(cors(corsOptions));

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());
const clientOptions = {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
};




// Define a route for the root URL
app.get('/test', (req, res) => {
  res.send('Welcome to my server!'); // Respond with a simple message
});

const User = require('./models/user');
const Chat = require('./models/message');

const generateToken = user => {
  // Define your secret key used to sign the token
  const secretKey = process.env.JWT_SECRET;
  // Define the token payload (you can include any user data you want)
  const payload = {
    userId: user._id,
    email: user.email,
    // Add any other user data you want to include
  };

  // Generate the token with the payload and secret key
  const token = jwt.sign(payload, secretKey, {expiresIn: '1d'}); // Token expires in 1 hour

  return token;
};

// Backend Route to Create User and Generate Token
app.post('/register', async (req, res) => {
  console.log('Received request:', req.body); // Log the request body to ensure you're getting user data
  try {
    const userData = req.body;
    // Additional logging
    console.log('User data:', userData);

    // Create a new user using the User model
    const newUser = new User(userData);
    try {
      await newUser.save();
      console.log('User saved to database:', newUser);
    } catch (saveError) {
      console.error('Error saving user to database:', saveError);
    }
    // Generate a token (you may want to adjust how tokens are generated)
    const token = jwt.sign({ userId: newUser._id }, 'yourSecretKey', { expiresIn: '1d' });

    // Return the new user data along with the token
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error creating user:', error); // Log the error for debugging
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.get('/user', async (req, res) => {
//   try {
//     // Get the user details based on the user ID from the authentication token
//     const userId = req.user.id; // Assuming the user ID is stored in the request object after authentication
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({message: 'User not found'});
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user details:', error);
//     res.status(500).json({message: 'Internal server error'});
//   }
// });

//fetch users data
app.get('/users/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({message: 'User not found'});
    }

    return res.status(200).json({user});
  } catch (error) {
    res.status(500).json({message: 'Error fetching the user details'});
  }
});

//endpoint to login
app.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    //check if the user exists already
    const user = await User.findOne({email});
    console.log('Found User:', user); // Ensure user is found and password matches

    if (!user) {
      return res.status(401).json({message: 'Invalid email or password'});
    }

    //check in password is correct
    if (user.password !== password) {
      return res.status(401).json({message: 'Invalide password'});
    }

    const secretKey = crypto.randomBytes(32).toString('hex');

    const token = jwt.sign({userId: user._id}, secretKey, {expiresIn: '1d'});

    return res.status(200).json({token});
  } catch (error) {
    res.status(500).json({message: 'login failed'});
  }
});

app.get('/matches', async (req, res) => {
  try {
    const {userId} = req.query;

    // Fetch user's dating preferences and type
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    let filter = {}; // Initialize filter as an empty object

    if (user.gender === 'Men') {
      filter.gender = 'Women';
    } else if (user.gender === 'Women') {
      filter.gender = 'Men';
    }

    // Construct query based on dating preferences and type
    let query = {
      _id: {$ne: userId},
    };

    // if (user.datingPreferences && user.datingPreferences.length > 0) {
    //   filter.datingPreferences = user.datingPreferences;
    // }
    if (user.type) {
      filter.type = user.type; // Assuming user.type is a single value
    }

    const currentUser = await User.findById(userId)
      .populate('matches', '_id')
      .populate('likedProfiles', '_id');

    // Extract IDs of friends
    const friendIds = currentUser.matches.map(friend => friend._id);

    // Extract IDs of crushes
    const crushIds = currentUser.likedProfiles.map(crush => crush._id);

    console.log('filter', filter);

    // Fetch matches based on query
    const matches = await User.find(filter)
      .where('_id')
      .nin([userId, ...friendIds, ...crushIds]);

    return res.status(200).json({matches});
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

// Endpoint for liking a profile
app.post('/like-profile', async (req, res) => {
  try {
    const {userId, likedUserId, image, comment} = req.body;

    // Update the liked user's receivedLikes array
    await User.findByIdAndUpdate(likedUserId, {
      $push: {
        receivedLikes: {
          userId: userId,
          image: image,
          comment: comment,
        },
      },
    });
    // Update the user's likedProfiles array
    await User.findByIdAndUpdate(userId, {
      $push: {
        likedProfiles: likedUserId,
      },
    });

    res.status(200).json({message: 'Profile liked successfully'});
  } catch (error) {
    console.error('Error liking profile:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.get('/received-likes/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const likes = await User.findById(userId)
      .populate('receivedLikes.userId', 'firstName imageUrls prompts')
      .select('receivedLikes');

    res.status(200).json({receivedLikes: likes.receivedLikes});
  } catch (error) {
    console.error('Error fetching received likes:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

//endpoint to create a match betweeen two people
app.post('/create-match', async (req, res) => {
  try {
    const {currentUserId, selectedUserId} = req.body;

    //update the selected user's crushes array and the matches array
    await User.findByIdAndUpdate(selectedUserId, {
      $push: {matches: currentUserId},
      $pull: {likedProfiles: currentUserId},
    });

    //update the current user's matches array recievedlikes array
    await User.findByIdAndUpdate(currentUserId, {
      $push: {matches: selectedUserId},
    });

    // Find the user document by ID and update the receivedLikes array
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: {receivedLikes: {userId: selectedUserId}},
      },
      {new: true},
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
  }


    // If the user document was successfully updated
    res.status(200).json({message: 'ReceivedLikes updated successfully'});

  } catch (error) {
    res.status(500).json({message: 'Error creating a match', error});
  }
});

// Endpoint to get all matches of a specific user
app.get('/get-matches/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    // Find the user by ID and populate the matches field
    const user = await User.findById(userId).populate(
      'matches',
      'firstName imageUrls',
    );

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Extract matches from the user object
    const matches = user.matches;

    res.status(200).json({matches});
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

io.on('connection', socket => {
  console.log('a user is connected');

  socket.on('sendMessage', async data => {
    try {
      const {senderId, receiverId, message} = data;

      console.log('data', data);

      const newMessage = new Chat({senderId, receiverId, message});
      await newMessage.save();

      //emit the message to the receiver
      io.to(receiverId).emit('receiveMessage', newMessage);
    } catch (error) {
      console.log('Error handling the messages');
    }
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
});

http.listen(8000, () => {
  console.log('Socket.IO server running on port 8000');
});

app.get('/messages', async (req, res) => {
  try {
    const {senderId, receiverId} = req.query;

    console.log(senderId);
    console.log(receiverId);

    const messages = await Chat.find({
      $or: [
        {senderId: senderId, receiverId: receiverId},
        {senderId: receiverId, receiverId: senderId},
      ],
    }).populate('senderId', '_id name');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({message: 'Error in getting messages', error});
  }
});
