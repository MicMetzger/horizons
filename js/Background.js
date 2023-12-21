import BirdGeometry from './BirdGeometry.js';
import {
		ATTRACTION_FACTOR,
		CAMERA_FOV,
		CAMERA_INITIAL_POSITION,
		CAMERA_POSITION,
		COHESION_FACTOR,
		CORE_STATE,
		DISTANCING_FACTOR,
		HORIZON_INCLINATION_SPEED,
		HORIZON_INITIAL_INCILNATION,
		HORIZON_TARGET_INCLINATION,
		P_INITIAL_POSITION_RANGE,
		P_INITIAL_VELOCITY,
		P_MAX_VELOCITY,
		P_SCALE,
		P_TURN_ACCELERATION,
		P_VISUAL_RANGE,
		PS_COUNT,
		X_BOUNDARY,
		Y_BOUNDARY,
		Z_BOUNDARY,
} from './Constants.js';
import * as THREE from "./node_modules/three/build/three.module.js";
import { GPUComputationRenderer } from './node_modules/three/examples/jsm/misc/GPUComputationRenderer.js';
import { Sky } from './node_modules/three/examples/jsm/objects/Sky.js';
import { WEBGL } from './node_modules/three/examples/jsm/WebGL.js';
import { onWindowResize, resetVector } from './Updaters.js';




function animate() {
		pSystemGeometry.vertices.map( v => {
				updateVelocityGroupAttraction( v, P_VISUAL_RANGE );
				updateVelocityGroupDistancing( v, P_VISUAL_RANGE );
				updateVelocityGroupCohesion( v );
				updateVelocityLimit( v, P_MAX_VELOCITY );
				updateVelocityPositionBoundary( v, P_TURN_ACCELERATION );

				v.add( v.velocity );
		} );
		pSystemGeometry.verticesNeedUpdate = true;


		// bSystemGeometry.vertices.map(v => {
		//   updateVelocityGroupAttraction(v, B_VISUAL_RANGE);
		//   updateVelocityGroupDistancing(v, B_VISUAL_RANGE);
		//   updateVelocityGroupCohesion(v, B_VISUAL_RANGE);
		//   updateVelocityLimit(v, B_MAX_VELOCITY);
		//   updateVelocityPositionBoundary(v, B_TURN_ACCELERATION);
		//
		//   v.add(v.velocity);
		// });
		// bSystemGeometry.verticesNeedUpdate = true;

		updatePositionBoundary( camera );
		updateHorizonPosition();

		renderer.render( scene, camera );
		requestAnimationFrame( animate );
};


function createRenderer() {
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.getElementById( "scene" ).appendChild( renderer.domElement );
}


function createScene() {
		scene            = new THREE.Scene();
		scene.background = new THREE.Color( 0x0f0f0f );
}


function createCamera() {
		camera            = new THREE.PerspectiveCamera(
				CAMERA_FOV,
				window.innerWidth / window.innerHeight,
				0.1,
				1000,
		);
		camera.position.z = CAMERA_INITIAL_POSITION;

		cameraBoundarySphere = new THREE.Sphere( new THREE.Vector3(), CAMERA_POSITION );

}


function createSkyBox() {
		sky = new Sky();
		sky.scale.setScalar( 1000 );
		scene.add( sky );

		horizonSphere = new THREE.Mesh( new THREE.SphereBufferGeometry( 1000, 32, 16 ), new THREE.MeshBasicMaterial( { color: 0xffffff, } ) );
		scene.add( horizonSphere );

		var uniforms                   = sky.material.uniforms;
		uniforms.turbidity.value       = horizonConfig.turbidity;
		uniforms.rayleigh.value        = horizonConfig.ray;
		uniforms.mieCoefficient.value  = horizonConfig.Coefficient;
		uniforms.mieDirectionalG.value = horizonConfig.DirectionalGradient;
		uniforms.luminance.value       = horizonConfig.luminance;

		updateHorizonPosition();
}


function createBirds() {
		const bGeometry = new BirdGeometry();

		birdUniforms = {
				'color'          : { value: new THREE.Color( 0xff2200 ) },
				'texturePosition': { value: null },
				'textureVelocity': { value: null },
				'time'           : { value: 1.0 },
				'delta'          : { value: 0.0 }
		};

		let bMaterial = new THREE.ShaderMaterial( {
				uniforms      : birdUniforms,
				vertexShader  : document.getElementById( 'birdVS' ).textContent,
				fragmentShader: document.getElementById( 'birdFS' ).textContent,
				side          : THREE.DoubleSide

		} );

		const birdMesh            = new THREE.Mesh( bGeometry, bMaterial );
		birdMesh.rotation.y       = Math.PI / 2;
		birdMesh.matrixAutoUpdate = false;
		birdMesh.updateMatrix();

		scene.add( birdMesh );

}


