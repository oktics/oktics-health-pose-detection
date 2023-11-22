import { find_angle, find_angle3D } from "./angles.js";

export let repetitionsCounter = 0;
export let holdStatus = 0;
export let successPercentage = [0, 0];
export let currentSide;
export let stateByCondition = [];

let posicioInici = true; //Estat inicial d'un exercici(cos// amunt quan fem sentadilla)
let posicioFinal = false;	//Estat final d'un exercici (cos abaix quan fem sentadilla)
let degreesExerciseRight = [];
let degreesExerciseLeft = [];
let lastExercise = '';
let timer;
let counter = 0;
let toggle;

// Requirements can be defined for each condition
let accomplishReq = [];
let req = [];


export function initExercise() {
	repetitionsCounter = 0;
	holdStatus = 0;
	successPercentage = [0, 0];
	posicioInici = true;
	posicioFinal = false;
	lastExercise = '';
	counter = 0;
	toggle = false;
}

// deprecated function
export function controlExerciseSingleCondition(results, exercise, minDuration) {

	// Init counter when changing exercise
	if (exercise.name !== lastExercise) repetitionsCounter = 0;
	lastExercise = exercise.name;

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
				holdStatus = 1;
			}
			else if (degreesExerciseRight.at(-1) >
				exercise.maxDegree && degreesExerciseLeft.at(-1) >
				exercise.maxDegree && posicioFinal) {
				posicioInici = true;
				posicioFinal = false;
				counter = 0;
				if (timer !== undefined) timer = clearInterval(timer);
				holdStatus = 0;
			} else {
				if (timer !== undefined) timer = clearInterval(timer);
				holdStatus = -1;
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
				holdStatus = 1;

			} else if (degreesExerciseRight.at(-1) <
				exercise.minDegree && degreesExerciseLeft.at(-1)
				< exercise.minDegree && posicioFinal) {
				posicioInici = true;
				posicioFinal = false;
				counter = 0;
				if (timer !== undefined) timer = clearInterval(timer);
				holdStatus = 0;
			} else {
				if (timer !== undefined) timer = clearInterval(timer);
				holdStatus = -1;
			}
		}
		// Success percentage
		if (exercise.refDegree !== undefined) {
			let maxDistance;
			if (exercise.change === "more2less") {
				maxDistance = Math.abs(exercise.maxDegree - exercise.refDegree);
			} else {
				maxDistance = Math.abs(exercise.refDegree - exercise.minDegree);
			}
			let success = 100 * ((maxDistance - Math.abs(exercise.refDegree - degreesExerciseRight.at(-1))) / maxDistance);
			if (success < 0) success = 0;
			successPercentage[0] = success;

			success = 100 * ((maxDistance - Math.abs(exercise.refDegree - degreesExerciseLeft.at(-1))) / maxDistance);
			if (success < 0) success = 0;
			successPercentage[1] = success;
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

export default function controlExercise(results, exercise, minDuration, difficulty) {

	// Init counter when changing exercise
	if (exercise.name !== lastExercise) repetitionsCounter = 0;
	lastExercise = exercise.name;

	let states = [];
	let successP = [];

	let mode;
	let space = exercise.space;
	let controlParams = [];

	if (typeof exercise.p !== "undefined") {
		// New definition (several conditions)
		mode = exercise.mode;
		controlParams = exercise.p;
	} else {
		// Old definition (one condition on both sides)
		mode = 'both';
		let e = {};
		e.kpDegrees = exercise.kpDegrees;
		e.minDegree = exercise.minDegree;
		e.maxDegree = exercise.maxDegree;
		e.refDegree = exercise.refDegree;
		e.change = exercise.change;
		e.side = '';
		controlParams.push(e);
	}

	stateByCondition = [];
	for (var i = 0; i < controlParams.length; i++) {
		var paramSet = controlParams[i];
		if (typeof accomplishReq[i] === "undefined") {
			if (typeof paramSet.requirement === "undefined") {
				accomplishReq[i] = true;
			} else {
				accomplishReq[i] = false;
			}
			req[i] = 0;
		}
		const [status, percentages] = controlExerciseDo(i, results, paramSet, mode, space, difficulty);
		stateByCondition.push(status);
		states.push(status);
		successP.push(percentages);
	}

	// Hold status
	states = states.flat().filter((el) => [0, 1, -1].includes(el));
	const equals = states.every(i => i == states[0]);
	if (equals && states[0] == 1) {
		holdStatus = 1;
	} else if (equals && states[0] == 0) {
		holdStatus = 0;
	} else {
		holdStatus = -1;
	}

	const hasSuccessed = successP.every(i => i != '');
	if (hasSuccessed) {
		// Mean of all conditions
		var successLeft = [];
		var successRight = [];
		for (var i = 0; i < successP.length; i++) {
			if (mode == 'alternate') {
				var side = getConditionSide(mode, exercise.p[i].side);
				if (side == 0) {
					successRight.push(successP[i][side]);
				} else {
					successLeft.push(successP[i][side]);
				}
			} else {
				successLeft.push(successP[i][1]);
				successRight.push(successP[i][0]);
			}
		}
		const averageLeft = average(successLeft);
		const averageRight = average(successRight);
		// Success percentage
		if (mode == 'left') {
			successPercentage = [averageLeft, ''];
		} else if (mode == 'right') {
			successPercentage = ['', averageRight];
		} else {
			successPercentage = [averageLeft, averageRight];
		}
	}

	// Count repetition
	if (holdStatus == 1) {
		// final position
		if (counter >= minDuration) {
			posicioInici = false;
			posicioFinal = true;
			repetitionsCounter += 1;
			if (mode == 'alternate') toggle = !toggle;
		}
		if (timer === undefined) timer = setInterval(() => counter = counter + 1, 1000);
	} else if (holdStatus == 0) {
		// initial position
		posicioInici = true;
		posicioFinal = false;
		counter = 0;
		if (timer !== undefined) timer = clearInterval(timer);
	} else {
		if (timer !== undefined) timer = clearInterval(timer);
	}

	// current side
	if (mode != 'alternate') {
		currentSide = mode;
	} else {
		currentSide = toggle ? "left" : "right";
	}
	return 0;
}

const controlExerciseDo = (condition, results, params, mode, space, difficulty) => {
	let status = [];
	let percentages = [];
	let angle;

	let kps;
	if (mode != 'both') {
		var i = getConditionSide(mode, params.side);
		kps = params.kpDegrees[i].flat();
	} else {
		kps = params.kpDegrees.flat();
	}
	const isAboveThreshold = (currentValue) =>
		results.keypoints3D[currentValue].score > 0.5;
	let valid = kps.every(isAboveThreshold);

	// Check feet keypoint
	var index = kps.indexOf(27);
	if (!valid && index > -1 && results.keypoints3D[27].score < 0.5) {
		if (results.keypoints3D[29].score < 0.5) {
			valid = kps.every(isAboveThreshold);
		} else if (results.keypoints3D[31].score < 0.5) {
			valid = kps.every(isAboveThreshold);
		}
	}
	index = kps.indexOf(28);
	if (!valid && index > -1 && results.keypoints3D[28].score < 0.5) {
		if (results.keypoints3D[30].score < 0.5) {
			valid = kps.every(isAboveThreshold);
		} else if (results.keypoints3D[32].score < 0.5) {
			valid = kps.every(isAboveThreshold);
		}
	}

	let side = [0, 1]; // right, left
	if (valid) {
		var angles = [];
		side.forEach(i => {
			kps = params.kpDegrees[i];
			if ((mode == 'left' && i == 0) || (mode == 'right' && i == 1)) {
				angles.push(0);
			} else {
				if (typeof (params.projPlanes) !== 'undefined') {
					angles.push(getAngle(kps, results, space, params.projPlanes[i]));
				} else {
					angles.push(getAngle(kps, results, space));
				}
			}
		});

		if (mode != 'both') {
			var i = getConditionSide(mode, params.side);
			angle = angles[i];
		}

		// Difficulty level
		const [minDegree, maxDegree] = setDifficultyLevel(params.minDegree, params.maxDegree, params.change, difficulty);

		// statusByCondition
		side.forEach(i => {
			if (posicioInici && accomplishReq[condition] && (
				(params.change == 'less2more' && angle > maxDegree && mode != 'both') ||
				(params.change == 'less2more' && angles[i] > maxDegree && mode == 'both') ||
				(params.change == 'more2less' && angle < minDegree && mode != 'both') ||
				(params.change == 'more2less' && angles[i] < minDegree && mode == 'both'))) {
				status.push(1);
			} else if (posicioFinal && (
				(params.change == 'more2less' && angle > maxDegree && mode != 'both') ||
				(params.change == 'more2less' && angles[i] > maxDegree && mode == 'both') ||
				(params.change == 'less2more' && angle < minDegree && mode != 'both') ||
				(params.change == 'less2more' && angles[i] < minDegree && mode == 'both'))) {
				status.push(0);
				if (typeof params.requirement !== "undefined") accomplishReq[condition] = false;
			} else if ((mode == 'right' && i == 1) || (mode == 'left' && i == 0)) {
				status.push("");
			} else {
				status.push(-1);
			}
		});

		// Check additional requirements
		if (typeof params.requirement !== "undefined" && !accomplishReq[condition] && posicioInici) {
			for (var i = 0; i < params.requirement.length; i++) {
				var reqAngle = params.requirement[condition].reqDegrees;
				var tolerance = 5;
				if ((angle >= (reqAngle - tolerance) && angle <= (reqAngle + tolerance) && mode != 'both') ||
					(angles[0] >= (reqAngle - tolerance) && angles[0] <= (reqAngle + tolerance) && mode == 'both') ||
					(angles[1] >= (reqAngle - tolerance) && angles[1] <= (reqAngle + tolerance) && mode == 'both')) {
					var accomplish = [];
					side.forEach(i => {
						var kps = params.requirement[condition].kpDegrees[i];
						if (kps.length > 0) {
							var a;
							if (typeof (params.requirement[condition].projPlanes) !== 'undefined') {
								a = getAngle(kps, results, space, params.requirement[condition].projPlanes[i]);
							} else {
								a = getAngle(kps, results, space);
							}
							var cnd = a + ' ' + params.requirement[condition].condition;
							var res = eval(cnd);
							if (res) {
								accomplish[i] = true;
							} else {
								accomplish[i] = false;
							}
						} else {
							accomplish[i] = true;
						}
					});
					// Condition accomplished in both sides
					const equals = accomplish.every(i => i == accomplish[0]);
					if (equals && accomplish[0]) { req[condition] = req[condition] + 1; }
					if (params.requirement.length == req[condition]) {
						accomplishReq[condition] = true;
						req[condition] = 0;
					}
				}
			}
		}
		// Success percentage
		if (params.refDegree !== undefined) {
			side.forEach(i => {
				if ((mode == 'left' && i == 0) || (mode == 'right' && i == 1)) {
					percentages.push(0);
				} else {
					if (params.refDegree == 0) params.refDegree = 1;
					let success = 100 * ((params.refDegree - Math.abs(params.refDegree - angles[i])) / params.refDegree);
					if (success < 0) success = 0;
					percentages.push(success);
				}
			});
		}
	} else {
		side.forEach(i => {
			if ((mode == 'right' && i == 1) || (mode == 'left' && i == 0)) {
				status.push("");
			} else {
				status.push(-1);
			}
		});
	}
	return [status, percentages, angles];
}

const setDifficultyLevel = (minDegree, maxDegree, change, difficulty) => {
	// Only apply to the exercise final position accuracy
	// difficulty:
	// 1: low
	// 2: normal (default)
	// 3: high
	if (difficulty !== 2) {
		if (change === 'less2more') {
			if (difficulty === 1) {
				maxDegree = maxDegree - 15;
			} else if (difficulty === 3) {
				maxDegree = maxDegree + 5;
			}
		} else {
			if (difficulty === 1) {
				minDegree = minDegree + 15;
			} else if (difficulty === 3) {
				minDegree = minDegree - 5;
			}
		}
	}
	return [minDegree, maxDegree];
}

const average = (elmt) => {
	var sum = 0;
	for (var i = 0; i < elmt.length; i++) {
		sum += elmt[i];
	}
	var avg = sum / elmt.length;
	return avg;
}

const getAngle = (kps, results, space, projPlanes = "") => {

	var angle;
	var points = [];
	var plane = "";
	if (kps.length > 0) {
		let i = 0;
		kps.forEach(element => {
			if (projPlanes.length > 1) {
				plane = projPlanes[i];
				i++;
			}
			let point = {
				x: results.keypoints3D[element].x,
				y: results.keypoints3D[element].y,
				z: results.keypoints3D[element].z
			};
			if (plane === 'YZ') {
				// YZ-projection
				const surface = { A: 1, B: 0, C: 0, D: -1 }
				point = calculateProjection(point, surface);
			} else if (plane === 'XZ') {
				// XZ-projection
				const surface = { A: 0, B: 1, C: 0, D: -1 }
				point = calculateProjection(point, surface);
			} else if (plane === 'XY') {
				// XY-projection
				const surface = { A: 0, B: 0, C: 1, D: 1 }
				point = calculateProjection(point, surface);
			}
			points.push(point);
		});
		if (space === "3D") {
			angle = find_angle3D(points[0], points[1], points[2]);
		} else if (space === "2D") {
			angle = find_angle(points[0], points[1], points[2]);
		}
	}
	return angle;
}

const calculateProjection = (point, surface) => {
	// Plane equation: Ax + By + Cz + D = 0
	const { x: px, y: py, z: pz } = point;
	const { A, B, C, D } = surface;

	// Calculate the distance from the point to the surface
	const distance = (A * px + B * py + C * pz + D) / Math.sqrt(A * A + B * B + C * C);

	// Calculate the coordinates of the projection point
	const projectionX = px - A * distance;
	const projectionY = py - B * distance;
	const projectionZ = pz - C * distance;

	return { x: projectionX, y: projectionY, z: projectionZ };
}

const getConditionSide = (mode, side) => {
	let i;
	switch (mode) {
		case 'alternate':
			if (toggle) {
				i = (side === undefined || side === 'right') ? 1 : 0; // left : right
			} else {
				i = (side === undefined || side === 'right') ? 0 : 1; // right : left
			}
			break;
		case 'individual':
			i = (side !== undefined && side === 'right') ? 0 : 1; // right : left
			break;
		case 'left':
			i = 1; // left
			break;
		case 'right':
			i = 0; // right
			break;
		default:
			i = 1; // left
			break;
	}
	return i;
}
