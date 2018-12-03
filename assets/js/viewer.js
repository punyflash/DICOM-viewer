class Viewer {
    constructor(toolgroups){
        this.elements = [];
        this.toolgroups = toolgroups;
        this.active = undefined;
        this.DoubleView = false;

        toolgroups.forEach((group, i) => {
            $("#tools").append('<div id="toolbar'+i+'" class="toolbar"></div>');
            group.forEach((tool,j) => {
                if(tool.headIcon) $("#toolbar"+i).append('<img class="icon" src="'+tool.headIcon+'">');
                $("#toolbar"+i).append('<button id="'+tool.id+'" class="btn"><img class="icon" src="'+tool.icon+'"></button>');
                $("#"+tool.id).click(tool.click);
            })
        });
        this.createElement();
    }
    createElement(){
        const id = this.elements.length;
        $("#images").append('<div id="image'+id+'" class="image-element"></div>');
        const _this = this;
        $("#image"+id).click(function(e){
            _this.setActiveElement(id);
        });
        $("#image"+id).contextmenu(function(e){
            _this.setActiveElement(id);
        });
        this.elements.push({element: undefined, image: $("#image"+id)});
        this.elements.forEach(e => {
            if(id>0) e.image[0].style = "width:50%;height:100%;display:inline-block;";
            else e.image[0].style = "width:100%;height:100%;display:inline-block;";
            if(e.element) cornerstone.resize(e.element.element);
        })
        this.setActiveElement(id);
        return id;        
    }
    destroyLastElement(){
        const id = this.elements.length-1;
        if(id<0) return;
        if(this.elements[id].element) this.elements[id].element.destroy();
        this.elements[id].image.remove();
        this.elements.pop();
        this.elements.forEach(e => {
            if(id>1) e.image[0].style = "width:50%;height:100%;display:inline-block;";
            else e.image[0].style = "width:100%;height:100%;display:inline-block;";
            if(e.element) cornerstone.resize(e.element.element);
        });
        this.setActiveElement(id-1);
    }
    loadFile(into, file){ 
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        this.loadFileByImageId(into, imageId);
        this.setActiveElement(into);
    }
    loadFileByImageId(into, imageId){
        if(!this.elements[into]) return;
        this.elements[into].element = new DICOMImage(this.elements[into].image[0], imageId);
        this.setActiveElement(into);
    }
    setActiveElement(id){
        if(id > this.elements.length || id<0) return;

        if(this.active == id) {this._updateTools(); return;}

        if (this.getActiveElement()) this.getActiveElement().active(false);
        this.active = id;
        const element = this.getActiveElement();
        if(element) element.active(true);
        this._updateTools();
        for(var i = 0; i < this.elements.length; i++){
            this.elements[i].image.removeClass("image-active");
            if(i==id) this.elements[i].image.addClass("image-active");
        }
    }
    getActiveCornerstoneElement(){
        return this.elements[this.active].element.element;
    }
    getActiveElement(){
        if(this.elements[this.active]) return this.elements[this.active].element;
        else return undefined;
    }
    doubleView(value){
        if(value){
            this.createElement();
            this.DoubleView = true;
        }
        else {
            this.destroyLastElement();
            this.DoubleView = false;
        }
    }
    _updateTools(){
        const element = this.getActiveElement();
        this.toolgroups.forEach((group, i) => {
            group.forEach(tool => {
                $("#"+tool.id).removeClass('active');
                $("#"+tool.id).removeClass('disabled');
                $("#"+tool.id).prop('disabled', false);

                if(!element && tool.id != "home" && tool.id != "connect" && tool.id != "open" && tool.id != "double-view"){
                    $("#"+tool.id).prop('disabled', true);
                    $("#"+tool.id).addClass('disabled');
                }
                else {
                    if(i==0){
                        if(tool.id == "double-view" && this.DoubleView) $("#"+tool.id).addClass('active')
                    }
                    if(i==2){
                        if(element && tool.id == "markers" && element.Orientation) $("#"+tool.id).addClass('active');
                        else if(element && tool.id == "scale" && element.Scale) $("#"+tool.id).addClass('active');
                        else if(element && tool.id == "hide" && !element.Drawings) $("#"+tool.id).addClass('active');
                        else if(element && tool.id == "hide-meta" && !element.Meta) $("#"+tool.id).addClass('active');
                    }            
                    if(i==3) if(element && tool.id == element.LMBTool) $("#"+tool.id).addClass('active');
        
                    if(i==4) if(element && tool.id == element.RMBTool) $("#"+tool.id).addClass('active');
                }
            });
        });
    }
}
class DICOMImage {
    constructor(element, imageId){
        this.element = element;
        this.setNewImage(imageId);
    }

