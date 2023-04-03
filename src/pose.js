import axios from 'axios';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
//import '@mediapipe/pose';

import controlExercise, {repetitionsCounter} from "./controlExercise.js";


export const exerciseResult = async (detector, params, image) =>  {
    try {
        let poses = await getKeyPoints(detector, image);
        let results = poses[0];
        controlExercise(results, params);

        // Return
        return {
            keypoints: results.keypoints,
            keypoints3D: results.keypoints3D,
            repetitions: repetitionsCounter
        }

    } catch (error) {
       console.log(error);
    }
}

export const exerciseResultFromRGBArray = async (detector, params, rgbArray, width, height) => {
    try {
        const dataArray = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < width * height; i++) {
            dataArray[i * 4 + 0] = rgbArray[i * 3 + 0];
            dataArray[i * 4 + 1] = rgbArray[i * 3 + 1];
            dataArray[i * 4 + 2] = rgbArray[i * 3 + 2];
            dataArray[i * 4 + 3] = 255; // set alpha channel to 255
        }
        let image = new ImageData(dataArray, width, height);
        let results = await exerciseResult(detector, params, image);
        return results;

    } catch (error) {
        console.log(error);
    }
}

export const getKeyPoints = async(detector, image) => {
    let poses;
    const estimationConfig = {flipHorizontal: true};
    if (detector != null) {
        try {
            poses = await detector.estimatePoses(image, estimationConfig);
            return poses;
        } catch (error) {
            console.log(error);
        }
    }
}


export default class PoseExercise {
    // runtime: 'mediapipe' or 'tfjs'
    constructor(urlExerciseData,
        selectedExercise,
        runtime = 'tfjs',
        modelType = 'full') {
        // Model basic options
        this.runtime = runtime;
        this.modelType = modelType;
        this.model = poseDetection.SupportedModels.BlazePose;

        // Exercise
        this.urlExerciseData = urlExerciseData;
        this.selectedExercise = selectedExercise;
        this.params = this.getExParams();
        this.detector = this.initDetector();
    }

    async initDetector() {
        const detectorConfig = {
            runtime: this.runtime,
            enableSmoothing: true,
            modelType: this.modelType
        }
        return await poseDetection.createDetector(this.model, detectorConfig);
    }

    async getExParams() {
        try {
            let res = await axios.post(this.urlExerciseData,
                { name: this.selectedExercise });
            let data = res.data.data;
            return data.params;
        }
        catch (error) {
            console.log(error)}
    }
}


export const getAdjacentPairs = [
  [ 0, 1 ],   [ 0, 4 ],   [ 1, 2 ],
  [ 2, 3 ],   [ 3, 7 ],   [ 4, 5 ],
  [ 5, 6 ],   [ 6, 8 ],   [ 9, 10 ],
  [ 11, 12 ], [ 11, 13 ], [ 11, 23 ],
  [ 12, 14 ], [ 14, 16 ], [ 12, 24 ],
  [ 13, 15 ], [ 15, 17 ], [ 16, 18 ],
  [ 16, 20 ], [ 15, 17 ], [ 15, 19 ],
  [ 15, 21 ], [ 16, 22 ], [ 17, 19 ],
  [ 18, 20 ], [ 23, 25 ], [ 23, 24 ],
  [ 24, 26 ], [ 25, 27 ], [ 26, 28 ],
  [ 27, 29 ], [ 28, 30 ], [ 27, 31 ],
  [ 28, 32 ], [ 29, 31 ], [ 30, 32 ]]


export const getAdjacentPairsWithoutFace = [
  [ 11, 12 ], [ 11, 13 ], [ 11, 23 ],
  [ 12, 14 ], [ 14, 16 ], [ 12, 24 ],
  [ 13, 15 ], [ 15, 17 ], [ 16, 18 ],
  [ 16, 20 ], [ 15, 17 ], [ 15, 19 ],
  [ 15, 21 ], [ 16, 22 ], [ 17, 19 ],
  [ 18, 20 ], [ 23, 25 ], [ 23, 24 ],
  [ 24, 26 ], [ 25, 27 ], [ 26, 28 ],
  [ 27, 29 ], [ 28, 30 ], [ 27, 31 ],
  [ 28, 32 ], [ 29, 31 ], [ 30, 32 ]]
