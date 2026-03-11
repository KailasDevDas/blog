import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function Home() {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		axios
			.get("http://localhost:5000/api/posts")
			.then((res) => setPosts(res.data))
			.catch((err) => console.error(err));
	}, []);

	const featuredPost = posts[0];
	const regularPosts = posts.slice(1);

	return (
		<div className="space-y-16">
			{/* Hero Section */}
			<div className="relative py-12 border-b border-gray-100">
				<div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
					<TrendingUp className="w-5 h-5" />
					<span className="uppercase tracking-widest text-xs">
						Featured Today
					</span>
				</div>
				{featuredPost ? (
					<Link
						to={`/post/${featuredPost.slug}`}
						className="group grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
					>
						<div className="bg-gray-200 aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
							<img
								src={
									featuredPost.coverImage ||
									"https://images.unsplash.com/photo-1498050108023-c5249f4df085"
								}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							/>
						</div>
						<div>
							<h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 group-hover:text-indigo-600 transition-colors">
								{featuredPost.title}
							</h1>
							<p className="text-gray-500 text-lg mb-8 line-clamp-3">
								Discover the latest insights into modern web development and
								digital architecture...
							</p>
							<div className="flex items-center gap-4">
								<span className="font-bold">{featuredPost.author}</span>
								<span className="text-gray-300">•</span>
								<span className="text-gray-500">
									{format(new Date(featuredPost.createdAt), "MMM d, yyyy")}
								</span>
							</div>
						</div>
					</Link>
				) : (
					<div className="h-64 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400">
						Loading featured...
					</div>
				)}
			</div>

			{/* Grid for other posts */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{regularPosts.map((post) => (
					<Link
						key={post.id}
						to={`/post/${post.slug}`}
						className="group flex flex-col"
					>
						<div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
							<img
								src={
									post.coverImage ||
									"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
								}
								className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
							/>
							<div className="absolute top-4 left-4 flex gap-1">
								{post.tags.slice(0, 1).map((tag) => (
									<span
										key={tag}
										className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-black uppercase text-gray-900"
									>
										{tag}
									</span>
								))}
							</div>
						</div>
						<h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
							{post.title}
						</h2>
						<div className="flex items-center justify-between mt-auto text-xs text-gray-400 font-medium">
							<span>
								{post.author} • {format(new Date(post.createdAt), "MMM d")}
							</span>
							<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
