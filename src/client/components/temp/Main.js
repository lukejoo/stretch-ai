import { Button, ButtonGroup, Grid } from "@mui/material";
import StopIcon from "@mui/icons-material/Stop";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-core";
import { useRef } from "react";
import Webcam from "react-webcam";
import { drawCanvas } from "./drawUtilities";
import "./Main.css";

const Main = () => {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	const runBlazePose = async () => {
		const model = poseDetection.SupportedModels.BlazePose;
		const detectorConfig = {
			runtime: "tfjs",
		};
		const detector = await poseDetection.createDetector(model, detectorConfig);
		setInterval(() => {
			detect(detector);
		}, 50);
	};

	const detect = async (detector) => {
		if (
			typeof webcamRef.current !== "undefined" &&
			webcamRef.current !== null &&
			webcamRef.current.video.readyState === 4
		) {
			// Get Video Properties
			const video = webcamRef.current.video;
			const videoWidth = webcamRef.current.video.videoWidth;
			const videoHeight = webcamRef.current.video.videoHeight;

			// Set video width
			webcamRef.current.video.width = videoWidth;
			webcamRef.current.video.height = videoHeight;

			// Make Detections
			const estimationConfig = { flipHorizontal: true }; // since using webcam
			const poses = await detector.estimatePoses(video, estimationConfig);

			// console.log("🧑🏻‍💻 poses", poses);

			drawCanvas(poses, videoWidth, videoHeight, canvasRef);
		}
	};

	runBlazePose();

	const startTraining = (e) => {
		e.preventDefault();
		console.log("🧑🏻‍💻 startTraining");
	};

  const endTraining = (e) => {
		e.preventDefault();
		console.log("🧑🏻‍💻 endTraining");
	};

  // eslint-disable-next-line no-undef
  console.log('🧑🏻‍💻 ml5', ml5.version);

	return (
		<div className="Main">
			<header className="Main-header">
				<h1>Main</h1>
			</header>
			<div className="Main-webcam">
				<Grid container>
					<Grid item>
						<Webcam ref={webcamRef} />
					</Grid>
					<Grid item>
						<canvas ref={canvasRef} />
					</Grid>
				</Grid>
			</div>
			<div className="Main-buttons">
				<ButtonGroup variant="contained">
					<Button startIcon={<ModelTrainingIcon />} onClick={startTraining}>
						Start Training
					</Button>
					<Button startIcon={<StopIcon />} onClick={endTraining}>
						End Training
					</Button>
				</ButtonGroup>
			</div>
		</div>
	);
};

export default Main;
