const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const readingTime = require("reading-time");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// --- AUTH MIDDLEWARE ---
const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) return res.status(401).json({ error: "No token provided" });

	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(403).json({ error: "Invalid or expired token" });
	}
};

// --- AUTH ROUTES ---
app.post("/api/login", async (req, res) => {
	const { username, password } = req.body;
	// Simple Admin check against .env
	if (
		username === process.env.ADMIN_USERNAME &&
		password === process.env.ADMIN_PASSWORD
	) {
		const token = jwt.sign({ user: username }, SECRET, { expiresIn: "24h" });
		return res.json({ token });
	}
	res.status(401).json({ error: "Invalid credentials" });
});

// --- POST ROUTES ---

// 1. Protected Create Post
app.post("/api/posts", authenticate, async (req, res) => {
	try {
		const { content } = req.body;
		const rawText = content.blocks
			.map((b) => b.data.text || b.data.code || "")
			.join(" ");
		const stats = readingTime(rawText);

		const newPost = await prisma.post.create({
			data: { ...req.body, readingTime: Math.ceil(stats.minutes) },
		});
		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Error creating post" });
	}
});

// 2. Protected Image Upload
const storage = multer.diskStorage({
	destination: "uploads/",
	filename: (req, file, cb) =>
		cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.post("/api/upload", authenticate, upload.single("image"), (req, res) => {
	res.json({
		success: 1,
		file: { url: `http://localhost:5000/uploads/${req.file.filename}` },
	});
});

// 3. Public Get Routes
app.get("/api/posts", async (req, res) => {
	const { query } = req.query;
	const posts = await prisma.post.findMany({
		where: {
			isPublished: true,
			...(query && {
				OR: [
					{ title: { contains: query, mode: "insensitive" } },
					{ tags: { has: query } },
				],
			}),
		},
		orderBy: { createdAt: "desc" },
	});
	res.json(posts);
});

app.get("/api/posts/:slug", async (req, res) => {
	const post = await prisma.post.update({
		where: { slug: req.params.slug },
		data: { views: { increment: 1 } },
	});
	res.json(post);
});

app.get("/api/posts/:slug/related", async (req, res) => {
	const current = await prisma.post.findUnique({
		where: { slug: req.params.slug },
	});
	const related = await prisma.post.findMany({
		where: {
			isPublished: true,
			id: { not: current.id },
			tags: { hasSome: current.tags },
		},
		take: 2,
	});
	res.json(related);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
