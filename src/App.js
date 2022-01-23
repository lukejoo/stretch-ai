import { Routes, Route } from "react-router";
import "./App.css";
import Main from "./client/components/Main";
import NotFound from "./client/components/NotFound";

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Main />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</div>
	);
}

export default App;
