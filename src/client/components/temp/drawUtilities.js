import * as poseDetection from "@tensorflow-models/pose-detection";

let ctx;
const model = poseDetection.SupportedModels.BlazePose;

export const drawCanvas = (poses, videoWidth, videoHeight, canvas) => {
  ctx = canvas.current.getContext("2d");
  canvas.current.width = videoWidth;
  canvas.current.height = videoHeight;

  drawKeypoints(poses[0]["keypoints"]);
  drawSkeleton(poses[0]["keypoints"]);
};

function drawKeypoints(keypoints) {
  const keypointInd = poseDetection.util.getKeypointIndexBySide(model);
  ctx.fillStyle = "Red";
  ctx.strokeStyle = "White";
  ctx.lineWidth = 2;

  for (const i of keypointInd.middle) {
    drawKeypoint(keypoints[i]);
  }

  ctx.fillStyle = "Green";
  for (const i of keypointInd.left) {
    drawKeypoint(keypoints[i]);
  }

  ctx.fillStyle = "Orange";
  for (const i of keypointInd.right) {
    drawKeypoint(keypoints[i]);
  }
}

function drawKeypoint(keypoint) {
  // If score is null, just show the keypoint.
  const score = keypoint.score != null ? keypoint.score : 1;
  const scoreThreshold = 0.65;

  if (score >= scoreThreshold) {
    const circle = new Path2D();
    circle.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
    ctx.fill(circle);
    ctx.stroke(circle);
  }
}

function drawSkeleton(keypoints) {
  const color = "White";
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  poseDetection.util.getAdjacentPairs(model).forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;
    const scoreThreshold = 0.65;

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
}
