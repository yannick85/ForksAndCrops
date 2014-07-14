var base = require('./dao/base.js'); 

base.query("DELETE FROM public.square;DELETE FROM public.user;DELETE FROM public.user_weapon;", function () { console.log("Nothing left"); });