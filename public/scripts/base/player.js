Player = fabric.util.createClass(fabric.Rect,  {
    type: 'player',
    initialize: function(data) {
        var difX = data.x - currentCenterX;
        var difY = data.y - currentCenterY;
        
        this.userWidth = 50;
        this.userHeight = 70;
        
        this.X = data.x;
        this.Y = data.y;
        this.user_id = data.user_id;
        this.name = data.name;
        this.color = data.color;
        this.character = data.character;
        
        players[this.user_id] = this;
        canvas.add(this);
        
        options = {
            left: canvasWidth/2 + (( -difX + difY ) * (squareWidth/2)),
            top: canvasHeight/2 + (( difX + difY ) * (squareHeight/2)) - (this.userHeight / 3 ),
            strokeWidth: 0,
            stroke: 'rgba(0,0,0,0)',
            width: this.userWidth,
            height: this.userHeight
        };
        this.callSuper('initialize', options);
        
        this.legend = new fabric.Text(this.name, { left: this.left, top: this.top + 40, fontFamily: 'Impact', fontSize: 20, fill: '#FFFFFF' });
        canvas.add(this.legend);
        
        this.orientation = 0;
        this.fill = getImage("people/" + this.character + ".png");
        if (this.fill == undefined) {
            this.fill = getImage("people/dog.png");
        }
        this.fill.offsetX = this.orientation * this.userWidth;
        
        this.opacity = 0;
        this.animate('opacity', '+=1');
        
        this.lockMovementX = true;
        this.lockMovementY = true;
        this.hasControls = false;
        this.hasBorders = false;
        
        this.slide = function () {
            var difX = this.X - currentCenterX;
            var difY = this.Y - currentCenterY;
            var newLeft = canvasWidth/2 + (( -difX + difY ) * (squareWidth/2));
            var newTop = canvasHeight/2 + (( difX + difY ) * (squareHeight/2)) - (this.userHeight / 3 );
            var x = this.left - newLeft;
            var y = this.top - newTop;
                        
            this.animate('left', (this.left-x), { duration: animationSpeed });
            this.animate('top', (this.top-y), { duration: animationSpeed });
            this.legend.animate('left', (this.left-x), { duration: animationSpeed });
            this.legend.animate('top', (this.top-y+40), { duration: animationSpeed });
            
            if (Math.abs(this.X - currentUserX) > radius || Math.abs(this.Y - currentUserY) > radius) { //la personnage disparait
                this.animate('opacity', '-=1', { duration: animationSpeed });
                setTimeout ("players["+this.user_id+"].kill();", animationSpeed);
            }
        };
        
        this.intervalMove = undefined;
        this.move = function (x,y) {
            var moveX = this.X - x;
            var moveY = this.Y -y;
            if (moveX != 0 || moveY != 0) {
                if (moveX == 1) {
                    this.orientation = 1;
                }
                if (moveX == -1) {
                    this.orientation = 3;
                }
                if (moveY == 1) {
                    this.orientation = 2;
                }
                if (moveY == -1) {
                    this.orientation = 0;
                }
                
                this.fill.offsetX = this.orientation * this.userWidth;
                
                this.X = x;
                this.Y = y;
                
                this.slide();
                setTimeout("players["+this.user_id+"].finishMovement()", animationSpeed + 100);
                
                this.alternateMovement();
                this.intervalMove = setInterval("players["+this.user_id+"].alternateMovement()", 200);
            }
        };
        
        this.alternateMovement = function () {
            if (this.alternateMovementBool) {
                this.alternateMovementBool = false;
                this.fill.offsetY = 1 * this.userHeight;
            } else {
                this.alternateMovementBool = true;
                this.fill.offsetY = 2 * this.userHeight;
            }
        };
        
        this.finishMovement = function () {
            clearInterval(this.intervalMove);
            this.fill.offsetY = 0;
        };
        
        this.kill = function () {
            clearInterval(this.intervalMove);
            canvas.remove(players[this.user_id]);
            canvas.remove(this.legend);
            delete players[this.user_id].legend;
            delete players[this.user_id];
            delete this;
        };
    },
});

MyPlayer = fabric.util.createClass(Player,  {
    type: 'myplayer',
    initialize: function() {
        
        var data = {
            color : playerData.color,
            character : playerData.character,
            name : playerData.name,
            x : currentUserX,
            y : currentUserY,
            user_id : playerData.user_id
        };
        this.callSuper('initialize', data);
        
        this.hasMoved = function () {
            this.move(currentUserX, currentUserY);
        };
    },
});