import {find_angle, find_angle3D } from "./angles.js";

export let repetitionsCounter = 0;
let posicioInici = true; //Estat inicial d'un exercici(cos// amunt quan fem sentadilla)
let posicioFinal = false;	//Estat final d'un exercici (cos abaix quan fem sentadilla)
let degreesExerciseRight = [];
let degreesExerciseLeft = [];
let lastExercise = '';
let timer;
let counter = 0;

export default function controlExercise(results, exercise) {

	// Init counter when changing exercise
	if (exercise.name !== lastExercise) repetitionsCounter = 0;
	lastExercise = exercise.name;

	let minDuration = exercise.minDuration;
	let kps = exercise.kpDegrees.flat();
	const isAboveThreshold = (currentValue) =>
		results.keypoints3D[currentValue].score > 0.5;
	let valid = kps.every(isAboveThreshold);
	if (valid) {
		if (exercise.space === "3D") {
			//Right side
			let kps = exercise.kpDegrees[0];
			let A = {
				x: results.keypoints3D[kps[0]].x,
				y: results.keypoints3D[kps[0]].y,
				z: results.keypoints3D[kps[0]].z
			};
			let B = {
				x: results.keypoints3D[kps[1]].x,
				y: results.keypoints3D[kps[1]].y,
				z: results.keypoints3D[kps[1]].z
			};
			let C = {
				x: results.keypoints3D[kps[2]].x,
				y: results.keypoints3D[kps[2]].y,
				z: results.keypoints3D[kps[2]].z
			};
			degreesExerciseRight.push(find_angle3D(A, B, C));

			//Left side
			kps = exercise.kpDegrees[1];
			A = {
				x: results.keypoints3D[kps[0]].x,
				y: results.keypoints3D[kps[0]].y,
				z: results.keypoints3D[kps[0]].z
			};
			B = {
				x: results.keypoints3D[kps[1]].x,
				y: results.keypoints3D[kps[1]].y,
				z: results.keypoints3D[kps[1]].z
			};
			C = {
				x: results.keypoints3D[kps[2]].x,
				y: results.keypoints3D[kps[2]].y,
				z: results.keypoints3D[kps[2]].z
			};
			degreesExerciseLeft.push(find_angle3D(A, B, C));

		} else if (exercise.space === "2D") {
			//Right side
			let kps = exercise.kpDegrees[0];
			let A = {
				x: results.keypoints3D[kps[0]].x,
				y: results.keypoints3D[kps[0]].y
			};
			let B = {
				x: results.keypoints3D[kps[1]].x,
				y: results.keypoints3D[kps[1]].y
			};
			let C = {
				x: results.keypoints3D[kps[2]].x,
				y: results.keypoints3D[kps[2]].y
			};

			degreesExerciseRight.push(find_angle(A, B, C));
			//Left side
			kps = exercise.kpDegrees[1];
			A = {
				x: results.keypoints3D[kps[0]].x,
				y: results.keypoints3D[kps[0]].y
			};
			B = {
				x: results.keypoints3D[kps[1]].x,
				y: results.keypoints3D[kps[1]].y
			};
			C = {
				x: results.keypoints3D[kps[2]].x,
				y: results.keypoints3D[kps[2]].y
			};
			degreesExerciseLeft.push(find_angle(A, B, C));
		}

		if (exercise.change === "more2less") {
			if (degreesExerciseRight.at(-1) <
				exercise.minDegree && degreesExerciseLeft.at(-1) <
				exercise.minDegree && posicioInici) {
				if (counter >= minDuration) {
					posicioInici = false;
					posicioFinal = true;
					repetitionsCounter += 1;
				}
				if (timer === undefined) timer = setInterval(() => counter = counter + 1, 1000);
			}
			else if (degreesExerciseRight.at(-1) >
				exercise.maxDegree && degreesExerciseLeft.at(-1) >
				exercise.maxDegree && posicioFinal) {
				posicioInici = true;
				posicioFinal = false;
				counter = 0;
				if (timer !== undefined) timer = clearInterval(timer);
			} else {
				if (timer !== undefined) timer = clearInterval(timer);
			}
		} else if (exercise.change === "less2more") {
			if (degreesExerciseRight.at(-1) >
				exercise.maxDegree && degreesExerciseLeft.at(-1) >
				exercise.maxDegree && posicioInici) {
				if (counter >= minDuration) {
					posicioInici = false;
					posicioFinal = true;
					repetitionsCounter += 1;
				}
				if (timer === undefined) timer = setInterval(() => counter = counter + 1, 1000);

			} else if (degreesExerciseRight.at(-1) <
				exercise.minDegree && degreesExerciseLeft.at(-1)
				< exercise.minDegree && posicioFinal) {
				posicioInici = true;
				posicioFinal = false;
				counter = 0;
				if (timer !== undefined) timer = clearInterval(timer);
			} else {
				if (timer !== undefined) timer = clearInterval(timer);
			}
		}
		//if (repetitionsCounter >= exercise.maxCounter && posicioInici === true)
		//{
		//	repetitionsCounter = 0;
		//	degreesExerciseRight = [];
		//	degreesExerciseLeft = [];
		//}
		return 0;
	} else {
		return -1;
	}
}
