const path = require('path')
const express = require('express')
const browserify = require('express-browserify')

const app = express()
app.set('view engine', 'jade');

app.listen(3000)
app.use(express.static('assets'))

app.get('/js/bundle.js', browserify({
	require: [
		'hammerjs',
		'jquery',
		'cornerstone-core/dist/cornerstone.js',
		'cornerstone-math/dist/cornerstoneMath.js',
		'cornerstone-tools/dist/cornerstoneTools.js',
		'dicom-parser',
		'cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoader.js',
		'dicomweb-client',
		'tabulator-tables',
		'moment'
	]
}));
app.get('/js/WebWorker.js', (request, response) => {
	response.sendFile(path.join(__dirname+'/node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.js'));
});
app.get('/js/Codecs.js', (request, response) => {
	response.sendFile(path.join(__dirname+'/node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.js'));
});


app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname+'/views/studies.html'));
})
app.get('/viewer', (request, response) => {
    response.sendFile(path.join(__dirname+'/views/viewer.html'));
})
app.get('/:studyId', (request, response) => {
	response.sendFile(path.join(__dirname+'/views/viewer.html'));
})
