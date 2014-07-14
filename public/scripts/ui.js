function showSquareInfo () {
    var square = selectedSquare;
    $("#square_info #square_x").html("" + square.X);
    $("#square_info #square_y").html("" + square.Y);
    $("#square_info #square_humidity").html("" + square.humidity);
    $("#square_info #square_fertility").html("" + square.fertility);
    
    if (square.crop_id != null) {
        var cropName = "";
        var cropMaturity = 0;
        for (var id in cropList) {
            if (id == square.crop_id) {
                cropName = cropList[id].name; 
                cropMaturity = square.crop_maturity *100 /cropList[id].maturation;
                if (cropMaturity > 100) {
                    cropMaturity = 100;
                }
            }
        }
        $("#square_info #square_crop_name").html("" + cropName);
        $("#square_info #square_crop_health").html("" + square.crop_health);
        $("#square_info #square_crop_maturity").html("" + cropMaturity);
    } else {
        $("#square_info #square_crop_name").html("-");
        $("#square_info #square_crop_health").html("-");
        $("#square_info #square_crop_maturity").html("-");
    }
    
    if (square.owner_id != null) {
        $("#square_info #square_owner").html("" + square.owner_name);
        if (square.owner_id == playerData.user_id) {//my square
            if (square.crop_id == null) {
                $("#set_crop").show();
            } else {
                $("#remove_crop").show();
                if (square.fertility < 70) {
                    $("#fertilize_crop").show();
                }
                if (square.humidity < 70) {
                    $("#water_crop").show();
                }
                if (cropMaturity > 80) {
                    $("#sell_crop").show();
                }
            }
        } else {//other player square
            if (//si voisin
                    (tabSquares[(square.X) + 1 ] != undefined && (tabSquares[(square.X) + 1 ][(square.Y)].owner_id == playerData.user_id)) ||
                    (tabSquares[(square.X) - 1 ] != undefined && tabSquares[(square.X) - 1 ][(square.Y)].owner_id == playerData.user_id) ||
                    tabSquares[(square.X)][(square.Y) + 1].owner_id == playerData.user_id ||
                    tabSquares[(square.X)][(square.Y) - 1].owner_id == playerData.user_id
                ) 
            {
                $("#attack_square").show();
                $("#attack_square_price").html("500 gold");
            }
        }
    } else {
        $("#square_info #square_owner").html("-");
        try {
            if (//si voisin
                    (tabSquares[(square.X) + 1 ] != undefined && (tabSquares[(square.X) + 1 ][(square.Y)].owner_id == playerData.user_id)) ||
                    (tabSquares[(square.X) - 1 ] != undefined && tabSquares[(square.X) - 1 ][(square.Y)].owner_id == playerData.user_id) ||
                    tabSquares[(square.X)][(square.Y) + 1].owner_id == playerData.user_id ||
                    tabSquares[(square.X)][(square.Y) - 1].owner_id == playerData.user_id
                ) 
            {
                $("#buy_square").show();
                $("#buy_square_price").html("500 gold");
            }
        } catch (e){
            //console.log(e);
        } finally {
            
        }
    }
}

function hideSquareInfo () {
    $("#square_info #square_x").html("");
    $("#square_info #square_y").html("");
    $("#square_info #square_humidity").html("");
    $("#square_info #square_fertility").html("");
    $("#square_info #square_owner").html("");
    $("#square_info #square_crop_name").html("");
    $("#set_crop").hide();
    $("#crop_list").hide();
    $("#remove_crop").hide();
    $("#fertilize_crop").hide();
    $("#water_crop").hide();
    $("#sell_crop").hide();
    $("#buy_square").hide();
    $("#attack_square").hide();
}

function showUserPositionInfo () {
    $("#user_position_x").html("" + currentUserX);
    $("#user_position_y").html("" + currentUserY);
}

$("#set_crop").click(function () {
    $("#crop_list").slideDown();
    return false;
});

