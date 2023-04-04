# Oktics-Health-Pose

This package is used to count exercise 
reps based on a pose detection model.

Two variables are required to use this package: a
**frame (image)** and an **exercise name**.

### Available exercises

The list of available exercises can be found at: [oktics-health-api]()

### Installation
Using a node.js ~= v16.17.1

Via npm:
```sh
npm i git@github.com:oktics/oktics-health-pose.git

```

### Import the libraries

```javascript
import PoseExercise from '@oktics/oktics-health-pose';
import {exerciseResult} from '@oktics/oktics-health-pose';
```

### Create a detector
```javascript
const urlExerciseData = 'vps.okoproject.com:49180/oktics-api';
const exercise = 'bicep curl';
async function initDetector() {
    const posesita = new PoseExercise(urlExerciseData,exercise);
    const params = await posesita.params;
    const detector = await posesita.detector;
}
```

### Get keypoints and number of repetitions from video, image or canvas
```javascript
async function getResults() {
    let results = await exerciseResult(detector, params, frame);
    let keypoints = results.keypoints;
    let repetitions = results.repetitions;
}
```

### Get keypoints and number of repetitions from rgb24 image array ([r,g,b,r,g,b,r,g,b,...])
```javascript
async function getResults() {
    let results = await exerciseResultFromRGBArray(detector, params, rgbArray, width, height);
    let keypoints = results.keypoints;
    let repetitions = results.repetitions;
}
```

#### Example of results

```
{keypoints: Array(33), 
keypoints3D: Array(33), 
score: 0.9999525547027588, 
repetitions: 0}

keypoints: [
    0: {x: 406, y: 275, z: -817691, score: 0.99, name: 'nose'}
    1: {x: 423, y: 244, z: -796055, score: 0.99, name: 'left_eye_inner}
    ...
 ],
keypoints3D: [
    0: {x: 0.12, y: -0.42, z: -0.42, score: 0.99, name: 'nose'}
    1: {x: 0.13, y: -0.46, z: -0.41, score: 0.99, name: 'left_eye_inner'}
    ...
],    
score: 0.99, 
repetitions: 2
   
```