    setNewImage(imageId){
        var element = this.element;
        try { this.destroy() } catch { }
        cornerstone.metaData.addProvider(this._metaDataProvider);
        this.imageId = imageId;
        this.Orientation = false;
        this.Drawings = true;
        this.Scale = false;
        this.Meta = true;
        this.MetaChanger = {pixelSpacing: undefined, orientationPatient: undefined, positionPatient: undefined};
        this.stack = {currentImageIdIndex : 0 ,imageIds: [], id: ''};
        this.LMBTool = '';
        this.RMBTool = '';

        cornerstone.enable(element);
        this._createMetaHandles(element.id);
        this._registerEvents();

        cornerstone.loadAndCacheImage(imageId).then((image) => {
            this._setMeta(image.data);
            cornerstone.displayImage(element, image);
            this._enableTools(element);
        });
    }
    destroy(){
        cornerstone.disable(this.element);
        cornerstone.metaData.removeProvider(this._metaDataProvider);
        this.element.innerHTML = '';
    }
    showOrientation(value){
        this.Orientation = value;
        if(value) cornerstoneTools.orientationMarkers.enable(this.element);
        else cornerstoneTools.orientationMarkers.disable(this.element);
        cornerstone.updateImage(this.element);
    }
    showDrawings(value){
        this.Drawings = value;
        if(value){
            cornerstoneTools.length.enable(this.element);
            cornerstoneTools.ellipticalRoi.enable(this.element);
            cornerstoneTools.rectangleRoi.enable(this.element);
            cornerstoneTools.simpleAngle.enable(this.element);
            cornerstoneTools.probe.enable(this.element);
            cornerstoneTools.arrowAnnotate.enable(this.element);
            cornerstoneTools.seedAnnotate.enable(this.element);
        } else {
            cornerstoneTools.length.disable(this.element);
            cornerstoneTools.ellipticalRoi.disable(this.element);
            cornerstoneTools.rectangleRoi.disable(this.element);
            cornerstoneTools.simpleAngle.disable(this.element);
            cornerstoneTools.probe.disable(this.element);
            cornerstoneTools.arrowAnnotate.disable(this.element);
            cornerstoneTools.seedAnnotate.disable(this.element);
        }
    }
    showMeta(value){
        this.Meta = value;
        cornerstone.updateImage(this.element);
    }
    showScale(value){
        this.Scale = value;
        if(value) cornerstoneTools.scaleOverlayTool.enable(this.element);
        else cornerstoneTools.scaleOverlayTool.disable(this.element);
    }
    setTool(name){
        switch(name){
            case 'wwwc': 
                this._unsetLMBTool();
                this.LMBTool = 'wwwc';
                this.showDrawings(true);
                cornerstoneTools.wwwc.activate(this.element, 1);                
                break;
            case 'length':
                this._unsetLMBTool();
                this.LMBTool = 'length';
                this.showDrawings(true);
                cornerstoneTools.length.activate(this.element, 1);
                break;
            case 'angle': 
                this._unsetLMBTool();
                this.LMBTool = 'angle';
                this.showDrawings(true);
                cornerstoneTools.simpleAngle.activate(this.element, 1);
                break;
            case 'rectangle':
                this._unsetLMBTool();
                this.LMBTool = 'rectangle';
                this.showDrawings(true);
                cornerstoneTools.rectangleRoi.activate(this.element, 1);
                break;
            case 'elipse':
                this._unsetLMBTool();
                this.LMBTool = 'elipse';
                this.showDrawings(true);
                cornerstoneTools.ellipticalRoi.activate(this.element, 1);
                break;
            case 'probe':
                this._unsetLMBTool();
                this.LMBTool = 'probe';
                this.showDrawings(true);
                cornerstoneTools.probe.activate(this.element, 1);
                break;
            case 'arrow':
                this._unsetLMBTool();
                this.LMBTool = 'arrow';
                this.showDrawings(true);
                cornerstoneTools.arrowAnnotate.activate(this.element, 1);
                break;
            case 'seed':
                this._unsetLMBTool();
                this.LMBTool = 'seed';
                this.showDrawings(true);
                cornerstoneTools.seedAnnotate.activate(this.element, 1);
                break;
            case 'zoom':
                this._unsetRMBTool();
                this.RMBTool = 'zoom';
                cornerstoneTools.zoom.activate(this.element, 4);
                break;
            case 'magnify':
                this._unsetRMBTool();
                this.RMBTool = 'magnify';
                cornerstoneTools.magnify.activate(this.element, 4);
                break;
            case 'rotate':
                this._unsetRMBTool();
                this.RMBTool = 'rotate';
                cornerstoneTools.rotate.activate(this.element, 4);
                break;
            case 'pan':
                this._unsetRMBTool();
                this.RMBTool = 'pan';
                cornerstoneTools.pan.activate(this.element, 4);
                break;
        }
    }
    active(value){
        if(value){
            if(this.LMBTool!='') this.setTool(this.LMBTool);
            if(this.RMBTool!='') this.setTool(this.RMBTool);
        }
        else {
            if(this.LMBTool!='') this._unsetLMBTool();
            if(this.RMBTool!='') this._unsetRMBTool();
        }
    }
    
