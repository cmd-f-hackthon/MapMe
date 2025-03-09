const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const axios = require('axios');

const RateLimit = require('express-rate-limit');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const googleMapsClient = {
    geocode: async (address) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
            );
            return response.data;
        } catch (error) {
            console.error('Geocoding error:', error);
            throw error;
        }
    },
    reverseGeocode: async (lat, lng) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
            );
            return response.data;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw error;
        }
    },
    getNearbyPlaces: async (lat, lng, radius = 1000, type = '') => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}${type ? `&type=${type}` : ''}&key=${GOOGLE_MAPS_API_KEY}`
            );
            return response.data;
        } catch (error) {
            console.error('Places API error:', error);
            throw error;
        }
    },
    // getDistanceMatrix: async (origins, destinations) => {
    //     try {
    //         // Convert origins and destinations arrays to strings
    //         const originsStr = origins.map(o => `${o.lat},${o.lng}`).join('|');
    //         const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
            
    //         const response = await axios.get(
    //             `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    //             `origins=${encodeURIComponent(originsStr)}` +
    //             `&destinations=${encodeURIComponent(destinationsStr)}` +
    //             `&mode=walking` +
    //             `&key=${GOOGLE_MAPS_API_KEY}`
    //         );
    //         return response.data;
    //     } catch (error) {
    //         console.error('Distance Matrix API error:', error.response?.data || error.message);
    //         throw error;
    //     }
    // }
};

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per windowMs
});


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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            required: true
        },
        address: String,
        nearbyPlaces: [{
            name: String,
            place_id: String,
            icon: String,
            vicinity: String
        }]
    },
    path: [{
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

journalEntrySchema.index({ location: '2dsphere' });

// Create a model
const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);



// add journal entry to database
createJournalEntry = async (req, res) => {
    try {
        const { title, content, location, date } = req.body;
        const newEntry = new JournalEntry({ title, content, location, date });
        await newEntry.save();
        res.json({ message: 'Journal entry created' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// retrieve all journal entries from database
retrieveJournalEntries = async (req, res) => {
    try {
        const entries = await JournalEntry.find();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

//testing function
testing = (req, res) => {
    console.log(req.body)
    const { title, content, location, date } = req.body;
    res.send(`
        <h1>Journal Entry</h1>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Content:</strong> ${content}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Date:</strong> ${date}</p>
    `);
}

// API Routes
app.post('/api/journal', async (req, res) => {
    try {
        const { title, content, latitude, longitude } = req.body;
        
        // Get address and place details for the location
        const geocodeResult = await googleMapsClient.reverseGeocode(latitude, longitude);
        const nearbyPlaces = await googleMapsClient.getNearbyPlaces(latitude, longitude, 100);
        
        const newEntry = new JournalEntry({
            title,
            content,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
                address: geocodeResult.results[0]?.formatted_address,
                nearbyPlaces: nearbyPlaces.results?.slice(0, 5) // Store up to 5 nearby places
            },
            path: [{
                type: 'Point',
                coordinates: [longitude, latitude]
            }]
        });
        
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update path for an existing journal entry
app.post('/api/journal/:id/location', limiter, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const entry = await JournalEntry.findById(req.params.id);
        
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        entry.path.push({
            type: 'Point',
            coordinates: [longitude, latitude]
        });

        await entry.save();
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get journal entry with its path
app.get('/api/journal/:id', limiter, async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all journal entries
app.get('/api/journal', limiter, async (req, res) => {
    try {
        const entries = await JournalEntry.find();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// New API endpoints for Google Maps features
app.post('/api/geocode', async (req, res) => {
    try {
        const { address } = req.body;
        const result = await googleMapsClient.geocode(address);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reverse-geocode', async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const result = await googleMapsClient.reverseGeocode(latitude, longitude);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/nearby-places', async (req, res) => {
    try {
        const { latitude, longitude, radius, type } = req.body;
        const result = await googleMapsClient.getNearbyPlaces(latitude, longitude, radius, type);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/distance-matrix', async (req, res) => {
    try {
        const { origins, destinations } = req.body;
        const result = await googleMapsClient.getDistanceMatrix(origins, destinations);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 

// Handle POST request to create a journal entry
app.post('/journal-entries', createJournalEntry);

// Handle GET request to retrieve all journal entries
app.get('/journal-entries', limiter, retrieveJournalEntries);

// Testing endpoint
app.post('/testing', testing);
