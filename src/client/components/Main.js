import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-core";
import { useRef } from "react";
import Webcam from "react-webcam";
import "./Main.css";
import { drawCanvas } from "./drawUtilities";

const Main = () => {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	let detector;

	const runBlazePose = async () => {
		const model = poseDetection.SupportedModels.BlazePose;
		const detectorConfig = {
			runtime: "tfjs",
		};
		detector = await poseDetection.createDetector(model, detectorConfig);
		setInterval(() => {
			detect();
		}, 50);
	};

	const detect = async () => {
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

			drawCanvas(poses, videoWidth, videoHeight, canvasRef);
		}
	};

	runBlazePose();

	return (
		<div className="Main">
			<header className="Main-header">
				<h1>Main</h1>
				<Webcam ref={webcamRef} />

				<canvas ref={canvasRef} />
			</header>
		</div>
	);
};

export default Main;
