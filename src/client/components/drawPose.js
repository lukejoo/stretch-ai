const KEYPOINT_SCORE = 0.7;

export const drawCameraIntoCanvas = (ctx, video) => {
  ctx.drawImage(video, 0, 0, 640, 480);
  ctx.strokeStyle = "White";
  ctx.lineWidth = 2;
}

export const drawKeypoints = (ctx, poses) => {
  if (poses.length) {
    for (let j = 0; j < poses[0].pose.keypoints.length; j += 1) {
      const keypoint = poses[0].pose.keypoints[j];
      if (keypoint.score > KEYPOINT_SCORE) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
        const circle = new Path2D();
        ctx.fill(circle);
        ctx.stroke();
      }
    }
  }
}

export const drawSkeleton = (ctx, poses) => {
  if (poses.length) {
    for (let j = 0; j < poses[0].skeleton.length; j += 1) {
      let partA = poses[0].skeleton[j][0];
      let partB = poses[0].skeleton[j][1];
      if (partA.score > KEYPOINT_SCORE && partB.score > KEYPOINT_SCORE) {
        ctx.beginPath();
        ctx.moveTo(partA.position.x, partA.position.y);
        ctx.lineTo(partB.position.x, partB.position.y);
        ctx.stroke();
      }
    }
  }
}
