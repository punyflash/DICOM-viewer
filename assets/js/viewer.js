var toolgroups = [
    [
        {   
            id: 'home', icon: 'icons/home.svg',
            click: function(e){
                window.location.replace(window.location.protocol+'//'+window.location.host);
            }
        },
        {
            id: 'open', icon: 'icons/file.svg',
            click: function(e){
                $('#file').click();
            }
        },
        {
            id: 'connect', icon: 'icons/connect.svg',
            click: function(e){
                //TODO: 
            }
        },
        {
            id: 'save', icon: 'icons/download.svg',
            click: function(e){
                cornerstoneTools.saveAs(viewer.getActiveCornerstoneElement(), 'dcm-export.jpg', 'image/jpg');
            }
        },
        {
            id: 'settings', icon: 'icons/settings.svg',
            click: function(e){
                //TODO: 
            }
        }
    ],
    [
        {   
            id: 'invert', icon: 'icons/invert.svg',
            click: function(e){
                const element = viewer.getActiveCornerstoneElement();
                const viewport = cornerstone.getViewport(element);
                viewport.invert = !viewport.invert;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'hflip', icon: 'icons/flip-h.svg',
            click: function(e){
                const element = viewer.getActiveCornerstoneElement();
                const viewport = cornerstone.getViewport(element);
                viewport.hflip = !viewport.hflip;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'vflip', icon: 'icons/flip-v.svg',
            click: function(e){
                const element = viewer.getActiveCornerstoneElement();
                const viewport = cornerstone.getViewport(element);
                viewport.vflip = !viewport.vflip;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'rotation', icon: 'icons/rotate.svg',
            click: function(e){
                const element = viewer.getActiveCornerstoneElement();
                const viewport = cornerstone.getViewport(element);
                viewport.rotation += 90;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'reset', icon: 'icons/reset.svg',
            click: function(e){
                cornerstone.reset(viewer.getActiveCornerstoneElement());
            }
        },
        {
            id: 'double-view', icon: 'icons/squares.svg',
            click: function(e){
                //TODO:
            }
        }
    ],
    [
        {   
            id: 'markers', icon: 'icons/orientation.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.Orientation) {
                    element.Orientation = false;
                    element.showOrientation(false);
                    $("#markers").removeClass("active");
                }
                else {
                    element.Orientation = true;
                    element.showOrientation(true);
                    $("#markers").addClass("active");
                }
            }
        },
        {
            id: 'scale', icon: 'icons/scale.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.Scale) {
                    element.Scale = false;
                    element.showScale(false);
                    $("#scale").removeClass("active");
                }
                else {
                    element.Scale = true;
                    element.showScale(true);
                    $("#scale").addClass("active");
                }
            }
        },
        {
            id: 'hide', icon: 'icons/hide.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.Drawings) {
                    element.Drawings = false;
                    element.showDrawings(false);
                    $("#hide").addClass("active");
                }
                else {
                    element.Drawings = true;
                    element.showDrawings(true);
                    $("#hide").removeClass("active");
                }
            }
        },
        {
            id: 'hide-meta', icon: 'icons/hide-meta.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.Meta) {
                    element.Meta = false;
                    element.showMeta(false);
                    $("#hide-meta").addClass("active");
                }
                else {
                    element.Meta = true;
                    element.showMeta(true);
                    $("#hide-meta").removeClass("active");
                }
            }
        }
    ],
    [
        {   
            headIcon: 'icons/LMB.svg',
            id: 'wwwc', icon: 'icons/wwwl.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('wwwc');
                $("#wwwc").addClass("active");
            }
        },
        {
            id: 'length', icon: 'icons/line.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(!element.Drawings) { 
                    element.showDrawings(true);
                    $("#hide").removeClass('active')
                }
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('length');
                $("#length").addClass("active");
            }
        },
        {
            id: 'angle', icon: 'icons/angle.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(!element.Drawings) { 
                    element.showDrawings(true);
                    $("#hide").removeClass('active')
                }
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('angle');
                $("#angle").addClass("active");
            }
        },
        {
            id: 'rectangle', icon: 'icons/rectangle.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(!element.Drawings) { 
                    element.showDrawings(true);
                    $("#hide").removeClass('active')
                }
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('rectangle');
                $("#rectangle").addClass("active");
            }
        },
        {
            id: 'elipse', icon: 'icons/elipse.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(!element.Drawings) { 
                    element.showDrawings(true);
                    $("#hide").removeClass('active')
                }
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('elipse');
                $("#elipse").addClass("active");
            }
        },
        {
            id: 'probe', icon: 'icons/probe.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(!element.Drawings) { 
                    element.showDrawings(true);
                    $("#hide").removeClass('active')
                }
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('probe');
                $("#probe").addClass("active");
            }
        },
        {
            id: 'arrow', icon: 'icons/arrow.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(!element.Drawings) { 
                    element.showDrawings(true);
                    $("#hide").removeClass('active')
                }
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('arrow');
                $("#arrow").addClass("active");
            }
        },
        {
            id: 'seed', icon: 'icons/seed.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(!element.Drawings) { 
                    element.showDrawings(true);
                    $("#hide").removeClass('active')
                }
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('seed');
                $("#seed").addClass("active");
            }
        }
    ],
    [
        {
            headIcon: 'icons/RMB.svg',
            id: 'zoom', icon: 'icons/zoom.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('zoom');
                $("#zoom").addClass("active");
            }
        },
        {
            id: 'magnify', icon: 'icons/magnify.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('magnify');
                $("#magnify").addClass("active");
            }
        },
        {
            id: 'pan', icon: 'icons/pan.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('pan');
                $("#pan").addClass("active");
            }
        },
        {
            id: 'rotate', icon: 'icons/rotate.svg',
            click: function(e){
                const element = viewer.getActiveElement();
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('rotate');
                $("#rotate").addClass("active");
            }
        }
    ]
];
const viewer = new Viewer(toolgroups);

