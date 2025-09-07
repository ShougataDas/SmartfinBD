# Backend Server Setup Guide

## Quick Setup for Development

### Option 1: Simple Node.js/Express Server

Create a new directory for your backend and run these commands:

```bash
mkdir smartfin-backend
cd smartfin-backend
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

Create `server.js`:

```javascript
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in production, use a real database)
const users = [];

// Routes
app.post("/api/v1/user", async (req, res) => {
  try {
    const { name, email, password, age, phone } = req.body;

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      age,
      phone,
      createdAt: new Date(),
    };

    users.push(user);

    res.status(201).json({
      message: "User created successfully",
      data: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "your-secret-key", // In production, use environment variable
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      data: {
        accessToken: token,
        user: { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Server accessible from network on http://YOUR_IP:${PORT}`);
});
```

Add to `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Run the server:

```bash
npm run dev
```

### Option 2: Using a Backend-as-a-Service

For quick testing, you can use services like:

- **Supabase** (free tier available)
- **Firebase** (free tier available)
- **Railway** (free tier available)

## Network Configuration

### Finding Your IP Address

**Windows:**

```bash
ipconfig
```

Look for "IPv4 Address" under your network adapter.

**Mac/Linux:**

```bash
ifconfig
# or
ip addr show
```

### Update Your App Configuration

1. Open `constants/config.ts`
2. Replace `192.168.1.100` with your actual IP address
3. For Android emulator, you can also use `10.0.2.2:4000`

### Testing the Connection

1. Start your backend server
2. Test the API endpoint in your browser: `http://YOUR_IP:4000/api/v1/user`
3. Make sure your phone/emulator is on the same network as your computer

## Common Issues and Solutions

### "Network request failed"

- ✅ Backend server is not running
- ✅ Wrong IP address in config
- ✅ Firewall blocking the connection
- ✅ Phone and computer on different networks

### "Connection refused"

- ✅ Backend server not listening on `0.0.0.0`
- ✅ Wrong port number
- ✅ Backend server crashed

### Android Emulator Issues

- Use `10.0.2.2:4000` instead of your IP address
- Make sure emulator has internet access

### iOS Simulator Issues

- Use `localhost:4000` or your computer's IP
- Make sure simulator has internet access

## Production Setup

For production, you'll need:

1. A real database (PostgreSQL, MongoDB, etc.)
2. Environment variables for secrets
3. HTTPS endpoints
4. Proper error handling and validation
5. Authentication middleware
6. Rate limiting and security measures
