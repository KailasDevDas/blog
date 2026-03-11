import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async"; // Add this
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
	Clock,
	Eye,
	Calendar,
	Share2,
	ChevronLeft,
	List as ListIcon,
} from "lucide-react";

const BlockRenderer = ({ block }) => {
	switch (block.type) {
		case "header":
			const HeaderTag = `h${block.data.level}`;
			const anchorId = block.data.text
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-");
			const sizes = {
				1: "text-5xl font-black mb-6 mt-10",
				2: "text-4xl font-extrabold mb-4 mt-12",
				3: "text-2xl font-bold mb-3 mt-8",
				4: "text-xl font-bold mb-2 mt-6",
			};
			return (
				<HeaderTag
					id={anchorId}
					className={`${sizes[block.data.level] || "text-2xl"} text-gray-900 scroll-mt-24`}
				>
					{block.data.text}
				</HeaderTag>
			);

		case "paragraph":
			return (
				<p
					className="leading-relaxed mb-6 text-gray-800 text-lg"
					dangerouslySetInnerHTML={{ __html: block.data.text }}
				/>
			);

		case "list":
			const isOrdered = block.data.style === "ordered";
			const isChecklist = block.data.style === "checklist";
			const ListTag = isOrdered ? "ol" : "ul";
			return (
				<ListTag
					className={`${isChecklist ? "list-none" : isOrdered ? "list-decimal" : "list-disc"} ml-6 space-y-3 mb-8 text-gray-800`}
				>
					{block.data.items.map((item, index) => {
						const content = typeof item === "object" ? item.content : item;
						return (
							<li key={index} className="flex items-start gap-3">
								{isChecklist && (
									<input
										type="checkbox"
										checked={item.meta?.checked}
										readOnly
										className="mt-1.5 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
									/>
								)}
								<span
									className="text-lg"
									dangerouslySetInnerHTML={{ __html: content }}
								/>
							</li>
						);
					})}
				</ListTag>
			);

		case "code":
			return (
				<div className="my-8 rounded-xl overflow-hidden text-sm border border-gray-800 shadow-2xl">
					<div className="bg-[#1e1e1e] text-gray-400 px-5 py-3 border-b border-gray-800 flex justify-between items-center">
						<span className="text-[10px] uppercase tracking-[0.2em] font-black">
							Source Code
						</span>
						<button
							onClick={() => navigator.clipboard.writeText(block.data.code)}
							className="hover:text-white transition-colors text-[10px] font-bold"
						>
							COPY
						</button>
					</div>
					<SyntaxHighlighter
						language="javascript"
						style={vscDarkPlus}
						customStyle={{
							margin: 0,
							padding: "1.5rem",
							background: "#1e1e1e",
						}}
					>
						{block.data.code}
					</SyntaxHighlighter>
				</div>
			);

		case "quote":
			return (
				<blockquote className="relative border-l-8 border-indigo-600 pl-8 py-6 my-12 bg-indigo-50/40 rounded-r-2xl italic text-2xl text-gray-800">
					<p dangerouslySetInnerHTML={{ __html: block.data.text }} />
					{block.data.caption && (
						<cite className="block mt-4 text-sm font-black text-indigo-600 not-italic tracking-wider">
							— {block.data.caption.toUpperCase()}
						</cite>
					)}
				</blockquote>
			);

		case "table":
			return (
				<div className="overflow-x-auto my-10 border border-gray-100 rounded-2xl shadow-sm">
					<table className="w-full text-left border-collapse">
						<tbody className="divide-y divide-gray-100">
							{block.data.content.map((row, i) => (
								<tr
									key={i}
									className={
										i === 0 && block.data.withHeadings
											? "bg-gray-50/50 font-bold"
											: "hover:bg-gray-50/30 transition-colors"
									}
								>
									{row.map((cell, j) => (
										<td
											key={j}
											className="p-5 text-gray-700 border-r border-gray-50 last:border-0"
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
				<figure className="my-14 group">
					<div className="overflow-hidden rounded-3xl shadow-lg transition-all duration-500">
						<img
							src={block.data.file.url}
							alt={block.data.caption}
							className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
						/>
					</div>
					{block.data.caption && (
						<figcaption className="text-center text-sm text-gray-400 mt-6 italic font-medium">
							{block.data.caption}
						</figcaption>
					)}
				</figure>
			);

		case "delimiter":
			return (
				<div className="py-16 flex justify-center items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-gray-200"></span>
					<span className="w-2 h-2 rounded-full bg-indigo-400"></span>
					<span className="w-2 h-2 rounded-full bg-gray-200"></span>
				</div>
			);

		case "warning":
			return (
				<div className="bg-rose-50 border-l-4 border-rose-500 p-8 my-10 rounded-r-2xl shadow-inner">
					<div className="flex items-center gap-3 mb-2">
						<div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
							!
						</div>
						<h4 className="font-black text-rose-900 uppercase tracking-tight">
							{block.data.title}
						</h4>
					</div>
					<p className="text-rose-800/80 leading-relaxed font-medium">
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
	const [scrollProgress, setScrollProgress] = useState(0);

	useEffect(() => {
		const updateScroll = () => {
			const currentScroll = window.scrollY;
			const scrollHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			setScrollProgress((currentScroll / scrollHeight) * 100);
		};
		window.addEventListener("scroll", updateScroll);
		return () => window.removeEventListener("scroll", updateScroll);
	}, []);

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

	const tableOfContents =
		post.content?.blocks?.filter((b) => b.type === "header") || [];
	const firstParagraph =
		post.content?.blocks
			?.find((b) => b.type === "paragraph")
			?.data?.text?.replace(/<[^>]*>/g, "")
			.substring(0, 160) || "Read this article on DevBlog";

	return (
		<div className="relative">
			{/* SEO SETTINGS */}
			<Helmet>
				<title>{post.title} | DevBlog</title>
				<meta name="description" content={firstParagraph} />
				<meta property="og:title" content={post.title} />
				<meta property="og:description" content={firstParagraph} />
				<meta
					property="og:image"
					content={
						post.coverImage || "https://yourdomain.com/default-share.png"
					}
				/>
				<meta property="og:type" content="article" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={post.title} />
				<meta name="twitter:image" content={post.coverImage} />
			</Helmet>

			<div className="fixed top-0 left-0 w-full h-1.5 z-[60] bg-gray-100">
				<div
					className="h-full bg-indigo-600 transition-all duration-150"
					style={{ width: `${scrollProgress}%` }}
				/>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
				<Link
					to="/"
					className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-indigo-600 mb-12 transition-colors uppercase tracking-widest"
				>
					<ChevronLeft className="w-4 h-4 mr-1" /> Back to Feed
				</Link>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
					<aside className="lg:col-span-1 hidden lg:block">
						<div className="sticky top-24 flex flex-col items-center space-y-6">
							<button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:text-indigo-600 hover:border-indigo-100 transition-all">
								<Share2 className="w-6 h-6" />
							</button>
						</div>
					</aside>

					<article className="lg:col-span-8">
						<header className="mb-16">
							<div className="flex flex-wrap gap-3 mb-8">
								{post.tags.map((tag) => (
									<span
										key={tag}
										className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-[0.1em] border border-indigo-100/50"
									>
										{tag}
									</span>
								))}
							</div>
							<h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-10 tracking-tight">
								{post.title}
							</h1>
							<div className="flex flex-wrap items-center gap-8 text-sm text-gray-400 font-bold border-y border-gray-100 py-8 uppercase tracking-widest">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl">
										{post.author.charAt(0)}
									</div>
									<span className="text-gray-900">{post.author}</span>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />{" "}
									{format(new Date(post.createdAt), "MMM d")}
								</div>
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4" /> {post.readingTime || 1} MIN READ
								</div>
								<div className="flex items-center gap-2">
									<Eye className="w-4 h-4" /> {post.views || 0} VIEWS
								</div>
							</div>
						</header>

						<section className="prose prose-indigo max-w-none">
							{post.content?.blocks?.map((block) => (
								<BlockRenderer key={block.id} block={block} />
							))}
						</section>
					</article>

					<aside className="lg:col-span-3 space-y-12">
						<div className="sticky top-24 space-y-10">
							{tableOfContents.length > 0 && (
								<div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100">
									<h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
										<ListIcon className="w-4 h-4" /> Table of Contents
									</h4>
									<nav className="space-y-4">
										{tableOfContents.map((header, i) => (
											<a
												key={i}
												href={`#${header.data.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
												className="block text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors line-clamp-2"
											>
												{header.data.text}
											</a>
										))}
									</nav>
								</div>
							)}
							<div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200">
								<h3 className="text-2xl font-black mb-3 text-white">
									Dev Insider
								</h3>
								<p className="text-indigo-100 text-sm mb-6 leading-relaxed">
									The best technical tutorials delivered directly to your inbox
									every Sunday.
								</p>
								<input
									className="w-full bg-indigo-500 border border-indigo-400 p-4 rounded-xl text-sm mb-4 outline-none placeholder:text-indigo-200 focus:ring-2 focus:ring-white text-white"
									placeholder="Email address..."
								/>
								<button className="w-full bg-white text-indigo-600 font-black py-4 rounded-xl hover:bg-indigo-50 transition-colors uppercase tracking-widest text-xs">
									Join the List
								</button>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
