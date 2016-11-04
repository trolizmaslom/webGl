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
