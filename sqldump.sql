CREATE TABLE square
(
  square_id serial NOT NULL,
  x integer, -- coordonnees X
  y integer, -- coordonees Y
  humidity double precision, -- humiditée en pourcentage
  fertility double precision, -- fertilité en pourcentage
  owner_id integer, -- user_id du propriétaire de la case
  crop_id integer, -- identifie le crop en cours de croissance sur cette case (les crops sont des ressources statiques définies en dur dans le code)
  crop_maturity integer, -- la maturité, nombre de World Hearthbeat que ce crop a vécu
  crop_health double precision, -- Point de vie du crop en pourcentage
  CONSTRAINT square_pkey PRIMARY KEY (square_id ),
  CONSTRAINT square_x_y_key UNIQUE (x , y )
)
WITH (
  OIDS=FALSE
);

COMMENT ON COLUMN square.x IS 'coordonnees X';
COMMENT ON COLUMN square.y IS 'coordonees Y';
COMMENT ON COLUMN square.humidity IS 'humiditée en pourcentage';
COMMENT ON COLUMN square.fertility IS 'fertilité en pourcentage';
COMMENT ON COLUMN square.owner_id IS 'user_id du propriétaire de la case';
COMMENT ON COLUMN square.crop_id IS 'identifie le crop en cours de croissance sur cette case (les crops sont des ressources statiques définies en dur dans le code)';
COMMENT ON COLUMN square.crop_maturity IS 'la maturité, nombre de World Hearthbeat que ce crop a vécu';
COMMENT ON COLUMN square.crop_health IS 'Point de vie du crop en pourcentage';

CREATE TABLE "user"
(
  name text,
  user_id serial NOT NULL,
  password text,
  token text,
  x integer, -- Position x du personnage
  y integer, -- Position y du personnage
  money integer,
  experience integer, -- Points d'expérience du joueur
  "character" text,
  health double precision,
  weapon_id integer, -- id du weapon équipée
  tutorial boolean DEFAULT true,
  CONSTRAINT user_pkey PRIMARY KEY (user_id ),
  CONSTRAINT user_name_key UNIQUE (name )
)
WITH (
  OIDS=FALSE
);

COMMENT ON COLUMN "user".x IS 'Position x du personnage';
COMMENT ON COLUMN "user".y IS 'Position y du personnage';
COMMENT ON COLUMN "user".experience IS 'Points d''expérience du joueur';
COMMENT ON COLUMN "user".weapon_id IS 'id du weapon équipée';

CREATE TABLE user_weapon
(
  user_weapon_id serial NOT NULL,
  user_id integer,
  weapon_id integer,
  CONSTRAINT user_weapon_pkey PRIMARY KEY (user_weapon_id )
)
WITH (
  OIDS=FALSE
);


