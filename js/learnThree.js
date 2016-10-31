var scene;
var camera;
var renderer;
var controls;

window.onload = function () {
    var viewport = document.getElementById('render-area');
    scene = new THREE.Scene();
    addCamera(viewport);
    addLight();
    try{
        renderer = new THREE.WebGLRenderer({ antialias:true });
    }catch(err){
        alert('У Вашего Браузера Отсутствует Поддержка WebGL!');
        try{
            renderer = new THREE.CanvasRenderer;
        }catch(err){
            alert('Установіть нормальный браузер, а це гівно просто Удаліть');
        }
    }
    renderer.setSize( viewport.clientWidth, viewport.clientHeight );
    renderer.setClearColor(0xFFFFff);
    viewport.appendChild( renderer.domElement );


    var geometry = new THREE.CubeGeometry(600, 600, 600, 3, 3, 3);
    var texture = new THREE.Texture();
    var manager = new THREE.LoadingManager();
    var loader  = new THREE.ImageLoader( manager );
    console.log(loader);
    loader.load('../model/minion.png', function (image) {
        texture.image = image;
        texture.needsUpdate = true;
    });
    texture.minFilter = THREE.LinearFilter;
    //var material = new THREE.MeshNormalMaterial({wireframe:true});
    var material = new THREE.MeshBasicMaterial({map:texture, overdraw: true});
    var sphere1 = new THREE.Mesh(geometry, material);
    sphere1.position.set(0, 20, 0);


    scene.add(sphere1);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(700, 0, 0));
    material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );
    line = new THREE.Line(geometry, material);
    scene.add(line);

    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 700, 0));
    material = new THREE.LineBasicMaterial( { color: 0x00ff00, linewidth: 2 } );
    line = new THREE.Line(geometry, material);
    scene.add(line);
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 700));
    material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 2 } );
    line = new THREE.Line(geometry, material);
    scene.add(line);
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(700, 700, 700));
    geometry.vertices.push(new THREE.Vector3(900, 700, 700));
    geometry.vertices.push(new THREE.Vector3(900, 900, 700));
    geometry.vertices.push(new THREE.Vector3(700, 900, 700));
    geometry.vertices.push(new THREE.Vector3(700, 700, 700));
    material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 2 } );
    line = new THREE.Line(geometry, material);
    scene.add(line);

    var prop = {
        rotY:Math.PI/500,
        rotX:Math.PI/500,
        rotZ:Math.PI/500
    };
    function clickbutton() {
        $('.buttn').click(function () {
            $(this).toggleClass('aaa');
            if($(this).hasClass('aaa')){
                prop.rotY = Math.PI/500;
                prop.rotZ = Math.PI/500;
                prop.rotX = Math.PI/500;
            }else {
                prop.rotY = 0;
                prop.rotZ = 0;
                prop.rotX = 0;
            }
        });
    }
    var render = function () {
        sphere1.rotation.y += prop.rotY;
        sphere1.rotation.x += prop.rotX;
        sphere1.rotation.z += prop.rotZ;
        requestAnimationFrame( render );
        controls.update();
        renderer.render(scene, camera);
    };
    render();
    clickbutton();
    function addLight(){
        var light = new THREE.DirectionalLight( '#ffffff' , 1 );
        light.position.set(0, 100, 100);
        scene.add(light);

        var ambiColor = "#cbc9bb";
        var ambientLight = new THREE.AmbientLight(ambiColor);
        scene.add(ambientLight);
    }

    function addCamera(viewport) {
        camera = new THREE.PerspectiveCamera( 45, viewport.clientWidth / viewport.clientHeight, 0.1, 10000 );
        controls = new THREE.TrackballControls( camera, viewport);
        controls.rotateSpeed = 2;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.staticMoving = true;
        camera.position.z = 1900;
    }



};