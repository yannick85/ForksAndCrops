Fog = fabric.util.createClass(fabric.Path,  { 
    type: 'fog',
    initialize: function(square) {
        options = { 
            left: 0,
            top: 0,
            fill: 'rgba(0,0,0,0.5)',
            selectable : false,
        };
        var sh = (squareHeight);
        var sw = (squareWidth);
        var ch = (canvasHeight);
        var cw = (canvasWidth);
        
        /* ajout sur les bord du fog */
        var bh = slideTolerance * sh;
        var bw = slideTolerance * sw;
        
        /* taille du bloc fog global */
        var fh = ch + bh*2;
        var fw = ch + bh*8/*2*/;
        
        /* taille interieur (trou) fog */
        var ih = (1 + radius*2) * sh; 
        var iw = (1 + radius*2) * sw; 
        
        /* placement centre */
        var px = (cw-iw) /2;
        var py = ((ch-ih) + sh*2) ;
        
        
        ih = ih/2;
        iw = iw/2;
        this.callSuper('initialize',
            "M -" + bw + " -" + bh + " l " + fw + " 0 l 0 " + fh + " l -" + fw + " 0 l 0 -" + fh + " z" +
            "M " + px + " " + py + " l " + iw + " " + ih + " l " + iw + " -" + ih + " l -" + iw + " -" + ih + " l -" + iw + " " + ih + " z"
        );
        this.callSuper('set', options);
        
        
        this.slidedX = 0;
        this.slidedY = 0;
        
        this.slide = function(x,y) {
            var slidex = 0;
            var slidey = 0;
            if (Math.abs(( currentUserX - currentCenterX )) < slideTolerance+1 ) {
                slidex = slidex - ((-x) * (squareWidth/2));
                slidey = slidey - x * (squareHeight/2);
                this.slidedX = this.slidedX + 1;
            }
            if (Math.abs(( currentUserY - currentCenterY )) < slideTolerance+1 ) {
                slidex = slidex - (y * (squareWidth/2));
                slidey = slidey - (y * (squareHeight/2));
                this.slidedY = this.slidedY + 1;
            }
            
            this.animate('left', (this.left-slidex), { duration: animationSpeed });
            this.animate('top', (this.top-slidey), { duration: animationSpeed });
        };
    },
});