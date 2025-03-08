require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

const journalEntrySchema = new mongoose.Schema({
    title: String,
    content: String,
    location: String,
    date: Date
});

// Create a model
const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

//Insert a new journal entry
const newEntry = new JournalEntry({
    title: 'My First Entry',
    content: 'This is my first journal entry',
    location: 'New York',
    date: new Date()
});

//Save the new entry to the database
newEntry.save()
.then(() => console.log('New journal entry saved'))
.catch((error) => console.error('Error saving journal entry:', error));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
