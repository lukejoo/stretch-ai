import { Routes, Route } from "react-router";
import "./App.css";
import Stretch from "./client/components/Stretch";
import TrainModel from "./client/components/TrainModel";
import NotFound from "./client/components/NotFound";

function App() {
	return (
		<div className="App">
			<Routes>
        <Route path="/" element={<Stretch />} />
				<Route path="/trainmodel" element={<TrainModel />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</div>
	);
}

export default App;
