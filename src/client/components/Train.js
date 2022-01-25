/* eslint-disable no-undef */
import { Button, ButtonGroup } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Train.css";
import { drawCameraIntoCanvas, drawKeypoints, drawSkeleton } from "./utilities/drawPose";
import { DELAY_TIME, MAX_EYE_DISTANCE, PREDICTION_CONFIDENCE, TRAIN_TIME } from "./utilities/constValues";

let currentPose = "";
let poseIsMatched = {};
let poseIntervalID = {};
let poseTime = {
  LEFT: 0,
  RIGHT: 0,
  UP: 0,
  IDLE: 0,
};

const Train = () => {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	const [video, setVideo] = useState(null);
	const [canvas, setCanvas] = useState(null);
	const [ctx, setCtx] = useState(null);
	const [modelLoaded, setModelLoaded] = useState(false);
	const [poses, setPoses] = useState([]);
	const [brain, setBrain] = useState(null);
	const [state, setState] = useState("waiting");
	const [targetLabel, setTargetLabel] = useState("");
	const [beginClassify, setBeginClassify] = useState(false);

	useEffect(() => {
		if (webcamRef.current) setVideo(webcamRef.current.video);
	}, [webcamRef]);

	useEffect(() => {
		if (canvasRef.current) {
			setCanvas(canvasRef.current);
			setCtx(canvasRef.current.getContext("2d"));
		}
	}, [canvasRef]);

	useEffect(() => {
		if (brain && poses.length > 0 && state === "collecting" && targetLabel) {
			const keypoints = poses[0].pose.keypoints;
			let inputs = [];
			keypoints.forEach((keypoint) => {
				let x = keypoint.position.x;
				let y = keypoint.position.y;
				inputs.push(x);
				inputs.push(y);
			});
			brain.addData(inputs, [targetLabel]);
		}
	}, [brain, poses, state, targetLabel]);

	//// POSENET ////

	// eslint-disable-next-line no-undef
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

	//// NEURAL NETWORK ////

	const setupNN = () => {
		const options = {
			inputs: 34,
			outputs: 4,
			task: "classification",
			// debug: true,
		};
		let newBrain = ml5.neuralNetwork(options);
		setBrain(newBrain);
	};

	if (!brain) setupNN();

	const classify = () => {
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
	};

	const gotResult = (error, results) => {
		if (results && results[0].confidence > PREDICTION_CONFIDENCE) {
			currentPose = results[0].label.toUpperCase();
			if (!poseIsMatched[currentPose]) {
				poseIsMatched[currentPose] = true;
        poseTime[currentPose] = 0;
				poseIntervalID[currentPose] = setInterval(() => {
          poseTime[currentPose] += 10;
				}, 10);
			}
			if (poseTime[currentPose] >= 10000 && poseIntervalID[currentPose]) {
				console.log("🧑🏻‍💻 reached 10000!");
				clearInterval(poseIntervalID[currentPose]);
				poseIntervalID[currentPose] = null;
			}
		}
	};

	if (beginClassify) classify();

	const dataReady = () => {
		brain.normalizeData();
		brain.train(
			{
				epochs: 50,
			},
			() => {
				finished();
			}
		);
	};

	function finished() {
		console.log("🧑🏻‍💻 Training Finished!");
	}

	const getEyeDistance = () => {
		const pose = poses[0].pose;
		const eyeR = pose.rightEye;
		const eyeL = pose.leftEye;
		return Math.sqrt((eyeR.x - eyeL.x) ** 2 + (eyeR.y - eyeL.y) ** 2);
	};

	const buttonClick = (e) => {
		e.preventDefault();
		const action = e.target.name;
		switch (action) {
			case "classify":
				if (brain && !brain.neuralNetwork.isTrained) {
					console.log("🧑🏻‍💻 Brain not trained yet!");
				} else {
					if (!beginClassify) console.log("🧑🏻‍💻 Begin Classification");
					else console.log("🧑🏻‍💻 Stop Classification");
					setBeginClassify(!beginClassify);
				}
				break;
			case "loadData":
				if (brain) {
					console.log("🧑🏻‍💻 Loading data...");
					brain.loadData("data.json", () => {
						dataReady();
					});
				} else {
					console.log("🧑🏻‍💻 brain not ready!");
				}
				break;
			case "loadModel":
				if (brain) {
					console.log("🧑🏻‍💻 Loading model...");
					const modelInfo = {
						model: "model.json",
						metadata: "model_meta.json",
						weights: "model.weights.bin",
					};
					brain.load(modelInfo, () => {
						console.log("🧑🏻‍💻 brain loaded!");
					});
				} else {
					console.log("🧑🏻‍💻 brain not ready!");
				}
				break;
			case "saveBrain":
				brain.save();
				break;
			case "saveData":
				brain.saveData("data");
				break;
			case "train":
				console.log("🧑🏻‍💻 Training brain...");
				brain.normalizeData();
				brain.train({ epochs: 50 }, finished);
				break;
			default:
				// train pose
				const distance = getEyeDistance();
				if (distance > MAX_EYE_DISTANCE) {
					console.log("🧑🏻‍💻 Too close to the camera!", distance);
				} else {
					console.log("🧑🏻‍💻 Training for:", action);
					setTimeout(() => {
						console.log("collecting");
						setState("collecting");
						setTargetLabel(action);
						setTimeout(function () {
							console.log("not collecting");
							setState("waiting");
							setTargetLabel("");
						}, TRAIN_TIME);
					}, DELAY_TIME);
				}
		}
	};

	return (
		<div className="Train">
			<h1>Train</h1>
			<div className="Train-parent">
				<div className="Train-buttons">
					<ButtonGroup color="primary" variant="contained">
						<Button name="up" onClick={buttonClick}>
							Up
						</Button>
						<Button name="left" onClick={buttonClick}>
							Left
						</Button>
						<Button name="right" onClick={buttonClick}>
							Right
						</Button>
						<Button name="idle" onClick={buttonClick}>
							Idle
						</Button>
						<Button name="saveData" onClick={buttonClick}>
							Save Data
						</Button>
						<Button name="train" onClick={buttonClick}>
							Train
						</Button>
						<Button name="saveBrain" onClick={buttonClick}>
							Save Brain
						</Button>
					</ButtonGroup>
					<ButtonGroup color="secondary" variant="contained">
						<Button name="loadData" onClick={buttonClick}>
							Load Data
						</Button>
						<Button name="loadModel" onClick={buttonClick}>
							Load Model
						</Button>
						<Button name="classify" onClick={buttonClick}>
							Classify
						</Button>
					</ButtonGroup>
				</div>
				<h3>Pose: {currentPose}</h3>
				{beginClassify && (
					<h4>
						Left: {poseTime.LEFT}, Right: {poseTime.RIGHT}, Up: {poseTime.UP}, Idle: {poseTime.IDLE}
					</h4>
				)}
				{/* <h2>Distance: {poses && poses[0] && getEyeDistance()}</h2> */}
				<div className="webcam">
					<Webcam ref={webcamRef} width={640} height={480} />
					<canvas ref={canvasRef} width={640} height={480} />
				</div>
			</div>
			<footer></footer>
		</div>
	);
};

export default Train;
