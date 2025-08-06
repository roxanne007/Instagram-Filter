// Image of Husky Creative commons from Wikipedia:
// https://en.wikipedia.org/wiki/Dog#/media/File:Siberian_Husky_pho.jpg
var filterIndex = 1;
var imgIn;
var imgOut;
var matrix = [
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64],
    [1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64, 1/64]
];

// matrixX and Y for horizontal and vertical edge detection
var matrixX = [    
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1]
];
var matrixY = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
];
/////////////////////////////////////////////////////////////////
function preload() {
    imgIn = loadImage("assets/husky.jpg");
}
/////////////////////////////////////////////////////////////////
function setup() {
    createCanvas((imgIn.width * 2), imgIn.height);
//    pixelDensity(1);
}
/////////////////////////////////////////////////////////////////
function draw() {
    background(125);
    image(imgIn, 0, 0);
    image(earlyBirdFilter(imgIn), imgIn.width, 0);
    noLoop();
}
/////////////////////////////////////////////////////////////////
function mousePressed(){
    loop(); 
}
/////////////////////////////////////////////////////////////////
function earlyBirdFilter(imgObj){
    imgOut = createImage(imgIn.width, imgIn.height);
    var resultImg = createImage(imgObj.width, imgObj.height);
    
    // users have 3 filter options which can be switched by pressing 1, 2 or 3
    if(filterIndex == 1){
        resultImg = sepiaFilter(imgIn);
        resultImg = darkCorners(resultImg);
        resultImg = radialBlurFilter(resultImg);
        resultImg = borderFilter(resultImg);
    }else if(filterIndex == 2){
        resultImg = greyscaleFilter(imgIn);    
        resultImg = darkCorners(resultImg);
        resultImg = radialBlurFilter(resultImg);
        resultImg = borderFilter(resultImg);
    }else if(filterIndex == 3){
        resultImg = edgeDetectionFilter(imgIn);
        resultImg = darkCorners(resultImg);
        resultImg = radialBlurFilter(resultImg);
        resultImg = borderFilter(resultImg);
    }
        
    return resultImg;
}

// filter activated by pressing 1
function sepiaFilter(imgObj){
    imgOut.loadPixels();
    imgObj.loadPixels();
    
    for(var x = 0; x < imgOut.width; x++){
        for(var y = 0; y < imgOut.height; y++){
            var pixelIndex = ((imgOut.width * y) + x) * 4;
            var oldRed = imgObj.pixels[pixelIndex + 0];
            var oldGreen = imgObj.pixels[pixelIndex + 1];
            var oldBlue = imgObj.pixels[pixelIndex + 2];
            
            var newRed = (oldRed * .393) + (oldGreen * .769) + (oldBlue * .189);
            var newGreen = (oldRed * .349) + (oldGreen * .686) + (oldBlue * .168);
            var newBlue = (oldRed * .272) + (oldGreen * .534) + (oldBlue * .131);
            
            newRed = constrain(newRed, 0 , 255);
            newGreen = constrain(newGreen, 0 , 255);
            newBlue = constrain(newBlue, 0 , 255);
            
            imgOut.pixels[pixelIndex+0] = newRed;
            imgOut.pixels[pixelIndex+1] = newGreen;
            imgOut.pixels[pixelIndex+2] = newBlue;
            imgOut.pixels[pixelIndex+3] = 255;
        }
    }
    
    imgOut.updatePixels();
    return imgOut;
}

function darkCorners(imgObj){
    imgOut.loadPixels();
    imgObj.loadPixels();
    var midX = imgObj.width/2;
    var midY = imgObj.height/2;
    var maxDist = dist(midX, midY, 0, 0);
    
    for(var x = 0; x < imgObj.width; x++){
        for(var y = 0; y < imgObj.height; y++){
            
            var d = dist(midX, midY, x, y);
//            console.log("d: " + d);
            
            if(d>300){
                var pixelIndex = ((imgObj.width * y) + x) * 4;
                var oldRed = imgObj.pixels[pixelIndex + 0];
                var oldGreen = imgObj.pixels[pixelIndex + 1];
                var oldBlue = imgObj.pixels[pixelIndex + 2];    
                
                if(d < 450){
                   var dynLum = map(d, 300, 450, 1, 0.4);
                }else{
                    var dynLum = map(d, 450, maxDist, 0.4, 0);
                }
                imgOut.pixels[pixelIndex+0] = oldRed * dynLum;
                imgOut.pixels[pixelIndex+1] = oldGreen * dynLum;
                imgOut.pixels[pixelIndex+2] = oldBlue * dynLum;
                imgOut.pixels[pixelIndex+3] = 255;
            }
        }
    }
    imgOut.updatePixels();
    return imgOut;
}