function createParticles() {
		pSystemGeometry = new THREE.Geometry();
		let pMaterial   = new THREE.PointsMaterial( {
				color          : 0x000000,
				size           : P_SCALE,
				map            : new THREE.TextureLoader().load( './textures/sprites/softAura.png' ),
				sizeAttenuation: true,
				alphaTest      : 0.5,
				transparent    : true,
		} );

		for ( let p = 0; p < PS_COUNT; p++ ) {
				const p = new THREE.Vector3(
						Math.random() * 2 * P_INITIAL_POSITION_RANGE - P_INITIAL_POSITION_RANGE,
						Math.random() * 2 * P_INITIAL_POSITION_RANGE - P_INITIAL_POSITION_RANGE,
						Math.random() * 2 * P_INITIAL_POSITION_RANGE - P_INITIAL_POSITION_RANGE,
				);

				p.velocity = new THREE.Vector3(
						Math.random() * 2 * P_INITIAL_VELOCITY - P_INITIAL_VELOCITY,
						Math.random() * 2 * P_INITIAL_VELOCITY - P_INITIAL_VELOCITY,
						Math.random() * 2 * P_INITIAL_VELOCITY - P_INITIAL_VELOCITY,
				);

				pSystemGeometry.vertices.push( p );
		}

		let pSystem = new THREE.Points(
				pSystemGeometry,
				pMaterial
		);

		scene.add( pSystem );
}


function updateVelocityGroupAttraction( v, range ) {
		let visualCenter = inPlaceVector;
		resetVector( visualCenter );
		let numNeighbors = 0;

		for ( let otherParticle of pSystemGeometry.vertices ) {
				if ( v.distanceTo( otherParticle ) < range ) {
						visualCenter.add( otherParticle );
						numNeighbors += 1;
				}
		}

		if ( numNeighbors ) {
				visualCenter.divideScalar( numNeighbors );
				v.velocity.add( visualCenter
						.sub( v )
						.multiplyScalar( ATTRACTION_FACTOR )
				);
		}
}


function updateVelocityGroupDistancing( v, range ) {
		let moveX = 0;
		let moveY = 0;
		let moveZ = 0;
		for ( let otherVertice of pSystemGeometry.vertices ) {
				if ( otherVertice !== v ) {
						if ( v.distanceTo( otherVertice ) < range ) {
								moveX += v.x - otherVertice.x;
								moveY += v.y - otherVertice.y;
								moveZ += v.z - otherVertice.z;
						}
				}
		}
		v.velocity.x += moveX * DISTANCING_FACTOR;
		v.velocity.y += moveY * DISTANCING_FACTOR;
		v.velocity.z += moveZ * DISTANCING_FACTOR;
}


function updateVelocityGroupCohesion( v, range ) {
		let avgVelocity = inPlaceVector;
		resetVector( avgVelocity );
		let numNeighbors = 0;

		for ( let otherParticle of pSystemGeometry.vertices ) {
				if ( v.distanceTo( otherParticle ) < range ) {
						avgVelocity.add( otherParticle.velocity );
						numNeighbors += 1;
				}
		}

		if ( numNeighbors ) {
				avgVelocity.divideScalar( numNeighbors );
				const velocityDelta = avgVelocity.sub( v.velocity );
				v.velocity.add(
						velocityDelta.multiplyScalar( COHESION_FACTOR )
				);
		}
}


const updateVelocityLimit = ( v, max ) => {
		if ( v.velocity.length() > max ) {
				v.velocity = v.velocity.normalize().multiplyScalar( max );
		}
}


const updateVelocityPositionBoundary = ( v, acceleration ) => {
		updateVelocityPositionBoundaryOnDimension( v, 'x', X_BOUNDARY, acceleration );
		updateVelocityPositionBoundaryOnDimension( v, 'y', Y_BOUNDARY, acceleration );
		updateVelocityPositionBoundaryOnDimension( v, 'z', Z_BOUNDARY, acceleration );
}