$(document).ready(() => {
    $('#file').on("change", function(e){
        const file = e.target.files[0];
        viewer.loadFile(viewer.active, file);
    });
    setCornerstoneConfig();    
    cornerstone.metaData.addProvider(metaDataProvider);
    viewer.loadFileByImageId(viewer.active, 'example://1');
});

function metaDataProvider(type, imageId){
    if(type === 'imagePlaneModule') {
        const element = getActiveElement(elements);
        if(imageId === element.imageId){
            if(element.metaData){
                const imageData = element.metaData;
                const metaData = element.MetaChanger;
                var pixelSpacing = metaData.pixelSpacing || imageData.string('x00280030') || imageData.string('x00181164') || imageData.string('x00182010');
                if(pixelSpacing){
                    pixelSpacing = pixelSpacing.split('\\');
                    pixelSpacing.forEach((e, i) => pixelSpacing[i] = parseFloat(e));
                    var rowPixelSpacing = pixelSpacing[0];
                    var columnPixelSpacing = pixelSpacing[1];
                }

                var orientationPatient = metaData.orientationPatient || imageData.string('x00200037');
                var rowCosines = undefined;
                var columnCosines = undefined;
                if(orientationPatient){
                    orientationPatient = orientationPatient.split('\\');
                    orientationPatient.forEach((e, i) => orientationPatient[i] = parseFloat(e));

                    rowCosines = [orientationPatient[0], orientationPatient[1], orientationPatient[2]];
                    columnCosines = [orientationPatient[3], orientationPatient[4], orientationPatient[5]];
                }

                var positionPatient = metaData.positionPatient || imageData.string('x00200032');
                if(positionPatient){
                    positionPatient = positionPatient.split('\\');
                    positionPatient.forEach((e, i) => positionPatient[i] = parseFloat(e));
                }

                var sliceThickness = metaData.sliceThickness || imageData.string('x00180050');
                if(sliceThickness) sliceThickness = parseFloat(sliceThickness);

                var sliceLocation = metaData.sliceLocation || imageData.string('x00201041');
                if(sliceLocation) sliceLocation = parseFloat(sliceLocation);

                return {
                    frameOfReferenceUID: imageData.string('x00200052') || null,
                    rows: imageData.int16('x00280010') || null,
                    columns: imageData.int16('x00280011') || null,
                    imageOrientationPatient: orientationPatient || null,
                    rowCosines: rowCosines || null,
                    columnCosines: columnCosines || null,
                    imagePositionPatient: positionPatient || null,
                    sliceThickness: sliceThickness || null,
                    sliceLocation: sliceLocation || null,
                    pixelSpacing: pixelSpacing || null,
                    rowPixelSpacing: rowPixelSpacing || null,
                    columnPixelSpacing: columnPixelSpacing || null
                }
            }
        }
    }
}
