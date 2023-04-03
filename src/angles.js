// Get angles in 2D and 3D

export function find_angle(A, B, C) {
	//A,B i C estan definides com: let A = {x:x1, y:y1}, B = {x:x2, y:y2}, C = {x:x3, y:y3}
	const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
	const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
	const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
	const angle_rad = Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
	return Math.round(angle_rad * 180 / 3.1416 * 100) / 100;  //Ho passem de radiants a degrees
}

export function find_angle3D(A, B, C) {
	//A,B i C estan definides com: let A = {x:x1, y:y1, z:z1}, B = {x:x2, y:y2, z:z2}, C = {x:x3, y:y3, z:z3}

	//Creem vector BA i BC
	const BA = { i: A.x - B.x, j: A.y - B.y, k: A.z - B.z }
	const BC = { i: C.x - B.x, j: C.y - B.y, k: C.z - B.z }
	//Apliquem la formula AB·BC = |AB|*|BC|*cos a
	const product_esc = BA.i * BC.i + BA.j * BC.j + BA.k * BC.k;
	const module_BA = Math.sqrt(Math.pow(BA.i, 2) + Math.pow(BA.j, 2) + Math.pow(BA.k, 2));
	const module_BC = Math.sqrt(Math.pow(BC.i, 2) + Math.pow(BC.j, 2) + Math.pow(BC.k, 2));

	const angle_rad = Math.acos(product_esc / module_BA / module_BC);
	return Math.round(angle_rad * 180 / 3.1416 * 100) / 100;
}

