/* Doomsday Vault: film data
   Each RAW row: [id, lanes, title, release date, runtime (min), type, director,
                  set in, story section, story position, synopsis]
   lanes: 'm' = MCU, 'x' = X-Men, 'mx' = both. Edit here to add or fix films. */

const CAT = {team:'Team-up',cosmic:'Cosmic',mystic:'Mystic and multiverse',street:'Street-level',mutant:'Mutant',royal:'Kingdoms and gods',tech:'Tech and armor',quantum:'Time and quantum',origin:'Origin story'};

/* Cover art: short title, series marker, franchise color key */
const KEY = new Set(['av1','iw','eg','nwh','dw','x1','dofp','ffs','tb']);
const TINT = {loki:'#2E9D58',avengers:'#46E07E',ironman:'#E39B3A',cap:'#4F86E8',thor:'#6FC3F2',hulk:'#8CD84A',spidey:'#E8503F',gotg:'#D46BD8',antman:'#F0703A',strange:'#2FD0BA',wakanda:'#A07CF0',marvels:'#F2C440',widow:'#D8404E',shangchi:'#F05A7A',eternals:'#E8C878',thunderbolts:'#A9BCC2',ff:'#4AA8F0',xmen:'#E3D39E',wolverine:'#E0B020',deadpool:'#D2303C'};
const COVER = {
 im:['Iron Man','Iron Man, part 1 of 3','ironman'], hulk:['Hulk','Standalone','hulk'], im2:['Iron Man 2','Iron Man, part 2 of 3','ironman'],
 thor:['Thor','Thor, part 1 of 4','thor'], cafa:['First Avenger','Captain America, part 1 of 4','cap'], av1:['Avengers','Avengers, part 1 of 5','avengers'],
 im3:['Iron Man 3','Iron Man, part 3 of 3','ironman'], tdw:['Dark World','Thor, part 2 of 4','thor'], tws:['Winter Soldier','Captain America, part 2 of 4','cap'],
 gotg:['Guardians','Guardians, part 1 of 3','gotg'], aou:['Age of Ultron','Avengers, part 2 of 5','avengers'], am:['Ant-Man','Ant-Man, part 1 of 3','antman'],
 cw:['Civil War','Captain America, part 3 of 4','cap'], ds:['Doctor Strange','Doctor Strange, part 1 of 2','strange'], gotg2:['Guardians 2','Guardians, part 2 of 3','gotg'],
 shc:['Homecoming','Spider-Man, part 1 of 4','spidey'], rag:['Ragnarok','Thor, part 3 of 4','thor'], bp:['Black Panther','Black Panther, part 1 of 2','wakanda'],
 iw:['Infinity War','Avengers, part 3 of 5','avengers'], amw:['Ant-Man & the Wasp','Ant-Man, part 2 of 3','antman'], cm:['Captain Marvel','Captain Marvel, part 1 of 2','marvels'],
 eg:['Endgame','Avengers, part 4 of 5','avengers'], loki:['Loki','Disney+ series, 2 seasons','loki'], ffh:['Far From Home','Spider-Man, part 2 of 4','spidey'], bw:['Black Widow','Standalone','widow'],
 sc:['Shang-Chi','Standalone','shangchi'], ete:['Eternals','Standalone','eternals'], nwh:['No Way Home','Spider-Man, part 3 of 4','spidey'],
 mom:['Multiverse of Madness','Doctor Strange, part 2 of 2','strange'], lat:['Love & Thunder','Thor, part 4 of 4','thor'], wf:['Wakanda Forever','Black Panther, part 2 of 2','wakanda'],
 qm:['Quantumania','Ant-Man, part 3 of 3','antman'], gotg3:['Guardians 3','Guardians, part 3 of 3','gotg'], tm:['The Marvels','Captain Marvel, part 2 of 2','marvels'],
 dw:['Deadpool & Wolverine','Deadpool, part 3 of 3','deadpool'], bnw:['Brave New World','Captain America, part 4 of 4','cap'], tb:['Thunderbolts*','Standalone','thunderbolts'],
 ffs:['First Steps','Fantastic Four','ff'], bnd:['Brand New Day','Spider-Man, part 4 of 4','spidey'],
 x1:['X-Men','X-Men, part 1 of 7','xmen'], x2:['X2','X-Men, part 2 of 7','xmen'], x3:['The Last Stand','X-Men, part 3 of 7','xmen'],
 xow:['Origins','Wolverine, part 1 of 3','wolverine'], xfc:['First Class','X-Men, part 4 of 7','xmen'], tw:['The Wolverine','Wolverine, part 2 of 3','wolverine'],
 dofp:['Days of Future Past','X-Men, part 5 of 7','xmen'], dp:['Deadpool','Deadpool, part 1 of 3','deadpool'], xa:['Apocalypse','X-Men, part 6 of 7','xmen'],
 logan:['Logan','Wolverine, part 3 of 3','wolverine'], dp2:['Deadpool 2','Deadpool, part 2 of 3','deadpool'], dph:['Dark Phoenix','X-Men, part 7 of 7','xmen'],
 nm:['New Mutants','X-Men spin-off','xmen']
};

