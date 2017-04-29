// Dimensions sizes
let xDim = 3;
let yDim = 3;
let zDim = 3;

const size = 5;
let speed = 1;

let paused = false;

// Camera auto navigator
let autoNav = false;

const axis = {
	X: 1,
	Y: 2,
	Z: 3,
};

/**
 * Rules for the next generation
 */
const gameRules = {
	XY: 'XY',
	XZ: 'XZ',
	YZ: 'YZ',
    thirdD: '3D',
};
let rulesUsed = [];

/**
 * Gets a random number
 * @param {Integer} min - Min number
 * @param {Integer} max - Max number
 * @return {Integer} the random number
 */
function rand(min, max) {
    return min + Math.random() * (max - min);
}

const oneFace = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

// WEBGL

let m4 = twgl.m4;
let CANVAS = document.getElementById('c');
let gl = twgl.getWebGLContext(CANVAS);
const ext = gl.getExtension('ANGLE_instanced_arrays');
if (!ext) {
   alert('need ANGLE_instanced_arrays');
}

let programInfo = twgl.createProgramInfo(gl, ['vs', 'fs']);
const offsetLoc = gl.getAttribLocation(programInfo.program, 'offset');
const onLoc = gl.getAttribLocation(programInfo.program, 'on');
const alphaLoc = gl.getAttribLocation(programInfo.program, 'alpha');


// Angles for camera rotation
let theta = 4;
let phi = 0;

let targetTimer = 0;
let targetChangeInterval = 3;
let color = [0, 0, 0];
let alpha = 1;

// Generate the cubes
let objects;
let myGame;

let gameSize;
let arrays, bufferInfo;

/**
 * Instantiate game logic and the cubes to be rendered
 * @param {Integer} xDimV        Size of x-dim
 * @param {Integer} yDimV        Size of y-dim
 * @param {Integer} zDimV        Size of z-dim
 * @param {any}     gameSelected Can be either a false or a map for a game
 */
function newGame (xDimV, yDimV, zDimV, gameSelected = false) {
    // No game to load
    if (!gameSelected) {
        xDim = xDimV;
        yDim = yDimV;
        zDim = zDimV;
    } else {
        xDim = gameSelected[0][0].length;
        yDim = gameSelected[0].length;
        zDim = gameSelected.length;
    }
    // gameSize = xDim * yDim * zDim;
    myGame = Object.create(game);
    myGame.consutructor(xDim, yDim, zDim, gameSelected);

    arrays = makeCells(size);
    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    requestAnimationFrame(render);
}

let then = 0;

/**
 * Renders the cubes
 * @param {Float} time Time since render start
 */
function render(time) {
    time *= 0.001;
    let elapsed = time - then;
    then = time;
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0, 0, 0, 1);

    targetTimer -= elapsed;

    const cellColor = [0, 0, 0];
    const fov = Math.PI * .25;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = .01;
    const zFar = 1000;
    const projection = m4.perspective(fov, aspect, zNear, zFar);

    const position = [cameraX, cameraY, cameraZ];
    let target = [cameraX, cameraY, 10];
    const up = [0, 1, 0];
    const camera = m4.lookAt(position, target, up);

    const view = m4.inverse(camera);
    let mat = m4.multiply(projection, view);
    mat = m4.rotateX(mat, phi);
    mat = m4.rotateY(mat, theta);

    const buf = arrays.on.data;
    const alph = arrays.alpha.data;
    if (targetTimer <= 0 && !paused) {
        targetTimer = targetChangeInterval / speed;
        let i = 0;
        // To the next generation
        if (rulesUsed.length > 0) {
            myGame.nextGen();
            setGameStatus();
            myGame.resetStatus();
            send(inGameAction.NAVIGATE);
        }
        for (let z = 0; z < myGame.zDim; z++) {
            for (let y = 0; y < myGame.yDim; y++) {
                for (let x = 0; x < myGame.xDim; x++) {
                    alph[i] = (myGame.get3DNeigh(z, y, x) / 26) * 255;
                    buf[i] = myGame.map[z][y][x] * 255;
                    i++;
                }
            }
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.alpha.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, alph, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.on.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buf, gl.DYNAMIC_DRAW);


    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    ext.vertexAttribDivisorANGLE(offsetLoc, 1);
    ext.vertexAttribDivisorANGLE(alphaLoc, 1);
    ext.vertexAttribDivisorANGLE(onLoc, 1);

    twgl.setUniforms(programInfo, {
        u_worldViewProjection: mat,
        u_color: cellColor,
    });

    ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 36, myGame.gameSize);
    twgl.drawBufferInfo(gl, bufferInfo);
    requestAnimationFrame(render);
}
newGame(xDim, yDim, zDim);



