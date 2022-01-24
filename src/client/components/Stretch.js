/* eslint-disable no-undef */
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { drawCameraIntoCanvas, drawKeypoints, drawSkeleton } from "./drawPose";
import "./Stretch.css";

const EYE_DISTANCE = 50;
const PREDICTION_CONFIDENCE = 0.85;

const Stretch = () => {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	const [video, setVideo] = useState(null);
	const [canvas, setCanvas] = useState(null);
	const [ctx, setCtx] = useState(null);
	const [modelLoaded, setModelLoaded] = useState(false);
	const [poses, setPoses] = useState([]);
	const [brain, setBrain] = useState(null);
	const [classify, setClassify] = useState(false);

	useEffect(() => {
		if (webcamRef.current) setVideo(webcamRef.current.video);
	}, [webcamRef]);

	useEffect(() => {
		if (canvasRef.current) {
			setCanvas(canvasRef.current);
			setCtx(canvasRef.current.getContext("2d"));
		}
	}, [canvasRef]);

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
		setPoses(poses);
		drawCameraIntoCanvas(ctx, video);
		drawKeypoints(ctx, poses);
		drawSkeleton(ctx, poses);
	};

	if (video && canvas && !modelLoaded) setupPoseNet();

	//// Neural Network ////

	const setupNN = () => {
		const options = {
			inputs: 34,
			outputs: 4,
			task: "classification",
			// debug: true,
		};
		let newBrain = ml5.neuralNetwork(options);
		setBrain(newBrain);
		newBrain.loadData("data.json", () => {
			dataReady(newBrain);
		});
	};

	const dataReady = (brain) => {
		brain.normalizeData();
		brain.train(
			{
				epochs: 50,
			},
			() => {
				console.log("🧑🏻‍💻 Neural Network Training Finished!");
				setClassify(true);
			}
		);
	};

	const getEyeDistance = () => {
		const pose = poses[0].pose;
		const eyeR = pose.rightEye;
		const eyeL = pose.leftEye;
		return Math.sqrt((eyeR.x - eyeL.x) ** 2 + (eyeR.y - eyeL.y) ** 2);
	};

	const gotResult = (error, results) => {
		if (results && results[0].confidence > PREDICTION_CONFIDENCE) {
			const poseLabel = results[0].label.toUpperCase();
		}
	};

	if (!brain) setupNN();

	if (classify) {
		const distance = getEyeDistance();
		if (distance > EYE_DISTANCE) {
			console.log("🧑🏻‍💻 too close to camera!");
		} else {
			const pose = poses[0].pose;
			if (pose) {
				let inputs = [];
				for (let i = 0; i < pose.keypoints.length; i++) {
					let x = pose.keypoints[i].position.x;
					let y = pose.keypoints[i].position.y;
					inputs.push(x);
					inputs.push(y);
				}
				brain.classify(inputs, gotResult);
			}
		}
	}

	return (
		<div className="Stretch">
			<h1>Stretch</h1>
			<Webcam ref={webcamRef} width={640} height={480} />
			<canvas ref={canvasRef} width={640} height={480} />
		</div>
	);
};

export default Stretch;