$("#crop_list a").click(function () {
    setCropForSquare($(this).data("crop-id"), { x: selectedSquare.X, y : selectedSquare.Y });
    $("#set_crop").hide();
    $("#crop_list").hide();
    return false;
});

function showMoney (money) {
    $("#user_info #user_money").html(money);
}

function showUsername (username) {
    $("#user_info #user_name").html(username);
}

function showLevel (level) {
    $("#user_info #user_level").html(level);
}

function showHealth (health) {
    $("#user_info #user_health").html(health);
}

function showExperienceToUp (experienceToUp) {
    $("#user_info #user_experience_to_up").html(experienceToUp);
}

function showExperienceWon (experience) {//petite animation de gain d'expérience
    
}

function showTerritorySize (territorySize) {
    $("#user_info #user_territory_size").html(territorySize);
}

$("#sell_crop").click(function () {
    sellCrop();
    $("#sell_crop").hide();
    return false;
});

$("#remove_crop").click(function () {
    removeCrop();
    return false;
});

$("#fertilize_crop").click(function () {
    fertilizeCrop();
    return false;
});

$("#water_crop").click(function () {
    waterCrop();
    return false;
});

$("#stock_crop").click(function () {
    stockCrop();
    $("#stock_crop").hide();
    return false;
});


$("#buy_square").click(function () {
    buySelectedTile();
    $("#buy_square").hide();
    return false;
});

$("#attack_square").click(function () {
    if (confirm("Are you sure tou want to attack ?")) {
        attackSelectedTile();
        $("#attack_square").hide();
    }
    return false;
});

var messageId = 0;
var messageShownDuration = 5000;
function showMessage(message) {
    $("#message_info_box").append("<div class=\"message\" id=\"message" + messageId + "\"></div>");
    $("#message" + messageId).hide();
    $("#message_info_box").show('fade');
    $("#message" + messageId).show('fade');
    $("#message" + messageId).html(message);
    
    setTimeout("$(\"#message" + messageId + "\").hide('fade', function() { $(\"#message" + messageId + "\").remove(); if ($(\"#message_info_box\").children().length == 0) { $(\"#message_info_box\").hide('fade'); } });", messageShownDuration);
    
    messageId++;
}

var popupId = 0;
function showPopup(title, message, confirm) {
    if (confirm == undefined) {
        confirm = "OK";
    }
    var popupStr = "<div class=\"popup\" data-popupid=\"" + popupId + "\" style=\"display:none;\"><div class=\"popup-title\">";
    popupStr += title;
    popupStr += "</div><div class=\"popup-message\">";
    popupStr += message;
    popupStr += "</div><div class=\"popup-confirm\">"+confirm+"</div></div>";
    
    $("#popup_wrapper").append(popupStr);
    $("#popup_wrapper .popup[data-popupid="+popupId+"]").show("fade");
    
    popupId++;
    
    $("#popup_wrapper .popup .popup-confirm").click(function () {
        $(this).parent().hide("fade");
    });
}

$(".panel .panel-inside").hide();
$(".panel .panel-title").click(function ()  {
    var effect = "fade";
    var panel = $(this).parent();
    var panelInside = $(panel).children(".panel-inside");
    if ($(panelInside).hasClass("active")) {
        $(panelInside).removeClass("active");
        $(panelInside).hide(effect);
    } else {
        $(".panel .panel-inside.active").hide(effect);
        $(".panel .panel-inside.active").removeClass("active");
        $(panelInside).addClass("active");
        $(panelInside).show(effect);
    }
});


function showMarketCrop (data) {
    $("#crop_market").html("");
    for (var id in data) {
        var cropPrice = data[id];
        $("#crop_market").append("<div class=\"one-market-crop\">" + cropList[id].name+ " : " + cropPrice + " gold</div>");
    };
    $("#crop_market_wrapper .panel-refresh").removeClass("waiting");
}
$("#crop_market_wrapper .panel-title").click( function () {
    $("#crop_market_wrapper .panel-refresh").click();
});
$("#crop_market_wrapper .panel-refresh").click( function () {
    $("#crop_market_wrapper .panel-refresh").addClass("waiting");
    server.getMarketCrop();
});

