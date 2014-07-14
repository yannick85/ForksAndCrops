this.crops = [
        {
            crop_id : 0,
            name : "Tomatoes",
            maturation: 40,//in world HB
            decay: 20,//in world HB
            productivity: 4,
            storability: 1000,//in world HB
            price: 15, 
        },
        {
            crop_id : 1,
            name : "Corn",
            maturation: 50,//in world HB
            decay: 30,//in world HB
            productivity: 4,
            storability: 250,//in world HB
            price: 10, 
        },
        {
            crop_id : 2,
            name : "Aubergine",
            maturation: 80,//in world HB
            decay: 40,//in world HB
            productivity: 2,
            storability: 400,//in world HB
            price: 12,
        },
];

this.cropSellPrice = [
        15,
        15,
        40,
];


this.getLevel = function (experience) {
    var i = 0;
    var cap = this.tabLevel[i];
    var stop = false;
    while (cap != undefined && stop == false) {
        if (!(experience > cap || experience == cap)) {
            stop = true;
        } else {
            i++;
            cap = this.tabLevel[i];
        }
    }
    return i;
};

this.experienceToUp = function (level, experience) {
    if (this.tabLevel[level] != undefined) {
        return (this.tabLevel[level] - experience);
    } else {
        return 0;//level max
    }
};

this.tabLevel = [//If you pass experience points cap , you up
        0,
        50,
        150,
        400,
        800,
        1500,
        2500,
        4000,
        6000,
        8000,
        10000,
        13000,
        17000,
        22000,
        29000,
        38000,
        48000,
];

this.experience = {
        setCrop : 1,
        harvestCrop : 2,
        buyTile : 20,
        water : 0,
        fertilize : 0,
        conquerTile : 25,
};

this.getMaxHealth = function (level) {
    return 100 + level * 10;
};

this.weapons = [
      {
          weapon_id : 0,
          name : "Fork",
          description: "Basic weapon",
          power: 40,
          hit_ratio: 40,//%
          hit_per_second: 1,
          price: 1,
      },
      {
          weapon_id : 1,
          name : "Baseball Bat",
          description: "A rapid weapon",
          power: 25,
          hit_ratio: 30,//%
          hit_per_second: 3,
          price: 100,
      },
      {
          weapon_id : 2,
          name : "Chainsaw",
          description: "Too cruel !",
          power: 70,
          hit_ratio: 60,//%
          hit_per_second: 1,
          price: 1000,
      },
      {
          weapon_id : 3,
          name : "AK-47",
          description: "Your ennemy will have no chance of survival",
          power: 50,
          hit_ratio: 30,//%
          hit_per_second: 5,
          price: 5000,
      }
  ];