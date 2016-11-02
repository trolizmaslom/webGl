var scene;
var camera;
var renderer;
var controls;
var TUI;
var objects={

    camParam:{
        fov:45,//угол перспективы камеры в градусах
        posx:0,// позиция по X
        lastPosx:0,//относительная позиция по X
        posy:0,// позиция по Y
        lastPosy:0,//относительная позиция по Y
        posz:0,// позиция по Z
        lastPosz:0,//относительная позиция по Z
        lookAt:0,//
        angleZ:30,// угол высоты камеры относительно сцены в градусах
        roundMoveStep:1,// шаг поворота камеры в градусах
        zoomStep:12,//шаг зума камеры
        dist:0

    }
}; //обьект хранящий в себе все обьекты сцены
function addLight(){ //добавление света на сцену
    var light = new THREE.DirectionalLight( '#ffffff' , 1 );
    light.position.set(0, 100, 100);
    scene.add(light);

    var ambiColor = "#cbc9bb";
    var ambientLight = new THREE.AmbientLight(ambiColor);
    scene.add(ambientLight);
}

function addCamera(viewport) { //добавляем камеру или въюпорт
    camera = new THREE.PerspectiveCamera( objects.camParam.fov, viewport.clientWidth / viewport.clientHeight, 0.1, 100000 );
}
function render () {// рендер сцены
    setCameraPosition();
    requestAnimationFrame( render );
    renderer.render(scene, camera);
}

function getTanDeg(deg) {
    var rad = deg * Math.PI/180;
    return Math.tan(rad);
}
function getSinDeg(deg) {
    var rad = deg * Math.PI/180;
    return Math.sin(rad);
}
function getCosDeg(deg) {
    var rad = deg * Math.PI/180;
    return Math.cos(rad);
}
//выставляем камеру в зависимости от размера сцены и строим саму сцену
function calcCameraPosition() {
    var sceneSize = TUI.TUI('getSceneSize');
    var chunkSize = TUI.TUI('getChunkSize');
    var a = chunkSize * sceneSize.x;
    var b = chunkSize * sceneSize.y;
    var x = (Math.sqrt(Math.pow(a,2)+Math.pow(b,2)))/2; //пол диагонали сцены
    objects.camParam.dist = x/getTanDeg((objects.camParam.fov)/2); //дистанция от камеры к цели
    camera.up.set(0,0,1);   // указываем верх камеры вектором(x,y,z)
    objects.camParam.posx = a/2+(Math.sqrt((Math.pow(objects.camParam.dist,2))/2))*-1;
    objects.camParam.posy = b/2+(Math.sqrt((Math.pow(objects.camParam.dist,2))/2))*-1;
    objects.camParam.posz = objects.camParam.dist * getSinDeg(objects.camParam.angleZ);
    saveLastPosition();
    setCameraPosition();
    objects.camParam.lookAt = new THREE.Vector3((a/2),(b/2),0);
    //objects.camParam.lookAt = new THREE.Vector3(0,0,0);
    camera.lookAt(objects.camParam.lookAt); //точка направления камеры   очень важно сохранять очередность указания параметров 1.верх камери 2.прзиция камеры 3.направление камеры
}
function setCameraPosition() {
    camera.position.x = objects.camParam.posx+objects.camParam.lookAt.x;//позиция камеры по x + смещение на средину сцены
    camera.position.y = objects.camParam.posy+objects.camParam.lookAt.y;//позиция камеры по y + смещение на средину сцены
    camera.position.z = objects.camParam.posz;//позиция камеры по z
    camera.lookAt(objects.camParam.lookAt);
}
function createGround() {
    scene.remove(scene.getObjectByName("test"));
    objects.groundGroup = new THREE.Object3D();//создаем пустой обьект-контейнер для чанков
    objects.groundGroup.name = "test";
    var sceneSize = TUI.TUI('getSceneSize');
    var chunkSize = TUI.TUI('getChunkSize');
    for (var i = 1; i < sceneSize.x+1; i++) {
        for (var j = 1; j < sceneSize.y+1; j++) {
            createChunk(chunkSize,i,j);
        }
    }
    scene.add(objects.groundGroup);//when done, add the group to the scene
    calcCameraPosition();//выставляем камеру в зависимости от размера сцены
}
function createChunk(size, x, y){//строим один чанк
    var chunk = {};
    chunk.geometry = new THREE.PlaneGeometry( size, size);
    chunk.material = new THREE.MeshNormalMaterial({wireframe:true});
    chunk.plane = new THREE.Mesh( chunk.geometry, chunk.material );
    chunk.posX = x;
    chunk.posY = y;
    chunk.plane.rotateX(0);
    chunk.plane.position.x = (x*size)-(size/2);
    chunk.plane.position.y = (y*size)-(size/2);
    objects.groundGroup.add(chunk.plane);//добавляем в контейнер чанк
}
function rotateCamera(direction){
    var angle = objects.camParam.roundMoveStep*direction;
    objects.camParam.posx = (((objects.camParam.lastPosx)*getCosDeg(angle))-((objects.camParam.lastPosy)*getSinDeg(angle)));
    objects.camParam.posy = (((objects.camParam.lastPosx)*getSinDeg(angle))+((objects.camParam.lastPosy)*getCosDeg(angle)));
    saveLastPosition();

}
function zoomCamera(direction) {
    var dist = Math.sqrt(Math.pow(objects.camParam.lastPosx,2)+Math.pow(objects.camParam.lastPosy,2)+Math.pow(objects.camParam.lastPosz,2)); //дистанция к камере (модуль вектора)
    var distNew = dist + (objects.camParam.zoomStep*direction); //модульнужного вектора далее узнаем косинусы вектора и узнаем нужные координаты
    objects.camParam.posx = distNew * (objects.camParam.lastPosx/dist);
    objects.camParam.posy = distNew * (objects.camParam.lastPosy/dist);
    objects.camParam.posz = distNew * (objects.camParam.lastPosz/dist);
    saveLastPosition();
}
function saveLastPosition() {
    objects.camParam.lastPosx = objects.camParam.posx;
    objects.camParam.lastPosy = objects.camParam.posy;
    objects.camParam.lastPosz = objects.camParam.posz;
}
window.onload = function () {
    TUI = $('.ui').TUI(); // подключаю  UI

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


    createGround();//строим чанки

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


    render();

};