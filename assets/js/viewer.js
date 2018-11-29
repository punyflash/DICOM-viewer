var toolgroups = [
    [
        {   
            id: 'home', icon: 'icons/home.svg', disabled: false,
            click: function(e){
                window.location.replace(window.location.protocol+'//'+window.location.host);
            }
        },
        {
            id: 'open', icon: 'icons/file.svg', disabled: false,
            click: function(e){
                $('#file').click();
            }
        },
        {
            id: 'connect', icon: 'icons/connect.svg', disabled: false,
            click: function(e){
                //TODO: 
            }
        },
        {
            id: 'save', icon: 'icons/download.svg', disabled: true,
            click: function(e){
                cornerstoneTools.saveAs(getActiveElement(elements).element, 'dcm-export.jpg', 'image/jpg');
            }
        },
        {
            id: 'settings', icon: 'icons/settings.svg', disabled: true,
            click: function(e){
                //TODO: 
            }
        }
    ],
    [
        {   
            id: 'invert', icon: 'icons/invert.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements).element;
                const viewport = cornerstone.getViewport(element);
                viewport.invert = !viewport.invert;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'hflip', icon: 'icons/flip-h.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements).element;
                const viewport = cornerstone.getViewport(element);
                viewport.hflip = !viewport.hflip;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'vflip', icon: 'icons/flip-v.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements).element;
                const viewport = cornerstone.getViewport(element);
                viewport.vflip = !viewport.vflip;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'rotation', icon: 'icons/rotate.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements).element;
                const viewport = cornerstone.getViewport(element);
                viewport.rotation += 90;
                cornerstone.setViewport(element, viewport);
            }
        },
        {
            id: 'reset', icon: 'icons/reset.svg', disabled: true,
            click: function(e){
                cornerstone.reset(getActiveElement(elements).element);
            }
        },
        {
            id: 'double-view', icon: 'icons/squares.svg', disabled: true,
            click: function(e){
                //TODO: 
            }
        }
    ],
    [
        {   
            id: 'markers', icon: 'icons/orientation.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
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
            id: 'scale', icon: 'icons/scale.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
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
            id: 'hide', icon: 'icons/hide.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
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
            id: 'hide-meta', icon: 'icons/hide-meta.svg', disabled: true,
            click: function(e){
                setElementTools(getActiveElement(elements));
            }
        }
    ],
    [
        {   
            headIcon: 'icons/LMB.svg',
            id: 'wwwc', icon: 'icons/wwwl.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('wwwc');
                $("#wwwc").addClass("active");
            }
        },
        {
            id: 'length', icon: 'icons/line.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('length');
                $("#length").addClass("active");
            }
        },
        {
            id: 'angle', icon: 'icons/angle.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('angle');
                $("#angle").addClass("active");
            }
        },
        {
            id: 'rectangle', icon: 'icons/rectangle.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('rectangle');
                $("#rectangle").addClass("active");
            }
        },
        {
            id: 'elipse', icon: 'icons/elipse.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('elipse');
                $("#elipse").addClass("active");
            }
        },
        {
            id: 'probe', icon: 'icons/probe.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('probe');
                $("#probe").addClass("active");
            }
        },
        {
            id: 'arrow', icon: 'icons/arrow.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('arrow');
                $("#arrow").addClass("active");
            }
        },
        {
            id: 'seed', icon: 'icons/seed.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.LMBTool != '') $("#"+element.LMBTool).removeClass("active");
                element.setTool('seed');
                $("#seed").addClass("active");
            }
        }
    ],
    [
        {
            headIcon: 'icons/RMB.svg',
            id: 'zoom', icon: 'icons/zoom.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('zoom');
                $("#zoom").addClass("active");
            }
        },
        {
            id: 'magnify', icon: 'icons/magnify.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('magnify');
                $("#magnify").addClass("active");
            }
        },
        {
            id: 'pan', icon: 'icons/pan.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('pan');
                $("#pan").addClass("active");
            }
        },
        {
            id: 'rotate', icon: 'icons/rotate.svg', disabled: true,
            click: function(e){
                const element = getActiveElement(elements);
                if(element.RMBTool != '') $("#"+element.RMBTool).removeClass("active");
                element.setTool('rotate');
                $("#rotate").addClass("active");
            }
        }
    ]
];
var elements = {active: 0, data: []};
$(document).ready(() => {
    $('#file').on("change", function(e){
        const file = e.target.files[0];
        //createNewElement(openFile(file));
        getActiveElement(elements).setNewImage(openFile(file));
    });
    setCornerstoneConfig();    
    cornerstone.metaData.addProvider(metaDataProvider);
    loadTools(toolgroups);
    createNewElement('example://1');
});

function loadTools(toolgroups) {
    if(tools.length==0){
        console.warn('No element with id "tools". Unable to load tools!');
        return;
    }
    toolgroups.forEach((group, i) => {
        $("#tools").append('<div id="toolbar'+i+'" class="toolbar"></div>');
        group.forEach((tool,j) => {
            if(tool.headIcon) $("#toolbar"+i).append('<img class="icon" src="'+tool.headIcon+'">');
            if(tool.disabled) $("#toolbar"+i).append('<button id="'+tool.id+'" class="btn disabled" disabled><img class="icon" src="'+tool.icon+'"></button>');
            else $("#toolbar"+i).append('<button id="'+tool.id+'" class="btn"><img class="icon" src="'+tool.icon+'"></button>');
            $("#"+tool.id).click(tool.click);
        })
    });
    
}
function switchTool(id){
    var button = $("#"+id);
    if(button.length>0) {
        var tmp = toolgroups.filter(group => group.filter(tool => tool.id == id).length>0)[0];
        tmp = tmp.filter(tool => tool.id == id)[0];
        
        if(button.is(':disabled')) {
            button.prop('disabled', false);
            button.removeClass('disabled');
            tmp.disabled = false;
        }
        else {
            button.prop('disabled', true);
            button.addClass('disabled');
            tmp.disabled = true;
        }
    }
}
function createNewElement(imageId){
    toolgroups.forEach(group => group.forEach(tool => {if(tool.disabled) switchTool(tool.id)}));
    var id = elements.data.length;
    $("#images").append('<div id="image'+id+'" class="image-element" style="width:100%;height:100%;display:block;"></div>');
    elements.data.push(new DICOMImage($("#image"+id)[0], imageId));
}
function getActiveElement(elements){
    return elements.data[elements.active];
}
function openFile(file){
    return cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
}
function setElementTools(element){
    toolgroups.forEach((group, i) => {
        group.forEach(tool => {
            $("#"+tool.id).removeClass('active');
            if(i==2){
                if(tool.id == "markers" && element.Orientation) $("#"+tool.id).addClass('active');
                else if(tool.id == "scale" && element.Scale) $("#"+tool.id).addClass('active');
                else if(tool.id == "hide" && !element.Drawings) $("#"+tool.id).addClass('active');
                else if(tool.id == "hide-meta" && element.Meta) $("#"+tool.id).addClass('active');
            }            
            if(i==3) if(tool.id == element.LMBTool) $("#"+tool.id).addClass('active');

            if(i==4) if(tool.id == element.RMBTool) $("#"+tool.id).addClass('active');
        });
    });
}
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
