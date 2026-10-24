
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true
    },
    clicks: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Url = mongoose.model("Url", urlSchema);

// Check whether the backend is running.
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Create a short link.
app.post("/api/urls", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (typeof originalUrl !== "string") {
      return res.status(400).json({
        message: "Please enter a valid URL."
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(originalUrl.trim());
    } catch {
      return res.status(400).json({
        message: "Please enter a valid URL."
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: "Only HTTP and HTTPS URLs are allowed."
      });
    }

    const normalizedUrl = parsedUrl.href;
    let shortCode;
    let exists = true;

    while (exists) {
      shortCode = crypto.randomBytes(4).toString("hex");
      exists = await Url.exists({ shortCode });
    }

    const savedUrl = await Url.create({
      originalUrl: normalizedUrl,
      shortCode
    });

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

res.status(201).json({
  ...savedUrl.toObject(),
  shortUrl: `${baseUrl}/${savedUrl.shortCode}`,
});
  } catch (error) {
    console.error("Create URL error:", error.message);
    res.status(500).json({
      message: "Could not create your short link."
    });
  }
});

app.get("/api/urls", async (req, res) => {
  try {
    const urls = await Url.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(urls);
  } catch (error) {
    console.error("Fetch URLs error:", error.message);
    res.status(500).json({ message: "Could not load saved links." });
  }
});

app.delete("/api/urls", async (req, res) => {
  try {
    await Url.deleteMany({});
    res.json({ message: "Link history cleared successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not clear link history." });
  }
});

// Retrieve saved links for the dashboard.
app.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOneAndUpdate(
      { shortCode: req.params.code },
      { $inc: { clicks: 1 } },
      { new: true }

    );

    if (!url) {
      return res.status(404).send("Short link not found");
    }
    console.log("CLICK COUNT:", url.shortCode, url.clicks);
    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).send("Redirect failed");
  }
});

// Redirect a short code to its original URL.
app.get("/:code", async (req, res, next) => {
  try {
    if (!/^[a-f0-9]{8}$/.test(req.params.code)) {
      return next();
    }

    const url = await Url.findOneAndUpdate(
      { shortCode: req.params.code },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) {
      return res.status(404).send("Short link not found.");
    }

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error.message);
    return res.status(500).send("Could not redirect.");
  }
});

// Serve the built React app in production.
const clientDist = path.join(__dirname, "../client/dist");

app.use(express.static(clientDist));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found." });
  }

  res.sendFile(path.join(clientDist, "index.html"), (error) => {
    if (error) next(error);
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the environment.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
