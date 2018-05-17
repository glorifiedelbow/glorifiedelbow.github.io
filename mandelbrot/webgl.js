// Compile and link shaders and create program

function createShader(gl, type, source){
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
		
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		alert("Error: failed to create shader. Check the console for more information.");
}

function createProgram(gl, vertexShader, fragmentShader){
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
	
	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
	alert("Error: failed to create program. Check the console for more information.");
}

// WebGL setup
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl");
if (!gl){
	var gl = canvas.getContext("experimental-webgl");
	console.log("WebGL not supported, falling back on experimental WebGL.");
}
if (!gl){
	console.log("Experimental WebGL not supported.");
	alert("Your browser does not support WebGL.");
}

// Create shaders and program
var vertexShaderSource = document.getElementById("vertexshader").text;
var fragmentShaderSource = document.getElementById("fragmentshader").text;

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

var program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// Set up position buffer
var drawScreen = new Float32Array([
	-1, -1, 
	1, -1, 
	1, 1, 
	1, 1, 
	-1, 1, 
	-1, -1]);
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, drawScreen, gl.STATIC_DRAW);

// Set up position attribute in vertex shader
var a_positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(a_positionLocation);
gl.vertexAttribPointer(a_positionLocation, 2, gl.FLOAT, false, 0, 0);

// Set up uniforms in fragment shader
var u_resolution_location = gl.getUniformLocation(program, "u_resolution");
var u_clip_location = gl.getUniformLocation(program, "u_clip");
var u_zoomCenter_location = gl.getUniformLocation(program, "u_zoomCenter");
var u_zoom_location = gl.getUniformLocation(program, "u_zoom");
var u_iterations_location = gl.getUniformLocation(program, "u_iterations");
var u_colorDiversity_location = gl.getUniformLocation(program, "u_colorDiversity");

// Set up some global variables
var zoom, offsetX, offsetY, iterations, colorDiversity, w, h, square;
var page_zoom = document.getElementById("page_zoom");
var page_offsetX = document.getElementById("page_offsetX");
var page_offsetY = document.getElementById("page_offsetY");
var page_iterations = document.getElementById("page_iterations");
var page_colorDiversity = document.getElementById("page_colorDiversity");

// Get input data
function getInputData(clicked){
	// Get information on screen resolution
	w = document.body.clientWidth;
	h = document.body.clientHeight;
	if (w > h) square = w;
	else square = h;
	
	// Get user input
	if (!clicked){
		zoom = parseFloat(page_zoom.value);
		offsetX = parseFloat(page_offsetX.value);
		offsetY = parseFloat(page_offsetY.value);
	}
	iterations = parseFloat(page_iterations.value);
	colorDiversity = parseFloat(page_colorDiversity.value);
}
	
// Draw the fractal
function drawFractal(){
	// Set uniforms
	gl.uniform2f(u_zoomCenter_location, offsetX, offsetY);
	gl.uniform1f(u_zoom_location, zoom);
	gl.uniform1i(u_iterations_location, iterations);
	gl.uniform1f(u_colorDiversity_location, colorDiversity);
	gl.uniform2f(u_resolution_location, w, h);

	// Calculate the portion of the fractal to be clipped
	gl.uniform2f(u_clip_location, 2 * w/square, 2 * h/square);

	// Set up WebGL window
	canvas.width = w;
	canvas.height = h;
	gl.viewport(0, 0, w, h);

	// Draw fractal
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// Get mouse position
function getMousePos(event) {
    return [(event.clientX - w/2) * 4/square, (event.clientY - h/2) * 4/square];
}

// Reset function
function resetPage(){
	page_zoom.value = 1;
	page_offsetX.value = 0;
	page_offsetY.value = 0;
	page_iterations.value = 5000;
	page_colorDiversity.value = 0.005;
	
	getInputData(false);
	drawFractal();
}

// Redraw fractal
function updateFractal(event, clicked){
	getInputData(clicked);
	
	if (clicked){
		var mousePos = getMousePos(event);
		offsetX += mousePos[0] / zoom;
		offsetY -= mousePos[1] / zoom;
		zoom *= 2;
	}
	
	drawFractal();
	
	page_offsetX.value = offsetX;
	page_offsetY.value = offsetY;
	page_zoom.value = zoom;
}
		

// Draw fractal when page loads
resetPage();













	