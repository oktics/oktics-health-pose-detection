# Oktics-Health-Pose

This package is used to count exercise 
reps based on a pose detection model.

Two variables are required to use this package: a
**frame (image)** or **rgb24 array** and an **exercise id**.

### Installation
Using a node.js ~= v16.17.1

To install the library, run the following command:

Via npm:
```sh
npm i git@github.com:oktics/oktics-health-pose.git

```

### Usage

Import the functions you need from the library like this:

```javascript
import PoseExercise, {getExercisesList, exerciseResultFromRGBArray, exerciseResult} from '@oktics/oktics-health-pose';
```

### Available exercises

'getExercisesList()'
This function returns the list of available exercises including the id, name, recommended repetitions and image url.

Usage example:

```javascript
    import {getExercisesList} from '@oktics/oktics-health-pose';
    import React, { useState, useEffect } from "react";

    function App() {
        const [selectedExercise, setSelectedExercise] = useState('');

        const getExerciseId = async (index) => {
            let exerciseList = await getExercisesList();
            let exerciseId = exerciseList[index].id;
            setSelectedExercise(exerciseId);
        }

        useEffect(() => {
            // Select first exercise: "Squats"
            getExerciseId(0);
        }, [])

        // Selected exercise id: 101
        return <div>'Selected exercise id:' {selectedExercise}</div>
    }
```

Output:

```javascript
[
  {
    "id": 101,
    "name": "Squats",
    "rep": 4,
    "image": "https://okobusiness.com/wp-content/uploads/sites/23/2022/11/squats.jpg"
  },
  {
    "id": 102,
    "name": "Arms Raise",
    "rep": 4,
    "image": "https://okobusiness.com/wp-content/uploads/sites/23/2022/11/arms.jpg"
  },
  {
    "id": 103,
    "name": "Bicep Curl",
    "rep": 4,
    "image": "https://okobusiness.com/wp-content/uploads/sites/23/2022/11/biceps.jpg"
  },
  {
    "id": 104,
    "name": "Lateral Shoulder",
    "rep": 4,
    "image": "https://okobusiness.com/wp-content/uploads/sites/23/2022/11/shoulder.jpg"
  }
]
```


### Init PoseExercise model and create a detector

Create new instance of PoseExercise object.

Example:

```javascript
    import PoseExercise from '@oktics/oktics-health-pose';

    // Init PoseExercise model
    async function initDetector() {
        const exerciseId = selectedExercise;
        const pose = new PoseExercise(exerciseId);
    }
```

### Get keypoints and number of repetitions from rgb24 image array ([r,g,b,r,g,b,r,g,b,...])

'exerciseResultFromRGBArray()'
This function returns the keypoints and number of repetitions from the webcam video.

Parameters:

*   *detector*: used to detect poses, returned from the model init method (new PoseExercise).

*   *params*: exercise parameters, returned from the model init method (new PoseExercise).

*   *rgbArray*: rgb24 image array ([r,g,b,r,g,b,r,g,b,...]).

*   *width*: image width.

*   *height*: image height.

*   *duration (optional)*: exercise duration, time that the position must be maintained for the repetition to be considered.
By default, no duration is considered necessary (duration = 0).

```javascript
    let results = await exerciseResultFromRGBArray(detector, params, rgbArray, width, height);
```

Examples of rgb24 array format:

```javascript
    function drawImageFromRGBArray(rgbArray, width, height) {
        // Image data from RGB array
        const dataArray = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < width * height; i++) {
            dataArray[i * 4 + 0] = rgbArray[i * 3 + 0];
            dataArray[i * 4 + 1] = rgbArray[i * 3 + 1];
            dataArray[i * 4 + 2] = rgbArray[i * 3 + 2];
            dataArray[i * 4 + 3] = 255; // set alpha channel to 255
        }
        // Draw image
        let imgData = new ImageData(dataArray, width, height);
        const context = canvas.getContext("2d");
        context.putImageData(imgData, 0, 0);
    }

    function rgbArrayFromImage(width, height) {
        // RGB array from image data
        const context = canvas.getContext("2d");
        const imageData = context.getImageData(0, 0, width, height);
        const rgbArray = new Uint8Array(width * height * 3);
        for (let i = 0; i < width * height; i++) {
            rgbArray[i * 3] = imageData.data[i * 4];
            rgbArray[i * 3 + 1] = imageData.data[i * 4 + 1];
            rgbArray[i * 3 + 2] = imageData.data[i * 4 + 2];
        }
        return rgbArray;
    }

    // draw 3x3 pixel black cross from rgb24 array format
    var canvas = document.getElementById("myCanvas");
    const width = 3;
    const height = 3;
    const rgbArray = new Uint8Array([255, 255, 255, 0, 0, 0, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 0, 0, 0, 255, 255, 255]);
    drawImageFromRGBArray(rgbArray, width, height);

    // get rgb24 array from canvas image
    const rgb24 = rgbArrayFromImage(width, height);
    console.log('3x3 pixel black cross rgb24 array: ' + rgb24);
```

