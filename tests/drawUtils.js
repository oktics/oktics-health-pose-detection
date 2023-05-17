import {getAdjacentPairsWithoutFace} from "../src/pose.js";

const scoreThreshold = 0.6;


export function drawKeypoint(ctx, keypoint) {
    const radius = 7;

    if (keypoint.score >= scoreThreshold) {
        const circle = new Path2D();
        circle.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI);
        ctx.fill(circle);
        ctx.stroke(circle);
    }
}


export function drawKeypoints(ctx, keypoints) {
    ctx.fillStyle = 'gray';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    for(let i=11; i<keypoints.length; i++) {
        drawKeypoint(ctx, keypoints[i]);
    }
}

export function drawSkeleton(ctx, keypoints) {
    const color = "#fff";
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    getAdjacentPairsWithoutFace
        .forEach(([i, j]) => {


            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1.score >= scoreThreshold && kp2.score >= scoreThreshold) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
            }
        });
}
