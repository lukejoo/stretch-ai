/* eslint-disable no-undef */
import { Button, ButtonGroup } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Main.css";
import { drawCameraIntoCanvas, drawKeypoints, drawSkeleton } from "./drawPose";

const PREDICTION_CONFIDENCE = 0.85;

const Main = () => {
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

	useEffect(() => {
		if (brain && poses.length > 0 && state === "collecting" && targetLabel) {
			const pose = poses[0].pose;
			const skeleton = poses[0].skeleton;
			let inputs = [];
			for (let i = 0; i < pose.keypoints.length; i++) {
				let x = pose.keypoints[i].position.x;
				let y = pose.keypoints[i].position.y;
				inputs.push(x);
				inputs.push(y);
			}
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

	if (classify) {
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

	function gotResult(error, results) {
		if (results && results[0].confidence > PREDICTION_CONFIDENCE) {
			const poseLabel = results[0].label.toUpperCase();
			console.log("🧑🏻‍💻 poseLabel", poseLabel);
		}
	}

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
		console.log("🧑🏻‍💻 Neural Network Training Finished!");
	}

	const getEyeDistance = () => {
    const pose = poses[0].pose;
    const eyeR = pose.rightEye;
    const eyeL = pose.leftEye;
		return Math.sqrt((eyeR.x - eyeL.x) ** 2 + (eyeR.y - eyeL.y) ** 2);
	}

	const buttonClick = (e) => {
		e.preventDefault();
		const action = e.target.name;
		switch (action) {
			case "classify":
				if (classify) console.log("🧑🏻‍💻 Stop Classification");
				else console.log("🧑🏻‍💻 Begin Classification");
				setClassify(!classify);
				break;
			case "load":
				if (brain) {
					console.log("🧑🏻‍💻 Loading brain...");
					brain.loadData("data.json", () => {
						dataReady();
					});
				} else {
					console.log("🧑🏻‍💻 brain not ready!");
				}
				break;
			case "saveBrain":
				brain.save();
				break;
			case "saveData":
				brain.saveData();
				break;
			case "train":
				console.log("🧑🏻‍💻 Training brain...");
				brain.normalizeData();
				brain.train({ epochs: 50 }, finished);
				break;
			default: // train pose
        const distance = getEyeDistance();
        if (distance > 50) {
          console.log('🧑🏻‍💻 Too close to the camera!', distance);
        } else {
          setTimeout(function () {
            console.log("collecting");
            setState("collecting");
            setTargetLabel(action);
            setTimeout(function () {
              console.log("not collecting");
              setState("waiting");
              setTargetLabel("");
            }, 10000);
          }, 1000);
        }
		}
	};

	return (
		<div className="Main">
			<header className="Main-header">
				<h1>Main</h1>
				<Webcam ref={webcamRef} width={640} height={480} />
				<canvas ref={canvasRef} width={640} height={480} />
				<div className="Main-buttons">
					<ButtonGroup color="primary" variant="contained">
						<Button name="front" onClick={buttonClick}>
							Front
						</Button>
						<Button name="up" onClick={buttonClick}>
							Up
						</Button>
						<Button name="left" onClick={buttonClick}>
							Left
						</Button>
						<Button name="right" onClick={buttonClick}>
							Right
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
						<Button name="load" onClick={buttonClick}>
							Load
						</Button>
						<Button name="classify" onClick={buttonClick}>
							Classify
						</Button>
					</ButtonGroup>
				</div>
			</header>
		</div>
	);
};

export default Main;