Usage example:

```javascript
    import PoseExercise, { exerciseResultFromRGBArray } from '@oktics/oktics-health-pose'

    let params;
    let detector;

    // Init PoseExercise model
    async function initPoseExercise() {
        const exerciseId = selectedExercise;
        const pose = new PoseExercise(exerciseId);
        params = await pose.params;
        detector = await pose.detector;
    }

    async function predictPoseExercise() {
        const width = 1280;
        const height = 960;
        const rgbArray = new Uint8Array([255, 255, 255, ...]);
        const results = await exerciseResultFromRGBArray(detector, params, rgbArray, width, height);
        console.log('keypoints: ' + JSON.stringify(results.keypoints));
        console.log('repetitions: ' + results.repetitions);
    }

    // Start prediction
    await initPoseExercise();
    await predictPoseExercise();
```


### Get keypoints and number of repetitions from the webcam video.

'exerciseResult()'
This function returns the keypoints and number of repetitions from the webcam video.

Parameters:

*   *detector*: used to detect poses, returned from the model init method (new PoseExercise).

*   *params*: exercise parameters, returned from the model init method (new PoseExercise).

*   *frame*: accepts both image and video in many formats, including: 
'HTMLVideoElement', 'HTMLImageElement', 'HTMLCanvasElement'.

*   *duration (optional)*: exercise duration, time that the position must be maintained for the repetition to be considered.
By default, no duration is considered necessary (duration = 0).

```javascript
    let results = await exerciseResult(detector, params, frame);
```

Usage example:

```javascript
    import PoseExercise, { exerciseResult } from '@oktics/oktics-health-pose'

    let params;
    let detector;

    // Init PoseExercise model
    async function initPoseExercise() {
        const exerciseId = selectedExercise;
        const pose = new PoseExercise(exerciseId);
        params = await pose.params;
        detector = await pose.detector;
    }

    async function predictPoseExercise() {
        ...
        let results = await exerciseResult(detector, params, video);
        console.log('keypoints: ' + JSON.stringify(results.keypoints));
        console.log('repetitions: ' + results.repetitions);
        ...
    }

    // Start prediction
    await initPoseExercise();
    predictPoseExercise();
```


#### Example of results

*status*: code status 0 means pose prediction completed successfully. Code status -1 means there has been an error.

*keypoints*: array of 33 keypoint objects, each object has x, y, a confidence score and the position name. 
The x and y are in pixel units.

*keypoints3D*: additional array with 33 keypoint objects, each object has x, y, z, score and position name.
The x, y, z are in meter units. The body structure is considered as if it were in a 2m x 2m x 2m cube. 
Each axis in a range from -1 to 1.

*repetitions*: repetitions counter.

*holdStatus*: code status 0 means the position is ready to start the exercise (e.g. arms down before starting the "Arms Raise" exercise). 
Code status 1 means that the position of the exercise is maintained (for example, arms up in exercise "Raise arms"). 
Code status -1 means that the body is in an intermediate position between the starting point and the correct execution of the exercise.

*successPercentage*: position success rate: 100% means that the exercise position is the reference position, 0% means that the body is in the starting position.

*error*: error message. If there has been an error other results cannot be available.

```
{status: 0,
keypoints: Array(33), 
keypoints3D: Array(33), 
repetitions: repetitionsCounter,
holdStatus: holdStatus,
successPercentage: successPercentage,
error: error}

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

#### Errors

If you encounter any errors while using the function, please see below for common error messages and their solutions:

Error: "selected exercise does not exist"
Solution: This error occurs when the exercise does not exist. Use an existing exercise list from 'getExercisesList()'.

Error: "unable to estimate poses"
Solution: This error occurs when the PoseExercise detector is not able to estimate poses. 
Check image input to 'exerciseResultFromRGBArray()' or 'exerciseResult()'.

Error: "unable to estimate exercise information"
Solution: This error occures when the required poses to evaluate exercise are not correctly estimated.
Check image or frame input to 'exerciseResultFromRGBArray()' or 'exerciseResult()'.

```
{"status":-1,
"error":"selected exercise does not exist"}
```

### Exercise holding duration

'getExerciseMinDuration(id)'
This function returns the time that the exercise must be holded in each repetition, in seconds.

Parameters:

*   *id*: exercise id.

Usage example:

```javascript
    import {getExerciseMinDuration} from '@oktics/oktics-health-pose';

    function getExerciseDuration() {
        ...
        // Squats minimum duration
        let duration = await getExerciseMinDuration(101);
        console.log('duration: ' + duration);
        ...
    }
```


#### License

This library is licensed under the MIT License.