const RAW = [
 ['im','m','Iron Man','2008-05-02',126,'tech','Jon Favreau','2010','mcu',3,'A weapons billionaire builds a suit of armor to escape his captors, then decides to keep it.'],
 ['hulk','m','The Incredible Hulk','2008-06-13',112,'origin','Louis Leterrier','2011','mcu',5,'Bruce Banner runs from the army while trying to cure the monster inside him.'],
 ['im2','m','Iron Man 2','2010-05-07',124,'tech','Jon Favreau','2011','mcu',4,'Tony’s secret is out, his health is failing, and a rival wants his tech.'],
 ['thor','m','Thor','2011-05-06',115,'royal','Kenneth Branagh','2011','mcu',6,'An arrogant god is banished to Earth to learn humility, while his brother schemes.'],
 ['cafa','m','Captain America: The First Avenger','2011-07-22',124,'origin','Joe Johnston','1943 to 1945','mcu',1,'A frail volunteer becomes a super-soldier and takes on HYDRA in World War II.'],
 ['av1','m','The Avengers','2012-05-04',143,'team','Joss Whedon','2012','mcu',7,'Earth’s heroes assemble for the first time to stop an invasion over New York.',true],
 ['im3','m','Iron Man 3','2013-05-03',130,'tech','Shane Black','2012','mcu',8,'Haunted by New York, Tony faces a terrorist who strikes close to home.'],
 ['tdw','m','Thor: The Dark World','2013-11-08',112,'royal','Alan Taylor','2013','mcu',9,'An ancient dark elf rises, and Thor must trust his brother to stop him.'],
 ['tws','m','Captain America: The Winter Soldier','2014-04-04',136,'street','Anthony & Joe Russo','2014','mcu',10,'S.H.I.E.L.D. is rotten from within, and a masked assassin has a familiar face.'],
 ['gotg','m','Guardians of the Galaxy','2014-08-01',121,'cosmic','James Gunn','2014','mcu',11,'A band of space misfits stumbles into saving the galaxy.'],
 ['aou','m','Avengers: Age of Ultron','2015-05-01',141,'team','Joss Whedon','2015','mcu',13,'A peacekeeping AI decides humanity is the problem.',true],
 ['am','m','Ant-Man','2015-07-17',117,'quantum','Peyton Reed','2015','mcu',14,'An ex-con inherits a suit that shrinks him down to the size of an insect.'],
 ['cw','m','Captain America: Civil War','2016-05-06',147,'team','Anthony & Joe Russo','2016','mcu',15,'New rules for heroes split the Avengers down the middle.',true],
 ['ds','m','Doctor Strange','2016-11-04',115,'mystic','Scott Derrickson','2016 to 2017','mcu',19,'A brilliant surgeon loses his hands and finds magic instead.'],
 ['gotg2','m','Guardians of the Galaxy Vol. 2','2017-05-05',136,'cosmic','James Gunn','2014','mcu',12,'Peter Quill finally meets his father, and it’s complicated.'],
 ['shc','m','Spider-Man: Homecoming','2017-07-07',133,'street','Jon Watts','2016','mcu',18,'A teenage hero juggles homework, prom and an arms dealer with wings.'],
 ['rag','m','Thor: Ragnarok','2017-11-03',130,'royal','Taika Waititi','2017','mcu',20,'Stranded on a junk planet, Thor races to save Asgard from his long-lost sister.'],
 ['bp','m','Black Panther','2018-02-16',134,'royal','Ryan Coogler','2016','mcu',17,'A new king of Wakanda faces a challenger with a claim to the throne.'],
 ['iw','m','Avengers: Infinity War','2018-04-27',149,'team','Anthony & Joe Russo','2018','mcu',22,'Thanos hunts the six Infinity Stones, and every hero stands in his way.',true],
 ['amw','m','Ant-Man and the Wasp','2018-07-06',118,'quantum','Peyton Reed','2018','mcu',21,'A rescue mission into the Quantum Realm, with a phasing thief on their tail.'],
 ['cm','m','Captain Marvel','2019-03-08',123,'cosmic','Anna Boden & Ryan Fleck','1995','mcu',2,'A Kree warrior crash-lands in 1995 and uncovers her human past.'],
 ['eg','m','Avengers: Endgame','2019-04-26',181,'team','Anthony & Joe Russo','2018 and 2023','mcu',23,'Five years after the snap, the survivors try to undo it.',true],
 ['loki','m','Loki (Disney+ series)','2021-06-09',null,'quantum','Kate Herron (season 1); Justin Benson & Aaron Moorhead and others (season 2)','Outside time, right after Endgame','mcu',23.5,'After grabbing the Tesseract during the Endgame time heist, Loki is arrested by the Time Variance Authority and pulled into a hunt that cracks the multiverse wide open.'],
 ['ffh','m','Spider-Man: Far From Home','2019-07-02',129,'street','Jon Watts','2024','mcu',24,'A school trip to Europe turns into a battle with elemental monsters.'],
 ['bw','m','Black Widow','2021-07-09',134,'street','Cate Shortland','2016','mcu',16,'Natasha reunites with the fake family she grew up with in Russia.'],
 ['sc','m','Shang-Chi and the Legend of the Ten Rings','2021-09-03',132,'origin','Destin Daniel Cretton','2024','mcu',25,'A martial artist is pulled back into his father’s secret organization.'],
 ['ete','m','Eternals','2021-11-05',156,'cosmic','Chloé Zhao','2024','mcu',26,'Immortal beings who have guarded Earth for millennia reunite.'],
 ['nwh','m','Spider-Man: No Way Home','2021-12-17',148,'mystic','Jon Watts','2024','mcu',27,'A spell to hide Peter’s identity cracks open the multiverse.',true],
 ['mom','m','Doctor Strange in the Multiverse of Madness','2022-05-06',126,'mystic','Sam Raimi','2024','mcu',28,'Strange protects a girl who can hop between universes.'],
 ['lat','m','Thor: Love and Thunder','2022-07-08',119,'royal','Taika Waititi','2025','mcu',30,'Thor faces a killer of gods, and an ex who now wields his hammer.'],
 ['wf','m','Black Panther: Wakanda Forever','2022-11-11',161,'royal','Ryan Coogler','2025','mcu',29,'Wakanda mourns its king and meets a hidden underwater nation.'],
 ['qm','m','Ant-Man and the Wasp: Quantumania','2023-02-17',125,'quantum','Peyton Reed','2025','mcu',31,'The family is sucked into the Quantum Realm, where a conqueror waits.'],
 ['gotg3','m','Guardians of the Galaxy Vol. 3','2023-05-05',150,'cosmic','James Gunn','2026','mcu',32,'Rocket’s past catches up with him, and the team fights to save him.'],
 ['tm','m','The Marvels','2023-11-10',105,'cosmic','Nia DaCosta','2026','mcu',33,'Three heroes keep swapping places every time they use their powers.'],
 ['dw','mx','Deadpool & Wolverine','2024-07-26',128,'mutant','Shawn Levy','2024','fox',13,'Deadpool recruits a reluctant Wolverine to save his universe.',true],
 ['bnw','m','Captain America: Brave New World','2025-02-14',118,'street','Julius Onah','Around 2027','mcu',34,'Sam Wilson’s first mission as Captain America leads to a conspiracy.'],
 ['tb','m','Thunderbolts*','2025-05-02',127,'street','Jake Schreier','Around 2027','mcu',35,'A group of antiheroes caught in the same trap has to work together.',true],
 ['ffs','m','The Fantastic Four: First Steps','2025-07-25',115,'cosmic','Matt Shakman','A retro-future Earth','828',1,'Marvel’s First Family faces a planet-eating giant and his herald.',true],
 ['bnd','m','Spider-Man: Brand New Day','2026-07-31',null,'street','Destin Daniel Cretton','After No Way Home','mcu',36,'Peter starts over in a world that has forgotten who he is.'],
 ['x1','x','X-Men','2000-07-14',104,'mutant','Bryan Singer','The near future','fox',6,'A runaway and a loner join Xavier’s school as Magneto plots against humanity.',true],
 ['x2','x','X2','2003-05-02',134,'mutant','Bryan Singer','The near future','fox',7,'A military raid on the school forces the X-Men and Magneto into an uneasy truce.'],
 ['x3','x','X-Men: The Last Stand','2006-05-26',104,'mutant','Brett Ratner','The near future','fox',8,'A mutant “cure” divides everyone, and Jean Grey returns changed.'],
 ['xow','x','X-Men Origins: Wolverine','2009-05-01',107,'mutant','Gavin Hood','1845 to 1979','fox',1,'How Logan got his claws, his metal and his amnesia.'],
 ['xfc','x','X-Men: First Class','2011-06-03',132,'mutant','Matthew Vaughn','1962','fox',2,'Young Charles and Erik become friends, then rivals, during the Cuban Missile Crisis.'],
 ['tw','x','The Wolverine','2013-07-26',126,'mutant','James Mangold','After The Last Stand','fox',9,'In Japan, Logan is offered the chance to become mortal.'],
 ['dofp','x','X-Men: Days of Future Past','2014-05-23',132,'mutant','Bryan Singer','1973 and 2023','fox',3,'Wolverine is sent back to 1973 to stop a dark future, uniting both casts.',true],
 ['dp','x','Deadpool','2016-02-12',108,'mutant','Tim Miller','2016','fox',11,'A mercenary with a mouth gets unkillable and goes after the man who scarred him.'],
 ['xa','x','X-Men: Apocalypse','2016-05-27',144,'mutant','Bryan Singer','1983','fox',4,'The first mutant wakes up and wants to remake the world.'],
 ['logan','x','Logan','2017-03-03',137,'mutant','James Mangold','2029','fox',14,'An aging Logan protects a young girl with claws just like his.'],
 ['dp2','x','Deadpool 2','2018-05-18',119,'mutant','David Leitch','2018','fox',12,'Deadpool forms a team to protect a kid from a time-traveling soldier.'],
 ['dph','x','Dark Phoenix','2019-06-07',113,'mutant','Simon Kinberg','1992','fox',5,'A space rescue leaves Jean Grey with a power she can’t control.'],
 ['nm','x','The New Mutants','2020-08-28',94,'mutant','Josh Boone','Modern day','fox',10,'Five young mutants are held in a hospital that hides something worse.']
];

