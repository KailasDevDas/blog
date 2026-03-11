import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
	useNavigate,
} from "react-router-dom";
import { PenSquare, BookOpen, LogOut } from "lucide-react";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";

// Component to protect admin routes
const ProtectedRoute = ({ children }) => {
	const token = localStorage.getItem("blog_token");
	return token ? children : <Navigate to="/login" />;
};

function App() {
	const token = localStorage.getItem("blog_token");

	const handleLogout = () => {
		localStorage.removeItem("blog_token");
		window.location.href = "/";
	};

	return (
		<Router>
			<div className="min-h-screen flex flex-col font-sans bg-white">
				<header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
						<Link
							to="/"
							className="flex items-center gap-2 text-2xl font-black text-gray-900 tracking-tighter"
						>
							<BookOpen className="w-8 h-8 text-indigo-600" />
							DevBlog
						</Link>

						<div className="flex items-center gap-4">
							{token ? (
								<>
									<Link
										to="/create"
										className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100"
									>
										<PenSquare className="w-4 h-4" /> Write
									</Link>
									<button
										onClick={handleLogout}
										className="p-2.5 text-gray-400 hover:text-rose-500 transition-colors"
									>
										<LogOut className="w-5 h-5" />
									</button>
								</>
							) : (
								<Link
									to="/login"
									className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors"
								>
									Admin
								</Link>
							)}
						</div>
					</div>
				</header>

				<main className="flex-grow w-full">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/post/:slug" element={<PostDetail />} />
						<Route
							path="/create"
							element={
								<ProtectedRoute>
									<CreatePost />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
