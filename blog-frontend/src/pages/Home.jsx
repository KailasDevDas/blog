import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { ArrowRight, TrendingUp, Search, X } from "lucide-react";

// Updated SearchBar with local state to prevent laggy typing
const SearchBar = ({ externalQuery, setExternalQuery }) => {
	const [localValue, setLocalValue] = useState(externalQuery);

	// Sync local value if external query changes (e.g., clearing search)
	useEffect(() => {
		setLocalValue(externalQuery);
	}, [externalQuery]);

	// Debounce Logic: Wait 500ms after last keystroke before updating URL
	useEffect(() => {
		const handler = setTimeout(() => {
			setExternalQuery(localValue);
		}, 500);

		return () => clearTimeout(handler);
	}, [localValue, setExternalQuery]);

	return (
		<div className="relative max-w-md w-full">
			<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
				<Search className="h-5 w-5 text-gray-400" />
			</div>
			<input
				type="text"
				value={localValue || ""}
				onChange={(e) => setLocalValue(e.target.value)}
				className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
				placeholder="Search articles or tags..."
			/>
			{localValue && (
				<button
					onClick={() => setLocalValue("")}
					className="absolute inset-y-0 right-0 pr-4 flex items-center"
				>
					<X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
				</button>
			)}
		</div>
	);
};

export default function Home() {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchParams, setSearchParams] = useSearchParams();
	const query = searchParams.get("query") || "";

	useEffect(() => {
		setLoading(true);
		const fetchUrl = `http://localhost:5000/api/posts${query ? `?query=${query}` : ""}`;

		axios
			.get(fetchUrl)
			.then((res) => {
				setPosts(res.data);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setLoading(false);
			});
	}, [query]);

	const handleSearchUpdate = (val) => {
		if (val) {
			setSearchParams({ query: val }, { replace: true });
		} else {
			setSearchParams({}, { replace: true });
		}
	};

	const featuredPost = !query ? posts[0] : null;
	const gridPosts = !query ? posts.slice(1) : posts;

	return (
		<div className="space-y-12 pb-20">
			<header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-10">
				<div>
					<h1 className="text-5xl font-black text-gray-900 tracking-tight">
						{query ? "Search Results" : "Latest Writings"}
					</h1>
					<p className="text-gray-500 mt-3 text-lg font-medium">
						{query
							? `Showing results for "${query}"`
							: "Tutorials, thoughts, and technical deep-dives."}
					</p>
				</div>
				<SearchBar
					externalQuery={query}
					setExternalQuery={handleSearchUpdate}
				/>
			</header>

			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-64 bg-gray-100 animate-pulse rounded-[2rem]"
						/>
					))}
				</div>
			) : (
				<>
					{featuredPost && (
						<section className="relative group">
							<Link
								to={`/post/${featuredPost.slug}`}
								className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
							>
								<div className="lg:col-span-7 aspect-[16/9] bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-2xl">
									<img
										src={
											featuredPost.coverImage ||
											"https://images.unsplash.com/photo-1498050108023-c5249f4df085"
										}
										alt={featuredPost.title}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
									/>
								</div>
								<div className="lg:col-span-5 space-y-6">
									<div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-xs">
										<TrendingUp className="w-4 h-4" /> Featured Post
									</div>
									<h2 className="text-4xl md:text-5xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
										{featuredPost.title}
									</h2>
									<p className="text-gray-500 text-lg line-clamp-3 leading-relaxed">
										Explore this deep dive into{" "}
										{featuredPost.tags[0] || "modern development"} and discover
										new perspectives on building for the web.
									</p>
									<div className="flex items-center gap-4 pt-4 border-t border-gray-100">
										<div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold uppercase">
											{featuredPost.author.charAt(0)}
										</div>
										<div>
											<p className="text-sm font-black text-gray-900">
												{featuredPost.author}
											</p>
											<p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
												{format(
													new Date(featuredPost.createdAt),
													"MMMM d, yyyy",
												)}
											</p>
										</div>
									</div>
								</div>
							</Link>
						</section>
					)}

					{posts.length > 0 ? (
						<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
							{gridPosts.map((post) => (
								<Link
									key={post.id}
									to={`/post/${post.slug}`}
									className="group flex flex-col h-full"
								>
									<div className="aspect-[4/3] bg-gray-100 rounded-[2rem] overflow-hidden mb-6 relative shadow-sm border border-gray-50">
										<img
											src={
												post.coverImage ||
												"https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
											}
											className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
											alt={post.title}
										/>
										<div className="absolute top-5 left-5">
											<span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm">
												{post.tags[0] || "General"}
											</span>
										</div>
									</div>
									<h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-2 leading-snug">
										{post.title}
									</h3>
									<div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
										<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
											{format(new Date(post.createdAt), "MMM d")} •{" "}
											{post.author}
										</span>
										<div className="p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
											<ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
										</div>
									</div>
								</Link>
							))}
						</section>
					) : (
						<div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
							<p className="text-gray-400 font-bold text-xl uppercase tracking-widest">
								No articles found
							</p>
							<button
								onClick={() => handleSearchUpdate("")}
								className="mt-4 text-indigo-600 font-bold hover:underline"
							>
								Clear search and see all posts
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
