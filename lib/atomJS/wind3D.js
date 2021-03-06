
import {ParticleSystem} from '../windJS/particleSystem.js';

class Wind3D {
    constructor(panel, viewer) {

        this.viewer = viewer

        
        this.scene = this.viewer.scene;
        this.camera = this.viewer.camera;
        //new CompositeView(this.viewer);
        //this.rainModel();
        //var line = initWork(this.viewer);
        // require(["lib/CompositeView","lib/index"],function(CompositeView,optionValue){
        //     new CompositeView(this.viewer, optionValue);
        // })
        this.panel = panel;

        this.viewerParameters = {
            lonRange: new Cesium.Cartesian2(),
            latRange: new Cesium.Cartesian2(),
            pixelSize: 0.0
        };
        // use a smaller earth radius to make sure distance to camera > 0
        this.globeBoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0.99 * 6378137.0);
        this.updateViewerParameters();

        DataProcess.loadData().then(
            (data) => {
                this.particleSystem = new ParticleSystem(this.scene.context, data,
                    this.panel.getUserInput(), this.viewerParameters);
                this.addPrimitives();
                this.setupEventListeners();
                this.debug();
            });
        this.imageryLayers = this.viewer.imageryLayers;
        this.setGlobeLayer(this.panel.getUserInput());
    }

    addPrimitives() {
        // the order of primitives.add() should respect the dependency of primitives
        this.pw = this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.getWind);
        this.ps = this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updateSpeed);
        this.pup = this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updatePosition);
        this.ppp = this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingPosition);
        this.pps = this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingSpeed);

        this.psg = this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.segments);
        this.pt = this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.trails);
        this.psc = this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.screen);
    }
    removePrimitives(){
        this.scene.primitives.remove(this.psc);
        this.scene.primitives.remove(this.pt);
        this.scene.primitives.remove(this.psg);
        this.scene.primitives.remove(this.pps);
        this.scene.primitives.remove(this.ppp);
        this.scene.primitives.remove(this.pup);
        this.scene.primitives.remove(this.ps);
        this.scene.primitives.remove(this.pw);
    }

    updateViewerParameters() {
        var viewRectangle = this.camera.computeViewRectangle(this.scene.globe.ellipsoid);
        var lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle);
        this.viewerParameters.lonRange.x = lonLatRange.lon.min;
        this.viewerParameters.lonRange.y = lonLatRange.lon.max;
        this.viewerParameters.latRange.x = lonLatRange.lat.min;
        this.viewerParameters.latRange.y = lonLatRange.lat.max;

        var pixelSize = this.camera.getPixelSize(
            this.globeBoundingSphere,
            this.scene.drawingBufferWidth,
            this.scene.drawingBufferHeight
        );

        if (pixelSize > 0) {
            this.viewerParameters.pixelSize = pixelSize;
        }
    }

    setGlobeLayer(userInput) {
        //this.viewer.imageryLayers.removeAll();
        this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

        var globeLayer = userInput.globeLayer;
        switch (globeLayer.type) {
            case "NaturalEarthII": {
                this.viewer.imageryLayers.removeAll();
                this.viewer.imageryLayers.addImageryProvider(
                    //Cesium.createTileMapServiceImageryProvider({
                    Cesium.createTileMapServiceImageryProvider({
                        url : 'data/arcgis_word', 
                        layers: 'tile:arcgis', 
                        //url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
                    })
                );
                break;
            }
            case "WMS": {
                console.log(userInput.WMS_URL);
                this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
                    url: userInput.WMS_URL,
                    layers: globeLayer.layer,
                    parameters: {
                        ColorScaleRange: globeLayer.ColorScaleRange
                    }
                }));
                break;
            }
            case "WorldTerrain": {
                this.viewer.imageryLayers.addImageryProvider(
                    Cesium.createWorldImagery()
                );
                this.viewer.terrainProvider = Cesium.createWorldTerrain();
                break;
            }
        }
    }

    setupEventListeners() {
        const that = this;

        this.camera.moveStart.addEventListener(function () {
            that.scene.primitives.show = false;
        });

        this.camera.moveEnd.addEventListener(function () {
            that.updateViewerParameters();
            that.particleSystem.applyViewerParameters(that.viewerParameters);
            that.scene.primitives.show = true;
        });

        var resized = false;
        window.addEventListener("resize", function () {
            resized = true;
            that.scene.primitives.show = false;
            that.scene.primitives.removeAll();
        });

        this.scene.preRender.addEventListener(function () {
            if (resized) {
                that.particleSystem.canvasResize(that.scene.context);
                resized = false;
                that.addPrimitives();
                that.scene.primitives.show = true;
            }
        });

        window.addEventListener('particleSystemOptionsChanged', function () {
            that.particleSystem.applyUserInput(that.panel.getUserInput());
        });
        window.addEventListener('layerOptionsChanged', function () {
            that.setGlobeLayer(that.panel.getUserInput());
        });
    }

    debug() {
        const that = this;

        var animate = function () {
            that.viewer.resize();
            that.viewer.render();
            requestAnimationFrame(animate);
        }

        //var spector = new SPECTOR.Spector();
        //spector.displayUI();
        //spector.spyCanvases();

        animate();
    }
}

export{Wind3D};