function radialBlurFilter(imgObj){
    imgOut.loadPixels();
    imgObj.loadPixels();
    var matrixSize = matrix.length;
    console.log(width);

    for(var x = 0; x < imgObj.width; x++){
        for(var y = 0; y < imgObj.height; y++){
            var pixelIndex = ((imgObj.width * y) + x) * 4;
            var oldRed = imgObj.pixels[pixelIndex + 0];
            var oldGreen = imgObj.pixels[pixelIndex + 1];
            var oldBlue = imgObj.pixels[pixelIndex + 2];
            
            var c = convolution(x, y, matrix, matrixSize, imgObj);
            
            var mouseDist = dist(x + 750, y, mouseX, mouseY);
            var dynBlur = map(mouseDist, 100, 300, 0, 1);
            dynBlur = constrain(dynBlur, 0, 1);
            
            var newRed = c[0] * dynBlur + oldRed * (1 - dynBlur);
            var newGreen = c[1] * dynBlur + oldGreen * (1 - dynBlur);
            var newBlue = c[2] * dynBlur + oldBlue * (1 - dynBlur);
            
            imgOut.pixels[pixelIndex + 0] = newRed;
            imgOut.pixels[pixelIndex + 1] = newGreen;
            imgOut.pixels[pixelIndex + 2] = newBlue;
            imgOut.pixels[pixelIndex + 3] = 255;
        }
    }
    
    imgOut.updatePixels();
    return imgOut;
}

function convolution(x, y, matrix, matrixSize, imgObj){
    var totalRed = 0.0;
    var totalGreen = 0.0;
    var totalBlue = 0.0;
    var offset = floor(matrixSize/2);
    
    for(var i = 0; i < matrixSize; i++){
        for(var j = 0; j < matrixSize; j++){
    
            var xloc = x + i - offset;
            var yloc = y + i - offset;
            var index = (xloc + imgObj.width * yloc) * 4;
            
            index = constrain(index, 0, imgObj.pixels.length - 1); 
            
            totalRed += imgObj.pixels[index + 0] * matrix[i][j]; 
            totalGreen += imgObj.pixels[index + 1] * matrix[i][j]; 
            totalBlue += imgObj.pixels[index + 2] * matrix[i][j];
        }
    }
    return [totalRed, totalGreen, totalBlue]; 
}

function borderFilter(imgObj){
    var buffer = createGraphics(imgObj.width, imgObj.height);
    buffer.image(imgObj, 0, 0);
    buffer.noFill();
    buffer.stroke(255, 255, 255);
    buffer.strokeWeight(40);
    buffer.rect(0, 0, imgObj.width, imgObj.height, 100);
    buffer.strokeWeight(35);
    buffer.rect(0, 0, imgObj.width, imgObj.height);
    return buffer;
}

// filter activated by pressing 2
function greyscaleFilter(imgObj){
    imgOut.loadPixels();
    imgObj.loadPixels();

    for (x = 0; x < imgOut.width; x++) {
        for (y = 0; y < imgOut.height; y++) {

            var pixelIndex = (x + y * imgOut.width) * 4;

            var r = imgObj.pixels[pixelIndex + 0];
            var g = imgObj.pixels[pixelIndex + 1];
            var b = imgObj.pixels[pixelIndex + 2];

            var gray = (r + g + b) / 3; // simple
            // var gray = r * 0.299 + g * 0.587 + b * 0.0114; // LUMA ratios

            imgOut.pixels[pixelIndex+0]= imgOut.pixels[pixelIndex+1] = imgOut.pixels[pixelIndex+2] = gray;
            imgOut.pixels[pixelIndex+3]= 255;
        }
    }
    imgOut.updatePixels();
    return imgOut;
}

// invert with i
function invertFilter(imgObj){
    imgOut.loadPixels();
    imgObj.loadPixels();

    for (var x = 0; x < imgOut.width; x++) {
        for (var y = 0; y < imgOut.height; y++) {

            var index = (x + y * imgOut.width) * 4;

            var r = 255 - imgObj.pixels[index + 0];
            var g = 255 - imgObj.pixels[index + 1];
            var b = 255 - imgObj.pixels[index + 2];

            imgOut.pixels[index + 0] = r;
            imgOut.pixels[index + 1] = g;
            imgOut.pixels[index + 2] = b;
            imgOut.pixels[index + 3] = 255;
        }
    }
    imgOut.updatePixels();
    return imgOut;
}

// filter activated by pressing 3
function edgeDetectionFilter(imgObj){
  var matrixSize = matrixX.length;

  imgOut.loadPixels();
  imgObj.loadPixels();

  // read every pixel
  for (var x = 0; x < imgOut.width; x++) {
      for (var y = 0; y < imgOut.height; y++) {

          var index = (x + y * imgOut.width) * 4;
          var cX = convolution(x, y, matrixX, matrixSize, imgObj);
          var cY = convolution(x, y, matrixY, matrixSize, imgObj);

          cX = map(abs(cX[0]), 0, 1020, 0, 255);
          cY = map(abs(cY[0]), 0, 1020, 0, 255);
          var combo = cX + cY;

          imgOut.pixels[index + 0] = combo;
          imgOut.pixels[index + 1] = combo;
          imgOut.pixels[index + 2] = combo;
          imgOut.pixels[index + 3] = 255;
      }
  }
  imgOut.updatePixels();
  return imgOut;
}

function keyPressed() {
    // press left arrow key 
    if (key === '1') {
        filterIndex = 1;
        loop();
    } 
    // press right arrow key to go to next image
    if (key === '2') {
        filterIndex = 2;
        loop();
    }
    // press r key for a random image
    if (key === '3'){
        filterIndex = 3;
        loop();
    }
    // stops any default behaviour
    return false; 
}
//Roxanne Bell