const updateVelocityPositionBoundaryOnDimension = ( v, dimension, boundary, acceleration ) => {
		if ( v[ dimension ] > boundary ) {
				v.velocity[ dimension ] -= acceleration;
		} else if ( v[ dimension ] < -1 * boundary ) {
				v.velocity[ dimension ] += acceleration;
		}
}


const updatePositionBoundary = ( camera ) => {
		cameraBoundarySphere.clampPoint( camera.position, camera.position );
}


// Sun
function updateHorizonPosition() {
		const musicPosition = document.getElementById( 'audioplayer' ).currentTime;
		let uniforms        = sky.material.uniforms;
		// console.log(musicPosition);



		// if ( CORE_STATE.isPlaying ) {
				// if (musicPosition > horizonAscensionTimer(CORE_STATE.song_number)) {
				if ( musicPosition > 0 ) {
						if ( horizonConfig.inclination >= horizonConfig.targetInclination ) {
								horizonConfig.inclination -= HORIZON_INCLINATION_SPEED;
								// horizonConfig.azimuth -= HORIZON_INCLINATION_SPEED;
						}

						if ( horizonSphere.position.y >= horizonConfig.targetY ) {
								CORE_STATE.isHorizonAscension = true;
								checkState();
						}

						let theta                = Math.PI * ( horizonConfig.inclination - 0.5 ); 
						let phi                  = 2 * Math.PI * ( horizonConfig.azimuth - 0.5 );
						horizonSphere.position.x = horizonConfig.distance * Math.cos( phi );
						horizonSphere.position.y = horizonConfig.distance * Math.sin( phi ) * Math.sin( theta );
						horizonSphere.position.z = horizonConfig.distance * Math.sin( phi ) * Math.cos( theta );
						console.log(horizonSphere.position);

						uniforms.sunPosition.value.copy( horizonSphere.position );
				}
		// }
}


const valuesChanger = function () {

		velocityUniforms[ 'separationDistance' ].value = effectController.separation;
		velocityUniforms[ 'alignmentDistance' ].value  = effectController.alignment;
		velocityUniforms[ 'cohesionDistance' ].value   = effectController.cohesion;
		velocityUniforms[ 'freedomFactor' ].value      = effectController.freedom;

};



function fillPositionTexture( texture ) {

		const theArray = texture.image.data;

		for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

				const x = Math.random() * BOUNDS - BOUNDS_HALF;
				const y = Math.random() * BOUNDS - BOUNDS_HALF;
				const z = Math.random() * BOUNDS - BOUNDS_HALF;

				theArray[ k ]     = x;
				theArray[ k + 1 ] = y;
				theArray[ k + 2 ] = z;
				theArray[ k + 3 ] = 1;

		}

}


function fillVelocityTexture( texture ) {

		const theArray = texture.image.data;

		for ( let k = 0, kl = theArray.length; k < kl; k += 4 ) {

				const x = Math.random() - 0.5;
				const y = Math.random() - 0.5;
				const z = Math.random() - 0.5;

				theArray[ k ]     = x * 10;
				theArray[ k + 1 ] = y * 10;
				theArray[ k + 2 ] = z * 10;
				theArray[ k + 3 ] = 1;

		}

}


function createMouseDecorator() {
		const geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
		const material = new THREE.MeshBasicMaterial( {
				color: '#FA7100'
		} );

		mouseDecorator = new THREE.Mesh( geometry, material );
		scene.add( mouseDecorator );
}


function onMouseMove( event ) {
		mouseDecorator.position.x = event.clientX;
		mouseDecorator.position.y = event.clientY;

		const x   = ( event.clientX / window.innerWidth ) * 2 - 1;
		const y   = -( event.clientY / window.innerHeight ) * 2 + 1;
		const z   = 0.5;
		const pos = new THREE.Vector3( x, y, z );
		pos.unproject( camera );
		const dir      = pos.sub( camera.position ).normalize();
		const distance = -camera.position.z / dir.z;
		const pos2     = camera.position.clone().add( dir.multiplyScalar( distance ) );
		mouseDecorator.position.copy( pos2 );
}


function render() {

		const now = performance.now();
		let delta = ( now - last ) / 1000;

		if ( delta > 1 ) {
				delta = 1;
		} // safety cap on large deltas
		last = now;

		positionUniforms[ 'time' ].value  = now;
		positionUniforms[ 'delta' ].value = delta;
		velocityUniforms[ 'time' ].value  = now;
		velocityUniforms[ 'delta' ].value = delta;
		birdUniforms[ 'time' ].value      = now;
		birdUniforms[ 'delta' ].value     = delta;

		velocityUniforms[ 'predator' ].value.set( 0.5 * mouseX / windowHalfX, -0.5 * mouseY / windowHalfY, 0 );

		mouseX = 10000;
		mouseY = 10000;

		gpuCompute.compute();

		birdUniforms[ 'texturePosition' ].value = renderer.getCurrentRenderTarget( positionVariable ).texture;
		birdUniforms[ 'textureVelocity' ].value = renderer.getCurrentRenderTarget( velocityVariable ).texture;


}


