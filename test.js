﻿        <script>

        var container = document.getElementById( 'container' );

        var renderer, scene, camera, fov = 45;
        var mesh, decal;
        var raycaster;
        var line;

        var intersection = {
            intersects: false,
            point: new THREE.Vector3(),
            normal: new THREE.Vector3()
        };
        var controls;
        var mouse = new THREE.Vector2();

        var decalDiffuse = THREE.ImageUtils.loadTexture( 'assets/img/cloud.png' );
        var decalNormal = THREE.ImageUtils.loadTexture( 'assets/img/cloud.png');

        var decalMaterial = new THREE.MeshPhongMaterial( {
            specular: 0x444444,
            map: decalDiffuse,
            normalMap: decalNormal,
            normalScale: new THREE.Vector2( 1, 1 ),
            shininess: 30,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            wireframe: false
        });
        /*decalMaterial = new THREE.MeshNormalMaterial( {
            transparent: true,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            shading: THREE.SmoothShading
        });*/
        var decals = [];
        var decalHelper, mouseHelper;
        var p = new THREE.Vector3( 0, 0, 0 );
        var r = new THREE.Vector3( 0, 0, 0 );
        var s = new THREE.Vector3( 10, 10, 10 );
        var up = new THREE.Vector3( 0, 1, 0 );
        var check = new THREE.Vector3( 1, 1, 1 );

        var params = {
            projection: 'normal',
            minScale: 10,
            maxScale: 20,
            rotate: true,
            clear: function() {
                removeDecals();
            }
        };

        window.addEventListener( 'load', init );

        function init() {

            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 1000 );
            camera.position.z = 100;
            camera.target = new THREE.Vector3();

            controls = new THREE.OrbitControls( camera, renderer.domElement );
            controls.minDistance = 50;
            controls.maxDistance = 200;

            var light = new THREE.HemisphereLight( 0xffddcc, 0x111122 );
            light.position.set( 1, 0.75, 0.5 );
            scene.add( light );

            line = new THREE.Line( new THREE.Geometry( ), new THREE.LineBasicMaterial( { linewidth: 4 }) );
            line.geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
            line.geometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
            scene.add( line );

            loadCake();

            raycaster = new THREE.Raycaster();

            mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
            mouseHelper.visible = false;
            scene.add( mouseHelper );

            window.addEventListener( 'resize', onWindowResize, false );

            var moved = false;

            controls.addEventListener( 'change', function() {

                moved = true;

            } );

            window.addEventListener( 'mousedown', function () {

                moved = false;

            }, false );

            window.addEventListener( 'mouseup', function() {

                checkIntersection();
                if( !moved ) shoot();

            } );

            window.addEventListener( 'mousemove', onTouchMove );
            window.addEventListener( 'touchmove', onTouchMove );

            function onTouchMove( event ) {

                if( event.changedTouches ) {
                    x = event.changedTouches[ 0 ].pageX;
                    y = event.changedTouches[ 0 ].pageY;
                } else {
                    x = event.clientX;
                    y = event.clientY;
                }

                mouse.x = ( x / window.innerWidth ) * 2 - 1;
                mouse.y = - ( y / window.innerHeight ) * 2 + 1;

                checkIntersection();

            }

            function checkIntersection() {

                if( !mesh ) return;

                raycaster.setFromCamera( mouse, camera );

                var intersects = raycaster.intersectObjects( [ mesh ] );

                if ( intersects.length > 0 ) {

                    var p = intersects[ 0 ].point;
                    mouseHelper.position.copy( p );
                    intersection.point.copy( p );
                    var n = intersects[ 0 ].face.normal.clone();
                    n.multiplyScalar( 10 );
                    n.add( intersects[ 0 ].point );
                    intersection.normal.copy( intersects[ 0 ].face.normal );
                    mouseHelper.lookAt( n );

                    line.geometry.vertices[ 0 ].copy( intersection.point );
                    line.geometry.vertices[ 1 ].copy( n );
                    line.geometry.verticesNeedUpdate = true;

                    intersection.intersects = true;

                } else {

                    intersection.intersects = false;

                }

            }

            var gui = new dat.GUI();

            gui.add( params, 'projection', { 'From cam to mesh': 'camera', 'Normal to mesh': 'normal' } );
            gui.add( params, 'minScale', 1, 30 );
            gui.add( params, 'maxScale', 1, 30 );
            gui.add( params, 'rotate' );
            gui.add( params, 'clear' );
            gui.open();

            onWindowResize();
            render();

        }

        function loadCake( callback ) {

            var loader = new THREE.JSONLoader();

            loader.load( 'obj/cake.json', function( geometry ) {

                geometry.verticesNeedUpdate = true;
                geometry.elementsNeedUpdate = true;
                geometry.morphTargetsNeedUpdate = true;
                geometry.uvsNeedUpdate = true;
                geometry.normalsNeedUpdate = true;
                geometry.colorsNeedUpdate = true;
                geometry.tangentsNeedUpdate = true;

               // var material = new THREE.MeshPhongMaterial( {
//                    map: THREE.ImageUtils.loadTexture( 'obj/leeperrysmith/Map-COL.jpg' ),
//                    specularMap: THREE.ImageUtils.loadTexture( 'obj/leeperrysmith/Map-SPEC.jpg' ),
//                    normalMap: THREE.ImageUtils.loadTexture( 'obj/leeperrysmith/Infinite-Level_02_Tangent_SmoothUV.jpg' ),
//                    shininess: 10
//                } );
//
                var texture = THREE.ImageUtils.loadTexture( 'assets/img/ariadne_and_the_sea.jpg' );
                var material = new THREE.MeshBasicMaterial( { map: texture } );
                mesh = new THREE.Mesh( geometry, material );
                scene.add( mesh );
                mesh.scale.set( 10, 10, 10 );

                //scene.add( new THREE.FaceNormalsHelper( mesh, 1 ) );
                //scene.add( new THREE.VertexNormalsHelper( mesh, 1 ) );

            } );

        }

        function shoot() {

            if( params.projection == 'camera' ) {

                var dir = camera.target.clone();
                dir.sub( camera.position );

                p = intersection.point;

                var m = new THREE.Matrix4();
                var c = dir.clone();
                c.negate();
                c.multiplyScalar( 10 );
                c.add( p );
                m.lookAt( p, c, up );
                m = m.extractRotation( m );

                dummy = new THREE.Object3D();
                dummy.rotation.setFromRotationMatrix( m );
                r.set( dummy.rotation.x, dummy.rotation.y, dummy.rotation.z );

            } else {

                p = intersection.point;
                r.copy( mouseHelper.rotation );

            }

            var scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
            s.set( scale, scale, scale );

            if( params.rotate) r.z = Math.random() * 2 * Math.PI;

            var material = decalMaterial.clone();
            material.color.setHex( Math.random() * 0xffffff );

            var m = new THREE.Mesh( new THREE.DecalGeometry( mesh, p, r, s, check ), material );
            decals.push( m );
            scene.add( m );

        }

        function removeDecals() {

            decals.forEach( function( d ) {
                scene.remove( d );
                d = null;
            } );
            decals = [];

        };

        function mergeDecals() {

            var merge = {};
            decals.forEach(function (decal) {

                var uuid = decal.material.uuid;
                var d = merge[uuid] = merge[uuid] || {};
                d.material = d.material || decal.material;
                d.geometry = d.geometry || new THREE.Geometry();
                d.geometry.merge(decal.geometry, decal.matrix);

            });

            removeDecals();

            for (var key in merge) {

                var d = merge[key];
                var mesh = new THREE.Mesh(d.geometry, d.material);
                scene.add(mesh);
                decals.push(mesh);

            }

        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }

        function render() {
            requestAnimationFrame( render );
            renderer.render( scene, camera );
        }

        </script>
