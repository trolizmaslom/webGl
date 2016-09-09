
window.onload(function () {
    var viewport = document.getElementById('render-area');
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 45, viewport.clientWidth / viewport.clientHeight, 0.1, 10000 );
    controls = new THREE.TrackballControls( camera, viewport);
    controls.rotateSpeed = 2;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
});