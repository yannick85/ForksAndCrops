var tabCharCode = {
    65 : "a",
    66 : "b",
    67 : "c",
    68 : "d",
    69 : "e",
    70 : "f",
    71 : "g",
    72 : "h",
    73 : "i",
    74 : "j",
    75 : "k",
    76 : "l",
    77 : "m",
    78 : "n",
    79 : "o",
    80 : "p",
    81 : "q",
    82 : "r",
    83 : "s",
    84 : "t",
    85 : "u",
    86 : "v",
    87 : "w",
    88 : "x",
    89 : "y",
    90 : "z",
    48 : "0",
    49 : "1",
    50 : "2",
    51 : "3",
    52 : "4",
    53 : "5",
    54 : "6",
    55 : "7",
    56 : "8",
    57 : "9",
};

$(document).ready(function() {
    //creation des keyboard shortcut
    var createKeyboardShortCurt = function () {
        $("[data-ks]").each(function() {
            var letter = $(this).data("ks");
            $(this).prepend("<div class=\"ks\">"+letter+"</div>");
            $(this).addClass("ks-"+letter);
            $(this).removeAttr("data-ks");
        });
    };
    createKeyboardShortCurt();
    $(document).keydown(function(e){
        if (!$("#chat_new_message").is(":focus")) {
            var returnFalse = false;
            switch (e.keyCode) {
                case 37 : //fleche gauche
                    tryMove(1,0);
                    returnFalse = true;
                    break;
                case 39 : //droite
                    tryMove(-1,0);
                    returnFalse = true;
                    break;
                case 38 ://haut
                    tryMove(0,-1);
                    returnFalse = true;
                    break;
                case 40 ://bas
                    tryMove(0,1);
                    returnFalse = true;
                    break;
                case 32 ://space
                    if (!$("#chat_new_message").is(":focus")) {
                        $("#chat_new_message").focus();
                    }
                    break;
                case 13 ://enter
                    
                    break;
                case 27 ://escap
                    
                    break;
                default:
                    if (tabCharCode[e.keyCode] != undefined) {
                        var letter = tabCharCode[e.keyCode];
                        $(".ks-" + letter).each(function () {
                            if ($(this).is(":visible")) {
                                $(this).click();
                            };
                        });
                    }
                    break;
            };
            if (returnFalse) {
                return false;
            }
        };
    });
});


/*

KEY_DOWN    = 40;
KEY_UP      = 38;
KEY_LEFT    = 37;
KEY_RIGHT   = 39;

KEY_END     = 35;
KEY_BEGIN   = 36;

KEY_BACK_TAB    = 8;
KEY_TAB             = 9;
KEY_SH_TAB      = 16;
KEY_ENTER           = 13;
KEY_ESC             = 27;
KEY_SPACE           = 32;
KEY_DEL             = 46;

KEY_A       = 65;
KEY_B       = 66;
KEY_C       = 67;
KEY_D       = 68;
KEY_E       = 69;
KEY_F       = 70;
KEY_G       = 71;
KEY_H       = 72;
KEY_I       = 73;
KEY_J       = 74;
KEY_K       = 75;
KEY_L       = 76;
KEY_M       = 77;
KEY_N       = 78;
KEY_O       = 79;
KEY_P       = 80;
KEY_Q       = 81;
KEY_R       = 82;
KEY_S       = 83;
KEY_T       = 84;
KEY_U       = 85;
KEY_V       = 86;
KEY_W       = 87;
KEY_X       = 88;
KEY_Y       = 89;
KEY_Z       = 90;

KEY_PF1     = 112;
KEY_PF2     = 113;
KEY_PF3     = 114;
KEY_PF4     = 115;
KEY_PF5     = 116;
KEY_PF6     = 117;
KEY_PF7     = 118;
KEY_PF8     = 119;

0   48
1   49
2   50
3   51
4   52
5   53
6   54
7   55
8   56
9   57 

*/