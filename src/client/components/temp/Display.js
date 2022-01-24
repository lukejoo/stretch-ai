/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
// import "./Display.css";
import { drawCameraIntoCanvas, drawKeypoints, drawSkeleton } from "./drawPose";

const Display = () => {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	const [video, setVideo] = useState(null);
	const [canvas, setCanvas] = useState(null);
	const [ctx, setCtx] = useState(null);
	const [modelLoaded, setModelLoaded] = useState(false);

	useEffect(() => {
		if (webcamRef.current) setVideo(webcamRef.current.video);
	}, [webcamRef]);

	useEffect(() => {
		if (canvasRef.current) {
			setCanvas(canvasRef.current);
			setCtx(canvasRef.current.getContext("2d"));
		}
	}, [canvasRef]);

	//// POSENET ////

	const setupPoseNet = () => {
		const options = {
			maxPoseDetections: 1,
			detectionType: "single",
		};
		const poseNet = ml5.poseNet(video, options, () => {
			console.log("🧑🏻‍💻 Model ready");
			setModelLoaded(true);
		});
		poseNet.on("pose", gotPoses);
	};

	const gotPoses = (poses) => {
		drawCameraIntoCanvas(ctx, video);
		drawKeypoints(ctx, poses);
		drawSkeleton(ctx, poses);
	};

	if (video && canvas && !modelLoaded) setupPoseNet();

	return (
		<div className="Display">
			<h1>Display</h1>
			<div className="Display-parent">
				<div className="webcam">
					<Webcam ref={webcamRef} width={640} height={480} />
					<canvas ref={canvasRef} width={640} height={480} />
				</div>
			</div>
			<footer></footer>
		</div>
	);
};

export default Display;
