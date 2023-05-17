import PoseExercise, {exerciseResult, getKeyPoints} from "../src/pose.js"
import {drawKeypoints, drawSkeleton} from "./drawUtils.js";

// Elements from index.html
let video = document.getElementById('video');
let canvas = document.getElementById('output');
let ctx = canvas.getContext('2d');
let repElement = document.getElementById('repeticiones');

// Params for model
let detector;
let model;
let params;

async function initDetector() {
    const posesita = new PoseExercise('bicep curl');
    model = posesita.model;
    params = await posesita.params;
    console.log(params)
    detector = await posesita.detector;
    console.log('Model has been initialized')

}

async function activateVideo() {
    // Activate webcam
    if(navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({'video': {
                width: '1200',
                height: '800'
            }}).then(stream => {
            video.srcObject = stream;
        })
            .catch(e => {
                console.log(e);
            });
    }

    //
    video.onloadedmetadata = () => {
        // Get video properties
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set video and canvas width and height
        video.width = videoWidth;
        video.height = videoHeight;
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        // Flip horizontally
        ctx.translate(videoWidth, 0);
        ctx.scale(-1, 1);
    };

    video.addEventListener("loadeddata", predictPoses);
}

async function predictPoses() {

    // Get repetitions
    let results = await exerciseResult(detector, params, video);
    repElement.textContent = results.repetitions;

    // Get keypoints
    let poses = await getKeyPoints(detector, video)
    // console.log(results.keypoints)

    // Draw keypoints
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    if (poses && poses.length > 0) {
        for (const pose of poses) {
            if (pose.keypoints != null) {

                drawKeypoints(ctx, pose.keypoints);
                drawSkeleton(ctx, pose.keypoints);
            }
        }
    }
    window.requestAnimationFrame(predictPoses);
}

async function app() {
    // Init detector
    await initDetector();

    // Enable camera, get keypoints and draw them
    await activateVideo();

}

app();
