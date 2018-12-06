document.addEventListener("DOMContentLoaded", function(event) { 
    var app = document.getElementById("app");
    var serverConfig;
    $.ajax({
        url: '/config/server.json',
        async: false,
        dataType: 'json',
        success: function (json) {
            serverConfig = {
                url: json.serverURL,
                username: json.login,
                password: json.password,
                qidoURLPrefix: json.qidoRoot,
                wadoURLPrefix: json.wadoRoot,
                stowURLPrefix: json.stowRoot
            }
        }
    })
    const user = new dicomWebClient.api.DICOMwebClient(serverConfig);
    var data = [];
    var table;
    var full = undefined;
    searchStudies();

    document.getElementById('file').addEventListener('change', function(e) {
        Array.prototype.forEach.call(e.target.files, function(file){
            fetch(serverConfig.url + '/instances', {
                method : "POST",
                header : {"Content-Type" : "application/dicom"},
                body : file
            })
                .catch(error => {
                    var warning = document.createElement('div');
                    warning.classList.add('warning');
                    warning.id = 'errormessage';
                    warning.innerHTML += error;
                    document.getElementById('filter').appendChild(warning);
                    return;
                })
        });
        searchStudies();
    });
    window.addEventListener('click', function(e) {
        deleteAllMenus();
    })

    function searchStudies(){
        app.innerHTML = '<div class="lds-dual-ring"></div>';
        data = [];
        user.searchForStudies()
            .then((studies) => {
                app.innerHTML = '<h3>Studies ('+serverConfig.url+')</h3>';
                buildFilter();
                app.appendChild(document.createElement('p'));
                full = studies;
                studies.forEach((e,index) => {
                    var date, name, birthday, sex, patient_id, modality, accession, physician, series, instances;

                    if (e['00080020']) date = e['00080020'].Value[0].substr(6,2) + '.' + e['00080020'].Value[0].substr(4,2) + '.' + e['00080020'].Value[0].substr(0,4) + ' ' + e['00080030'].Value[0].substr(0,2) + ':' + e['00080030'].Value[0].substr(2,2) + ':' + e['00080030'].Value[0].substr(4,2);
                    else date = '';
                    if(e['00100010']) name = e['00100010'].Value[0].replace("^", " ").replace("_", " ").replace(";", " ").replace(".", " ").replace(",", " ");
                    else name = '';
                    if(e['00100030']) birthday = e['00100030'].Value[0].substr(6,2) + '.' + e['00100030'].Value[0].substr(4,2) + '.' + e['00100030'].Value[0].substr(0,4);
                    else birthday = '';
                    if(e['00100040']) sex = e['00100040'].Value[0];
                    else sex = '';
                    if(e['00100020']) patient_id = e['00100020'].Value[0];
                    else patient_id = '';
                    if(e['00080061']) modality = e['00080061'].Value[0];
                    else modality = '';
                    if(e['00080050']) accession = e['00080050'].Value[0];
                    else accession = '';
                    if(e['00080090']) physician = e['00080090'].Value[0];
                    else physician = '';
                    if(e['00201206']) series = e['00201206'].Value[0];
                    else series = '';
                    if(e['00201208']) instances = e['00201208'].Value[0];
                    else instances = '';
                    
                    data.push({index, date, name, birthday, sex, patient_id, modality, accession, physician, series, instances})
                });
                buildStudieTable(app, data);
            })
            .catch(error => {            
                var warning = document.createElement('div');
                warning.classList.add('warning');
                warning.id = 'errormessage';
                warning.innerHTML += error;
                app.innerHTML = '';
                app.appendChild(warning);
            });
    }
    function buildStudieTable(element, data){
        var d = document.createElement('div');
        d.id = "studies-table";
        element.appendChild(d);
        table = new Tabulator("#studies-table", {
            width: "100%",
            height: "650px",
            data: data,
            layout: "fitColumns",
            columns:[
               {title:"Study Date", field:"date", sorter:"date"},
               {title:"Name", field:"name"},
               {title:"Date Of Birth", field:"birthday", sorter:"date"},
               {title:"Sex", field:"sex", width:20},
               {title:"Patient ID", field:"patient_id"},
               {title:"Modality", field:"modality"},
               {title:"Accession Number", field:"accession"},
               {title:"Referring Physician", field:"physician"},
               {title:"Series", field:"series"},
               {title:"Instances", field:"instances"},
            ],
            rowClick:function(e, row){
                window.location.replace(window.location.href + full[row._row.data.index]['0020000D'].Value[0]);
            }
        });
    }
    function buildFilter(){
        var data = document.createElement('span');
        data.id = 'filter';
        var span = document.createElement('span');
        span.innerHTML = '<label><b>Filter:</b> Field: </label>';
        var field = document.createElement('select');
        field.innerHTML = '<option></option><option value="name">Name</option><option value="date">Study Date</option><option value="birthday">Date Of Birth</option>'+
            '<option value="sex">Sex</option><option value="patient_id">Patient ID</option><option value="modality">Modality</option>'+
            '<option value="accession">Accession Number</option><option value="physician">Referring Physician</option>';
        field.addEventListener('change', updateFilter);
        span.appendChild(field);
        data.appendChild(span);
    
        span = document.createElement('span');
        span.innerHTML = '<label> Type: </label>';
        var type = document.createElement('select');
        type.innerHTML = '<option value="=">=</option><option value="<">&lt;</option><option value="<=">&lt;=</option><option value=">">&gt;</option>'+
            '<option value=">=">&gt;=</option><option value="!=">!=</option><option value="like">like</option>';
        type.addEventListener('change', updateFilter);
        span.appendChild(type);
        data.appendChild(span);
    
        span = document.createElement('span');
        span.innerHTML = '<label> Type: </label>';
        var value = document.createElement('input');
        value.type = 'text'; value.placeholder = 'value to filter';
        value.addEventListener('keyup', updateFilter);
        span.appendChild(value);
        data.appendChild(span);
    
        var button = document.createElement('button');
        button.classList.add('btn');
        button.innerHTML = 'Clear Filter';
        button.style = "margin-left:10px;"
        button.addEventListener('click', function(e){
            field.value = '';
            type.value = '=';
            value.value = '';
            table.clearFilter();
        })
        data.appendChild(button);
        button = document.createElement('button');
        button.classList.add('btn');
        button.classList.add('active');
        button.innerHTML = 'Upload DICOM to server';
        button.addEventListener('click', function(e){
            document.getElementById('file').click();
        });
        data.appendChild(button);
        app.appendChild(data);

        function updateFilter(e){
            table.setFilter(field.value,type.value,value.value);
        }
    }
    function deleteAllMenus(){
        while (document.getElementsByClassName('context-menu')[0]) {
            document.getElementsByClassName('context-menu')[0].remove();
        }
    }
});