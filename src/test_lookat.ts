import * as THREE from 'three';

const pos = new THREE.Vector3(0, 0, 5);
const target = new THREE.Vector3(0, 0, 0);

// Method 1: Matrix4.lookAt
const m1 = new THREE.Matrix4();
m1.lookAt(pos, target, new THREE.Vector3(0, 1, 0));
const q1 = new THREE.Quaternion().setFromRotationMatrix(m1);
const dir1 = new THREE.Vector3(0, 0, -1).applyQuaternion(q1);
console.log('Matrix4.lookAt direction (forward is -Z):', dir1.toArray());

// Method 2: Object3D.lookAt
const dummy = new THREE.Object3D();
dummy.position.copy(pos);
dummy.lookAt(target);
const q2 = dummy.quaternion;
const dir2 = new THREE.Vector3(0, 0, -1).applyQuaternion(q2);
console.log('Object3D.lookAt direction (forward is -Z):', dir2.toArray());
