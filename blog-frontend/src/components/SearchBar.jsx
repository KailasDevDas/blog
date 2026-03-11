import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function SearchBar() {
	const [searchParams, setSearchParams] = useSearchParams();
	const query = searchParams.get("query") || "";

	const handleSearch = (e) => {
		const value = e.target.value;
		if (value) {
			setSearchParams({ query: value });
		} else {
			setSearchParams({});
		}
	};

	return (
		<div className="relative max-w-md w-full">
			<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
				<Search className="h-5 w-5 text-gray-400" />
			</div>
			<input
				type="text"
				value={query}
				onChange={handleSearch}
				className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
				placeholder="Search articles or tags..."
			/>
		</div>
	);
}
