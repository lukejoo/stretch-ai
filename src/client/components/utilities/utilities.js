export const displayTime = (time) => {
  const seconds = Math.floor(time / 1000)
    .toString()
    .padStart(2, "0");
  const milliSeconds = (time % 100).toString().padStart(2, "0");
  return `${seconds}:${milliSeconds}`;
};

export const getEyeDistance = (pose) => {
  const eyeR = pose.rightEye;
  const eyeL = pose.leftEye;
  return Math.sqrt((eyeR.x - eyeL.x) ** 2 + (eyeR.y - eyeL.y) ** 2);
};
