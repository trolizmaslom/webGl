// /*window.onload = initGL;
// var camera, scene, render;
//
// function initGL() {
//     container = document.createElement('div');
//     document.body.appendChild(container);
//
//     scene = new THREE.Scene();
//     camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight,0.1,2000);
//     camera.position.y = 150;
//     camera.position.z = 200;
//
//
//
//     var line_geometry = new THREE.Geometry();
//     line_geometry.vertices.push(
//         new THREE.Vector3(0,0,0),
//         new THREE.Vector3(0,40,0)
//     );
//
//     var line = THREE.Line(line_geometry);
//
//     scene.add(line);
//
//
//     render = new THREE.WebGLRenderer();
//     render.setSize(window.innerWidth, window.innerHeight, true);
//
//     container.appendChild(render.domElement);
//     render.render(scene, camera);
//
// }*/



var map = new ol.Map({
    target: 'map'
});

var osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM()
});
map.addLayer(osmLayer);

var arcgisImagery = new ol.layer.Tile({
    source: new ol.source.TileArcGISRest({
        url: 'http://server.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer'
    })
});
map.addLayer(arcgisImagery);

var view = new ol.View({
    center: [ 4188426.7147939987, 7508764.236877314 ],
    zoom: 12
});
map.setView(view);
// текущее положение мыши - относительно него будут рассчитываться все эффекты
var currentMousePosition = [0, 0];

map.on('pointermove', function (evt) {
    // запоминаем положение мыши при движении курсора над картой
    currentMousePosition = evt.pixel;
    // необходимо вызывать принудительную отрисовку карты, иначе эффекты не будут обновляться
    map.render();
});

// обработка события перед отрисовкой слоя
arcgisImagery.on('precompose', function(event) {
    var ctx = event.context;

    // ограничиваем область по вертикали от левого края до указателя мыши
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, currentMousePosition[0], ctx.canvas.height);
    ctx.clip();
});

// сразу после отрисовки слоя возвращаем область отрисовки в начальную форму
arcgisImagery.on('postcompose', function(event) {
    var ctx = event.context;
    ctx.restore();
});


