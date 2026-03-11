import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { PenSquare, BookOpen } from "lucide-react";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";

function App() {
	return (
		<Router>
			<div className="min-h-screen flex flex-col font-sans">
				{/* Modern Navbar */}
				<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
					<div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
						<Link
							to="/"
							className="flex items-center gap-2 text-xl font-bold text-gray-800"
						>
							<BookOpen className="w-6 h-6 text-indigo-600" />
							DevBlog
						</Link>
						<Link
							to="/create"
							className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
						>
							<PenSquare className="w-4 h-4" />
							Write
						</Link>
					</div>
				</header>

				{/* Main Content Area */}
				<main className="flex-grow w-full max-w-5xl mx-auto px-6 py-8">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/create" element={<CreatePost />} />
						<Route path="/post/:slug" element={<PostDetail />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