const FILMS=RAW.map(([id,lanes,title,date,min,cat,dir,setIn,sec,idx,blurb])=>({id,lanes,title,date,min,cat,dir,setIn,sec,idx,blurb,year:+date.slice(0,4)}));
const DOOM_DATE='2026-12-18';
const RELEASE_CH=[
  {to:'2008-01-01',t:'The mutant age!',d:'2000 to 2007'},{to:'2013-01-01',t:'Phase One!',d:'2008 to 2012'},
  {to:'2016-01-01',t:'Phase Two!',d:'2013 to 2015'},{to:'2020-01-01',t:'Phase Three!',d:'2016 to 2019'},
  {to:'2023-01-01',t:'Phase Four!',d:'2020 to 2022'},{to:'2025-07-01',t:'Phase Five!',d:'2023 to 2025'},
  {to:'9999-01-01',t:'Phase Six!',d:'2025 onward'}
];
const STORY_CH={mcu:{t:'The Sacred Timeline!',d:'The main MCU universe, from World War II onward'},fox:{t:'The Fox timeline!',d:'The X-Men universe, ending with its jump into the MCU'},'828':{t:'Earth-828!',d:'A separate, retro-future universe'}};
const UNIVERSE={mcu:'The Sacred Timeline',fox:'The Fox timeline','828':'Earth-828'};


