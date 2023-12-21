const INFINITY = 999999999999;


export const CORE_GET_SONG_NAME = ( number ) => {
		switch (number) {
				case 1:
						return "Portico Quartet - Winding Snake";
				case 2:
						return "Hania Rani - Glass";
				case 3:
						return "Hania Rani - Time";
				default:
						return "none";
		}
};


export const horizonAscensionTimer = ( song_number ) => {
		switch (song_number) {
				case 1:
						return 120;
				case 2:
						return 120;
				case 3:
						return 120;
				default:
						return INFINITY;

		}
};


/** ---------------------------------------------- **/
const PS_COUNT                 = 1000;
const P_SCALE                  = 0.4;
const P_INITIAL_POSITION_RANGE = 1.5;
const P_VISUAL_RANGE           = 2.0;
const P_INITIAL_VELOCITY       = 0.45;
const P_MAX_VELOCITY           = 0.405;
const P_TURN_ACCELERATION      = 0.040;
const B_COUNT                  = 1500;
const B_SCALE                  = 1;
const B_INITIAL_POSITION_RANGE = 1;
const B_INITIAL_VELOCITY_RANGE = 0.61;
const B_MAX_VELOCITY           = 0.705;
const B_TURN_ACCELERATION      = 0.082;
const B_VISUAL_RANGE           = 2.0;
const B_ATTRACTION_FACTOR      = 0.1;
const ATTRACTION_FACTOR        = 0.1;
const COHESION_FACTOR          = 0.3;
const DISTANCING_FACTOR        = 0.1;
const MINIMUM_DISTANCE         = 1.25;
const X_BOUNDARY               = 14;
const Y_BOUNDARY               = 10;
const Z_BOUNDARY               = 10;
const CAMERA_NEAR              = 0.1;
const CAMERA_FOV               = 90;
const CAMERA_POSITION          = 15;
const CAMERA_INITIAL_POSITION  = 30;
// const HORIZON_INITIAL_INCILNATION = 0.56412;
// const HORIZON_INITIAL_INCILNATION = 0.505;	// Horizon
const HORIZON_INITIAL_INCILNATION = 0.59812;
// const HORIZON_INITIAL_INCILNATION = 0.60412;
const HORIZON_TARGET_INCLINATION  = 0.500;
const HORIZON_INCLINATION_SPEED   = 0.00001093;
// const HORIZON_INITIAL_INCILNATION = 0.56408;
// const HORIZON_TARGET_INCLINATION  = 0.500;
// const HORIZON_INCLINATION_SPEED = 0.00001203;
// const HORIZON_INITIAL_INCILNATION = 0.56405;
// const HORIZON_TARGET_INCLINATION  = 0.500;
// const HORIZON_INCLINATION_SPEED   = 0.00001023;
export const CORE_STATE = {
		isLoaded          : "false",
		isRunning         : "false",
		isPaused          : "false",
		isPlaying         : "false",
		song_number       : "0",
		song_name         : "none",
		isInitialized     : false,
		isHorizonAscension: false,
};
/** ---------------------------------------------- **/


export {
		PS_COUNT,
		P_SCALE,
		P_INITIAL_POSITION_RANGE,
		P_VISUAL_RANGE,
		P_INITIAL_VELOCITY,
		P_MAX_VELOCITY,
		P_TURN_ACCELERATION,
		B_COUNT,
		B_SCALE,
		B_INITIAL_POSITION_RANGE,
		B_INITIAL_VELOCITY_RANGE,
		B_MAX_VELOCITY,
		B_TURN_ACCELERATION,
		B_VISUAL_RANGE,
		B_ATTRACTION_FACTOR,
		ATTRACTION_FACTOR,
		COHESION_FACTOR,
		DISTANCING_FACTOR,
		MINIMUM_DISTANCE,
		X_BOUNDARY,
		Y_BOUNDARY,
		Z_BOUNDARY,
		CAMERA_NEAR,
		CAMERA_FOV,
		CAMERA_POSITION,
		CAMERA_INITIAL_POSITION,
		HORIZON_INITIAL_INCILNATION,
		HORIZON_TARGET_INCLINATION,
		HORIZON_INCLINATION_SPEED,
};
