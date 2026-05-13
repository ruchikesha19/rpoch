require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Pickup = require('./models/Pickup');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

  })
  .catch(err => console.error('❌ MongoDB error:', err));

// Socket.io Logic
io.on('connection', (socket) => {
  const role = socket.handshake.query.role;
  socket.role = role;
  console.log(`⚡ User connected: ${socket.id} (Role: ${role})`);

  socket.on('send_message', (data) => {
    console.log(`💬 Message from ${socket.role}:`, data.message);
    io.emit('receive_message', data);
  });

  socket.on('volunteer_location', (data) => {
    // Broadcast volunteer location to the specific restaurant tracking this pickup
    // data: { pickup_id, restaurant_id, lat, lng }
    io.emit(`location_update_${data.pickup_id}`, data);
  });

  socket.on('disconnect', () => {
    console.log(`🔥 User disconnected: ${socket.id}`);
  });
});


// Helper: Calculate points based on distance
const calculatePoints = (km) => {
  if (km <= 5) return 10;
  if (km <= 10) return 25;
  if (km <= 20) return 50;
  return 100;
};

// --- AUTH APIs ---

app.post('/api/register', async (req, res) => {
  const { name, email, password, user_type, location, lat, lng } = req.body;
  console.log('📝 Registration attempt:', { name, email, user_type });

  if (!name || !email || !password || !user_type) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const role = user_type.toLowerCase();
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = await User.create({ 
      name, 
      email, 
      password, 
      user_type: role,
      location: location || '',
      lat: lat || 12.9716,
      lng: lng || 77.5946 
    });
    res.status(201).json({
      user_id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      user_type: newUser.user_type,
      location: newUser.location,
      lat: newUser.lat,
      lng: newUser.lng
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    res.json({
      user_id: user._id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      location: user.location,
      lat: user.lat,
      lng: user.lng
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- RESTAURANT APIs ---

app.post('/api/pickups', async (req, res) => {
  const { restaurant_id, restaurant_name, location, food_type, quantity, distance_km, lat, lng } = req.body;
  if (!restaurant_id || !food_type || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const pickup = await Pickup.create({
      restaurant_id: new mongoose.Types.ObjectId(restaurant_id),
      restaurant_name,
      location: location || 'Main Street',
      lat: lat || 12.9716,
      lng: lng || 77.5946,
      food_type,
      quantity,
      distance_km: distance_km || 5,
      status: 'available'
    });

    // Notify all connected volunteers in real-time
    io.emit('new_pickup', pickup);

    res.status(201).json({ message: 'Pickup created', pickup });
  } catch (error) {
    console.error('Error creating pickup:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/restaurants/:id/pickups', async (req, res) => {
  try {
    const restaurantId = new mongoose.Types.ObjectId(req.params.id);
    const pickups = await Pickup.find({ restaurant_id: restaurantId }).sort({ created_at: -1 });
    
    const availableCount = pickups.filter(p => p.status === 'available').length;
    const acceptedCount = pickups.filter(p => p.status === 'accepted').length;
    
    // Calculate total meals (rough estimate based on quantity strings)
    const totalMeals = pickups.length * 20; // Simple mock multiplier for now

    res.json({
      total_listings: pickups.length,
      active_listings: availableCount + acceptedCount,
      total_meals: totalMeals,
      pickups
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- VOLUNTEER APIs ---

app.get('/api/pickups', async (req, res) => {
  try {
    const pickups = await Pickup.find({ status: 'available' });
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/pickups/:id', async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ error: 'Pickup not found' });
    res.json(pickup);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/pickups/:id/accept', async (req, res) => {
  const { volunteer_id, volunteer_lat, volunteer_lng } = req.body;
  const { id } = req.params;
  if (!volunteer_id) return res.status(400).json({ error: 'ID required' });

  try {
    const pickup = await Pickup.findById(id);
    if (!pickup || pickup.status !== 'available') {
      return res.status(400).json({ error: 'Invalid pickup' });
    }

    // Calculate real distance if coordinates are provided
    let realDistance = pickup.distance_km;
    if (volunteer_lat && volunteer_lng && pickup.lat && pickup.lng) {
      const R = 6371;
      const dLat = (pickup.lat - volunteer_lat) * Math.PI / 180;
      const dLon = (pickup.lng - volunteer_lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(volunteer_lat * Math.PI / 180) * Math.cos(pickup.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      realDistance = R * c;
      pickup.distance_km = realDistance;
    }

    const pointsEarned = calculatePoints(realDistance);
    pickup.status = 'accepted';
    pickup.assigned_to = new mongoose.Types.ObjectId(volunteer_id);
    pickup.otp = Math.floor(1000 + Math.random() * 9000).toString(); 
    await pickup.save();

    const user = await User.findById(volunteer_id);
    if (user) {
      user.points = (user.points || 0) + pointsEarned;
      await user.save();
      
      // Notify all clients that this pickup is no longer available
      io.emit('pickup_accepted', pickup);
      
      return res.json({ message: 'Accepted', pickup, points_earned: pointsEarned, total_points: user.points });
    }
    
    io.emit('pickup_accepted', pickup);
    res.json({ message: 'Accepted', pickup });
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/volunteer/:id', async (req, res) => {
  try {
    const volunteerId = new mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(volunteerId);
    const pickups = await Pickup.find({ assigned_to: volunteerId });
    res.json({ total_pickups: pickups.length, total_points: user?.points || 0, pickups });
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
});

// --- MANAGE PICKUPS (For Restaurants) ---

app.put('/api/pickups/:id/complete', async (req, res) => {
  const { delivery_photo } = req.body || {};
  console.log(`📦 Completion request for pickup: ${req.params.id} (Body size: ${JSON.stringify(req.body || {}).length} bytes)`);
  
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ error: "Pickup not found" });

    let finalPhotoPath = delivery_photo;

    // If it's a base64 image, save it to the folder
    if (delivery_photo && delivery_photo.startsWith('data:image')) {
      try {
        console.log("🖼️ Processing base64 image...");
        const base64Data = delivery_photo.replace(/^data:image\/\w+;base64,/, "");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `delivery_${req.params.id}_${timestamp}.png`;
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');
        finalPhotoPath = `http://localhost:5000/uploads/${fileName}`;
        console.log(`✅ Image saved locally: ${fileName}`);
      } catch (fileErr) {
        console.error("❌ Error saving file:", fileErr);
      }
    }

    pickup.status = "completed";
    pickup.delivery_photo = finalPhotoPath || null;
    await pickup.save();

    // Emit realtime update
    io.emit('pickup_completed', pickup);
    res.json(pickup);
  } catch (err) {
    console.error("❌ Completion error:", err);
    res.status(500).json({ error: 'Error' });
  }
});

app.delete('/api/pickups/:id', async (req, res) => {
  try {
    const pickup = await Pickup.findByIdAndDelete(req.params.id);
    if (!pickup) return res.status(404).json({ error: "Pickup not found" });

    // Emit realtime delete event
    io.emit('pickup_deleted', req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Redeem points for a reward
app.post('/api/redeem', async (req, res) => {
  const { user_id, cost, reward_name } = req.body;
  try {
    const user = await User.findById(user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.points < cost) return res.status(400).json({ message: 'Insufficient points' });

    user.points -= cost;
    await user.save();

    // Generate a unique 8-character reward code
    const uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    res.json({ 
      success: true, 
      newPoints: user.points, 
      code: uniqueCode,
      reward: reward_name
    });
  } catch (error) {
    res.status(500).json({ message: 'Redemption failed' });
  }
});

// Community Stats
app.get('/api/community-stats', async (req, res) => {
  try {
    const restaurantCount = await User.countDocuments({ user_type: 'restaurant' });
    const volunteerCount = await User.countDocuments({ user_type: 'volunteer' });
    const completedPickups = await Pickup.find({ status: 'completed' });
    
    // Sum up servings from all completed pickups
    const totalMeals = completedPickups.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);

    res.json({
      restaurants: restaurantCount,
      volunteers: volunteerCount,
      meals: totalMeals
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 FeedNet Backend running on port ${PORT}`);
});
