var patternSourceCanvas = {};

var loading = function (callback) {
    var listImg = [
            "tile/grass.png", "tile/ground.png",
            "tile/crop/0/0.png", "tile/crop/0/1.png", "tile/crop/0/2.png", "tile/crop/0/3.png", "tile/crop/0/4.png",
            "tile/crop/1/0.png", "tile/crop/1/1.png", "tile/crop/1/2.png", "tile/crop/1/3.png", "tile/crop/1/4.png",
            "tile/crop/2/0.png", "tile/crop/2/1.png", "tile/crop/2/2.png", "tile/crop/2/3.png", "tile/crop/2/4.png",
            "people/female.png","people/claudiagreen.png","people/claudiapink.png","people/dog.png","people/sheep.png",
            "people/farmerblue.png","people/farmerdarkblue.png","people/farmergreen.png","people/farmerorange.png","people/farmerpink.png",
            "people/farmeryellow.png","people/farmerwhite.png","people/farmerred.png",
    ];
    var listSong = [
            "setcrop.ogg", "background.ogg", "harvestcrop.ogg", "rain.ogg", "wind.ogg"
    ];
    
    var listFileSize = 0;
    for (var key in listImg) 
    {
        listFileSize++;
    }
    for (var key in listSong) 
    {
        listFileSize++;
    }
    var listFileI = 0;
    for (var key in listImg) 
    {
        var name = listImg[key];
        //console.log("Loading image : " + name);
        fabric.util.loadImage('http://' + document.location.host + '/img/' + name, function(img) {//Image.fromURL
            var src = img.src;
            patterns[src] = new fabric.Pattern({
                source: img,
                repeat: "repeat",
            });
            //console.log("Image loaded : " + src);
            listFileI++;
            finishLoading();
         });
    }
    
    for (var key in listSong) 
    {
        var name = listSong[key];
        sound.add(name);
        listFileI++;
        finishLoading();
    }
    
    function finishLoading () {
        if (listFileI == listFileSize) {
            callback();
            console.log("Loading complete");
        }
    }
};