    _setMeta(imageData){
        this.metaData = imageData;
        this.stack.id = this.imageId
        if(imageData && imageData.string('x00280008'))
            for(var i=0; i<parseInt(imageData.string('x00280008')); i++) this.stack.imageIds[i] = this.imageId + '?frame=' + i;
        else this.stack.imageIds[0] = this.imageId;
    }
    _unsetLMBTool(){
        switch(this.LMBTool){
            case 'wwwc': 
                cornerstoneTools.wwwc.deactivate(this.element, 1);
                break;
            case 'length':
                cornerstoneTools.length.deactivate(this.element, 1);
                break;
            case 'angle': 
                cornerstoneTools.simpleAngle.deactivate(this.element, 1);
                break;
            case 'rectangle':
                cornerstoneTools.rectangleRoi.deactivate(this.element, 1);
                break;
            case 'elipse':
                cornerstoneTools.ellipticalRoi.deactivate(this.element, 1);
                break;
            case 'probe':
                cornerstoneTools.probe.deactivate(this.element, 1);
                break;
            case 'arrow':
                cornerstoneTools.arrowAnnotate.deactivate(this.element, 1);
                break;
            case 'seed':
                cornerstoneTools.seedAnnotate.deactivate(this.element, 1);
                break;
        }
    }    
    _unsetRMBTool(){
        switch(this.RMBTool){            
            case 'zoom':
                cornerstoneTools.zoom.deactivate(this.element, 4);
                break;
            case 'magnify':
                cornerstoneTools.magnify.deactivate(this.element, 4);
                break;
            case 'rotate':
                cornerstoneTools.rotate.deactivate(this.element, 4);
                break;
            case 'pan':
                cornerstoneTools.pan.deactivate(this.element, 4);
                break;
        }
    }
    _enableTools(element){
        cornerstoneTools.keyboardInput.enable(element);
        cornerstoneTools.mouseInput.enable(element);
        cornerstoneTools.mouseWheelInput.enable(element);
        cornerstoneTools.wwwc.enable(element);
        cornerstoneTools.length.enable(element);
        cornerstoneTools.simpleAngle.enable(element);
        cornerstoneTools.rectangleRoi.enable(element);
        cornerstoneTools.ellipticalRoi.enable(element);
        cornerstoneTools.probe.enable(element);
        cornerstoneTools.arrowAnnotate.enable(element);
        cornerstoneTools.seedAnnotate.enable(element);
        cornerstoneTools.zoom.enable(element);
        cornerstoneTools.magnify.enable(element);
        cornerstoneTools.rotate.enable(element);
        cornerstoneTools.pan.enable(element);
        cornerstoneTools.addStackStateManager(this.element, ['stack', 'playClip']);
        cornerstoneTools.addToolState(this.element, 'stack', this.stack);
        cornerstoneTools.stackScrollWheel.activate(this.element);
    }
    _createMetaHandles(elementId){
        $("#"+elementId).append('<div id="topleft'+elementId+'"class="overlay" style="position: absolute; top: 0px; left: 0px; text-align: left;"></div>'+
                                '<div id="topright'+elementId+'"class="overlay" style="position: absolute; top: 0px; right: 0px; text-align: right;"></div>'+
                                '<div id="bottomleft'+elementId+'"class="overlay" style="position: absolute; bottom: 0px; left: 0px; text-align: left;"></div>'+
                                '<div id="bottomright'+elementId+'"class="overlay" style="position: absolute; bottom: 0px; right: 0px; text-align: right;"></div>');
        this.overlay = {
            topleft: $("#topleft"+elementId)[0],
            topright: $("#topright"+elementId)[0],
            bottomleft: $("#bottomleft"+elementId)[0],
            bottomright: $("#bottomright"+elementId)[0]
        }
    }
    _registerEvents(){
        var _this = this;
        this.element.addEventListener("mousemove", function(event) {
            _this._mouseMove(event);
        });
        this.element.addEventListener("cornerstoneimagerendered", function(event) {
            _this._imageRendered(event);
        });
        this.element.addEventListener("contextmenu", function(event) {
            _this._contextMenu(event);
        });
        window.addEventListener('click', function(e) {
            _this._deleteAllMenus();
        });
    }
    _mouseMove(event) {
        if(!this.stack.imageIds[0] || !this.Meta) return;
        const pixelCoords = cornerstone.pageToPixel(this.element, event.pageX, event.pageY);
        this.overlay.bottomleft.innerHTML = '';
        if(this.renderData && pixelCoords.x>0 && pixelCoords.y>0 && pixelCoords.x<=this.renderData.image.columns && pixelCoords.y<=this.renderData.image.rows) {
            this.overlay.bottomleft.innerHTML += " X: " + pixelCoords.x.toFixed(0) + " Y: " + pixelCoords.y.toFixed(0);
        }
    }
    _imageRendered(event) {
        cornerstone.setToPixelCoordinateSystem(event.detail.enabledElement, event.detail.canvasContext);
        this.renderData = event.detail;

        if(this.Meta) {
            this.overlay.topleft.innerHTML = 'Im: '+(this.stack.currentImageIdIndex+1)+'/'+this.stack.imageIds.length;
            this.overlay.bottomright.innerHTML = "WW: " + Math.round(event.detail.viewport.voi.windowWidth) + 
                                                 " WL: " + Math.round(event.detail.viewport.voi.windowCenter) + 
                                                 " Zoom: " + event.detail.viewport.scale.toFixed(2);
            if(this.metaData){
                if(this.metaData.string('x00200011')) this.overlay.topleft.innerHTML += '</br>Se: '+this.metaData.string('x00200011');
                this.overlay.topright.innerHTML = '';
                if(this.metaData.string('x00100010')) this.overlay.topright.innerHTML += this.metaData.string('x00100010')
                    .replace("^", " ").replace("_", " ").replace(";", " ").replace(".", " ").replace(",", " ")+'<br>';
                
                if(this.metaData.string('x00100020')) this.overlay.topright.innerHTML += this.metaData.string('x00100020')+'<br>';
                if(this.metaData.string('x00100030')) 
                    this.overlay.topright.innerHTML += this.metaData.string('x00100030').substr(6,2) + '.' + 
                                                       this.metaData.string('x00100030').substr(4,2) + '.' + 
                                                       this.metaData.string('x00100030').substr(0,4);
                
                if(this.metaData.string('x00100040')) this.overlay.topright.innerHTML += ' ' + this.metaData.string('x00100040')+ '<br>'
                if(this.metaData.string('x00080080')) this.overlay.topright.innerHTML += this.metaData.string('x00080080')+ '<br>'
                if(this.metaData.string('x00080050')) this.overlay.topright.innerHTML += this.metaData.string('x00080050')+ '<br>'
                if(this.metaData.string('x0008103e')) this.overlay.topright.innerHTML += '<br>' +this.metaData.string('x0008103e')+ '<br>'
                if(this.metaData.string('x00080022') && this.metaData.string('x00080032')) 
                    this.overlay.topright.innerHTML += '<br>' + this.metaData.string('x00080022').substr(6,2) + '.' + 
                                                        this.metaData.string('x00080022').substr(4,2) + '.' + 
                                                        this.metaData.string('x00080022').substr(0,4) + ' ' + 
                                                        this.metaData.string('x00080032').substr(0,2) + ':' + 
                                                        this.metaData.string('x00080032').substr(2,2) + ':' + 
                                                        this.metaData.string('x00080032').substr(4,2);
            }
        }
        else {
            this.overlay.topright.innerHTML = '';
            this.overlay.bottomright.innerHTML = '';
            this.overlay.topleft.innerHTML = '';
            this.overlay.bottomleft.innerHTML = '';
        }
    }
    _contextMenu(event) {
        this._deleteAllMenus();
        const supportedTools = ['length', 'ellipticalRoi', 'rectangleRoi', 'simpleAngle', 'probe', 'arrowAnnotate', 'seedAnnotate'];
        const pixelCoords = {x: event.offsetX, y: event.offsetY};
        const element = this.element;
        var childs = [];
        var success = false;

        supportedTools.forEach(toolName => {
            const state = cornerstoneTools.getToolState(element, toolName);
            const check = cornerstoneTools[toolName].pointNearTool;
            if(state) state.data.forEach((data, j) => {
                if(check(element,data,pixelCoords)){
                    success = true;
                    childs.push(function(){
                        return $('<div class="context-child">Remove '+toolName+(j+1)+'</div>').click(function(e){
                            cornerstoneTools.removeToolState(element,toolName,data);
                            cornerstone.updateImage(element);
                        })
                    });
                }
            })
        });
        if(success) {
            $("body").append('<div id="context" class="context-menu" style="top:'+event.pageY+';left:'+event.pageX+';"></div>');
            childs.forEach(e => $("#context").append(e));
        }
    }
    _deleteAllMenus(){
        while (document.getElementsByClassName('context-menu')[0]) {
            document.getElementsByClassName('context-menu')[0].remove();
        }
    }
    _Loading(value){
        if(value){
            this.overlay.topleft.innerHTML = '<div class="lds-dual-ring"></div>';
            this.Loading = true;
        }
        else {
            this.overlay.topleft.innerHTML = '';
            this.Loading = false;
        }
    }
    _metaDataProvider(type, imageId){
        if(type === 'imagePlaneModule') {
            const element = this;
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
}
function setCornerstoneConfig(){
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.external.Hammer = Hammer;
    cornerstoneTools.toolStyle.setToolWidth(2);
    cornerstoneTools.toolStyle.setActiveWidth(0);
    cornerstoneTools.toolColors.setToolColor("#FFFF00");
    cornerstoneTools.toolColors.setActiveColor("#32CD32");
    cornerstoneTools.toolColors.setFillColor("#32CD32");
    cornerstoneTools.orientationMarkers.setConfiguration({drawAllMarkers: true});

    cornerstoneWADOImageLoader.configure({
        beforeSend: function(xhr) {
            // Add custom headers here (e.g. auth tokens)
            //xhr.setRequestHeader('x-auth-token', 'my auth token');
        },
        useWebWorkers: true,
    });
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
        maxWebWorkers: 8,
        startWebWorkersOnDemand: true,
        webWorkerPath : 'js/WebWorker.js',
        webWorkerTaskPaths: [],
        taskConfiguration: {
            decodeTask : {
                loadCodecsOnStartup: true,
                initializeCodecsOnStartup: false,
                codecsPath: 'Codecs.js',
                usePDFJS: false,
                strict: true
            }
        }
    });
}


let viewer;
$(document).ready(() => {
    setCornerstoneConfig();
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
                id: 'double-view', icon: 'icons/squares.svg',
                click: function(e){
                    if(viewer.DoubleView) {
                        viewer.doubleView(false);
                        $("#double-view").removeClass("active");
                    }
                    else {
                        viewer.doubleView(true);
                        $("#double-view").addClass("active");
                    }
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
    viewer = new Viewer(toolgroups);
    $('#file').on('click touchstart', function(){
        $(this).val('');
    });
    $('#file').on("change", function(e){
        const file = e.target.files[0];
        viewer.loadFile(viewer.active, file);
    }); 
});