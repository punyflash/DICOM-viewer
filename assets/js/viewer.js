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
        this._events();
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
    openSettings(){
        let element = this.getActiveElement();
        let modal = $("#modal-content");
        var data = {
            pixelSpacing: element.MetaChanger.pixelSpacing || element.metaData.string('x00280030') || element.metaData.string('x00181164') || element.metaData.string('x00182010'),
            orientationPatient: element.MetaChanger.orientationPatient || element.metaData.string('x00200037'),
            positionPatient: element.MetaChanger.positionPatient || element.metaData.string('x00200032')
        }
        if(data.pixelSpacing){
            data.pixelSpacing = data.pixelSpacing.split("\\");
            data.pixelSpacing.forEach((e,i) => data.pixelSpacing[i] = parseFloat(e));
        } else data.pixelSpacing = [0, 0];
        if(data.orientationPatient){
            data.orientationPatient = data.orientationPatient.split("\\");
            data.orientationPatient.forEach((e,i) => data.orientationPatient[i] = parseFloat(e));
        } else data.orientationPatient = [0, 0, 0, 0, 0, 0];
        if(data.positionPatient){
            data.positionPatient = data.positionPatient.split("\\");
            data.positionPatient.forEach((e,i) => data.positionPatient[i] = parseFloat(e));
        } else data.positionPatient = [0, 0, 0];

        modal.html('<table class="settings-table">'+
                    '<tr><th>Setting</th><th>Value</th></tr>'+
                    '<tr><td>Pixel Spacing</td><td>'+
                        '<label>x: </label><input id="ps-X" min="0.001" step="0.001" type="number" style="width: 12.35em" placeholder="'+data.pixelSpacing[0]+'">'+
                        '<label> y: </label><input id="ps-Y" min="0.001" step="0.001" type="number" style="width: 12.35em" placeholder="'+data.pixelSpacing[1]+'"></td></tr>'+
                    '<tr><td>Image Orientation (Patient) - Row cossines</td><td>'+
                        '<label>x (R/L): </label><input id="io-R-X" min="-1" max="1" step="0.01" type="number" style="width: 4em" placeholder="'+data.orientationPatient[0]+'">'+
                        '<label> y (A/P): </label><input id="io-R-Y" min="-1" max="1" step="0.01" type="number" style="width: 4em" placeholder="'+data.orientationPatient[1]+'">'+
                        '<label> z (F/H): </label><input id="io-R-Z" min="-1" max="1" step="0.01" type="number" style="width: 4em" placeholder="'+data.orientationPatient[2]+'"></td></tr>'+
                    '<tr><td>Image Orientation (Patient) - Column cossines</td><td>'+
                        '<label>x (R/L): </label><input id="io-C-X" min="-1" max="1" step="0.01" type="number" style="width: 4em" placeholder="'+data.orientationPatient[3]+'">'+
                        '<label> y (A/P): </label><input id="io-C-Y" min="-1" max="1" step="0.01" type="number" style="width: 4em" placeholder="'+data.orientationPatient[4]+'">'+
                        '<label> z (F/H): </label><input id="io-C-Z" min="-1" max="1" step="0.01" type="number" style="width: 4em" placeholder="'+data.orientationPatient[5]+'"></td></tr>'+
                    '<tr><td>Image Posiiton (Patient)</td><td>'+
                        '<label>x: </label><input id="ip-X" step="0.01" type="number" style="width: 7.45em" placeholder="'+data.positionPatient[0]+'">'+
                        '<label> y: </label><input id="ip-Y" step="0.01" type="number" style="width: 7.45em" placeholder="'+data.positionPatient[1]+'">'+
                        '<label> z: </label><input id="ip-Z" step="0.01" type="number" style="width: 7.45em" placeholder="'+data.positionPatient[2]+'"></td></tr></table>');
        modal.append(function(){
            return $('<button class="btn" style="float:right;padding:13px;margin:13px;">Apply</button>').click(function(){
                if($("#ps-X").val()!='') data.pixelSpacing[0] = parseFloat($("#ps-X").val());
                if($("#ps-Y").val()!='') data.pixelSpacing[1] = parseFloat($("#ps-Y").val());
                if($("#io-R-X").val()!='') data.orientationPatient[0] = parseFloat($("#io-R-X").val());
                if($("#io-R-Y").val()!='') data.orientationPatient[1] = parseFloat($("#io-R-Y").val());
                if($("#io-R-Z").val()!='') data.orientationPatient[2] = parseFloat($("#io-R-Z").val());
                if($("#io-C-X").val()!='') data.orientationPatient[3] = parseFloat($("#io-C-X").val());
                if($("#io-C-Y").val()!='') data.orientationPatient[4] = parseFloat($("#io-C-Y").val());
                if($("#io-C-Z").val()!='') data.orientationPatient[5] = parseFloat($("#io-C-Z").val());        
                if($("#ip-X").val()!='') data.positionPatient[0] = parseFloat($("#ip-X").val());
                if($("#ip-Y").val()!='') data.positionPatient[1] = parseFloat($("#ip-Y").val());
                if($("#ip-Z").val()!='') data.positionPatient[2] = parseFloat($("#ip-Z").val());
                
                element.MetaChanger.pixelSpacing = data.pixelSpacing[0] + "\\" + data.pixelSpacing[1];
                element.MetaChanger.orientationPatient = data.orientationPatient[0] + "\\" + data.orientationPatient[1] + "\\" + data.orientationPatient[2] + "\\" + data.orientationPatient[3] + "\\" + data.orientationPatient[4] + "\\" + data.orientationPatient[5];
                element.MetaChanger.positionPatient = data.positionPatient[0] + "\\" + data.positionPatient[1] + "\\" + data.positionPatient[2];

                $("#modal")[0].style.display = "none";
                $("#modal-content")[0].innerHTML = "";
                cornerstone.updateImage(element.element);                
            });
        });
        modal.append(function(){
            return $('<button class="btn" style="float:right;padding:13px;margin:13px;">Set Default</button>').click(function(){
                element.MetaChanger.pixelSpacing = undefined;
                element.MetaChanger.orientationPatient = undefined;
                element.MetaChanger.positionPatient = undefined;
                
                $("#modal")[0].style.display = "none";
                $("#modal-content")[0].innerHTML = "";
                cornerstone.updateImage(element.element);    
            });
        })
        this._displayModal();
    }
    openStudies(){
        $("#modal-content").html('<div class="lds-dual-ring"></div>');
        this._displayModal();
        if(this.study) this._fetchInstances();
        else this._fetchStudies();
    }
    loadStudie(studyID, patientId){
        this.study = studyID;
        this.patient = patientId;
    }

    _fetchStudies(){
        let modal = $("#modal-content");
        if(!this.client){
            $.get('/config/server.json', data => {
                const serverConfig = {
                    url: data.serverURL,
                    username: data.login,
                    password: data.password,
                    qidoURLPrefix: data.qidoRoot,
                    wadoURLPrefix: data.wadoRoot,
                    stowURLPrefix: data.stowRoot
                };
                this.client = new dicomWebClient.api.DICOMwebClient(serverConfig);
                this.client.searchForStudies()
                .then(data => {
                    this._tabulateStudies(modal, data);
                })
                .catch(error => {
                    this.client = undefined;
                    modal.html('<div class="warning" id="errormessage">'+error+'</div>');
                    return;
                });
            })
        } else  {
            this.client.searchForStudies()
            .then(data => {
                this._tabulateStudies(modal, data);
            })
            .catch(error => {
                this.client = undefined;
                modal.html('<div class="warning" id="errormessage">'+error+'</div>');
                return;
            });
        }
    }
    _fetchInstances(){
        let modal = $("#modal-content");
        if(!this.client){
            $.get('/config/server.json', data => {
                const serverConfig = {
                    url: data.serverURL,
                    username: data.login,
                    password: data.password,
                    qidoURLPrefix: data.qidoRoot,
                    wadoURLPrefix: data.wadoRoot,
                    stowURLPrefix: data.stowRoot
                };
                this.client = new dicomWebClient.api.DICOMwebClient(serverConfig);
                this.client.searchForInstances({studyInstanceUID: this.study})
                    .then(data => {
                        this._tabulateInstances(modal, data);
                    })
                    .catch(error => {
                        this.client = undefined;
                        modal.html('<div class="warning" id="errormessage">'+error+'</div>');
                        return;
                    });
            })
        } else  {
            this.client.searchForInstances({studyInstanceUID: this.study})
                .then(data => {
                    this._tabulateInstances(modal, data);
                })
                .catch(error => {
                    this.client = undefined;
                    modal.html('<div class="warning" id="errormessage">'+error+'</div>');
                    return;
                });
        }
    }
    _tabulateStudies(source, studies){
        source.html('<h3>Studies</h3>');
        source.append(
            '<span>'+
                '<label>Field: </label><select id="filter-field">'+
                    '<option></option>'+
                    '<option value="name">Name</option>'+
                    '<option value="date">Study Date</option>'+
                    '<option value="birthday">Date Of Birth</option>'+
                    '<option value="sex">Sex</option><option value="patient_id">Patient ID</option>'+
                    '<option value="modality">Modality</option><option value="accession">Accession Number</option>'+
                    '<option value="physician">Referring Physician</option></select></span><span>'+
                '<label> Type: </label><select id="filter-type">'+
                    '<option value="=">=</option>'+
                    '<option value="<">&lt;</option>'+
                    '<option value="<=">&lt;=</option>'+
                    '<option value=">">&gt;</option>'+
                    '<option value=">=">&gt;=</option>'+
                    '<option value="!=">!=</option>'+
                    '<option value="like">like</option></select></span><span>'+
                '<label> Value: </label><input id="filter-value" type="text" placeholder="value to filter"></span>'+
                '<button id="filter-clear" class="btn" style="margin-left: 10px;">Clear Filter</button><p></p>');
        source.append('<div id="studies-table"></div>');
        var data = [];
        studies.forEach((e,i) => {
            var date, name, birthday, sex, patient_id, modality, accession, physician, series, instances;
            if(e['00080020']) date = e['00080020'].Value[0];
            if(e['00080030']) date += ' '+e['00080030'].Value[0];
            if(e['00100010']) name = e['00100010'].Value[0].replace("^", " ").replace("_", " ").replace(";", " ").replace(".", " ").replace(",", " ");
            if(e['00100030']) birthday = e['00100030'].Value[0];
            if(e['00100040']) sex = e['00100040'].Value[0];
            if(e['00100020']) patient_id = e['00100020'].Value[0];
            if(e['00080061']) modality = e['00080061'].Value[0];
            if(e['00080050']) accession = e['00080050'].Value[0];
            if(e['00080090']) physician = e['00080090'].Value[0];
            if(e['00201206']) series = e['00201206'].Value[0];
            if(e['00201208']) instances =  e['00201208'].Value[0];
            data.push({index: i, date, name, birthday, sex, patient_id, modality, accession, physician, series, instances});
        })
        const _this = this;
        var table = new Tabulator("#studies-table", {
            width: "100%",
            height: "300px",
             data: data,
             layout: "fitColumns",
             columns:[
                {title:"Study Date", field:"date", sorter:"number", width:160},
                {title:"Name", field:"name", width:180},
                {title:"Date Of Birth", field:"birthday", sorter:"number", width:90},
                {title:"Sex", field:"sex", width:20},
                {title:"Patient ID", field:"patient_id", sorter:"number", width:50},
                {title:"Modality", field:"modality", width:20},
                {title:"Accession Number", field:"accession", width:140},
                {title:"Referring Physician", field:"physician", width:130},
                {title:"Series", field:"series", sorter:"number", width:20},
                {title:"Instances", field:"instances", sorter:"number", width:20},
             ],
             rowClick:function(e, row){
                var studyID = studies[row._row.data.index]['0020000D'].Value[0];
                var patientID = studies[row._row.data.index]['00100020'].Value[0];
                source.html('<div class="lds-dual-ring"></div>');
                _this.loadStudie(studyID, patientID);
                _this._fetchInstances();
             },
        });
        $("#filter-field").change(updateFilter);
        $("#filter-type").change(updateFilter);
        $("#filter-value").keyup(updateFilter);
        $("#filter-clear").click(event => {
            $("#filter-field").val('');
            $("#filter-type").val('=');
            $("#filter-value").val('');
            table.clearFilter();
        })
        function updateFilter(event){
            table.setFilter($("#filter-field").val(), $("#filter-type").val(), $("#filter-value").val());
        }
    }
    _tabulateInstances(source, instances){
        if(this.patient) source.html('<h3>Instances (patient '+this.patient+')</h3>');
        else source.html('<h3>Instances</h3>');
        source.append(
            '<span>'+
                '<label>Field: </label><select id="filter-field">'+
                    '<option></option>'+
                    '<option value="series">Series</option>'+
                    '<option value="instance">Instance</option>'+
                    '<option value="description">Description</option>'+
                    '<option value="character_set">Character Set</option>'+
                    '<option value="modality">Moadlity</option>'+
                    '<option value="rows">Rows</option>'+
                    '<option value="columns">Columns</option>'+
                    '<option value="bits">Bits/Pixel</option></select></span><span>'+
                '<label> Type: </label><select id="filter-type">'+
                    '<option value="=">=</option>'+
                    '<option value="<">&lt;</option>'+
                    '<option value="<=">&lt;=</option>'+
                    '<option value=">">&gt;</option>'+
                    '<option value=">=">&gt;=</option>'+
                    '<option value="!=">!=</option>'+
                    '<option value="like">like</option></select></span><span>'+
                '<label> Value: </label><input id="filter-value" type="text" placeholder="value to filter"></span>'+
                '<button id="filter-clear" class="btn" style="margin-left: 10px;">Clear Filter</button>'+
                ' <button id="back-to-studies" class="btn" style="margin-left: 10px;">Back to studies</button><p></p>');
        source.append('<div id="instances-table"></div>');
        var data = [];
        instances.forEach((e,i) => {
            var description, character_set, modality, series, instance, rows, columns, bits;
            if(e['0008103E']) description = e['0008103E'].Value[0];
            if(e['00080005']) character_set = e['00080005'].Value[0];
            if(e['00080060']) modality = e['00080060'].Value[0];
            if(e['00200011']) series = e['00200011'].Value[0];
            if(e['00200013']) instance = e['00200013'].Value[0];
            if(e['00280010']) rows = e['00280010'].Value[0];
            if(e['00280011']) columns = e['00280011'].Value[0];
            if(e['00280100']) bits = e['00280100'].Value[0];
            data.push({index: i, series, instance, description, character_set, modality, rows, columns, bits});
        })
        const _this = this;
        var table = new Tabulator("#instances-table", {
            width: "100%",
            height: "300px",
             data: data,
             layout: "fitColumns",
             columns:[
                {title:"Series", field:"series", sorter:"number", width:40},
                {title:"Instance", field:"instance", sorter:"number", width:40},
                {title:"Description", field:"description", width:588},
                {title:"Character Set", field:"character_set", width:100},
                {title:"Moadlity", field:"modality", width:40},
                {title:"Rows", field:"rows", sorter:"number", width:40},
                {title:"Columns", field:"columns", sorter:"number", width:40},
                {title:"Bits/Pixel", field:"bits", sorter:"number", width:40},
             ],
             rowClick: function(e, row){
                const url = _this.client.buildInstanceWadoURIUrl({
                    studyInstanceUID: instances[row._row.data.index]['0020000D'].Value[0],
                    seriesInstanceUID: instances[row._row.data.index]['0020000E'].Value[0],
                    sopInstanceUID: instances[row._row.data.index]['00080018'].Value[0]
                });
                _this._displayInstance(url);
                $("#modal")[0].style.display = "none";
                $("#modal-content")[0].innerHTML = "";
            }
        });
        $("#filter-field").change(updateFilter);
        $("#filter-type").change(updateFilter);
        $("#filter-value").keyup(updateFilter);
        $("#filter-clear").click(event => {
            $("#filter-field").val('');
            $("#filter-type").val('=');
            $("#filter-value").val('');
            table.clearFilter();
        })
        $("#back-to-studies").click(event => {
            this.study = undefined;
            this.openStudies();
        })
        function updateFilter(event){
            table.setFilter($("#filter-field").val(), $("#filter-type").val(), $("#filter-value").val());
        }

    }
    _displayInstance(url){        
        fetch(url).then(res => res.blob()).then(blob => {
            this.loadFile(this.active, blob);
        });
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
    _displayModal(){
        $("#modal")[0].style.display = 'block'
    }
    _events(){
        const _this = this;
        window.addEventListener('click', function(e){
            var modal = $("#modal")[0];
            var content = $("#modal-content")[0];
            if (e.target == modal) {
                modal.style.display = "none";
                content.innerHTML = "";
            }
        });
        document.getElementsByClassName("close")[0].addEventListener('click', function(e) {
            $("#modal")[0].style.display = "none";
            $("#modal-content")[0].innerHTML = "";
        });
        $('#file').on('click touchstart', function(){
            $(this).val('');
        });
        $('#file').on("change", function(e){
            const file = e.target.files[0];
            _this.loadFile(_this.active, file);
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
        this.imageId = imageId;
        this.Orientation = false;
        this.Drawings = true;
        this.Scale = false;
        this.Meta = true;
        this.MetaChanger = {pixelSpacing: undefined, orientationPatient: undefined, positionPatient: undefined};
        this.stack = {currentImageIdIndex : 0 ,imageIds: [], id: ''};
        this.LMBTool = '';
        this.RMBTool = '';
        this.Active = true;

        cornerstone.enable(element);
        this._createMetaHandles(element.id);
        this._registerEvents();

        cornerstone.loadAndCacheImage(imageId).then((image) => {
            this._setMeta(image.data);
            cornerstone.displayImage(element, image);
            this._enableTools(element);
        });
        cornerstone.metaData.addProvider(metaDataProvider);

        const _this = this;
        function metaDataProvider(type, imageId){
            return _this._metaDataProvider(type, imageId);
        }
    }
    destroy(){
        cornerstone.disable(this.element);
        cornerstone.metaData.removeProvider(metaDataProvider);
        this.element.innerHTML = '';

        const _this = this;
        function metaDataProvider(type, imageId){
            return _this._metaDataProvider(type, imageId);
        }
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
            this.Active = true;
        }
        else {
            if(this.LMBTool!='') this._unsetLMBTool();
            if(this.RMBTool!='') this._unsetRMBTool();
            this.Active = false;
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
        if(!this.Active) return;
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
        if(type === 'imagePlaneModule' && imageId === this.imageId && this.metaData) {
            var pixelSpacing = this.MetaChanger.pixelSpacing || this.metaData.string('x00280030') || this.metaData.string('x00181164') || this.metaData.string('x00182010') || undefined;
            if(pixelSpacing){
                pixelSpacing = pixelSpacing.split('\\');
                pixelSpacing.forEach((e, i) => pixelSpacing[i] = parseFloat(e));
                var rowPixelSpacing = pixelSpacing[0];
                var columnPixelSpacing = pixelSpacing[1];
            }
            
            var orientationPatient = this.MetaChanger.orientationPatient || this.metaData.string('x00200037') || undefined;
            var rowCosines = undefined;
            var columnCosines = undefined;
            if(orientationPatient){
                orientationPatient = orientationPatient.split('\\');
                orientationPatient.forEach((e, i) => orientationPatient[i] = parseFloat(e));
    
                rowCosines = [orientationPatient[0], orientationPatient[1], orientationPatient[2]];
                columnCosines = [orientationPatient[3], orientationPatient[4], orientationPatient[5]];
            }
    
            var positionPatient = this.MetaChanger.positionPatient || this.metaData.string('x00200032') || undefined;
            if(positionPatient){
                positionPatient = positionPatient.split('\\');
                positionPatient.forEach((e, i) => positionPatient[i] = parseFloat(e));
            }
    
            var sliceThickness = this.metaData.string('x00180050') || undefined;
            if(sliceThickness) sliceThickness = parseFloat(sliceThickness);
    
            var sliceLocation = this.metaData.string('x00201041') || undefined;
            if(sliceLocation) sliceLocation = parseFloat(sliceLocation);
    
            return {
                frameOfReferenceUID: this.metaData.string('x00200052') || null,
                rows: this.metaData.int16('x00280010') || null,
                columns: this.metaData.int16('x00280011') || null,
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

$(document).ready(() => {
    setCornerstoneConfig();
    var toolgroups = [
        [
            {   
                id: 'home', icon: 'icons/home.svg',
                click: function(e){
                    window.location.href = (window.location.protocol+'//'+window.location.host);
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
                    viewer.openStudies();
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
                    viewer.openSettings();
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
    const viewer = new Viewer(toolgroups);
    let study = window.location.pathname.replace("/", '');
    if(study != 'viewer'){
        viewer.loadStudie(study);
        viewer.openStudies(study);
    }
});