/**
 * Contierte una imagen a un string base64
 *
 * Parametros:
 *      {String}   url         
 *      {Function} callback    
 *      {String}   [outputFormat=image/png]           
 */
function img2Base64(url, callback, outputFormat){
    var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var dataURL;
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        callback.call(this, dataURL);
        canvas = null; 
    };
    img.src = url;
}

img2Base64('http://bit.ly/18g0VNp', function(base64Img){
    // Base64DataURL
});

/* DOCUMENTACION:
Formatos de entrada compatibles
	image/png
	image/jpeg
	imagen/jpg
	imagen/gif
	imagen/bmp
	imagen/tiff
	image/x-icon
	image/svg+xml
	imagen/webp
	imagen/xxx
Los formatos de salida compatibles
	image/png
	image/jpeg
	imagen/webp (chrome)

Demo:
http://jsfiddle.net/handtrix/YvQ5y/

Avanzado-Código:
https://gist.github.com/HaNdTriX/7704632

Prueba: toDataUrl tipo mime
http://kangax.github.io/jstests/toDataUrl_mime_type_test/

Compatibilidad del navegador (hasta ahora que yo sepa)
http://caniuse.com/#feat=canvas
> IE10 (IE10 sólo funciona con el mismo origen de las imágenes)
*/