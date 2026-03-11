const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const readingTime = require("reading-time");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// --- IMAGE UPLOAD CONFIG ---
const storage = multer.diskStorage({
	destination: "uploads/",
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
const upload = multer({ storage });
app.use("/uploads", express.static("uploads")); // Make uploads folder public

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// 1. CREATE a new post with auto-calculated reading time
app.post("/api/posts", async (req, res) => {
	try {
		const { title, content, tags } = req.body;

		// Extract all text from Editor.js blocks to calculate reading time
		const rawText = content.blocks
			.map((block) => {
				if (block.type === "paragraph" || block.type === "header")
					return block.data.text;
				if (block.type === "code") return block.data.code;
				if (block.type === "list") return block.data.items.join(" ");
				return "";
			})
			.join(" ");

		const stats = readingTime(rawText);

		const newPost = await prisma.post.create({
			data: {
				...req.body,
				readingTime: Math.ceil(stats.minutes),
			},
		});

		res.status(201).json(newPost);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Failed to create post" });
	}
});

// 2. GET all posts (with basic sorting)
app.get("/api/posts", async (req, res) => {
	try {
		const posts = await prisma.post.findMany({
			where: { isPublished: true },
			orderBy: { createdAt: "desc" },
		});
		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch posts" });
	}
});

// 3. GET single post and update VIEW COUNT
app.get("/api/posts/:slug", async (req, res) => {
	try {
		const post = await prisma.post.update({
			where: { slug: req.params.slug },
			data: { views: { increment: 1 } }, // Atomic increment
		});
		res.status(200).json(post);
	} catch (error) {
		res.status(404).json({ error: "Post not found" });
	}
});

// 4. IMAGE UPLOAD ENDPOINT (For Editor.js)
app.post("/api/upload", upload.single("image"), (req, res) => {
	res.json({
		success: 1,
		file: {
			url: `http://localhost:5000/uploads/${req.file.filename}`,
		},
	});
});

app.get("/api/posts", async (req, res) => {
	try {
		const { query } = req.query; // Get search term from URL

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
		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch posts" });
	}
});

app.get("/api/posts/:slug/related", async (req, res) => {
	try {
		const { slug } = req.params;

		// 1. Get the current post to find its tags
		const currentPost = await prisma.post.findUnique({
			where: { slug },
			select: { tags: true, id: true },
		});

		if (!currentPost) return res.status(404).json({ error: "Post not found" });

		// 2. Find other posts that share at least one tag
		const relatedPosts = await prisma.post.findMany({
			where: {
				isPublished: true,
				id: { not: currentPost.id }, // Don't recommend the same post
				tags: { hasSome: currentPost.tags }, // Match any tag
			},
			take: 3,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				title: true,
				slug: true,
				coverImage: true,
				author: true,
				createdAt: true,
			},
		});

		res.status(200).json(relatedPosts);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch related posts" });
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
	console.log(`🚀 Server ready at http://localhost:${PORT}`),
);