/**
 * Generates the position of the vertices for the cell
 * @param {Objct} arrays Used for webgl shaders
 */
function makeCell(arrays) {
    const positions = arrays.position;
    let vertOffset = 0;

    for (let f = 0; f < 6; ++f) {
        const axis = f / 2 | 0;
        const sign = f % 2 ? -1 : 1;
        const major = (axis + 1) % 3;
        const minor = (axis + 2) % 3;

    for (let i = 0; i < 6; ++i) {
        const offset3 = vertOffset * 3;
        positions[offset3 + axis] = sign;
        positions[offset3 + major] = oneFace[i][0];
        positions[offset3 + minor] = oneFace[i][1];
        ++vertOffset;
        }
    }
}

/**
 * Generates the set of cubes in form of an array of objects that contain
 * the attributes passed to the webGL shaders
 * @return {Array} array of cubes
 */
function makeCells() {
    const numCubes = myGame.gameSize;
    const arrays = {
        position: new Float32Array(36 * 3),
        offset: new Float32Array(numCubes * 3),
        on: {
        numComponents: 1,
        data: new Uint8Array(numCubes),
        normalized: false,
        },
        alpha: {
        numComponents: 1,
        data: new Uint8Array(numCubes),
        normalized: false,
        },
    };

    makeCell(arrays);

    let vertOffset = 0;
    for (let z = 0; z < myGame.zDim; z++) {
        const zoff = (z * 2);
        for (let y = 0; y < myGame.yDim; y++) {
            const yoff = (y * 2);
            for (let x = 0; x < myGame.xDim; x++) {
                const xoff = (x * 2);
                const offset3 = vertOffset * 3;
                arrays.offset[offset3 + 0] = xoff - (xDim - 1);
                arrays.offset[offset3 + 1] = yoff - (yDim - 1);
                arrays.offset[offset3 + 2] = zoff - (zDim - 1);
                vertOffset++;
            }
        }
    }
    return arrays;
}

// Mouse capturing events

let isFirefox = typeof InstallTrigger !== 'undefined';
// Scrolling sens
let sens = isFirefox ? 1 : 0.1;

// User is pressing
let drag = false;

let oldX;
let oldY;

let dX = 0;
let dY = 0;

let cameraSen = 0.1;
let cameraX = 0;
let cameraY = 0;
let cameraZ = 100;

let mouseDown = function(e) {
    autoNav = false;
    drag = true;
    oldX=e.clientX;
    oldY=e.clientY;
    e.preventDefault();
    return false;
};

let mouseUp = function(e) {
    drag=false;
};

let mouseMove = function(e) {
    if (!drag) {
        return false;
    }
    autoNav = false;
    dX = (e.clientX - oldX)*2*Math.PI/CANVAS.width,
    dY = (e.clientY - oldY)*2*Math.PI/CANVAS.height;
    theta += dX;
    phi += dY;
    oldX = e.clientX;
    oldY = e.clientY;
    send(inGameAction.NAVIGATE);
};

let wheel = function(e) {
    autoNav = false;
    let newCameraHeight = cameraZ + e.deltaY*sens;
    if (newCameraHeight <= 0) {
        console.log('Can\'t zoom in more than that');
        return;
    }
    cameraZ = newCameraHeight;
    send(inGameAction.NAVIGATE);
};
let keys = [];
let cameraXOld = cameraX;
let cameraYOld = cameraY;

/**
 * Updates the camera position in the X and Y axis
 */
function cameraMove() {
    if (keys[38] || keys[87]) {
        cameraY -= cameraSen;
    } if (keys[40] || keys[83]) {
        cameraY += cameraSen;
    } if (keys[39] || keys[68]) {
        cameraX -= cameraSen;
    } if (keys[37] || keys[65]) {
        cameraX += cameraSen;
    }
    if (cameraXOld != cameraX || cameraYOld != cameraY) {
        send(inGameAction.NAVIGATE);
    }
    cameraXOld = cameraX;
    cameraYOld = cameraY;
    setTimeout(cameraMove, 10);
}

let addKey = function(e) {
    keys[e.keyCode] = true;
};

let removeKey = function(e) {
    delete keys[e.keyCode];
};

CANVAS.addEventListener('mousedown', mouseDown, false);
CANVAS.addEventListener('wheel', wheel, false);
CANVAS.addEventListener('mouseup', mouseUp, false);
CANVAS.addEventListener('mouseout', mouseUp, false);
CANVAS.addEventListener('mousemove', mouseMove, false);
document.addEventListener('keydown', addKey, false);
document.addEventListener('keyup', removeKey, false);

cameraMove();
