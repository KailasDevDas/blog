import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
	Clock,
	Eye,
	Calendar,
	Share2,
	ChevronLeft,
	List as ListIcon,
	ArrowRight,
	Mail,
	BellRing,
} from "lucide-react";

const BlockRenderer = ({ block }) => {
	switch (block.type) {
		case "header":
			const HeaderTag = `h${block.data.level}`;
			const anchorId = block.data.text
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-");
			const sizes = {
				1: "text-5xl lg:text-6xl font-black mb-8 mt-12",
				2: "text-4xl font-extrabold mb-6 mt-10",
				3: "text-2xl font-bold mb-4 mt-8",
				4: "text-xl font-bold mb-3 mt-6",
			};
			return (
				<HeaderTag
					id={anchorId}
					className={`${sizes[block.data.level] || "text-2xl"} text-gray-900 scroll-mt-24 tracking-tight`}
				>
					{block.data.text}
				</HeaderTag>
			);

		case "paragraph":
			return (
				<p
					className="leading-relaxed mb-8 text-gray-700 text-lg lg:text-xl font-normal"
					dangerouslySetInnerHTML={{ __html: block.data.text }}
				/>
			);

		case "list":
			const isOrdered = block.data.style === "ordered";
			const isChecklist = block.data.style === "checklist";
			const ListTag = isOrdered ? "ol" : "ul";
			return (
				<ListTag
					className={`${isChecklist ? "list-none" : isOrdered ? "list-decimal" : "list-disc"} ml-6 space-y-4 mb-10 text-gray-700`}
				>
					{block.data.items.map((item, index) => {
						const content = typeof item === "object" ? item.content : item;
						return (
							<li key={index} className="flex items-start gap-4">
								{isChecklist && (
									<input
										type="checkbox"
										checked={item.meta?.checked}
										readOnly
										className="mt-1.5 h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all"
									/>
								)}
								<span
									className="text-lg lg:text-xl leading-snug"
									dangerouslySetInnerHTML={{ __html: content }}
								/>
							</li>
						);
					})}
				</ListTag>
			);

		case "code":
			return (
				<div className="my-10 rounded-2xl overflow-hidden text-sm border border-gray-800 shadow-2xl group">
					<div className="bg-[#1a1a1a] text-gray-400 px-6 py-3 border-b border-gray-800 flex justify-between items-center">
						<span className="text-[10px] uppercase tracking-[0.25em] font-black text-indigo-400">
							Code Snippet
						</span>
						<button
							onClick={() => navigator.clipboard.writeText(block.data.code)}
							className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-md text-[10px] font-bold"
						>
							COPY
						</button>
					</div>
					<SyntaxHighlighter
						language="javascript"
						style={vscDarkPlus}
						customStyle={{
							margin: 0,
							padding: "2rem",
							background: "#1a1a1a",
							fontSize: "15px",
							lineHeight: "1.6",
						}}
					>
						{block.data.code}
					</SyntaxHighlighter>
				</div>
			);

		case "quote":
			return (
				<blockquote className="relative border-l-[10px] border-indigo-600 pl-10 py-8 my-14 bg-indigo-50/20 rounded-r-3xl italic">
					<p
						className="text-2xl lg:text-3xl text-gray-800 leading-relaxed font-medium"
						dangerouslySetInnerHTML={{ __html: block.data.text }}
					/>
					{block.data.caption && (
						<cite className="block mt-6 text-xs font-black text-indigo-500 not-italic tracking-[0.2em] uppercase">
							— {block.data.caption}
						</cite>
					)}
				</blockquote>
			);

		case "table":
			return (
				<div className="overflow-x-auto my-12 border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/50">
					<table className="w-full text-left border-collapse">
						<tbody className="divide-y divide-gray-100">
							{block.data.content.map((row, i) => (
								<tr
									key={i}
									className={
										i === 0 && block.data.withHeadings
											? "bg-gray-50/80 font-bold text-gray-900"
											: "hover:bg-gray-50/40 transition-colors"
									}
								>
									{row.map((cell, j) => (
										<td
											key={j}
											className="p-6 text-base text-gray-600 border-r border-gray-50 last:border-0"
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
				<figure className="my-16 group">
					<div className="overflow-hidden rounded-[2.5rem] shadow-2xl border border-gray-100">
						<img
							src={block.data.file.url}
							alt={block.data.caption}
							className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
						/>
					</div>
					{block.data.caption && (
						<figcaption className="text-center text-xs font-bold text-gray-400 mt-6 uppercase tracking-widest">
							{block.data.caption}
						</figcaption>
					)}
				</figure>
			);

		case "delimiter":
			return (
				<div className="py-20 flex justify-center items-center gap-3">
					<span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse"></span>
					<span className="w-2 h-2 rounded-full bg-gray-200"></span>
					<span className="w-2 h-2 rounded-full bg-gray-200"></span>
				</div>
			);

		case "warning":
			return (
				<div className="bg-gradient-to-br from-rose-50 to-white border-l-8 border-rose-500 p-10 my-12 rounded-r-[2rem] shadow-xl shadow-rose-100/50">
					<div className="flex items-center gap-4 mb-3">
						<BellRing className="w-6 h-6 text-rose-600" />
						<h4 className="font-black text-rose-900 uppercase tracking-tighter text-xl">
							{block.data.title}
						</h4>
					</div>
					<p className="text-rose-800/80 leading-relaxed font-medium text-lg lg:text-xl">
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
	const [related, setRelated] = useState([]);
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
			.then((res) => {
				setPost(res.data);
				return axios.get(`http://localhost:5000/api/posts/${slug}/related`);
			})
			.then((res) => setRelated(res.data))
			.catch((err) => console.error(err));
		window.scrollTo(0, 0);
	}, [slug]);

	if (!post)
		return (
			<div className="max-w-7xl mx-auto px-6 py-20 animate-pulse h-screen bg-gray-50 rounded-[3rem]" />
		);

	const tableOfContents =
		post.content?.blocks?.filter((b) => b.type === "header") || [];
	const firstParagraph =
		post.content?.blocks
			?.find((b) => b.type === "paragraph")
			?.data?.text?.replace(/<[^>]*>/g, "")
			.substring(0, 160) || "Read this article on DevBlog";

	return (
		<div className="relative bg-white selection:bg-indigo-100 selection:text-indigo-900">
			<Helmet>
				<title>{post.title} | DevBlog</title>
				<meta property="og:image" content={post.coverImage} />
			</Helmet>

			{/* Reading Progress Bar */}
			<div className="fixed top-0 left-0 w-full h-1.5 z-[60] bg-gray-50">
				<div
					className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.8)] transition-all duration-150"
					style={{ width: `${scrollProgress}%` }}
				/>
			</div>

			<div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
				<Link
					to="/"
					className="inline-flex items-center text-xs font-black text-gray-400 hover:text-indigo-600 mb-12 transition-all uppercase tracking-[0.3em] group"
				>
					<ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />{" "}
					Back to Dashboard
				</Link>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
					{/* SOCIAL SIDEBAR (1 Col) */}
					<aside className="lg:col-span-1 hidden lg:block">
						<div className="sticky top-32 flex flex-col items-center space-y-8">
							<button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-indigo-100 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:-translate-y-1">
								<Share2 className="w-6 h-6" />
							</button>
						</div>
					</aside>

					{/* MAIN CONTENT (8 Cols - Expanded) */}
					<article className="lg:col-span-8">
						<header className="mb-16">
							<div className="flex flex-wrap gap-2 mb-10">
								{post.tags.map((tag) => (
									<span
										key={tag}
										className="px-4 py-2 bg-gray-50 text-gray-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-gray-100"
									>
										#{tag}
									</span>
								))}
							</div>
							<h1 className="text-5xl md:text-5xl lg:text-5xl font-black text-gray-900 leading-[0.95] mb-12 tracking-tighter">
								{post.title}
							</h1>
							<div className="flex flex-wrap items-center gap-10 text-[11px] font-black text-gray-400 border-y border-gray-50 py-10 uppercase tracking-[0.2em]">
								<div className="flex items-center gap-4 text-gray-900">
									<div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
										{post.author.charAt(0)}
									</div>
									<div className="flex flex-col gap-0.5">
										<span className="text-xs">{post.author}</span>
										<span className="text-[9px] text-gray-400 uppercase tracking-tighter">
											AUTHOR
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4" />{" "}
									{format(new Date(post.createdAt), "MMM d, yyyy")}
								</div>
								<div className="flex items-center gap-2 text-indigo-500">
									<Clock className="w-4 h-4" /> {post.readingTime || 1} MIN READ
								</div>
								<div className="flex items-center gap-2">
									<Eye className="w-4 h-4" /> {post.views || 0} VIEWS
								</div>
							</div>
						</header>

						<section className="prose prose-indigo prose-lg lg:prose-xl max-w-none">
							{post.content?.blocks?.map((block) => (
								<BlockRenderer key={block.id} block={block} />
							))}
						</section>

						{/* RELATED POSTS */}
						{related.length > 0 && (
							<section className="mt-32 pt-20 border-t border-gray-50">
								<h3 className="text-4xl font-black text-gray-900 mb-12 tracking-tighter">
									Continue Reading
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
									{related.map((r) => (
										<Link key={r.id} to={`/post/${r.slug}`} className="group">
											<div className="aspect-video rounded-[2rem] overflow-hidden mb-6 bg-gray-50 border border-gray-100">
												<img
													src={
														r.coverImage ||
														"https://images.unsplash.com/photo-1498050108023-c5249f4df085"
													}
													alt={r.title}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
												/>
											</div>
											<h4 className="text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
												{r.title}
											</h4>
										</Link>
									))}
								</div>
							</section>
						)}
					</article>

					{/* RIGHT SIDEBAR (3 Cols - Narrower) */}
					<aside className="lg:col-span-3 space-y-12">
						<div className="sticky top-32 space-y-10">
							{/* TABLE OF CONTENTS */}
							{tableOfContents.length > 0 && (
								<div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
									<h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 flex items-center gap-3">
										<ListIcon className="w-4 h-4" /> Navigation
									</h4>
									<nav className="space-y-4">
										{tableOfContents.map((header, i) => (
											<a
												key={i}
												href={`#${header.data.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
												className="group flex gap-3 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-all leading-snug"
											>
												<span className="text-[10px] text-gray-300 group-hover:text-indigo-300">
													0{i + 1}
												</span>
												{header.data.text}
											</a>
										))}
									</nav>
								</div>
							)}

							{/* NEWSLETTER */}
							<div className="p-8 bg-indigo-900 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
								<div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl transition-opacity group-hover:opacity-50"></div>
								<div className="relative z-10">
									<Mail className="w-8 h-8 text-indigo-300 mb-6" />
									<h3 className="text-2xl font-black mb-4 leading-tight text-white">
										Master the <br />
										Modern Stack.
									</h3>
									<p className="text-indigo-200 text-xs mb-8 font-medium leading-relaxed italic">
										Expert deep dives delivered every Sunday morning.
									</p>
									<input
										className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl text-sm outline-none placeholder:text-indigo-300 focus:bg-white/20 transition-all text-white mb-4"
										placeholder="Email..."
									/>
									<button className="w-full bg-white text-indigo-900 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-all uppercase tracking-widest text-[10px]">
										Join 5k+ Readers
									</button>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}
