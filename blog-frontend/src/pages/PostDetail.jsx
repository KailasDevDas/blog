import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clock, Eye, Calendar, Share2, ChevronLeft } from "lucide-react";

const BlockRenderer = ({ block }) => {
	switch (block.type) {
		case "header":
			const HeaderTag = `h${block.data.level}`;

			// Define a mapping for heading levels to Tailwind sizes
			const sizes = {
				1: "text-5xl font-black mb-6 mt-10",
				2: "text-4xl font-extrabold mb-4 mt-8",
				3: "text-2xl font-bold mb-3 mt-6",
				4: "text-xl font-bold mb-2 mt-4",
			};

			return (
				<HeaderTag
					className={`${sizes[block.data.level] || "text-2xl"} text-gray-900 tracking-tight`}
				>
					{block.data.text}
				</HeaderTag>
			);

		case "paragraph":
			return (
				<p
					className="leading-relaxed mb-4 text-gray-800"
					dangerouslySetInnerHTML={{ __html: block.data.text }}
				/>
			);

		case "list":
			const isOrdered = block.data.style === "ordered";
			const isChecklist = block.data.style === "checklist";
			const ListTag = isOrdered ? "ol" : "ul";

			return (
				<ListTag
					className={`${isChecklist ? "list-none" : isOrdered ? "list-decimal" : "list-disc"} ml-6 space-y-2 mb-6`}
				>
					{block.data.items.map((item, index) => {
						const content = typeof item === "object" ? item.content : item;
						return (
							<li key={index} className="flex items-start gap-2">
								{isChecklist && (
									<input
										type="checkbox"
										checked={item.meta?.checked}
										readOnly
										className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600"
									/>
								)}
								<span dangerouslySetInnerHTML={{ __html: content }} />
							</li>
						);
					})}
				</ListTag>
			);

		case "code":
			return (
				<div className="my-6 rounded-lg overflow-hidden text-sm border border-gray-800 shadow-lg">
					<div className="bg-[#1e1e1e] text-gray-400 px-4 py-2 border-b border-gray-700 flex justify-between">
						<span className="text-xs uppercase tracking-widest font-bold">
							Code Block
						</span>
						<button
							onClick={() => navigator.clipboard.writeText(block.data.code)}
							className="hover:text-white transition-colors text-[10px]"
						>
							COPY
						</button>
					</div>
					<SyntaxHighlighter
						language="javascript"
						style={vscDarkPlus}
						customStyle={{ margin: 0, padding: "1.25rem" }}
					>
						{block.data.code}
					</SyntaxHighlighter>
				</div>
			);

		case "quote":
			return (
				<blockquote className="border-l-4 border-indigo-500 pl-6 py-4 my-8 bg-indigo-50/30 rounded-r-xl italic text-xl text-gray-700">
					<p dangerouslySetInnerHTML={{ __html: block.data.text }} />
					{block.data.caption && (
						<cite className="block mt-2 text-sm font-bold text-indigo-600 not-italic">
							— {block.data.caption}
						</cite>
					)}
				</blockquote>
			);

		case "table":
			return (
				<div className="overflow-x-auto my-8 border border-gray-200 rounded-xl">
					<table className="w-full text-left border-collapse">
						<tbody className="divide-y divide-gray-200">
							{block.data.content.map((row, i) => (
								<tr
									key={i}
									className={
										i === 0 && block.data.withHeadings
											? "bg-gray-50 font-bold"
											: ""
									}
								>
									{row.map((cell, j) => (
										<td
											key={j}
											className="p-4 text-sm text-gray-700 border-r border-gray-100 last:border-0"
											dangerouslySetInnerHTML={{ __html: cell }}
										/>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);

		case "image":
			return (
				<figure className="my-10">
					<img
						src={block.data.file.url}
						alt={block.data.caption}
						className={`rounded-2xl w-full h-auto shadow-md ${block.data.withBorder ? "border-4 border-gray-100" : ""}`}
					/>
					{block.data.caption && (
						<figcaption className="text-center text-sm text-gray-500 mt-4 italic">
							{block.data.caption}
						</figcaption>
					)}
				</figure>
			);

		case "delimiter":
			return (
				<div className="py-10 flex justify-center">
					<div className="w-24 border-t-4 border-gray-100 rounded-full"></div>
				</div>
			);

		case "warning":
			return (
				<div className="bg-orange-50 border-l-4 border-orange-500 p-6 my-8 rounded-r-xl shadow-sm">
					<h4 className="font-black text-orange-900 mb-1">
						{block.data.title}
					</h4>
					<p className="text-orange-800 text-sm leading-relaxed">
						{block.data.message}
					</p>
				</div>
			);

		default:
			return null;
	}
};

export default function PostDetail() {
	const { slug } = useParams();
	const [post, setPost] = useState(null);

	useEffect(() => {
		axios
			.get(`http://localhost:5000/api/posts/${slug}`)
			.then((res) => setPost(res.data))
			.catch((err) => console.error(err));
	}, [slug]);

	if (!post)
		return (
			<div className="max-w-3xl mx-auto mt-20 animate-pulse bg-gray-100 h-96 rounded-3xl" />
		);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<Link
				to="/"
				className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
			>
				<ChevronLeft className="w-4 h-4 mr-1" /> Back to Feed
			</Link>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
				<aside className="lg:col-span-1 hidden lg:block">
					<div className="sticky top-24 flex flex-col items-center space-y-6">
						<button className="p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:text-indigo-600 cursor-pointer transition-all">
							<Share2 className="w-5 h-5" />
						</button>
					</div>
				</aside>

				<article className="lg:col-span-8">
					<header className="mb-12">
						<div className="flex flex-wrap gap-2 mb-6">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider"
								>
									{tag}
								</span>
							))}
						</div>
						<h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-8">
							{post.title}
						</h1>
						<div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-y border-gray-100 py-6">
							<div className="flex items-center gap-2">
								<div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
									{post.author.charAt(0)}
								</div>
								<span className="font-bold text-gray-900">{post.author}</span>
							</div>
							<div className="flex items-center gap-1">
								<Calendar className="w-4 h-4" />{" "}
								{format(new Date(post.createdAt), "MMM d, yyyy")}
							</div>
							<div className="flex items-center gap-1">
								<Clock className="w-4 h-4" /> {post.readingTime || 1} min read
							</div>
							<div className="flex items-center gap-1">
								<Eye className="w-4 h-4" /> {post.views || 0} views
							</div>
						</div>
					</header>

					<section className="prose prose-lg prose-indigo max-w-none">
						{post.content?.blocks?.map((block) => (
							<BlockRenderer key={block.id} block={block} />
						))}
					</section>
				</article>

				<aside className="lg:col-span-3">
					<div className="sticky top-24 space-y-8">
						<div className="bg-gray-900 rounded-2xl p-6 text-white relative shadow-xl">
							<h3 className="text-xl font-bold mb-2">Weekly Newsletter</h3>
							<p className="text-gray-400 text-sm mb-4">
								Join 5,000+ developers getting my latest tutorials.
							</p>
							<input
								className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-sm mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="your@email.com"
							/>
							<button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-lg transition-colors">
								Subscribe
							</button>
						</div>

						<div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
							<h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-widest">
								More Tags
							</h4>
							<div className="flex flex-wrap gap-2">
								{post.tags.length > 0 ? (
									post.tags.map((t) => (
										<span
											key={t}
											className="text-xs text-gray-500 hover:text-indigo-600 cursor-pointer"
										>
											#{t}
										</span>
									))
								) : (
									<span className="text-xs text-gray-400 italic">No tags</span>
								)}
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