/* Movie posters: film id -> poster id (from posters-check.json, only films on this page).
   Put each image in the posters folder, named by its poster id, e.g. posters/iron-man-2008.jpg
   (.jpg, .jpeg, .png or .webp all work). Films without an image keep their designed comic cover. */
const POSTER_DIR = 'posters/';
const POSTERS = {
  loki:'loki-2021',
  im:'iron-man-2008',
  hulk:'the-incredible-hulk-2008',
  im2:'iron-man-2-2010',
  thor:'thor-2011',
  cafa:'captain-america-the-first-avenger-2011',
  av1:'the-avengers-2012',
  im3:'iron-man-3-2013',
  tdw:'thor-the-dark-world-2013',
  tws:'captain-america-the-winter-soldier-2014',
  gotg:'guardians-of-the-galaxy-2014',
  aou:'avengers-age-of-ultron-2015',
  am:'ant-man-2015',
  cw:'captain-america-civil-war-2016',
  ds:'doctor-strange-2016',
  gotg2:'guardians-of-the-galaxy-vol-2-2017',
  shc:'spider-man-homecoming-2017',
  rag:'thor-ragnarok-2017',
  bp:'black-panther-2018',
  iw:'avengers-infinity-war-2018',
  amw:'ant-man-and-the-wasp-2018',
  cm:'captain-marvel-2019',
  eg:'avengers-endgame-2019',
  ffh:'spider-man-far-from-home-2019',
  bw:'black-widow-2021',
  sc:'shang-chi-and-the-legend-of-the-ten-rings-2021',
  ete:'eternals-2021',
  nwh:'spider-man-no-way-home-2021',
  mom:'doctor-strange-in-the-multiverse-of-madness-2022',
  lat:'thor-love-and-thunder-2022',
  wf:'black-panther-wakanda-forever-2022',
  qm:'ant-man-and-the-wasp-quantumania-2023',
  gotg3:'guardians-of-the-galaxy-vol-3-2023',
  tm:'the-marvels-2023',
  dw:'deadpool-wolverine-2024',
  bnw:'captain-america-brave-new-world-2025',
  tb:'thunderbolts-2025',
  ffs:'the-fantastic-four-first-steps-2025',
  bnd:'spider-man-brand-new-day-2026',
  x1:'x-men-2000',
  x2:'x2-2003',
  x3:'x-men-the-last-stand-2006',
  xow:'x-men-origins-wolverine-2009',
  xfc:'x-men-first-class-2011',
  tw:'the-wolverine-2013',
  dofp:'x-men-days-of-future-past-2014',
  dp:'deadpool-2016',
  xa:'x-men-apocalypse-2016',
  logan:'logan-2017',
  dp2:'deadpool-2-2018',
  dph:'dark-phoenix-2019',
  nm:'the-new-mutants-2020'
};

/* Films where Robert Downey Jr. plays Tony Stark (The Incredible Hulk is his end-credits cameo).
   Hovering these shows Iron Man's glove as the cursor; he plays Doom in Avengers: Doomsday. */
const RDJ_FILMS = ['im','hulk','im2','av1','im3','aou','cw','shc','iw','eg'];


/* Disney+ series shown in the timeline (one panel each, same size as a film).
   essential: true adds the "Essential!" badge. */
const SERIES = {
  loki:{label:'MCU series', episodes:'2 seasons, 12 episodes', season2:'2023-10-05', essential:true}
};
