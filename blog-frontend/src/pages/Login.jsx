import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, User } from "lucide-react";

export default function Login() {
	const [form, setForm] = useState({ username: "", password: "" });
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("http://localhost:5000/api/login", form);
			localStorage.setItem("blog_token", res.data.token);
			window.location.href = "/create"; // Force reload to update Navbar
		} catch (err) {
			setError("Access denied. Please check your credentials.");
		}
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center px-6">
			<div className="max-w-md w-full p-10 bg-white rounded-[3rem] shadow-2xl border border-gray-50">
				<div className="text-center mb-10">
					<div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
						<Lock className="w-8 h-8" />
					</div>
					<h1 className="text-3xl font-black text-gray-900 tracking-tight">
						Admin Gate
					</h1>
					<p className="text-gray-400 font-medium mt-2">
						Sign in to manage your masterpiece.
					</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-6">
					<div className="space-y-2">
						<label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">
							Username
						</label>
						<div className="relative">
							<User className="absolute left-5 top-5 w-5 h-5 text-gray-300" />
							<input
								type="text"
								required
								className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
								onChange={(e) => setForm({ ...form, username: e.target.value })}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">
							Password
						</label>
						<div className="relative">
							<Lock className="absolute left-5 top-5 w-5 h-5 text-gray-300" />
							<input
								type="password"
								required
								className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
								onChange={(e) => setForm({ ...form, password: e.target.value })}
							/>
						</div>
					</div>

					{error && (
						<p className="text-rose-500 text-xs font-bold text-center italic">
							{error}
						</p>
					)}

					<button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200">
						Authorize
					</button>
				</form>
			</div>
		</div>
	);
}
