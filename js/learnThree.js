var scene;
var camera;
var renderer;
var controls;
var TUI;
var objects={//обьект хранящий в себе все обьекты сцены
    container:{},
    activeBuild:[],
    camParam:{//параметры камеры
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
        zoomStep:4,//шаг зума камеры
        updownStep:3, //шаг движения камеры вверх/вниз
        zoomLimitMin:10, //минимальный зум
        zoomLimitMax:3000,//максимальный зум
        dist:0
    }
};
var serverData;
var domEvents;
var progress = 1;
var loaded =1;
var prel;
function preloader() {
    prel = document.getElementById('preloader');
}

function getDataFromServer(){
    $.getJSON('objects.json',function (data) {
        serverData = data;
        startBuildingScene();
        arr = data.chunks;
        for (var i = 0; i < arr.length; i++) {
            if(arr[i]['buildings'] != undefined){progress += arr[i]['buildings'].length; }
            if(i == arr.length-1){preloader()}
        }
    });
}
function addLight(){ //добавление света на сцену
    var light = new THREE.DirectionalLight( '#cccccc' , 1 );
    light.position.set(300, -100, 100);
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
function calcCameraPosition(sizeScene) {
    var sceneSize = sizeScene;
    var chunkSize = TUI.TUI('getChunkSize');
    var a = chunkSize * sceneSize.x;
    var b = chunkSize * sceneSize.y;
    var x = (Math.sqrt(Math.pow(a,2)+Math.pow(b,2)))/2; //пол диагонали сцены
    objects.camParam.dist = x/getTanDeg((objects.camParam.fov)/2); //дистанция от камеры к цели
    camera.up.set(0,0,1);   // указываем верх камеры вектором(x,y,z)
    //objects.camParam.posx = 0;
     //objects.camParam.posy = 0;
    // objects.camParam.posz = 425;
    objects.camParam.posx = a/2+(Math.sqrt((Math.pow(objects.camParam.dist,2))/2))*-1;
    objects.camParam.posy = b/2+(Math.sqrt((Math.pow(objects.camParam.dist,2))/2))*-1;
    objects.camParam.posz = objects.camParam.dist * getSinDeg(objects.camParam.angleZ);
    saveLastPosition();
    setCameraPosition();
    objects.camParam.lookAt = new THREE.Vector3((a/2),(b/2),0);
    //objects.camParam.lookAt = new THREE.Vector3(285,150,0);
    camera.lookAt(objects.camParam.lookAt); //точка направления камеры   очень важно сохранять очередность указания параметров 1.верх камери 2.прзиция камеры 3.направление камеры
}
function setCameraPosition() {
    camera.position.x = objects.camParam.posx+objects.camParam.lookAt.x;//позиция камеры по x + смещение на средину сцены
    camera.position.y = objects.camParam.posy+objects.camParam.lookAt.y;//позиция камеры по y + смещение на средину сцены
    camera.position.z = objects.camParam.posz;//позиция камеры по z
    camera.lookAt(objects.camParam.lookAt);
}

function createGround() {
    scene.remove(scene.getObjectByName("groundGroup"));
    scene.remove(scene.getObjectByName("buildGroup"));
    objects.groundGroup = new THREE.Object3D();//создаем пустой обьект-контейнер для чанков
    objects.buildGroup = new THREE.Object3D();//создаем пустой обьект-контейнер для домиков
    objects.groundGroup.name = "groundGroup";
    objects.buildGroup.name = "buildGroup";
    var chunkSize = TUI.TUI('getChunkSize');
    var sceneSize = {x:0, y:0}; //указывается в количестве чанков

    for (var i = 0; i < serverData.chunks.length; i++) {
            createChunk(chunkSize,serverData.chunks[i]);
            if(serverData.chunks[i].x>sceneSize.x){sceneSize.x=serverData.chunks[i].x;}
            if(serverData.chunks[i].y>sceneSize.y){sceneSize.y=serverData.chunks[i].y;}
    }
    scene.add(objects.groundGroup);//when done, add the group to the scene
    scene.add(objects.buildGroup);//when done, add the group to the scene
    calcCameraPosition(sceneSize);//выставляем камеру в зависимости от размера сцены
}
function createBuild(buildData, chankX, chankY, chankSize){
    var bX=parseInt(buildData.x), bY=parseInt(buildData.y), bZ=parseInt(buildData.z), bS=parseInt(buildData.scale);  // обработка входящих параметров
    if(!isNaN(bX) || bX > 0){  if(bX>100){ bX=100;}     }else{bX = 0;}
    if(!isNaN(bY) || bY > 0){  if(bY>100){ bY=100;}     }else{bY = 0;}
    if(isNaN(bZ)){bZ = 0}
    if(isNaN(bS) || bS <= 0){bS = 1}

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            if( Math.round(percentComplete, 2) > 99){
                loaded++;
               
                if(loaded == progress){
                    setTimeout(function () {
                        prel.remove();
                    },3000);

                }
            }

        }
    };
    var onError = function ( xhr ) { };
    var objLoader = new THREE.OBJLoader();
    var dom;
    var outlineMesh1;
    var manager = new THREE.LoadingManager();
    var loader  = new THREE.ImageLoader( manager );
    var texture = new THREE.Texture();
    if(buildData.texture != undefined){
        loader.load( buildData.texture, function ( image ) {
            texture.image = image;
            texture.needsUpdate = true;
        });
    }
    objLoader.load( buildData.url, function ( object ) {
        object.traverse( function ( child ){
            if ( child instanceof THREE.Mesh ){dom=child;}
        });
        dom.position.x = (chankX - (chankSize / 2)) + ((chankSize / 100) * bX);
        dom.position.y = (chankY - (chankSize / 2)) + ((chankSize / 100) * bY);
        dom.position.z = bZ;
        dom.scale.set(bS, bS, bS);
        if(buildData.title != undefined){
            var showText = false;
            var box = new THREE.Box3().setFromObject( dom );// делаем баундбокс на основе объекта
            var z = box.max.z + 5;   //и узнаем его высоту
            z = z>0 && !isNaN(z)?z:1;
            var spritey = makeTextSprite( buildData.title, showText);
            spritey.position.x = dom.position.x;
            spritey.position.y = dom.position.y;
            spritey.position.z = z;
            scene.add( spritey );
            // var domEvents2 = new THREEx.DomEvents(camera, renderer.domElement);
            // domEvents2.addEventListener(spritey, 'click', function () {
            //     if(showText){
            //         showText = false;
            //         scene.remove( spritey );
            //     }else{
            //         showText = true;
            //         scene.remove( spritey );
            //     }
            //     makeSome();
            // });
            objects.xx = spritey;
            function makeSome(){
                spritey = makeTextSprite( buildData.title, showText);
                spritey.position.x = dom.position.x;
                spritey.position.y = dom.position.y;
                spritey.position.z = z;
                scene.add( spritey );
            }
        }
        if(buildData.texture != undefined){
            dom.material = new THREE.MeshPhongMaterial({map: texture, specular: 0xfceed2});
        }else{
            dom.material = new THREE.MeshNormalMaterial();
        }
        scene.add(dom);
        objects.buildGroup.add(dom);//добавляем в контейнер домики
        domEvents.addEventListener(dom, 'mouseover', function () {
            outlineMesh1 = dom.clone();
            outlineMesh1.material = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.BackSide } );
            outlineMesh1.scale.multiplyScalar(1.02);
            outlineMesh1.position = dom.position;
            scene.add( outlineMesh1 );
            objects.container.style.cursor = 'pointer';
        }, false);
        domEvents.addEventListener(dom, 'mouseout', function () {
            objects.container.style.cursor = 'auto';
            scene.remove(outlineMesh1);
        },false);

    }, onProgress, onError );
}
function createChunk(size, chunkData){//строим один чанк
    var chunk = {};
    var texture = new THREE.Texture();
    var manager = new THREE.LoadingManager();
    var loader = new THREE.ImageLoader(manager);
    loader.load(chunkData.texture, function (image) {
        texture.image = image;
        texture.needsUpdate = true;
    });
    chunk.geometry = new THREE.PlaneGeometry( size, size);
    chunk.material = new THREE.MeshBasicMaterial({map:texture, overdraw:true});
    chunk.plane = new THREE.Mesh( chunk.geometry, chunk.material );
    chunk.plane.position.x = (chunkData.x*size)-(size/2);
    chunk.plane.position.y = (chunkData.y*size)-(size/2);
    objects.groundGroup.add(chunk.plane);//добавляем в контейнер чанк
    if(chunkData.buildings != undefined){ // если у чанка есть дома
        for (var i = 0; i < chunkData.buildings.length; i++) {
            createBuild(chunkData.buildings[i], chunk.plane.position.x, chunk.plane.position.y, size);
        }
    }
}
function rotateCamera(direction){
    var angle = objects.camParam.roundMoveStep*direction;
    objects.camParam.posx = (((objects.camParam.lastPosx)*getCosDeg(angle))-((objects.camParam.lastPosy)*getSinDeg(angle)));
    objects.camParam.posy = (((objects.camParam.lastPosx)*getSinDeg(angle))+((objects.camParam.lastPosy)*getCosDeg(angle)));
    saveLastPosition();
}
function zoomCamera(direction) {
    if((objects.camParam.posz <= objects.camParam.zoomLimitMin && direction < 0) || (objects.camParam.posz >= objects.camParam.zoomLimitMax && direction > 0)){
        console.log('zooming stoped by limits:'+objects.camParam.posz);
        return;
    }else{
        var dist = Math.sqrt(Math.pow(objects.camParam.lastPosx,2)+Math.pow(objects.camParam.lastPosy,2)+Math.pow(objects.camParam.lastPosz,2)); //дистанция к камере (модуль вектора)
        var distNew = dist + (objects.camParam.zoomStep*direction); //модульнужного вектора далее узнаем косинусы вектора и узнаем нужные координаты
        objects.camParam.posx = distNew * (objects.camParam.lastPosx/dist);
        objects.camParam.posy = distNew * (objects.camParam.lastPosy/dist);
        objects.camParam.posz = distNew * (objects.camParam.lastPosz/dist);
        saveLastPosition();
    }
}
function upDownCamera(direction) {
    if((objects.camParam.posz <= objects.camParam.zoomLimitMin && direction < 0) || (objects.camParam.posz >= objects.camParam.zoomLimitMax && direction > 0)){
        console.log('zooming stoped by limits:'+objects.camParam.posz);
        return;
    }else {
        var step = objects.camParam.updownStep * direction;
        objects.camParam.posz = step + objects.camParam.lastPosz;
        saveLastPosition();
    }
}
function saveLastPosition() {
    objects.camParam.lastPosx = objects.camParam.posx;
    objects.camParam.lastPosy = objects.camParam.posy;
    objects.camParam.lastPosz = objects.camParam.posz;
}
function onWindowResize(){
    var viewport = document.getElementById('render-area');
    renderer.setSize( viewport.clientWidth, viewport.clientHeight);
    camera.aspect = (viewport.clientWidth, viewport.clientHeight);
    camera.fov = objects.camParam.fov;
    setCameraPosition();
}