function showNaturalEvent (data) {
    $("#natural_event").html("");
    for (var id in data) {
        var event = data[id];
        $("#natural_event").append("<div class=\"one-natural-event\" title=\""+event.description+"\">" + event.name + " x:" + event.x +  ",y:" + event.y + "</div>");
    };
    $("#natural_event_wrapper .panel-refresh").removeClass("waiting");
}
$("#natural_event_wrapper .panel-title").click( function () {
    $("#natural_event_wrapper .panel-refresh").click();
});
$("#natural_event_wrapper .panel-refresh").click( function () {
    $("#natural_event_wrapper .panel-refresh").addClass("waiting");
    server.getNaturalEventList();
});


function showWeapons (data) {
    $("#weapons").html("");
    for (var id in data) {
        var weapon = data[id];
        var str = "<div data-wid=\"" + weapon.weapon_id + "\" data-price=\"" + weapon.price + "\" data-name=\"" + weapon.name + "\" class=\"one-weapon";
        if (weapon.owned && !weapon.current) {
            str += " equipWeapon";
        }
        if (weapon.current) {
            str += " current";
        }
        if (!weapon.owned) {
            str += " buyWeapon";
        }
        str += "\" title=\"" + weapon.description + "\">" + weapon.name;
        if (!weapon.owned) {
            str += " (" + weapon.price + " gold)";
        }
        str += "</div>";
        $("#weapons").append(str);
    };
    $("#weapons_wrapper .panel-refresh").removeClass("waiting");
    $("#weapons .buyWeapon").click( function () {
        if (confirm("Buy " + $(this).data("name") + " for " + $(this).data("price") + " gold?" )) {
            var wid = $(this).data("wid");
            server.buyWeapon(wid);
        }
    });
    $("#weapons .equipWeapon").click( function () {
        var wid = $(this).data("wid");
        server.equipWeapon(wid);
    });
}
$("#weapons_wrapper .panel-title").click( function () {
    $("#weapons_wrapper .panel-refresh").click();
});
$("#weapons_wrapper .panel-refresh").click( function () {
    $("#weapons_wrapper .panel-refresh").addClass("waiting");
    server.getWeapons();
});


function showPlayerList (data) {
    $("#players").html("");
    for (var id in data) {
        var player = data[id];
        var str = "<div data-pid=\"" + player.user_id + "\" data-name=\"" + player.name + "\" class=\"one-player";
        var description = "";
        if (player.connected) {
            str += " connected";
            description += "Connected, ";
        } else {
            description += "Not connected, ";
        }
        description += "level " + player.level + ", last seen in x: " + player.x + ", y: " + player.y;
        str += "\" title=\"" + description + "\">" + player.name;
        str += "</div>";
        $("#players").append(str);
    };
    $("#players_wrapper .panel-refresh").removeClass("waiting");
    $("#players .connected").click( function () {
        //to chat pm
        $("#chat_new_message").val("/pm " + $(this).data("name") + " ");
        $("#chat_new_message").focus();
    });
}
$("#players_wrapper .panel-title").click( function () {
    $("#players_wrapper .panel-refresh").click();
});
$("#players_wrapper .panel-refresh").click( function () {
    $("#players_wrapper .panel-refresh").addClass("waiting");
    server.getPlayerList();
});


$("#sound_control").click(function () {
    if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).addClass("inactive");
        sound.mute();
    } else {
        $(this).addClass("active");
        $(this).removeClass("inactive");
        sound.setVolume(1);
    }
});

$("#help_button").click(function () {
    showTutorial();
});
function showTutorial () {
    var title = "Welcome on Fork & Crops";
    var text = $("#tutorial_text").html();
    showPopup(title, text);
};


$("#direction_nw").click(function () {
    tryMove(0,-1);
});

$("#direction_ne").click(function () {
    tryMove(-1,0);
});

$("#direction_sw").click(function () {
    tryMove(1,0);
});

$("#direction_se").click(function () {
    tryMove(0,1);
});