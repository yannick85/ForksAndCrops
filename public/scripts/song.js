var sound = {
        volume : 1,
        list : {},
        add : function (name) {
            this.list[name] = new Audio('http://' + document.location.host + '/song/' + name);
        },
        play : function (name) {
            this.list[name].volume = this.volume;
            this.list[name].play();
            this.list[name].name = name;
            this.list[name].addEventListener('ended', function() {
                sound.add(this.name);
            });
        },
        
        startBackgroundMusic : function () {
            if (this.list["background.ogg"] != undefined) {
                this.list["background.ogg"].addEventListener('ended', function() {
                    setTimeout(function () { sound.startBackgroundMusic(); }, 2000);
                });
                this.play("background.ogg");
            } else {
                console.log("No background song");
            }
        },
        mute : function () {
            this.setVolume(0);
            
        },
        setVolume : function (newVolume) {
            this.volume = newVolume;
            for (var i in this.list) {
                var s = this.list[i];
                s.volume = this.volume;
            }
        },
};