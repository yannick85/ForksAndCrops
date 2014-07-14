Square = fabric.util.createClass(fabric.Path,  {
    type: 'square',
    initialize: function(square) {
        var difX = (square.x - currentCenterX);
        var difY = (square.y - currentCenterY);
        var options = {
            left: canvasWidth/2 + (( (-difX) + difY ) * (squareWidth/2)),
            top: canvasHeight/2 + (( difX + difY ) * (squareHeight/2)),
            strokeWidth: 1,
            stroke: 'rgba(0,0,0,1)'
        };
        var h = (squareHeight-1) /2;
        var w = (squareWidth-1) /2;
        /*
         * [{x: -w-w/2, y: h},
          {x: 0-w/2, y: h*2},
          {x: w-w/2, y: h},
          {x: 0-w/2, y: 0}]
         */
        this.callSuper('initialize',  'm -' + w + ' ' + (w-h) + ' ' + w + ' -' + h + ' ' + w + ' ' + h + ' -' + w + ' ' + h + ' -' + w +' -' + h );
        this.callSuper('set', options);
        
        this.lockMovementX = true;
        this.lockMovementY = true;
        this.hasControls = false;
        this.hasBorders = false;
        this.opacity = 0;
        this.animate('opacity', '+=1');
        
        this.X = square.x;
        this.Y = square.y;
        this.selected = false;
        
        this.image = new SquareImage(this.left, this.top);
        canvas.add(this.image);
        
        this.update = function (square) {
            this.fertility = square.fertility;
            this.humidity = square.humidity;
            this.owner_id = square.owner_id;
            this.owner_name = square.owner_name;
            this.crop_id = square.crop_id;
            this.crop_health = square.crop_health;
            this.crop_maturity = square.crop_maturity;
            if (this.selected) {
                showSquareInfo(this);
            }
            if (this.crop_id != null) {
                this.fill = getImage('tile/ground.png');
                //associate the maturity to a stage
                var cropMaturity = this.crop_maturity *100 /cropList[this.crop_id].maturation;
                if (cropMaturity > 100) {
                    cropMaturity = 100;
                }
                var maturityStage = 0;
                if (cropMaturity > 20) {
                    maturityStage = 1;
                }
                if (cropMaturity > 40) {
                    maturityStage = 2;
                }
                if (cropMaturity > 60) {
                    maturityStage = 3;
                }
                if (cropMaturity > 80) {
                    maturityStage = 4;
                }
                this.image.setImage('tile/crop/' + this.crop_id + "/" + maturityStage + '.png');
            } else {
                this.fill = getImage('tile/grass.png');
                this.image.cancelImage();
            }
            if (!this.selected) {
                if (this.owner_id == playerData.user_id) {
                    this.stroke = 'rgba(100, 255, 100, 1)';
                } else {
                    if (this.owner_id != null) {
                        this.stroke = 'rgba(255, 143, 0,1)';
                    } else {
                        this.stroke = 'rgba(0,0,0,1)';
                    }
                }
            }
            
            if (square.square_id == undefined) {
                this.fill = "#440";
            };
        };
        
        this.update(square);

        this.select = function () {
            if (this.selected == true) {
                this.unselect();
            } else {
                if (selectedSquare != null) {
                    selectedSquare.unselect();
                }
                selectedSquare = this;
                this.selected = true;
                this.strokeWidth = 3;
                this.stroke = 'rgba(255,0,0,1)';
                showSquareInfo();
            }
        };
        this.unselect = function () {
            this.selected = false;
            this.strokeWidth = 1;
            if (this.owner_id == playerData.user_id) {
                this.stroke = 'rgba(100, 255, 100, 1)';
            } else {
                if (this.owner_id != null) {
                    this.stroke = 'rgba(255, 143, 0,1)';
                } else {
                    this.stroke = 'rgba(0,0,0,1)';
                }
            }
            hideSquareInfo();
        };
        
        this.slide = function(x,y) {
            this.animate('left', (this.left-x), { duration: animationSpeed });
            this.animate('top', (this.top-y), { duration: animationSpeed });
            this.image.animate('left', (this.left-x), { duration: animationSpeed });
            this.image.animate('top', (this.top-y), { duration: animationSpeed });
        };
    },
});

SquareImage = fabric.util.createClass(fabric.Rect,  {
    type: 'squareimage',
    initialize: function(parentLeft, parentTop) {
        options = {
            left: parentLeft,
            top: parentTop,
            width: 0,
            height: 0,
            fill: "rgba(255,255,255,0)",
            strokeWidth: 0,
            stroke: 'rgba(255,255,255,0)'
        };
        this.callSuper('set', options);
        
        this.opacity = 0;
        this.lockMovementX = true;
        this.lockMovementY = true;
        this.hasControls = false;
        this.hasBorders = false;
        this.originX = 0;
        this.originY = 0;
        
        this.imageName = "";
        
        this.setImage = function (name) {
            if (name != this.imageName) {
                this.imageName = name;
                var img = getImage(name);
                /*this.height = img.source().height;
                this.width = img.source().width;*/
                this.height = img.source.height;
                this.width = img.source.width;
                this.fill = img;
                this.opacity = 0;
                this.animate('opacity', '+=1');
            }
        };
        
        this.cancelImage = function () {
            this.imageName = "";
            this.fill = "rgba(255,255,255,0)";
            this.height = 0;
            this.width = 0;
            this.opacity = 0;
        };
    },
});