import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import axios from "axios";
import { EDITOR_TOOLS } from "../editorTools";

export default function CreatePost() {
	const editorRef = useRef(null);
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [tags, setTags] = useState("");
	const [isPublishing, setIsPublishing] = useState(false);

	useEffect(() => {
		if (!editorRef.current) {
			editorRef.current = new EditorJS({
				holder: "editorjs-container",
				tools: EDITOR_TOOLS,
				placeholder:
					"Press Tab to open tools. Start writing your masterpiece...",
			});
		}
		return () => {
			if (editorRef.current && editorRef.current.destroy) {
				editorRef.current.destroy();
			}
		};
	}, []);

	const handlePublish = async () => {
		if (!title) return alert("Title is required!");
		setIsPublishing(true);
		const token = localStorage.getItem("blog_token");

		try {
			const contentData = await editorRef.current.save();
			const firstImage = contentData.blocks.find((b) => b.type === "image");

			const postPayload = {
				title,
				slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
				author: "John Doe",
				tags: tags
					.split(",")
					.map((t) => t.trim())
					.filter((t) => t),
				content: contentData,
				coverImage: firstImage ? firstImage.data.file.url : null,
				isPublished: true,
			};

			await axios.post("http://localhost:5000/api/posts", postPayload, {
				headers: { Authorization: `Bearer ${token}` },
			});
			navigate("/");
		} catch (error) {
			console.error(error);
			alert(
				error.response?.status === 403
					? "Session expired. Please log in again."
					: "Failed to publish",
			);
		} finally {
			setIsPublishing(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto">
			<div className="mb-8 space-y-4">
				<input
					type="text"
					placeholder="Post Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="w-full text-5xl font-extrabold outline-none placeholder-gray-300 text-gray-900 bg-transparent"
				/>
				<input
					type="text"
					placeholder="Add tags (e.g. React, Node, Web)"
					value={tags}
					onChange={(e) => setTags(e.target.value)}
					className="w-full text-lg outline-none placeholder-gray-400 text-gray-600 bg-transparent border-b border-gray-200 pb-2"
				/>
			</div>

			<div
				id="editorjs-container"
				className="prose prose-lg max-w-none min-h-[50vh]"
			></div>

			<div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
				<button
					onClick={handlePublish}
					disabled={isPublishing}
					className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all disabled:opacity-50"
				>
					{isPublishing ? "Publishing..." : "Publish Post"}
				</button>
			</div>
		</div>
	);
}
