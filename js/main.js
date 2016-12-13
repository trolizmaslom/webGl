window.onload = function() {
  var el = document.getElementById('render-area');
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 65, el.clientWidth/ el.clientHeight, 0.1, 10000 );

  var renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize( el.clientWidth, el.clientHeight );
  renderer.setClearColor( 0xFFFFFF );
  el.appendChild( renderer.domElement );

  camera.position.z = 190;

  var light = new THREE.DirectionalLight( 0xfcf9e8, 1 );
  scene.add(light);

  var ambiColor = "#cbc9bb";
  var ambientLight = new THREE.AmbientLight(ambiColor);
  scene.add(ambientLight);

  var manager = new THREE.LoadingManager();
  var loader  = new THREE.ImageLoader( manager );

  manager.onProgress = function ( item, loaded, total ) {

	};

  var textureBody = new THREE.Texture();
  var textureHead = new THREE.Texture();

  var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
  };

  var onError = function ( xhr ) { };

  loader.load( 'models/build01_texture.jpg', function ( image ) {
    textureBody.image = image;
    textureBody.needsUpdate = true;
  });



  var meshes ;

  var objLoader = new THREE.OBJLoader();

  objLoader.load( 'model/bb8.obj', function ( object ) {
    console.log(object);
    object.traverse( function ( child )
    {
      if ( child instanceof THREE.Mesh )
      {
        meshes=child;
      }
    });





    body.position.y = -80;


    body.rotation.y = Math.PI/3;




    head.material = new THREE.MeshPhongMaterial({map: textureHead, specular: 0xfceed2, bumpMap: mapHeightHead, bumpScale: 0.4, shininess: 25});
    body.material = new THREE.MeshPhongMaterial({map: textureBody, specular: 0xfceed2, bumpMap: mapHeightBody, bumpScale: 0.4, shininess: 25});

    console.log('head', head);


    scene.add(head);
    scene.add(body);
  }, onProgress, onError );

controls = new THREE.TrackballControls( camera, el );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

  var render = function () {
    requestAnimationFrame( render );
   controls.update();
  	renderer.render(scene, camera);
  };

  render();
  var projector, mouse = { x: 0, y: 0 };
  projector = new THREE.Projector();
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  function onDocumentMouseDown( event )
  {
    // the following line would stop any other event handler from firing
    // (such as the mouse's TrackballControls)
    // event.preventDefault();

    console.log("Click.");

    // update the mouse variable
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections

    // create a Ray with origin at the mouse position
    //   and direction into the scene (camera direction)
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
    projector.unprojectVector( vector, camera );
    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    // create an array containing all objects in the scene with which the ray intersects
    var intersects = ray.intersectObjects(meshes);

    // if there is one (or more) intersections
    if ( intersects.length > 0 )
    {

      console.log(intersects[0].object.name);
      console.log("Hit @ " + toString( intersects[0].point ) );
      // change the color of the closest face.
      intersects[ 0 ].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 );
      intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
    }

  }
};

/*
 Three.js "tutorials by example"
 Author: Lee Stemkoski
 Date: July 2013 (three.js v59dev)
 */

// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var cube;
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
var sprite1;
var canvas1, context1, texture1;

init();
animate();

// FUNCTIONS
function init()
{
  // SCENE
  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0,150,400);
  camera.lookAt(scene.position);
  // RENDERER
  if ( Detector.webgl )
    renderer = new THREE.WebGLRenderer( {antialias:true} );
  else
    renderer = new THREE.CanvasRenderer();
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById( 'ThreeJS' );
  container.appendChild( renderer.domElement );
  // EVENTS
  THREEx.WindowResize(renderer, camera);
  THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
  // CONTROLS
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  // STATS
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild( stats.domElement );
  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(0,250,0);
  scene.add(light);

  // SKYBOX/FOG
  var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
  var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
  var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
  scene.add(skyBox);

  ////////////
  // CUSTOM //
  ////////////

  var geometry = new THREE.SphereGeometry( 100, 4, 3 );
  geometry.mergeVertices();
  geometry.computeCentroids();
  var material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh( geometry, material );
  mesh.position.set(0,0,0);
  scene.add(mesh);

  for (var i = 0; i < geometry.vertices.length; i++)
  {
    var spritey = makeTextSprite( " " + i + " ", { fontsize: 32, backgroundColor: {r:255, g:100, b:100, a:1} } );
    spritey.position = geometry.vertices[i].clone().multiplyScalar(1.1);
    scene.add( spritey );
  }

  for (var i = 0; i < geometry.faces.length; i++)
  {
    var spritey = makeTextSprite( " " + i + " ", { fontsize: 32, backgroundColor: {r:100, g:100, b:255, a:1} } );
    spritey.position = geometry.faces[i].centroid.clone().multiplyScalar(1.1);
    scene.add( spritey );
  }

}

function makeTextSprite( message, parameters )
{
  if ( parameters === undefined ) parameters = {};

  var fontface = parameters.hasOwnProperty("fontface") ?
      parameters["fontface"] : "Arial";

  var fontsize = parameters.hasOwnProperty("fontsize") ?
      parameters["fontsize"] : 18;

  var borderThickness = parameters.hasOwnProperty("borderThickness") ?
      parameters["borderThickness"] : 4;

  var borderColor = parameters.hasOwnProperty("borderColor") ?
      parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

  var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
      parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

  

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;

  // get size data (height depends only on font size)
  var metrics = context.measureText( message );
  var textWidth = metrics.width;

  // background color
  context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
      + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
      + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  // text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText( message, borderThickness, fontsize + borderThickness);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas)
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial(
      { map: texture, useScreenCoordinates: false} );
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(100,50,1.0);
  return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r)
{
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function animate()
{
  requestAnimationFrame( animate );
  render();
  update();
}

function update()
{
  controls.update();
  stats.update();
}

function render()
{
  renderer.render( scene, camera );
}