function makeTextSprite( message, showText){
    var fontsize = 32;
    var borderThickness =  40;
    var yScale = 20;
     var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var cross = canvas.getContext('2d');
    var round = canvas.getContext('2d');
    var round2 = canvas.getContext('2d');
    var text = canvas.getContext('2d');
    text.font = "32px Arial";
    var metrics = text.measureText( message );
    var textWidth = metrics.width;
    var radius = (fontsize+borderThickness) * 0.6;
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    var w = textWidth + borderThickness+(fontsize+borderThickness) * 1.2;

    if(showText){
        canvas.width = radius *2 + w+borderThickness;
        drawLabel(cross, round, round2, context, text, borderThickness/2, borderThickness/2, w, message, radius, showText);

    }else{
        canvas.width = radius *2 + borderThickness;
        canvas.height = radius *2+ borderThickness;
        drawLabel(cross, round, round2, context, text, borderThickness/2, borderThickness/2, 0, message, radius, showText);

    }
    var spriteMaterial = new THREE.SpriteMaterial(        { map: texture, useScreenCoordinates: false} );
    var sprite = new THREE.Sprite( spriteMaterial );
    var xScale = (canvas.width * yScale)/canvas.height;
    sprite.scale.set(xScale,yScale,1.0);

    return sprite;
}
function drawLabel(cross, round, round2, ctx, text, x, y, w, message, r,big){
    ctx.clearRect(0,0,w+r*2,r*2);
    round.clearRect(0,0,w+r*2,r*2);
    round2.clearRect(0,0,w+r*2,r*2);
    cross.clearRect(0,0,w+r*2,r*2);
    text.clearRect(0,0,w+r*2,r*2);

    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+r+w, y);
    ctx.arc(x+r+w,y+r,r,(Math.PI/2)*-1,Math.PI/2);
    ctx.lineTo(x+r, y+2*r);
    ctx.arc(x+r,y+r,r,Math.PI/2,(Math.PI/2)*-1);
    ctx.closePath();
    ctx.fill();

    round2.fillStyle   = "rgba(255,255,255,0.7)";
    round2.beginPath();
    round2.arc(x+r,y+r,0.8*r,0,2*Math.PI);
    round2.fill();

    if(big){round.fillStyle   = "rgba(232,28,63,1)";}else{round.fillStyle   = "rgba(255,255,255,1)";}
    round.beginPath();
    round.arc(x+r,y+r,0.55*r,0,2*Math.PI);
    round.fill();

    cross.lineWidth = 2;
    if(big){cross.strokeStyle="rgba(255,255,255,1)";}else{cross.strokeStyle="rgba(0,0,0,1)";}
    cross.beginPath();
    cross.moveTo(x+r-((0.55*r)/3.6), y+r);
    cross.lineTo(x+r+((0.55*r)/3.6), y+r);
    cross.moveTo(x+r,y+r-((0.55*r)/3.6));
    cross.lineTo(x+r,y+r+((0.55*r)/3.6));
    cross.stroke();
    if(big){
        text.font = "32px Arial";
        text.fillStyle   = "rgba(0,0,0,1)";
        text.fillText( message, x+w/2-r, 1.7*r);
    }

}
function startBuildingScene(){
    TUI = $('.ui').TUI(); // подключаю  UI
    var viewport = document.getElementById('render-area');
    objects.container = viewport;
    scene = new THREE.Scene();
    addCamera(viewport);
    addLight();
    try{
        renderer = new THREE.WebGLRenderer({ antialias:true,  alpha: true });
    }catch(err){
        alert('У Вашего Браузера Отсутствует Поддержка WebGL!');
        try{
            renderer = new THREE.CanvasRenderer;
        }catch(err){
            alert('Установите нормальный Браузер!');
        }
    }
    domEvents = new THREEx.DomEvents(camera, renderer.domElement);
    renderer.setSize( viewport.clientWidth, viewport.clientHeight );
    renderer.setClearColor( 0xffffff, 0);
    viewport.appendChild( renderer.domElement );
    createGround();//строим чанки
    render();
}
window.onload = function () {
    getDataFromServer();
};
window.addEventListener( 'resize', onWindowResize, false );