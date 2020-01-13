var demo = Cesium.defaultValue(demo, false);

const fileOptions = {
    dataDirectory: demo ? 'https://raw.githubusercontent.com/RaymanNg/3D-Wind-Field/master/data/' : 'data/',
    dataFile: "demo.nc",
    glslDirectory: demo ? '../Cesium-3D-Wind/glsl/' : 'glsl/'
}

const defaultParticleSystemOptions = {
    maxParticles: 30000,
    particleHeight: 100.0,
    fadeOpacity: 0.972,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 6,
    lineWidth: 7
}

const globeLayers = [
    { name: "NaturalEarthII", type: "NaturalEarthII" },
    //{ name: "WMS:Rainfall", type: "WMS", layer: "Precipitable_water_entire_atmosphere_single_layer", ColorScaleRange: '0.1,66.8' },
    //{ name: "WMS:Air Pressure", type: "WMS", layer: "Pressure_surface", ColorScaleRange: '51640,103500' },
    { name: "WMS:Temperature", type: "WMS", layer: "Temperature_surface", ColorScaleRange: '204.1,317.5' },
    //{ name: "WMS:Wind Speed", type: "WMS", layer: "Wind_speed_gust_surface", ColorScaleRange: '0.1095,35.31' },
    //{ name: "WorldTerrain", type: "WorldTerrain" }
    //{name: "HeatMap", type:"heatmap"}
]

const defaultLayerOptions = {
    "globeLayer": globeLayers[0],
    //"WMS_URL": "https://www.ncei.noaa.gov/thredds/wms/gfs-004-files/201809/20180916/gfs_4_20180916_0000_000.grb2"
    "WMS_URL": "./data/gfs_4_20180916_0000_000.grb2",
}

class Panel {
    constructor(viewer,gui) {
        this.maxParticles = defaultParticleSystemOptions.maxParticles;
        this.particleHeight = defaultParticleSystemOptions.particleHeight;
        this.fadeOpacity = defaultParticleSystemOptions.fadeOpacity;
        this.dropRate = defaultParticleSystemOptions.dropRate;
        this.dropRateBump = defaultParticleSystemOptions.dropRateBump;
        this.speedFactor = defaultParticleSystemOptions.speedFactor;
        this.lineWidth = defaultParticleSystemOptions.lineWidth;

        this.globeLayer = defaultLayerOptions.globeLayer;
        this.WMS_URL = defaultLayerOptions.WMS_URL;


        var layerNames = [];
        globeLayers.forEach(function (layer) {
            layerNames.push(layer.name);
        });
        this.layerToShow = layerNames[0];

        var onParticleSystemOptionsChange = function () {
            var event = new CustomEvent('particleSystemOptionsChanged');
            window.dispatchEvent(event);
        }

        const that = this;
        var onLayerOptionsChange = function () {
            for (var i = 0; i < globeLayers.length; i++) {
                if (that.layerToShow == globeLayers[i].name) {
                    that.globeLayer = globeLayers[i];
                    break;
                }
            }
            var event = new CustomEvent('layerOptionsChanged');
            window.dispatchEvent(event);
        }
        gui.add(that, 'maxParticles', 1, 256 * 256, 1).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'particleHeight', 1, 10000, 1).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'fadeOpacity', 0.90, 0.999, 0.001).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'dropRate', 0.0, 0.1).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'dropRateBump', 0, 0.2).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'speedFactor', 0.5, 100).onFinishChange(onParticleSystemOptionsChange);
        gui.add(that, 'lineWidth', 0.01, 16.0).onFinishChange(onParticleSystemOptionsChange);

        gui.add(that, 'layerToShow', layerNames).onFinishChange(onLayerOptionsChange);
        
        //var panelContainer = document.getElementsByClassName('cesium-widget').item(0);
        

    }

    getUserInput() {
        // make sure maxParticles is exactly the square of particlesTextureSize
        var particlesTextureSize = Math.ceil(Math.sqrt(this.maxParticles));
        this.maxParticles = particlesTextureSize * particlesTextureSize;

        return {
            particlesTextureSize: particlesTextureSize,
            maxParticles: this.maxParticles,
            particleHeight: this.particleHeight,
            fadeOpacity: this.fadeOpacity,
            dropRate: this.dropRate,
            dropRateBump: this.dropRateBump,
            speedFactor: this.speedFactor,
            lineWidth: this.lineWidth,
            globeLayer: this.globeLayer,
            WMS_URL: this.WMS_URL
        }
    }
}