function initComputeRenderer() {

		gpuCompute = new GPUComputationRenderer( 32, 32, renderer );

		const dtPosition = gpuCompute.createTexture();
		const dtVelocity = gpuCompute.createTexture();
		fillPositionTexture( dtPosition );
		fillVelocityTexture( dtVelocity );

		velocityVariable = gpuCompute.addVariable( 'textureVelocity', document.getElementById( 'fragmentShaderVelocity' ).textContent, dtVelocity );
		positionVariable = gpuCompute.addVariable( 'texturePosition', document.getElementById( 'fragmentShaderPosition' ).textContent, dtPosition );

		gpuCompute.setVariableDependencies( velocityVariable, [ positionVariable, velocityVariable ] );
		gpuCompute.setVariableDependencies( positionVariable, [ positionVariable, velocityVariable ] );

		positionUniforms = positionVariable.material.uniforms;
		velocityUniforms = velocityVariable.material.uniforms;

		positionUniforms[ 'time' ]               = { value: 0.0 };
		positionUniforms[ 'delta' ]              = { value: 0.0 };
		velocityUniforms[ 'time' ]               = { value: 1.0 };
		velocityUniforms[ 'delta' ]              = { value: 0.0 };
		velocityUniforms[ 'testing' ]            = { value: 1.0 };
		velocityUniforms[ 'separationDistance' ] = { value: 1.0 };
		velocityUniforms[ 'alignmentDistance' ]  = { value: 1.0 };
		velocityUniforms[ 'cohesionDistance' ]   = { value: 1.0 };
		velocityUniforms[ 'freedomFactor' ]      = { value: 1.0 };
		velocityUniforms[ 'predator' ]           = { value: new THREE.Vector3() };
		velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed( 2 );

		velocityVariable.wrapS = THREE.RepeatWrapping;
		velocityVariable.wrapT = THREE.RepeatWrapping;
		positionVariable.wrapS = THREE.RepeatWrapping;
		positionVariable.wrapT = THREE.RepeatWrapping;

		const error = gpuCompute.init();

		if ( error !== null ) {

				console.error( error );

		}

}


function init() {
		createRenderer();
		createScene();
		createCamera();
		createSkyBox();
		createBirds();
		createParticles();
		// createMouseDecorator();
		CyclePhaseOfDay = "Night";

		initComputeRenderer();


		window.addEventListener( 'resize', () => onWindowResize( camera, renderer ), false );
		// window.addEventListener('mousemove', onMouseMove, false);
}


let mouseDecorator       = null;
let cameraControls       = null;
let cameraBoundarySphere = null;
let pSystemGeometry      = null;
let bSystemGeometry      = null;
let scene                = null;
let renderer             = null;
let camera               = null;
let mouseX               = 0, mouseY = 0;
let windowHalfX          = window.innerWidth / 2;
let windowHalfY          = window.innerHeight / 2;
const BOUNDS             = 800, BOUNDS_HALF = BOUNDS / 2;

let sky                = null;
let horizonSphere      = null;
let birdUniforms       = null;
let horizonConfig      = {
		turbidity          : 10,
		ray                : 2,
		Coefficient        : 0.005,
		DirectionalGradient: 0.8,
		luminance          : 1,
		inclination        : HORIZON_INITIAL_INCILNATION,
		targetInclination  : HORIZON_TARGET_INCLINATION,
		azimuth            : 0.25,
		distance           : 40000,
};
const effectController = {
		separation: 20.0,
		alignment : 20.0,
		cohesion  : 20.0,
		freedom   : 0.75
};


let vUniforms;
let CyclePhaseOfDay = "";
let inPlaceVector   = new THREE.Vector3();
let last            = performance.now();

let gpuCompute;
let velocityVariable;
let positionVariable;
let positionUniforms;
let velocityUniforms;

if ( WEBGL.isWebGLAvailable() ) {
		init();
		animate();
} else {
		let warning = WEBGL.getWebGLErrorMessage();
		document.body.appendChild( warning );
}
