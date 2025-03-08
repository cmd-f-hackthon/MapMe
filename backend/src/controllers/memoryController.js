const Memory = require('../models/Memory');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Get all memories
exports.getAllMemories = async (req, res) => {
    try {
        const memories = await Memory.find().sort({ date: -1 });
        res.status(200).json(memories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single memory
exports.getMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);
        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }
        res.status(200).json(memory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new memory
exports.createMemory = async (req, res) => {
    try {
        const { location, date, description, coordinates } = req.body;
        const uploadedPhotos = [];

        // Upload photos to Cloudinary if any
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'travel-memories'
                });
                uploadedPhotos.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        }

        const memory = new Memory({
            location,
            date,
            description,
            photos: uploadedPhotos,
            coordinates
        });

        const savedMemory = await memory.save();
        res.status(201).json(savedMemory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a memory
exports.updateMemory = async (req, res) => {
    try {
        const { location, date, description, coordinates } = req.body;
        const memory = await Memory.findById(req.params.id);

        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        // Handle new photos if any
        if (req.files && req.files.length > 0) {
            const uploadedPhotos = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'travel-memories'
                });
                uploadedPhotos.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
            memory.photos = [...memory.photos, ...uploadedPhotos];
        }

        memory.location = location || memory.location;
        memory.date = date || memory.date;
        memory.description = description || memory.description;
        memory.coordinates = coordinates || memory.coordinates;

        const updatedMemory = await memory.save();
        res.status(200).json(updatedMemory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a memory
exports.deleteMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(req.params.id);
        
        if (!memory) {
            return res.status(404).json({ message: 'Memory not found' });
        }

        // Delete photos from Cloudinary
        for (const photo of memory.photos) {
            if (photo.publicId) {
                await cloudinary.uploader.destroy(photo.publicId);
            }
        }

        await memory.remove();
        res.status(200).json({ message: 'Memory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 