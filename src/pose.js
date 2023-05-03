import axios from 'axios';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/pose';

import controlExercise, {repetitionsCounter} from "./controlExercise.js";
const healthApi = 'https://vps.okoproject.com:49180/oktics-api';

const errIsExercise = "selected exercise does not exist";
const errEstimatedPoses = "unable to estimate poses";
const errControlExercise = "unable to estimate exercise information";

export const exerciseResult = async (detector, params, image) =>  {
    try {
        // Getting keypoints
        let poses = await getKeyPoints(detector, image);
        let results = poses[0];

        // Handle exceptions
        if (typeof poses === "undefined" || poses == null) throw errEstimatedPoses;
        if (typeof params.id === "undefined" || params.id == null) throw errIsExercise;

        // Getting repetions
        let error = '';
        let status = controlExercise(results, params);
        // Some of the required poses are not available
        if (status == -1) error = errControlExercise;

        // Return
        return {
            status: status,
            keypoints: results.keypoints,
            keypoints3D: results.keypoints3D,
            repetitions: repetitionsCounter,
            error: error
        }

    } catch (error) {
        //console.log(error);
        return ({ status: -1, error: error });
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
        //console.log(error);
        return ({ status: -1, error: error });
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
            return "";
        }
    }
}

export const getExercisesList = async () => {
    try {
        let urlExerciseList = healthApi + '/exercise_list';
        let res = await axios.get(urlExerciseList);
        return res.data.data;
    }
    catch (error) {
        console.log(error);
        return "";
    }
}

export default class PoseExercise {
    // runtime: 'mediapipe' or 'tfjs'
    constructor(selectedExercise,
        runtime = 'mediapipe',
        modelType = 'full') {
        // Model basic options
        this.runtime = runtime;
        this.modelType = modelType;
        this.model = poseDetection.SupportedModels.BlazePose;

        // Exercise
        this.selectedExercise = selectedExercise;
        this.params = this.getExParams();
        this.detector = this.initDetector();
    }

    async initDetector() {
        const detectorConfig = {
            runtime: this.runtime,
            enableSmoothing: true,
            modelType: this.modelType,
            solutionPath: 'https://vps.okoproject.com/oktics-health/@mediapipe/pose/'
        }
        return await poseDetection.createDetector(this.model, detectorConfig);
    }

    async getExParams() {
        try {                     
            if (typeof this.selectedExercise !== "number") return "";
            let urlExerciseList = healthApi + '/exercise_list';
            let res = await axios.get(urlExerciseList);
            let exerciseList = res.data.data;
            const getItemByKey = (key) => {
                return exerciseList.find((item) => item.id === key);
            };
            const exercise = getItemByKey(this.selectedExercise);
            urlExerciseList = healthApi + '/exercise';
            res = await axios.post(urlExerciseList,
                { name: exercise.name });
            let data = res.data.data;
            return data.params;
        }
        catch (error) {
            //console.log(error);
            return "";
        }
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
