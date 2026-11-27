# Changelog

All notable changes to Skill Graph are documented here, newest first. Skill Graph is a fork of the
[Marble Skill Taxonomy](https://github.com/withmarbleapp/os-taxonomy): the first part of this file covers
the fork (the viewer, labs, school curricula, extra topics and translations); the second part keeps the
upstream Marble dataset history as it was synced.

The fork has no version numbers: `main` is deployed to GitHub Pages on every merge, so entries are grouped
by merge date and point to their pull requests. A shorter, parent-facing summary in English, Russian and
Hungarian is on the site: [What's new](https://samvelkoch.github.io/skill-graph/changelog/)
(`changelog/index.html`; its lab lists are read from the `added` dates in `labs/registry.json`).

Counts in brackets are totals after that day.

## 2026-11-27

### Labs (pictures fixed)
- `labs/people.js`: the `pigtails` hairstyle is two fluffy bunches tied high on the sides, with hair ties, instead of two tapering strands that looked like carrots. Used by `frame-it` and `leading-question`.
- `frame-it`: the dog is redrawn as a sitting golden dog with four paws, both eyes and a friendly face, looking up at the girl (its frame zone updated); the sleeping cat in the third view is redrawn (rounded ears without outlines cutting the face, a tail around the front); the crying girl wipes a tear with one hand instead of crossing her arms into an X.

### Labs (my-body fix)
- `my-body`: the cousin's pigtails are redrawn as two bunches high on the sides (no strands hanging in front), and the 'private' zone is a warm halo behind the swimsuit instead of a yellow outline that read as a see-through top.

### Labs
- Ten new labs on thinking for yourself (872): `two-books` “One Bridge, Two Books” (one event told by two invented countries' school books), `frame-it` “Inside the Frame” (cropping, choosing facts, the Kuleshov effect), `see-or-think` “I See, I Think” (observation vs interpretation, ages 6–9), `change-mind` “What's Going On?” (Bayes without formulas: 100 beans over several stories, clue strength, forecast calibration), `think-first` “Think First” (thinking before asking an AI helper), `trick-box` “The Trick Box” (persuasion tricks used symmetrically by two sides), `echo` “Echo” (illusory truth effect, many posts from one source, rumour vs correction), `cafe-queue` “Follow the Queue?” (information cascades, MusicLab), `leading-question` “How Was It Asked?” (leading questions and memory, Loftus & Palmer) and `retell` “Say It Back” (restating the other side, three ethical lenses, judging a speech). All countries, towns and people in them are invented. (#747)
- `market-stall`, `ask-help`, `good-friend`, `bully-or-not`, `family-roles`, `growing-up`, `no-go-tell`, `boxes` and `my-body` draw their people with the shared `labs/people.js`; props, costumes and the swimsuit highlight stay in the labs. `caricature` keeps its own exaggeration code, restyled to the same look. `labs/people.js` is unchanged. (#743)

### Data
- Two extra topics for the thinking-for-yourself labs: `ai_09` “Thinking for Yourself with AI” and `sg_civ_41` “Spotting Persuasion Tricks”, with RU/HU names and dependencies; layout regenerated. (#747)

## 2026-11-26

### Labs
- `athens`, `south-america`, `surnames`, `fair-test` and `sled-work` draw their people with the shared `labs/people.js`; costumes and props stay in the labs. (#746)
- `ballet` “Ballet Studio”: the dancers are drawn by the shared `labs/people.js` (`drawRig`); the lab's own figure code is removed. (#745)
- Shared people for labs: `labs/people.js` draws picture-book figures with one canvas-2D call: `drawPerson` for standing people (ages, builds, outfits, shoes, hair styles, moods, a rim for dark scenes) and `drawRig` for any pose and turn (front, three-quarter, profile, back). Demo in `labs/people-demo.html`. No lab uses it yet. (#744)

## 2026-11-24

### Labs
- New lab `golden-rule` “The Golden Rule”: the Golden Rule across religions and philosophies (862). (#741)
- New lab `public-services` “From Cradle to Pension”: public services, who pays, e-government (861). (#740)
- New lab `health-claims` “Miracle Juice?”: judging health messages and claims (860). (#739)
- New lab `kitchen-snack` “Snack Time”: healthy snacks, bridge and claw knife grips, food hygiene (859). (#738)
- New lab `pitch-it` “One Minute to Pitch”: pitching an idea, social enterprise, a one-page business plan (858). (#737)
- New lab `market-stall` “The Market Stall”: selling, simple marketing and teamwork at a stall (857). (#736)
- New lab `family-roles` “A Family Over Time”: family forms, functions and changing roles (856). (#735)
- New lab `my-circles` “My Circles”: belonging to many groups; identity and place (855). (#734)
- New lab `me-petals` “All About Me”: self-concept: likes, skills, qualities (854). (#733)
- New lab `good-friend` “What Makes a Friend?”: what makes a good friend; friendships change (853). (#732)
- New lab `ask-help` “Who Can Help?”: sizing a problem and asking for help clearly (852). (#731)
- New lab `my-body` “My Body Is Mine”: body safety (PANTS), safe and unsafe secrets, body image (851). (#730)
- New lab `no-go-tell` “No, Go, Tell”: early warning signs and the No-Go-Tell safety steps (850). (#729)
- New lab `bully-or-not` “Is It Bullying?”: what bullying is (on purpose, repeated, power imbalance) and what helps (849). (#728)
- New lab `safety-signs` “Signs Without Words”: safety sign shapes and colours (ISO 7010) (848). (#727)
- New lab `brain-alarm` “The Brain's Alarm”: amygdala fast route vs cortex, fight-or-flight, regulating emotions (847). (#723)
- New lab `co2-bathtub` “The Carbon Bathtub”: stock and flow of CO2, net zero (846). (#722)
- New lab `rock-story` “Read the Cliff”: reading rock layers: superposition, cross-cutting, gaps in time (845). (#721)
- New lab `five-solids` “Perfect Solids”: Euler's formula and the five Platonic solids (844). (#720)
- New lab `wait-trick` “How to Wait”: patience and strategies for delayed gratification (843). (#719)
- New lab `one-letter` “One Letter Changed”: mutations: silent, missense, nonsense, frameshift; source of variation (842). (#718)
- New lab `safe-in-shoal` “Alone or Together?”: why animals live in groups and what it costs (841). (#717)

### Data
- Linked existing labs to 51 more repeat topics from the remaining list, e.g. the reactivity series, Roman numerals, Robin Hood and King Arthur (coverage 75% → 77%). (#742)
- Linked existing labs to 189 more repeat topics after a second, stricter review (coverage 66% → 74%). (#726)

### Lab fixes
- `brain-alarm`: the head and brain are redrawn with real proportions and a lateral-view brain. (#725)

### Data
- Linked the topic “Periods of Music History” (`sg_art_77`) to the lab `growing-orchestra`. (#724)

## 2026-11-23

### Labs
- New lab `behind-face` “What's Inside?”: hidden and masked feelings, noticing and sharing (840). (#716)
- New lab `trace-image` “Where Did It Come From?”: deepfakes and misinformation: check the source, not the pixels (839). (#715)

### Data
- Existing labs linked to 334 graph topics that repeat their idea (same main idea, overlapping ages): topics with a lab 1,175 → 1,539 of 2,364 (50% → 65%); the map shows a lab on these topics and “Where next” is richer. (#714)

### Labs
- New lab `crust-elements` “What Is the Ground Made Of?”: the elements of Earth's crust, sea and air, and extracting metals (838). (#713)
- New lab `persia-tribute` “Gifts for the King of Kings”: Assyria and the Persian Empire: satrapies, tribute and tolerance (837). (#712)
- New lab `ideas-1800s` “Three Big Ideas of the 1800s”: liberalism, conservatism and socialism in the 19th century (836). (#711)
- New lab `egypt-rulers` “The Last Pharaohs”: the end of ancient Egyptian civilisation under foreign rulers (835). (#710)
- New lab `medieval-women` “Women of the Middle Ages”: the lives and work of women in the Middle Ages (834). (#709)
- New lab `republic-falls` “From Republic to Emperor”: the fall of the Roman Republic and the rise of Augustus (833). (#708)
- New lab `colosseum` “A Day at the Colosseum”: the Colosseum: seating by rank, entrances, and who gladiators were (832). (#707)
- New lab `ask-ai` “Working with an AI Helper”: using an AI assistant well: clear requests, checking facts, honesty (831). (#706)
- New lab `pipe-notes` “Holes and Notes”: how wind instruments make notes: holes and the air column (830). (#705)
- New lab `patch-it` “Keep the Pests Out”: malware and device protection: updates, careful clicks and backups (829). (#704)
- New lab `secant-angles` “Where You Stand”: angles formed by chords, secants and tangents (828). (#703)
- New lab `habitat-makers` “Who Changed This Place?”: how plants and animals change their habitats (827). (#702)
- New lab `dna-tree` “Family Ties in DNA”: grouping species using DNA and the molecular clock (826). (#701)
- New lab `life-expectancy` “Health and Wealth”: human development: income, life expectancy, schooling and the HDI (825). (#700)
- New lab `baikal` “Lake Baikal”: Lake Baikal: a rift lake, its depth, age, water and life (824). (#699)
- New lab `led-way` “Bulb, Buzzer, LED”: why circuit components behave differently (823). (#698)
- New lab `tangent-quad` “A Circle in a Frame”: quadrilaterals with an inscribed circle (Pitot's theorem) (822). (#697)
- New lab `decimal-estimate` “Where Does the Point Go?”: estimating to check decimal multiplication and division (821). (#696)
- New lab `hyperbola` “The Curve of k/x”: graphs of y = k/x, asymptotes and shifts, and Boyle's law (820). (#695)
- New lab `hike-time` “Which Path Is Quicker?”: route planning with distance and climb, and sketch maps (819). (#694)
- New lab `pin-chance` “Point Up or Point Down?”: uniform and non-uniform probability models, and models from trials (818). (#693)
- New lab `thin-soil` “Where Is the Forest's Food?”: nutrient cycling in thin rainforest soil (817). (#692)
- New lab `insect-size` “Why Aren't Insects Giant?”: insect anatomy: spiracles, tracheae, compound eyes and mouthparts (816). (#691)
- New lab `snow-map` “Dots on a Doctor's Map”: how data builds and checks explanations: John Snow's cholera map (815). (#690)
- New lab `approx-shapes` “Made of Simple Shapes”: approximating real objects with familiar 2-D and 3-D shapes (814). (#689)
- New lab `shadow-angle` “How Steep Is the Stick?”: projection onto a plane and the angle between a line and a plane (813). (#688)
- New lab `food-label` “Read the Label”: reading nutrition labels: per 100 g, portions and front-of-pack claims (812). (#687)
- New lab `punnett` “The Square of Chances”: alleles, dominant and recessive traits and Punnett squares (811). (#686)
- New lab `sled-work` “Pull the Sled”: work at an angle and the dot product of vectors (810). (#685)
- New lab `eclipse-safe` “Look After Your Eyes”: protecting eyes from sunlight and watching an eclipse safely (809). (#684)

## 2026-11-22

### Labs
- New lab `sample-jar` “The Bead Jar”: how random samples vary, and biased samples (808). (#683)
- New lab `homes-world` “Homes Around the World”: traditional homes shaped by climate, materials and way of life (807). (#683)
- New lab `ai-energy` “How Much Power Does AI Use?”: AI and the environment: electricity per answer and in total (806). (#683)
- New lab `frozen-app` “When an App Freezes”: the operating system shares the computer between apps (805). (#683)
- New lab `styles` “Styles, Not Spaces”: word processing: alignment, styles, lists and page breaks (804). (#683)
- New lab `licence` “Free to Use, Free to Change?”: kinds of software and software licences (803). (#683)
- New lab `two-columns` “The Bike Shop’s Books”: a balance sheet and double-entry bookkeeping (802). (#683)
- New lab `bank-loans` “Barter, Coins and Credit”: the history and properties of money, and how a loan works (801). (#683)
- New lab `hidden-tax` “The Hidden Tax”: types of taxes, VAT inside prices, and who collects what (800). (#683)
- New lab `morning-jobs` “Who Made Your Morning?”: the jobs behind everyday things, and why people are paid (799). (#683)
- New lab `count-votes` “Count the Votes”: elections: counting rules, the secret ballot and turnout (798). (#683)
- New lab `fix-street` “Who Fixes the Street?”: what local councils do and how they are paid for (797). (#683)
- New lab `rule-path` “How a Rule Is Made”: who makes rules: a school rule and a law through parliament (HU, RU, UK) (796). (#683)
- New lab `dilemma` “Two Good Reasons”: difficult ethical choices between two good values (795). (#683)
- New lab `same-rain` “Same Rain, Different Feelings”: feelings have triggers, differ between people and change during a day (794). (#683)
- New lab `kind-eyes` “Who Needs a Hand?”: everyday kindness starts with noticing who needs help (793). (#683)
- New lab `story-ends` “Once Upon a Time… The End”: a story needs a beginning and an ending (792). (#683)
- New lab `research-q` “Start with a Question”: short research projects: the question picks the facts, notes in your own words, sources (791). (#683)
- New lab `who-for` “Who Is It For?”: finding a text's intended audience from its words, length, pictures and place (790). (#683)
- New lab `eyewitness` “I Was There”: firsthand and secondhand accounts: what a witness can know from where they stood (789). (#683)

## 2026-11-21

### Labs
- New lab `seed-travel` “Seeds on the Move”: how fruits spread seeds by wind, animals, water and bursting pods (788). (#682)
- `balaton-park` reworked for a classroom projector: a real Natural Earth map of Lake Balaton with large on-map names and the witness hills, a fitted map view, no scrolling on big screens, and a crafted volcano-to-witness-hill cross-section with the old ground level marked. (#680)
- New lab `spring-bounce` “Bounce on a Spring”: the period of a spring pendulum and what it depends on (787). (#681)
- New lab `lomonosov` “Lomonosov and Venus”: Russian science in the 18th century: Lomonosov, the Academy and Moscow University (786). (#679)
- New lab `power-curves` “x to the Power n”: power functions, roots and Kepler's third law (785). (#678)
- New lab `crossing-chords` “Crossing Chords”: the intersecting chords and tangent–secant theorems (784). (#677)
- New lab `read-building` “What Does a Building Say?”: reading buildings as messages about power (783). (#676)
- New lab `compass-ruler` “Compass and Ruler”: compass and straightedge constructions: bisectors and perpendiculars (782). (#675)
- New lab `moscow-stone` “Moscow in Stone”: Russian architecture and culture of the 16th–17th centuries (781). (#674)
- New lab `dot-shapes` “Shapes on Dots”: areas of polygons on dot paper and Pick's rule (780). (#673)
- New lab `mirror-halves` “Mirror Halves”: planes of symmetry of solids (779). (#672)
- New lab `forest-fire` “A Model of a Forest Fire”: computer modelling and simulation with a forest-fire model (778). (#671)
- New lab `which-way-down` “Which Way Is Down?”: gravity pulls towards the Earth's centre, so down is different everywhere (777). (#670)
- New lab `animal-records` “Animal Champions”: the blue whale, cheetah and bee hummingbird compared with things we know (776). (#669)
- New lab `sign-machine` “The Sign Machine”: the sign rules for multiplying and dividing negative numbers (775). (#668)
- New lab `polder` “Land from the Sea”: Dutch polders, dikes and windmills: people shaping a place (774). (#667)
- New lab `insect-count` “Count Every Kind”: why insects have more species than any other animals, and how to help them (773). (#666)
- New lab `sound-fade` “Can You Still Hear It?”: how sound fades as it spreads out from its source (772). (#665)
- New lab `dress-weather` “What Shall I Wear?”: choosing clothes for rain, sun and cold, and why layers keep you warm (771). (#664)
- New lab `bump` “Bump!”: what happens to motion and energy when objects collide (770). (#663)
- New lab `farm-glass` “A Farm Under Glass”: greenhouses, irrigation and terraces: managed environments for food (769). (#662)
- New lab `place-names` “Names on the Map”: Viking and Anglo-Saxon place names in England and the Danelaw (768). (#661)
- New lab `lizard-mouse` “Lizard and Mouse”: warm-blooded and cold-blooded animals and the food they need (767). (#660)
- New lab `season-sky` “Where Is Orion in Summer?”: why different constellations are seen in different seasons (766). (#659)
- New lab `see-through` “The Torch Test”: transparent, translucent and opaque materials (765). (#658)
- New lab `weekday` “Calendar Detective”: rows of seven in a calendar, counting days between dates, and why birthdays move a weekday (764). (#657)
- New lab `euclid` “Cut the Biggest Square”: Euclid's algorithm as cutting squares, and the greatest common divisor (763). (#656)
- New lab `plant-families` “Plant Families”: plant families by flower and fruit: crucifers, legumes, the rose family and conifers (762). (#655)
- New lab `divisibility` “Does It Divide?”: divisibility rules for 2, 3, 4, 5, 6, 9 and 10, and why they work (761). (#654)
- New lab `one-key` “One Key for Every Door?”: why every account needs its own password, and two-step login (760). (#653)
- New lab `stem-leaf` “Stems and Leaves”: stem-and-leaf plots: building, reading and comparing (759). (#652)

## 2026-11-19

### Labs
- New lab `balaton-park` “Balaton-felvidéki Nemzeti Park”: a class lab for the projector with a map of the park's places (1997 vs 2026), a find-it game, how a volcano became a witness hill, animal riddles and a 20-question class quiz; HU first, also EN and RU (758). (#651)

## 2026-11-17

### Labs
- New lab `hungarian-minds` “Who Invented It?”: Hungarian inventors, scientists and athletes around the world (757). (#650)
- New lab `americas-cross` “Across the Americas”: mountains, lowlands, rain shadows and rivers of the Americas (756). (#649)
- New lab `us-1800s` “Across a Growing Country”: the United States in the 19th century: expansion, railways, the Civil War and abolition (755). (#648)
- New lab `container-ship` “The Steel Box”: the shipping container, globalisation and the digital age (754). (#647)
- New lab `ancient-china` “Rivers, Walls and Paper”: ancient China: the river valleys, unification under Qin, inventions (753). (#646)
- New lab `decolonisation` “Maps of a Changing World, 1945–1975”: decolonisation and social movements after 1945 (752). (#645)
- New lab `scaling-up` “From One Stall to Ten”: growing a small business: batches, demand and quality (751). (#644)
- New lab `australia-dry` “The Island Continent”: Australia and Oceania: a dry continent, unique animals, coral atolls (750). (#643)
- New lab `seas-europe` “Europe's Seas Compared”: the seas around Europe: salinity, tides, fishing (749). (#642)
- New lab `medieval-court` “Guilty or Not?”: medieval justice: ordeals, evidence and juries (748). (#641)
- New lab `meadow-garden` “Meadow or Garden Bed?”: natural and artificial communities, succession and pests (747). (#640)
- New lab `rivers-map` “Source to Mouth”: continents, oceans and rivers on maps (746). (#639)
- New lab `africa-belts` “Africa, North to South”: Africa's natural zones mirrored around the equator (745). (#638)
- New lab `jelly-worm` “Hydra and Earthworm”: cnidarians and worms: body layers, segments, soil (744). (#637)
- New lab `fruit-smells` “Molecules That Smell”: alcohols, carboxylic acids and esters (743). (#636)
- New lab `molluscs` “Soft Body, Hard Shell”: molluscs: one body plan, three ways of life (742). (#635)
- New lab `blood-drop` “One Drop of Blood”: blood cells and tissues under the microscope (741). (#634)
- New lab `polymers` “Chains, Crystals and Mixes”: ceramics, polymers and composites and why they behave as they do (740). (#633)
- New lab `ant-trail` “Ants and the Sugar Cube”: how ants find food together with scent trails (739). (#632)
- New lab `heat-flow` “Where Does the Warmth Go?”: heat sources and heat moving from hotter to colder (738). (#631)
- New lab `born-or-learned` “Born Knowing or Learned?”: innate and learned behaviour: triggers, imprinting, conditioning (737). (#630)
- New lab `sharp-sight` “Why Is It Blurry?”: short and long sight and how glasses correct them (736). (#629)
- New lab `shade-builder` “A Cool Spot in the Sun”: how shade blocks sunlight, and why it must follow the moving Sun (735). (#628)
- New lab `gut-bugs` “Who Lives in Your Gut?”: gut bacteria, fibre and antibiotics (734). (#627)
- New lab `yeast-balloon` “Breathing Without Air”: anaerobic respiration in yeast and muscles (733). (#626)
- New lab `same-bones` “Arm, Wing, Flipper”: evidence for evolution: homologous limbs, fossil order, island species (732). (#625)
- New lab `museum` “Curate a Museum Room”: what museums do: choosing, protecting and showing objects (731). (#624)
- New lab `beat-maker` “Make a Beat”: loops, layers and tempo in digital music (730). (#623)
- New lab `sort-list` “A Row of Boxes”: arrays: loops over a list, linear search, bubble sort (729). (#622)
- New lab `safe-at-home` “Read the Label”: hazard pictograms, chemicals that must not be mixed, first aid (728). (#621)

## 2026-11-16

### Labs
- New lab `sensor-robot` “The Robot That Feels the Line”: sensors and feedback control: a line-following robot and everyday feedback loops (727). (#620)
- New lab `spore-plants` “Under the Fern Leaf”: algae, mosses and ferns: spores, the need for water, coal forests (726). (#619)
- New lab `kidney-filter` “The Body's Filter”: how the kidneys filter blood, reabsorption and urine (725). (#618)
- New lab `body-scan` “Seeing Inside the Body”: X-ray, ultrasound, MRI and ECG: what each shows and how (724). (#617)
- New lab `galileo-ramp` “Galileo's Ramp”: uniformly accelerated motion on an inclined plane, the odd-number rule, then steady motion (723). (#616)
- New lab `salt-share` “How Salty Is It?”: mass fraction of a solution, dilution and saturation (722). (#615)
- New lab `chain-reaction` “One Neutron, Many Neutrons”: nuclear fission, chain reactions and control rods, fusion in the Sun (721). (#614)
- New lab `ions-conduct` “Which Water Lights the Bulb?”: electrolytes and ions: which solutions conduct, ions moving to electrodes, ion exchange reactions (720). (#613)
- New lab `carbon-forms` “A Gem and a Pencil”: crystal structure: diamond, graphite and salt lattices and their properties (719). (#612)
- New lab `memory-span` “How Much Can You Hold?”: short-term memory span, chunking and meaningful memorising (718). (#611)
- New lab `south-america` “South America, 1810–1830”: the independence of Spanish and Portuguese America, 1810–1830 (717). (#610)
- New lab `two-skaters` “Two Skaters”: Newton's third law: force pairs on different bodies (716). (#609)
- New lab `motor-effect` “Why the Motor Turns”: the force on a current in a magnetic field, the DC motor and the loudspeaker (715). (#608)
- New lab `star-elements` “Where Did Your Atoms Come From?”: where the elements come from: the Big Bang, stars, supernovae and neutron-star mergers (714). (#607)
- New lab `thermos` “Keep the Tea Hot”: conduction, convection and radiation, the vacuum flask and a house in winter (713). (#606)
- New lab `thermal-expansion` “Gaps in the Bridge”: thermal expansion of solids, liquids and gases, water's anomaly and gas pressure (712). (#605)
- New lab `fields-of-europe` “Fields of Europe”: how climate, soil, relief and markets shape farming across Europe (711). (#604)
- New lab `lens-image` “Where Is the Picture?”: ray diagrams for a converging lens and a plane mirror; real and virtual images (710). (#603)
- New lab `year-1905` “The Year 1905”: Russia under Nicholas II, the revolution of 1905, the October Manifesto and the first Duma (709). (#602)
- New lab `homeostasis` “The Thermostat Inside”: homeostasis: temperature control by the skin, negative feedback, insulin and glucagon (708). (#601)
- New lab `reaction-rate` “Speed Up the Reaction”: temperature, concentration, surface area and catalysts in collision theory (707). (#600)
- New lab `greek-colonies` “Where Did the Greeks Go?”: why Greek city-states founded colonies around the Mediterranean and Black Sea, trade with the Scythians (706). (#599)
- New lab `planet-landing` “Could You Land There?”: rocky and gas planets, Venus the hottest, rings on all giants, rusty Mars (705). (#598)
- New lab `joints` “How Joints Move”: tendons, ligaments, cartilage and joint types (704). (#597)
- New lab `sky-weeks` “The Night Sky, Week by Week”: planets moving among the stars, Mars's loop, Earth-centred and Sun-centred models (703). (#596)
- New lab `line-spectra` “Barcodes of Light”: continuous, emission and absorption spectra, hydrogen lines and stellar spectra (702). (#595)
- New lab `exoplanets` “Planets of Other Stars”: the transit method, light curves and the habitable zone (701). (#594)
- New lab `trial-reward` “The Mouse and the Cheese”: reinforcement learning: rewards, exploration and badly chosen rewards (700). (#593)
- New lab `reaction-heat` “Warmer or Colder?”: exothermic and endothermic reactions, energy diagrams, everyday examples (699). (#592)
- New lab `on-target` “Tight or True?”: precision vs accuracy, repeats and systematic error, honest significant figures (698). (#591)
- New lab `telescope` “Look Through the Telescope”: a telescope gathers light; mirror size, Hubble and Webb, why telescopes go to space (697). (#590)
- New lab `biomagnify` “A Drop in the Lake”: bioaccumulation of persistent toxins up a food chain and the DDT story (696). (#589)
- New lab `farm-gifts` “What Does the Farm Give?”: what farm animals give and the daily care that comes first (695). (#588)
- New lab `egypt-maths` “Sums of the Scribes”: Egyptian doubling multiplication, unit fractions from the Rhind papyrus, the seked (694). (#587)
- New lab `snowflake` “How Snow Is Made”: snow as ice crystals grown from vapour, six arms, a snowdrift is mostly air (693). (#586)
- New lab `one-neuron` “Inside a Neural Network”: a neuron as weighted sum and threshold; learning as nudging weights (692). (#585)
- New lab `radiation` “Alpha, Beta, Gamma”: alpha, beta and gamma radiation: penetration, deflection, nuclear change (691). (#584)
- New lab `nested-loops` “A Loop Inside a Loop”: nested loops: inner and outer loops, outer × inner runs (690). (#583)
- New lab `bead-patterns` “The Bead Necklace”: the repeating unit (core) of a pattern, far terms and the same pattern in other forms (689). (#582)
- New lab `recipe-scale` “Pancakes for Everyone”: measuring with the right tool, following steps in order, scaling a recipe (688). (#581)
- Robot Lab (`robot-lab`) reworked for a class on a projector: on a big screen the whole lab fits one screen without scrolling (and scales up on Full HD and larger); the task is shown above the board and as a live mission checklist; the robot has a beam that shows which way it faces; the block the robot stopped at is framed in red; loops show their round; blocks can be inserted after any block; speed ×1/×2/×4, a "Next" button after a win and keyboard keys (arrows, Enter, Backspace). Two new "find the bug" levels start with a broken program (12 levels). A new "Quiz" tab has 10 questions for the whole class, two of them with a robot that runs the program after the answer. Unlocking the secret levels now marks the lab's topics as "learning" on the map. (#579)
- Robot Lab quiz: 10 more questions on how robots are built (sense, decide, act; the five parts), what they are for (dull, dirty, dangerous work; surgery, space, factories) and their risks (hacking, jobs), 20 in total; the quiz now starts with a choice of 7, 10, 15 or 20 questions (`?view=quiz&n=10` opens one directly). (#580)

## 2026-11-15

### Labs
- New lab `egypt-gods` “Gods of the Nile”: Egyptian polytheism: gods behind nature, Nut and the sun, Osiris and Horus. (687). (#578)
- New lab `user-stories` “Who Is the App For?”: “As a…, I want…, so that…” and testing against stories. (686). (#578)
- New lab `fair-ai` “The Robot Coach”: An AI copies unfair past choices; proxies and fair rules. (685). (#578)
- New lab `earning` “Why Do Jobs Pay Differently?”: Why pay differs: supply and demand, training, risk, minimum wage. (684). (#578)
- New lab `factors` “What Does a Bakery Need?”: Natural, human and capital resources; the bottleneck. (683). (#578)
- New lab `family-budget` “A Month for the Family”: Needs, wants and savings; an emergency cushion over a year. (682). (#578)
- New lab `consumer-rights` “Can I Take It Back?”: Faulty goods, online returns and in-store exchange (EU vs Russia). (681). (#578)
- New lab `focus` “One Thing at a Time”: The cost of switching tasks, phones and planning in blocks. (680). (#578)
- New lab `stereotype` “The Label and the Person”: Group averages vs individuals, prejudice vs discrimination. (679). (#578)
- New lab `i-message` “Say It Without a Sting”: I-messages, blame words and repairing a quarrel. (678). (#578)
- New lab `gestures` “One Gesture, Many Meanings”: Gestures that change meaning across cultures; shared facial expressions. (677). (#578)
- New lab `crowd` “Three Lines and a Crowd”: Asch conformity: group size and one partner. (676). (#578)
- New lab `empathy` “Down in the Hole”: Sympathy vs empathy, naming feelings, listen before advice. (675). (#578)
- New lab `bias` “Tricks of the Mind”: Availability bias, anchoring, risk vs uncertainty. (674). (#578)
- New lab `habits` “The Habit Path”: Habit loop and the automaticity curve; one missed day. (673). (#578)
- New lab `slides` “Words, Pictures, Listeners”: Slides that help a talk: picture and key words vs a wall of text. (672). (#578)
- New lab `genre-switch` “One Fox, Five Texts”: One event as a news report, diary, notice, letter and poem. (671). (#578)
- New lab `revise` “The Draft Workshop”: Revising ideas vs editing the surface; revise first. (670). (#578)
- New lab `tale-versions` “One Slipper, Many Tales”: Comparing Cinderella tales from China, Egypt, France and Germany. (669). (#578)
- New lab `squeeze` “Squeeze It Down”: Précis: keep every key idea in fewer words; paraphrase vs copy. (668). (#578)
- New lab `questions` “Open the Door with a Question”: Closed vs open questions, follow-up questions. (667). (#578)
- New lab `blues` “Twelve Bars of Blues”: The 12-bar blues, blue notes and the family tree of popular music. (666). (#577)
- New lab `sharps-flats` “Sharps, Flats and Keys”: Sharps, flats, the major-scale pattern and the bass clef. (665). (#577)
- New lab `texture` “One Voice or Many?”: Monophony, melody with chords, and a round. (664). (#577)
- New lab `packets` “A Photo in Pieces”: Packets, rerouting around a cut cable, cable vs Wi-Fi vs Bluetooth. (663). (#577)
- New lab `bits-letters` “Letters Made of Bulbs”: 2ⁿ codes, ASCII, UTF-8 bytes per letter, Morse. (662). (#577)
- New lab `same-different` “Same and Different”: Similarities and differences in a Venn diagram. (661). (#577)
- New lab `permission` “May I?”: When to ask first, how to ask, and photos of friends. (660). (#577)
- New lab `join-in` “Who Will Come on Saturday?”: Why people join community work, and how kids can help. (659). (#577)
- New lab `practice-curve` “The Not-Yet Curve”: Learning curves with plateaus, self-talk and strategy. (658). (#577)
- New lab `mixed-feelings` “Two Feelings at Once”: Two feelings at once, and how a strong feeling narrows choices. (657). (#577)
- New lab `fact-check` “Source Detective”: Judging sources, independent vs copied sources, lateral reading. (656). (#576)
- New lab `translator` “The Translator’s Choice”: Word-for-word vs free translation, names in translation. (655). (#576)
- New lab `theme` “What Is It Really About?”: Topic vs theme, one theme across different stories. (654). (#576)
- New lab `epithets` “Make It Vivid”: Epithet, personification and hyperbole. (653). (#576)
- New lab `novel-size` “How Big Is a Book?”: Short story, novella and novel by scope and word count. (652). (#576)
- New lab `symbol` “More Than It Seems”: Symbols in a story, fable animals and allegory. (651). (#576)
- New lab `arc` “How a Hero Changes”: A character arc, the turning point, round and flat characters. (650). (#576)
- New lab `sound-play` “Sounds That Paint”: Alliteration, assonance and onomatopoeia. (649). (#576)
- New lab `metre` “Tap the Beat”: Strong and weak beats, iamb, trochee and three-syllable feet. (648). (#576)
- New lab `narrator` “Who Is Telling?”: First-, third-person and all-knowing narrators, and two characters' views of one event. (647). (#576)

## 2026-11-14

### Labs
- New lab `dejima` “The Fan-Shaped Island”: Dejima, the Canton System and Indian trading posts, 1600–1860. (646). (#575)
- New lab `sevastopol-roads` “Roads to Sevastopol”: Nicholas I's Russia and the Crimean War: supply routes, weapons, reforms. (645). (#574)
- New lab `horde-roads` “Roads Through the Horde”: Rus princes, the Golden Horde and Italian trading posts around 1300. (644). (#573)
- New lab `wind-belts` “Winds Around the World”: Global circulation cells with and without rotation, real wind belts. (643). (#572)
- New lab `mantle` “What Moves the Plates?”: Mantle convection, slab pull and plate boundaries in a cross-section. (642). (#571)
- New lab `kadesh` “Who Won at Kadesh?”: The Battle of Kadesh from two sources, the treaty and Egypt's trade. (641). (#570)
- New lab `palace-coups` “Who Will Sit on the Throne?”: Russian rulers 1725–1762, who decided the succession, and Catherine II. (640). (#569)
- New lab `year-1917` “1917: A Year of Choices”: Russia's two revolutions of 1917, dual power and the Constituent Assembly. (639). (#568)
- New lab `prikazy` “An Office for Every Job”: Prikazy, the Duma and the Zemsky Sobor under Ivan IV, and the oprichnina. (638). (#567)
- New lab `king-parliament` “King or Parliament?”: Absolutism in France vs Parliament in England, 1600–1700. (637). (#566)
- New lab `two-ways` “Two Ways to Wire”: Series and parallel circuits with meters and a home switchboard. (636). (#565)
- New lab `circle-area` “Unroll the Circle”: Circle area by rearranging sectors, with the A(r) graph. (635). (#564)
- New lab `slinky` “Push or Shake”: Transverse and longitudinal waves on a slinky with v = f·λ. (634). (#563)
- New lab `growing-up` “How Fast Do We Grow?”: Height by age on a door frame and a WHO-based growth curve. (633). (#562)
- New lab `dino-or-not` “Dinosaur or Not?”: Six ancient animals to sort, legs to turn, film myths to spot. (632). (#561)
- New lab `salts` “Name the Salt”: Acid reactions in test tubes with word equations and salt names. (631). (#560)
- New lab `whose-brush` “Whose Brush?”: One still life in five painters' manners, a guessing game, dots and light. (630). (#559)
- New lab `chronicle` “Year by Year”: Chronicle year count, entry structure and the 1185 eclipse. (629). (#558)
- New lab `two-lands` “Two Lands, One Crown”: Upper and Lower Egypt on a Nile map, the double crown and the shaduf. (628). (#557)
- New lab `shape-for-job` “Shape for the Job”: Spoon, boat and jug shapes tested in a workshop. (627). (#556)
- New lab `fast-slow` “Fast or Slow?”: A landscape changed by quick events and by a time slider up to a million years. (626). (#555)
- New lab `kingdoms` “Plant, Animal or Neither?”: Sort organisms into kingdoms, zoom with a microscope, find the deciding rule. (625). (#554)
- New lab `storm-safe` “When the Storm Comes”: Forecast, shelter choice and the park after a thunderstorm. (624). (#553)
- New lab `alexander` “Alexander's March”: Alexander's route on a historical map, the Hellenistic kingdoms and Cleopatra. (623). (#552)
- New lab `surnames` “Smith, Miller, Baker”: Medieval trades behind surnames in three languages, and medieval inventions. (622). (#551)
- New lab `push-trolley` “Same Push, Different Load”: Force, mass and acceleration with a live velocity–time graph. (621). (#550)
- New lab `moving-feasts` “Which Day This Year?”: A year wheel with holidays from many countries across 2025–2035. (620). (#549)
- New lab `thumbs-feet` “Thumbs and Feet”: Body-based units, imperial conversions and old Russian and Hungarian measures. (619). (#548)
- New lab `papyrus` “From Reed to Scroll”: Make an Egyptian papyrus sheet step by step and roll it into a scroll. (618). (#547)
- New lab `polar-chains` “Who Eats Krill?”: Polar sea food chains built with arrows, with one link removable. (617). (#546)
- New lab `call-response` “Question and Answer”: Two birds sing musical questions and answers with Web Audio. (616). (#545)
- New lab `cold-touch` “Which Feels Colder?”: Touch materials with a thermometer, heat spoons, test properties. (615). (#544)
- New lab `space-race` “First in Space”: Space-flight milestones ordered on a rocket timeline. (614). (#543)

## 2026-11-13

### Labs
- Labs `population-tub` and `berlin-wall` no longer mention present-day conflicts: Germany's example shows the same migration sum as the other countries, and the Yugoslavia fact ends in 2006. (#542)
- Removed lab `russia-grows`: its map of today's borders touches present-day territorial disputes, which the labs leave out (613). (#541)
- New lab `trianon` “Trianon”: guess the share of the Kingdom of Hungary's land left inside the 1920 border, compare Hungarian speakers by region from the 1910 census, and see the railways and towns such as Komárom that the new border cut (614). (#540)
- New lab `russia-grows` “How Russia Grew”: slide Russia's map from 1533 to today and guess when it first reached the Pacific, move the sun over six city clocks from Kaliningrad to Kamchatka, and find its 14 land neighbours and two across the sea (613). (#539)
- New lab `rail-russia` “Rails Across Russia”: predict the length of Russia's railways in 1900 and watch the network and its graph grow from 1851 to 1913, time the trip from Moscow to Vladivostok, and watch Novonikolayevsk grow by the Ob bridge (612). (#538)
- New lab `reformation` “Theses on the Door”: buy an indulgence in 1517 and guess what Luther asked for first, choose the faith of thirteen German lands as their prince under the Peace of Augsburg, and order the wars of religion up to 1648 and their cost (611). (#537)
- New lab `vienna-1815` “Europe After Napoleon”: guess how the other powers answer Russia's and Prussia's claims and level a balance of lands, switch the map between 1812 and 1815, and order the Balkan steps from 1815 to 1908 (610). (#536)
- New lab `europe-east` “From West to East”: travel from Dublin to Yekaterinburg and watch the climate chart and the summer–winter range change, sort twelve countries into north, west, south and east, and trace raindrops from the Alps and the Valdai Hills to four seas (609). (#535)
- New lab `troubles` “The Time of Troubles”: guess how many men held Moscow's throne before Mikhail Romanov and run 1598–1613, predict the price of rye in the famine after the 1600 eruption, and follow Minin and Pozharsky to the Zemsky Sobor of 1613 (608). (#534)
- New lab `interwar` “Europe Between the Wars”: guess how many of 26 European states are still democracies at the end of 1938 and play the map from 1920, predict German unemployment and votes through the crisis, and sort six signs of democratic and totalitarian states (607). (#533)
- New lab `vectors` “Arrows on the Map”: compare pairs of arrows placed anywhere on an island map, predict where a+b+c and a−b end, and multiply an arrow by −1, ½ and 2 while its x and y steps update (606). (#532)
- New lab `conquest` “A New Homeland”: follow the Hungarians across the steppe into the Carpathian Basin and pick what the land offered, sort the magic stag and Emese's dream from recorded history, and order 895, 1000, 1222 and 1241–42 (605). (#531)
- New lab `skew-lines` “Lines in a Room”: turn a room and sort pairs of edges into crossing, parallel and skew, find which planes meet and along which line, and check a pole with one and two right angles (604). (#530)
- New lab `out-of-africa` “Across the Whole World”: order Australia, Europe and the Americas by when people reached them and run 300,000 years on a world map, try a hand axe, a spear, a bow and a needle, and keep warm on an Ice Age night with fire, a tent and clothes (603). (#529)
- New lab `myths` “Why Does Thunder Roll?”: tap thunder, a rainbow and winter and guess what Greek, Norse and Slavic myths said, place Troy, Persephone, Robin Hood, Ilya Muromets and King Arthur between legend and myth, and build a myth of your own (602). (#528)
- New lab `schism` “Rome and Constantinople”: guess whether Clovis, Bulgaria, Poland, Rus and Hungary turned to Rome or Constantinople, sort what divided the churches in 1054, and tell Catholic from Orthodox on a street of churches and a calendar (601). (#527)
- New lab `speed-energy` “Roll It Faster”: release a ball from four marks on a ramp and flag where the box stops, knock down a block tower at three speeds, and race a heavy and a light ball (600). (#526)
- New lab `choice-chamber` “Where Do They Like to Live?”: set up a choice chamber and guess where ten woodlice gather, give a woodlouse, an earthworm, a butterfly and a pond skater their spot in a garden, and move the wet paper for a fair test (599). (#525)
- New lab `crow-puzzle` “A Puzzle for a Crow”: choose stones or corks and how many a crow drops to raise the water in three tubes, match a crow, a chimpanzee, a sea otter and an octopus with their tools, and run the mirror test (598). (#524)
- New lab `line-graph` “What the Line Says”: grow a sunflower beside its height graph and guess the week of fastest growth, measure the gap between Budapest's and Moscow's temperature lines, and spot a cut axis and uneven steps (597). (#523)
- New lab `comets` “Tailed Visitors”: guess where a comet moves fastest on its stretched orbit, point the way its tail streams, and sort Pluto, Titan, Halley, Mercury, Eros and Ceres by the rules for planets, dwarf planets, moons, asteroids and comets (596). (#522)
- New lab `bird-flight` “Built to Fly”: cut open a pigeon's and a rat's bone and weigh feathers against a skeleton, match four wing shapes to four ways of flying, and zoom into a feather down to its barbs and hooks (595). (#521)
- New lab `decomposers` “Where Do the Leaves Go?”: run a forest floor for ten years with and without decomposers, match worms, fungi, woodlice and bacteria to their jobs, and fill a compost heap to see what rots in months, in years or never (594). (#520)
- New lab `antarctica` “Whose Ice?”: find where the seven claims on Antarctica overlap and freeze them with the 1959 treaty, sort six plans into allowed and banned, and see who staffs six research stations in summer and winter (593). (#519)
- New lab `carbon-cycle` “A Carbon Atom’s Journey”: lead one carbon atom between air, plants, a deer, soil, ocean and coal, guess the biggest carbon store before the bars grow, and burn fossil fuels to see where the carbon goes (592). (#518)
- New lab `olympus` “The Gods of Olympus”: find the god of each sign falling from the clouds, choose whom a Greek would ask in a storm, with a letter or at a wedding, and pair six Greek gods with their Roman names (591). (#517)
- New lab `clay` “Shape It, Stand It”: make a pinch pot, a coil pot and a slab with one lump of clay, give a clay horse thin or thick legs and let it dry, and join a handle by pressing, after drying, or with scoring and slip (590). (#516)
- New lab `leaf-inside` “Inside a Leaf”: slice a leaf and guess the layer with the most chloroplasts, drive its stomata with light and soil-water sliders, and sort a potato, an onion, an iris and a carrot into stems and roots (589). (#515)
- New lab `coprolite` “What Did the Dinosaur Eat?”: guess meat or plants, then saw three coprolites open and search them with a magnifier, work out which dinosaur most likely left them, and match teeth, stomach contents, bite marks and coprolites to the questions they answer (588). (#514)
- New lab `she-wolf` “The Twins and the She-Wolf”: turn the pages of the legend of Romulus and Remus and guess each next page, sort what the story says from what archaeologists found, and find the Palatine and the Aventine among Rome's seven hills (587). (#513)
- New lab `carbon-chains` “Carbon Chains”: grow a carbon chain and predict the next boiling point on the graph, compare butane and isobutane, and swap in an −OH or −COOH group to see what mixes with water (586). (#512)
- New lab `factorise` “Take It Out”: arrange algebra tiles into equal rows, decide whether a common factor can go further, and expand a factorisation back to check it (585). (#511)
- New lab `fire-triangle` “What Does a Fire Need?”: cover three candles with jars of different sizes and watch the oxygen fall, put out five kinds of fire by taking away fuel, oxygen or heat, and test four gases with a glowing and a lit splint (584). (#510)
- New lab `tea-tax` “The Tea Tax”: count the American colonies’ seats in Parliament and guess how colonists answer the Stamp, Townshend and Tea Acts, send the tea overboard on a December night in 1773 and guess Parliament’s reply, and order the road to independence (583). (#509)
- New lab `berlin-wall` “The Wall”: try three routes to a cousin across divided Berlin before and after 9 November 1989, slide Eastern Europe’s map from 1988 to 1993 and count the new states, and sort which breakups were peaceful (582). (#508)
- New lab `yuri-day` “St George’s Day”: stand at the manor gate in 1497, 1581, 1597 and 1649 and decide whether a Russian peasant may leave, chase a runaway as the search term grows from five years to forever, and split a serf’s week between the lord’s field and his own (581). (#507)
- New lab `emancipation` “The Freedom of 1861”: sort what a Russian peasant could do before and after 1861, redraw a village’s fields and run the redemption payments year by year, and match the zemstvo, court, city and army reforms that followed (580). (#506)
- New lab `wwii-turn` “The Turning Point”: compare how many aircraft the Allies and the Axis built each year, place Midway, El Alamein, Stalingrad and Kursk on a timeline, and move a schematic map of Europe date by date (579). (#505)
- New lab `steel-race` “The Steel Race”: run three furnaces from 1870 to 1913 on a steel output index and see how 7 % a year beats 1 %, place the inventions of the Second Industrial Revolution by year and country, and follow the dreadnought race (578). (#504)
- New lab `extinctions` “When Life Nearly Ended”: plant flags where you think life crashed on a 540-million-year curve and lift the curtain, guess the deadliest extinction and match each one to its cause, and watch who moved into the emptied places (577). (#503)
- New lab `three-mammals` “Three Ways to Be Born”: guess how small a newborn kangaroo is and follow a platypus, a kangaroo and a horse from the very start of life, tick what every mammal shares, and place egg-layers and pouched mammals on the world map (576). (#502)
- New lab `raster-vector` “Zoom In!”: zoom into two pictures that look the same and see one turn into squares, look inside at pixel numbers and drawing commands, shrink a photo and try to bring it back, and pick raster or vector for each job (575). (#501)
- New lab `price-tag` “The Price Tag”: put a price rise and an equal discount on a pair of trainers and guess where the price lands, undo a sale to find the old price, and race three small rises against one big one (574). (#500)

## 2026-11-12

### Labs
- New lab `wrap-box` “Wrap the Present”: guess how much paper a gift box needs and unfold it into a net, compare boxes made of the same 24 cubes, and wrap an open box and a tent (573). (#499)
- New lab `diggers` “How Many Diggers?”: weigh apples and hire diggers for a trench while two graphs grow beside them, place your guesses on the graphs before the line appears, and sort everyday pairs into direct, inverse or neither (572). (#498)
- New lab `signals` “Across the Valley”: send a drum beat, a flag, a lantern or a fire across a valley by day, at night, in fog and through trees, pick the best signal for each case, and agree a code so the friend understands (571). (#497)
- New lab `right-tool` “Which Saw?”: cut wood, plastic and metal with a panel saw, a tenon saw and a hacksaw and compare speed and edges, slice bread and tomatoes with three knives, and find the parts that keep hands safe (570). (#496)
- New lab `from-flat` “From a Flat Sheet”: cut two slits in a card and guess what pops up, fold a floppy sheet into a zigzag, triangle or tube and load it with blocks, and slot two cards together into a standing tree (569). (#495)
- New lab `alveoli` “A Tree in Your Chest”: branch the airways of a lung level by level and guess how big all the air sacs would be spread flat, thicken the wall of one alveolus and watch oxygen and carbon dioxide cross, and compare lungs with fish gills and emphysema (568). (#494)
- New lab `tag-fish` “How Many Fish in the Lake?”: tag, release and recatch fish to estimate a lake you cannot count, break the method on purpose and see whether the estimate comes out too big or too small, and count a forest from five random squares (567). (#493)
- New lab `rock-pool` “When the Sea Goes Out”: let the tide go out over a rocky shore and guess what the anemone, limpet, barnacles and crab will do, send a big wave to see who holds on, and watch who starts eating when the sea comes back (566). (#492)
- New lab `chain-bridge` “A Bridge over the Danube”: try to cross the Danube between Buda and Pest in winter and build the Chain Bridge, stand at its toll gate and see whether the count pays, and tick the old rules the April Laws of 1848 ended (565). (#491)
- New lab `cloud-docs` “One File for Everyone”: plan a class trip with three friends by emailing copies and then in one shared document, hand out view, comment and edit rights and test them, and bring back a deleted paragraph from the version history (564). (#490)

### Viewer
A calmer screen for a first visit; nothing was removed. (#486)
- The filter panel folds into sections with a one-line summary each (“Curricula · all 17”, “Progress · 0 known”). Only “Age and grade” starts open; a summary turns red when that section narrows the list. What you unfold is remembered on the device (`skillgraph.sideSec`).
- The topic card shows the path once: the “How to get here” button, the progress bar, “Stuck on this?” and “Mark the whole path as known” sit in one block, so the tabs start about a screen higher. The explanations of the path count and of “Stuck on this?” are tooltips now.
- The labs menu dims the page behind it and has one main button; “Show the topics that have a lab” is a link under it.
- The view tabs in the top bar no longer wrap onto two lines on narrower desktop windows.

### Labs
- New lab `single-cell` “A Life in One Cell”: feed an amoeba in a drop of pond water and watch it engulf food and divide, change the water around its contractile vacuole, and compare its seven jobs of life with a skin cell (563). (#489)
- New lab `sea-ice` “Ice in the Sea”: drill into sea ice, a glacier and an iceberg and compare their thickness and saltiness, freeze tap water and sea water side by side, and lower an iceberg into the sea (562). (#488)
- New lab `creep-crawl` “How Do They Get Around?”: guess how a snail, a worm, a grasshopper and other minibeasts will move before they set off, read their tracks in the mud and race two of them to a leaf (561). (#487)
- New lab `fossil-clues` “What the Rock Remembers”: find shells on a mountain, whale bones in a desert and plants in Antarctica and guess what the place was like when they lived, match clue fossils to old worlds, and watch a sea floor rise into a mountain (560). (#485)
- New lab `bus-stops` “The Bus Ride”: ride a bus from stop to stop and guess which dashboard numbers will change, watch a birthday table, and see that a number which stays the same on one trip can still change overnight (559). (#484)
- New lab `polyudie` “Tribute from the Drevlians”: ride with a prince of Kiev on the winter tribute round and see what happens in 945 when Igor asks for more, compare twelve winters of rounds with Olga’s fixed tribute, and settle a quarrel by the Russkaya Pravda (558). (#483)
- New lab `dualism` “Vienna and Budapest”: send the affairs of Austria-Hungary after 1867 to Vienna, Budapest or a common ministry, watch Budapest grow from 1870 to 1910, and follow the Tisza being made shorter while railways spread (557). (#482)
- New lab `then-now` “When Grandma Was Little”: move a child’s room back to around 1965 and guess which things Grandma had, sort a day into what changed and what stayed, and put old gadgets on a line of years (556). (#481)
- New lab `scissors-angles` “Open the Scissors”: open a pair of scissors to find the hidden angles at the pivot, fill a fan of angles around a point and work out a crossroads (angles on a line, around a point, vertically opposite; reflex angles) (555). (#480)
Twenty labs for the areas with the fewest labs (English and literature, personal development, civics and history for ages 12–15).
- New lab `persuade` “Win Them Over”: build a speech for a later school start and watch five very different listeners react, sort strong reasons from tricks, and find the reason that works for each listener (535). (#479)
- New lab `prove-it` “Prove It!”: pick the sentence that really holds up a claim and watch the bridge take the weight, tell what a story says from what it lets you guess, and finish an answer that explains its quote (536). (#479)
- New lab `glue-words` “Glue for Ideas”: join two ideas with a linking word and watch a reader robot picture the meaning, change one small word and change the whole story, then map how a paragraph holds together (537). (#479)
- New lab `iceberg` “Under the Surface”: see what a character does above the water, dive for the reason underneath, find out why the same deed can hide different reasons, and collect clues to name a character’s nature (538). (#479)
- New lab `word-colour` “One Word, a Different Feeling”: slide through words that mean nearly the same and watch a picture change its mood, spot the loaded words in two news reports of one event, and paint an evening sad or happy with three words (539). (#479)
- New lab `epic-singer` “Sing It from Memory”: help a singer by the fire keep a long song going without a book, find the pieces a song repeats, and travel to the great sung stories of the world (540). (#479)
- New lab `irony` “Didn’t See That Coming”: watch a stage where you see more than the characters do, sort three kinds of gap between words and things, and guess the ending of a famous short story before the curtain opens (541). (#479)
- New lab `play-script` “From Page to Stage”: mark which words of a script are spoken and watch two actors perform it, change the stage directions to change the scene, and split a story into scenes where the place or time changes (542). (#479)
- New lab `discussion-web` “The Talk Web”: watch two group talks draw their shapes from above, choose each next move in a class discussion and see the web grow, and sort the phrases that build a talk from the ones that end it (543). (#479)
- New lab `describe-draw` “Draw What I Say”: describe a hidden picture to a robot that draws exactly what it hears, try the same words in a different order, and be the listener who picks the right picture (544). (#479)
- New lab `caricature` “Funny Mirrors”: stretch a face away from the average and see when it becomes more recognisable, match three cartoons to three people, and find what a parody is really laughing at (545). (#479)
- New lab `coping` “The Right Tool”: sort troubles you can change from ones you can’t, pick a tool from the box and watch the storm cloud shrink, and follow a week after a setback on a mood line (546). (#479)
- New lab `rowing` “Row Together”: set four rowers’ pulls and guess which buoy the boat reaches, share out the jobs of a group poster and race the clock, and see what happens to a group that only hears its loudest voice (547). (#479)
- New lab `stress-curve` “Under Pressure”: turn up the pressure on a juggler and draw the curve of how well they do, find out how the curve shifts for a hard task, and keep a stress bucket from overflowing over a week (548). (#479)
- New lab `goal-setting` “Sharpen the Goal”: turn a foggy wish into a goal you can see and watch the target come into focus, climb a ladder of small steps week by week, and change the plan when a week goes wrong (549). (#479)
- New lab `feedback` “Make It Better”: give a classmate feedback on a poster and watch both the poster and their face change, be the artist who receives comments, and listen to a short talk to give two stars and a wish (550). (#479)
- New lab `upstander` “One Voice”: add more and more watchers to a schoolyard and see what happens to each one’s sense that it’s up to them, try safe ways to step in, and follow a mean picture through a group chat (551). (#479)
- New lab `rights` “Rights Next Door”: run a street of neighbours whose freedoms grow until they bump into each other, pair rights with the duties that keep them working, and discover the two ways countries decide who is born a citizen (552). (#479)
- New lab `norms` “Who Will Stop You?”: drop rules into a sorting machine and see who reacts when each is broken, take apart a bike sale into who, what and which promises, and find the ages at which the law starts to treat you differently (553). (#479)
- New lab `enlightenment` “Dare to Know”: release a banned book on a map of 1750s Europe and see if any king can stop it, match four thinkers to the problems they wanted to solve, and test which reforms the “enlightened” monarchs would accept (554). (#479)

## 2026-11-11

### Labs
- New lab `sound-square` “Singing Square”: play a glowing square with several fingers (up = higher, pressing harder or sliding faster = louder, right = brighter), with a smooth glide or pentatonic notes, a soft reverb and a full-screen mode; let a pen write what you play as a graphic score and play it back; and match hidden tunes to their sound pictures (534). (#477)
- `sound-square`: finger trails no longer show seams or blots on sharp turns; the second part becomes “Compose”, a loop of up to four layers, each with its own instrument (voice, bells or drums), with an echo on the beat, an “On the beat” snap with a metronome, undo and a full-screen toolbar. (#478)

## 2026-11-10

### Labs
- New lab `diagonals` “Two Sticks, Four Sides”: cross two sticks and stretch a band round their ends to build a rhombus, a kite and a rectangle, fill a table of diagonal properties, and find the minimal recipe for each shape (533). (#476)
- New lab `gold-foil` “Shooting at Gold Foil”: fire a thousand alpha particles at gold foil and compare the plum-pudding and nuclear atoms, zoom from a gold atom to its nucleus, and make a hydrogen electron give off coloured light (532). (#475)
- New lab `house-of-wisdom` “The House of Wisdom”: carry Euclid, Ptolemy and the Indian digits from city to city and guess each new language, race Roman numerals against digits in a sum, and find words that came through Arabic (531). (#474)
- New lab `climograph` “Guess the City”: read the rain bars and temperature line of a real climate chart, find six mystery cities from their charts, and flip the seasons of Sydney against Budapest (530). (#473)
- New lab `bridges` “Seven Bridges”: try to cross every bridge of an old river town once, turn the town into dots and lines and find the rule of odd dots, and add or remove bridges until the walk works (529). (#472)
- New lab `frog-or-lizard` “From Water to Land”: walk a frog and a lizard away from a pond and watch their water graphs, leave spawn and a shelled egg on dry sand, and guess who lives in rainforests, ponds and deserts (528). (#471)
- New lab `paleoart` “Dress the Skeleton”: add bones, muscles, feathers and colour to a dinosaur and sort what is known from what is guessed, watch Iguanodon change since the 1850s, and read colour from a fossil feather (527). (#470)
- New lab `one-output` “The Vending Machine”: press the buttons of three vending machines and draw what comes out, sort tables of inputs and outputs, and slide a vertical line across graphs (526). (#469)
- New lab `parabola` “The Flight of a Ball”: predict the top of a throw and watch its path become a graph, turn the a, b and c dials of a quadratic, and race square tile patterns against a straight row (525). (#468)
- New lab `neurons` “A Path in the Brain”: send a signal along a chain of neurons and watch it cross the synapses, light up the lobes of the brain at work, and practise a skill for 30 days (524). (#467)
- New lab `share-decimals` “Share to the Last Coin”: deal coins to four friends and change the leftovers into tenths and hundredths, watch each step appear in a written division, and cut a ribbon into equal pieces (523). (#466)
- New lab `not-event` “The Chance It Won't”: paint a spinner and find the chance of "not red" before spinning it a thousand times, find a hidden chance on a four-colour wheel, and turn forecasts and raffles into chances of the opposite (522). (#465)
- New lab `coord-rules` “The Moving Rule”: feed points into a hidden machine and predict where the next one lands, then name the coordinate rules that slide, flip and turn a sailboat on a grid (521). (#464)
- New lab `wild-farm-pet` “Who Looks After Them?”: take animals to the forest, the farm or a house and see who feeds them, leave a cow out in the winter woods, and slide back in time to their wild ancestors (520). (#463)
- New lab `tundra` “Under the Tundra”: dig into frozen ground and plant a pine, a willow, moss and lichen, run a tundra year from polar night to midnight sun, and see how its animals get through winter (519). (#462)
- New lab `two-unknowns` “Two Puzzles on the Scales”: balance an apple and a pear in every way and watch the pairs line up on a grid, add a second scale to leave one answer, and solve ticket and chicken-and-rabbit puzzles (518). (#461)
- New lab `space-station` “A Home in Orbit”: tip a cup of water on a space station and on Earth, guess how astronauts eat, sleep, exercise and wash, and count the sunrises outside the window (517). (#460)
- New lab `volcano-sleep` “Asleep or Gone?”: open the eruption diaries of three volcanoes and label them, watch a volcano quiet for 500 years show its first signs, and label six real volcanoes (516). (#459)
- New lab `castle-ages` “One Hill, Many Castles”: rebuild one castle on one hill through the centuries after watching each attack, find the weak spot of each design, and test tall and low walls against cannons (515). (#458)
- New lab `folk-tale` “What Is a Tale Made Of?”: find the bricks of a folk tale about three brothers, guess what happens the third time, and build a tale of your own (514). (#457)
- New lab `prism` “Slices of a Prism”: cut prisms of every shape into equal slices, lean a triangle without changing its area, and fill a swimming pool with a sloping floor (513). (#456)
- New lab `plastic-sea` “The Bottle's Journey”: follow a plastic bottle as the sea breaks it into ever smaller pieces, see what sea animals mistake for food, and try the levers a seaside town can pull (512). (#455)
- New lab `turn-symmetry` “Turn It Round”: spin pinwheels, stars and snowflakes on a pin and count how often they match, find the smallest turn, and hunt for letters that look the same upside down (511). (#454)
- New lab `home-power` “Who Uses Most?”: switch on appliances and watch an old meter's disc spin, sort what runs on electricity, and add up a family's day in watt-hours (510). (#453)
- New lab `false-belief` “Where Will She Look?”: watch a cat move Mia's ball while she is out and guess where she will look, open a crayon box with a surprise inside, and work out who knows about a birthday gift (509). (#452)
- New lab `multi-bar` “Bars in Pairs”: put two classes' votes side by side and find the biggest gap, catch a key that swaps its colours, and compare rain in Budapest and Moscow by season (508). (#451)
- New lab `eggs-or-babies` “Egg or Baby?”: guess what is behind a little door for eight animals, meet animals that break the rules, and watch a frog egg, a caterpillar and a kitten grow up (507). (#450)
- New lab `sun-warms` “Sunny Yard”: move an umbrella over stones in the sun, compare a black and a white shirt, and follow a stone's warmth from morning to evening (506). (#449)
- New lab `tally` “Count the Cars”: mark passing cars in bundles of five, race sticks against bundles, and turn the marks into a bar chart (505). (#448)
- New lab `match-pitch` “Sing the Same Note”: move a bird up a ladder until two notes sound as one, turn separate loudness and pitch knobs, and echo three-note tunes (504). (#447)

### Viewer
- A first visit opens in the browser's language when it is English, Russian or Hungarian, on the map, the labs, the curricula page and "What's new". The order is `?lang=`, then the language chosen before on the site (now remembered on every page, not only the map), then `navigator.languages`, then English. Backlog F03. (#437)
- "My child" works without a school curriculum: leave "Any curriculum" and pick the child's age (4–14). The radar, the quick check, the by-subject check, "This week" and "Gaps" then use the graph's subjects (in the interface language) and the topics that start at that age or a year before. Snapshots and by-subject results are kept per age. With a curriculum chosen nothing changes. Backlog F01. (#437)
- The first tap on "Show the picture" after typing the name works: the heading follows the name while it is typed, and the card is no longer re-rendered when the field loses focus. Backlog F02. (#437)
- The quick check in "My child" asks mostly about the grade's core: mathematics and the school language take two questions of every three, the other subjects one each; inside a subject the grade's `core` topics come first, then the central ones, then those nearest the child's age (before: "ready" topics first, which at the start are the earliest and softest). After the check a card lists each answer (can / not yet, with a route), and while there are few answers a note explains that the shares count all of the grade's topics. Without a curriculum, topics about one country's school language are left out. Backlog F05. (#438)
- "Canada (Ontario)" in the map's source filter, in EN, RU and HU: Canada has no national curriculum, so Ontario's documents stand for it, as Bavaria does for Germany. 812 topics cite them; "Marble only" goes from 203 to 163 topics, also on the curricula page. Canada is not a school choice in "My child". Backlog F07. (#438)
- Routes show subject content as steps: habits of mind (`META` topics such as "Connecting maths to real life") go to a line "Habits that help along the way" under the route, except for Learning to Learn and Personal & Social goals. When that leaves fewer than 3 steps, because the goal's content prerequisites are `soft`, the goal's direct content prerequisites and their required basics become the steps. "Working with money" was 2 `META` steps; it is now 6 steps of measuring and word problems. Of the 107 ready-made routes, 2 others change (one `META` step each moved out). Backlog F06. (#439)
- Shorter lists on a phone. Labs overview: a compact card (emoji, title, age and topic count; the blurb is on the lab's own page), and without a filter each section shows its first 6 labs with "Show all" (about 5,600 px at 390 px instead of about 107,000; the first 20 labs within 4 screens). Search, subject, age and "Newest first" work as before; desktop is unchanged. Routes: subjects are folded with a count, and an age filter (remembered) narrows the goals; about 1,200 px instead of 11,000. Backlog F10. (#440)
- Small fixes (backlog F17): the labs button on the map counts the labs in the interface language, as the labs page does (499 in RU, 502 in HU, 498 in EN, of 503); notices such as "Quick check done" appear at the bottom of the screen and go away when the screen changes; on a phone the map fits below the heading instead of under it (`graph2d.js` takes a `top()` inset). (#441)
- "My child" names the school's subjects in the interface language (`data/school-subjects.i18n.json`: 135 subject names of 14 curricula in EN, RU and HU, translated with Sonnet); the bars keep the original name as a hint, and long radar labels wrap onto two lines instead of being cut. Backlog F14. (#442)
- "My child" says when a curriculum is mapped only in outline (under 20 items a grade: Sweden, Finland, Singapore, Estonia), so the picture is coarse. Backlog F16. (#442)
- A two-row header on a phone (about 86 px instead of 175): the language is one compact select, search opens from a 🔍 icon, "Filters" is an icon; the views scroll sideways in one row. The tour points at the icon and the select on a phone. Backlog F11. (#443)
- One menu on every page, in one order: Graph, Topic list, Routes, My child, Labs, Curricula. The labs, curricula and "What's new" pages gain Routes and My child; the map gains a Curricula link (its Labs entry stays the 🧪 button). Backlog F12. (#443)
- The site, `README.md` and `CONTRIBUTING.md` say ages 4–14, as the topics do (was 4–16). Backlog F08. (#437)

### Project
- `docs/BACKLOG.md`: F01–F03, F05–F08, F10–F12 and F14–F17 done in #437–#444; F13 (facts for older labs) stays open. (#445)
- `docs/BACKLOG.md`: F13 deferred by the owner; older labs stay without facts for now. (#446)
- `docs/BACKLOG.md`: a shared work backlog (items F01–F17 from a whole-project review of the viewer, routes, labs and data), with a status per item so that any session or contributor can pick one up; linked from `CLAUDE.md` and `AGENTS.md`. (#436)

### Data
- The 21 `hard` prerequisites that started at a later age than their topic are now `soft` (12 Marble edges as deliberate data fixes, 9 of our own in `data/extra/`, in all three languages), so they no longer force a later topic before an earlier one in route steps. Among them, "Inherited characteristics" before "Offspring resemble parents" points the wrong way and is softened rather than reversed, to keep the translated reasons. 163 `soft` inversions stay as they are. `scripts/validate.mjs` warns about new hard inversions. Backlog F15. (#444)
- Sync with upstream Marble: Ontario Language and Science grades 1–6, Ontario mathematics grades 6–7, India's NCERT catalogue (codes only); 1,861 Marble topics (16 new: English grammar, geometry of solids and views, divisibility rules, ways to pay, bank interest and fees, touch typing, First Nations, Métis and Inuit peoples), 4,003 dependencies. 176 new or changed strings per language translated to RU and HU. Marble's new `data/curriculum-alignments.json`, its `alignments:*` scripts and its `taxonomy-curation` agent skill come along unchanged; the viewer does not use them. (#435)
- Rules for mapping curricula and adding topics in `CONTRIBUTING.md`, adapted from Marble's curation principles: one topic per skill a child can show, reuse before adding, `core` only for full coverage, a learning reason for each prerequisite, ages 4–16. (#435)

## 2026-11-09

### Labs
- New lab `game-ai` “How the Guard Decides”: switch a game guard’s rules on and off, work out a hidden rule from how a guard moves, tune a game until it feels fair (503). (#434)
- New lab `dino-continents` “Fossils Across the Sea”: fit the continents together by their fossils, slide 250 million years of drifting land, dig for dinosaurs on every continent (502). (#433)
- New lab `volcanic-winter` “Ash in the Sky”: set off eruptions of different sizes and watch the world’s temperature, visit a village in June 1816, compare Pinatubo, Tambora and Toba (501). (#432)
- New lab `film-music` “Music for a Scene”: play one short scene with three soundtracks, build music for a chase or a sunrise, recognise characters by their tunes (500). (#431)
- New lab `medieval-clothes` “Dress for 1300”: dress a peasant and a noble, dye cloth with woad, madder and weld, put a knight’s armour on layer by layer and weigh it (499). (#430)
- New lab `roman-roads` “Straight Roads, Strong Shields”: build a Roman road layer by layer and send rain over it, walk a straight and a winding road, lock shields into a tortoise (498). (#429)
- New lab `minotaur-maze` “The Minotaur’s Maze”: lead Theseus into the labyrinth and back, try to get out with no thread, put the myth of Theseus in order (497). (#428)
- New lab `hastings` “A Story Stitched in Wool”: meet the three men who wanted the English crown in 1066, scroll along the Bayeux Tapestry, ask who made it and for whom (496). (#427)
- New lab `pendulum` “Tick, Tock, Swing”: change one thing at a time on a pendulum and count swings, predict a hidden pendulum behind a curtain, set a grandfather clock to tick once a second (495). (#426)
- New lab `troy-layers` “City on City”: dig down through nine cities at Troy, watch Schliemann’s trench cut through the layers, sort clues for a real war and for the poem (494). (#425)
- New lab `mummy` “How to Keep Forever”: dry one apple in salt and leave one out, put the steps of mummification in order, wrap a figure in linen (493). (#424)
- New lab `congruent` “Fixed or Not?”: build triangles from fixed sticks and angles, test SSS, SAS, ASA, SSA and AAA, push a triangle and a square frame (492). (#424)
- New lab `medieval-food` “What’s for Dinner in 1300?”: fill a bread trencher with medieval food, compare a lord’s feast and a peasant’s supper, eat without a fork (491). (#424)
- New lab `first-olympics` “The First Olympics”: run the stadium at Olympia, find out what the winner got, sort ancient and modern sports (490). (#424)
- New lab `histogram` “Bars Without Gaps”: change bin width for 60 pupils’ heights, drop pupils into touching bars, decide which data needs a histogram (489). (#424)
- New lab `whale-mammal` “Fish or Not?”: help a dolphin come up for air, compare a dolphin’s and a fish’s tails, sort six sea animals into fish and mammals (488). (#423)
- New lab `art-genres` “What Is the Picture About?”: move a golden frame around one garden scene to make a portrait, a landscape or a still life, sort six small paintings, pick a tall or wide page (487). (#422)
- New lab `dino-sizes` “How Big Were They?”: line up five dinosaurs beside a bus and a child, stand next to a Velociraptor, step into a T. rex footprint (486). (#421)
- New lab `plant-bends` “Which Way Will It Grow?”: move a lamp around a seedling and play the days, lay a jar on its side and watch root and shoot turn, see which flowers open with light and which with warmth (485). (#420)
- New lab `separating` “Sort Out the Mess”: separate gravel, sand, iron, salt and water with a sieve, a magnet, a filter and a flame, match each tool to its trick, sort pure substances from mixtures (484). (#419)
- New lab `tessellation` “No Gaps, No Overlaps”: put tiles round one point and add the angles, tile a floor with each regular shape, continue border patterns (483). (#418)
- New lab `solar-panel` “Catch the Sunlight”: tilt a solar panel towards the sun and read the power, shade one cell and lose a string, wire four cells in series or parallel (482). (#417)
- New lab `heat-capacity` “Same Heat, Different Warmth”: heat water, oil and sand on identical hotplates and watch the graph, find Q = mcΔT, compare the sand and the sea through a sunny day (481). (#416)
- New lab `weather-map` “Read the Forecast”: read the symbols on a weather map, pack a bag for a trip to one town, move a band of rain east across the country (480). (#415)
- New lab `trebuchet` “Siege!”: load a trebuchet and fling stones at a castle wall, defend with walls, a moat and arrow slits, count how long the food lasts (479). (#414)
- New lab `insect-records` “If You Were a Flea”: jump like a flea, pull like a dung beetle and hunt like a dragonfly, then scale each record up to your own size (478). (#413)
- New lab `coral` “When Coral Turns White”: zoom into a coral and its algae partners, run a heatwave week by week over a reef, make the sea more acidic (477). (#412)
- New lab `interest` “Money That Grows”: leave coins in a bank for years, borrow and choose how much to pay back, find the rule of 72 for doubling money (476). (#411)
- New lab `scatter` “Do They Go Together?”: predict the pattern before the dots fall, drag points to make r strong or weak, ask whether ice cream really causes drowning (475). (#410)
- New lab `longship` “The Viking Longship”: race a deep ship and a longship up a shallow river, sail with the wind or row without it, follow the Vikings as far as America (474). (#409)
- New lab `peacock` “The Peacock’s Tail”: choose between peacocks like a peahen, evolve tail length over 100 generations with tigers about, sort antlers, claws and dances (473). (#408)
- New lab `pop-pyramid` “The Shape of a Country”: match three countries to their age pyramids, run a country to 2100 with births and life expectancy, plan its schools, jobs and pensions (472). (#407)
- New lab `electromagnet` “Wire, Nail, Battery”: wrap a nail in wire and switch the current on and off, find the rule for how many paperclips it lifts, sort scrap with an electromagnet crane (471). (#406)
- New lab `hilbert-hotel` “Hilbert’s Hotel”: find a room for a new guest in a full hotel with endless rooms, fit a whole endless bus, pair whole numbers with even numbers and meet Cantor’s diagonal (470). (#405)
- New lab `gps` “Three Circles Find You”: listen to towers one by one until the circles meet in one place, turn signal time into distance and see what a clock error does, count the satellites overhead (469). (#404)
- New lab `groundwater` “Water Under Your Feet”: zoom into sand, gravel and clay to see where groundwater sits, dig a well through a dry summer, follow a spill as it seeps towards the well (468). (#403)
- New lab `blind-spot` “What the Driver Can’t See”: hide cyclists around a lorry and reveal what the driver sees in the mirrors, watch the trailer cut the corner on a right turn, find the safe place by the driver’s face (467). (#402)
- New lab `relative-motion` “Who Is Moving?”: throw a ball in a moving train and watch it from the platform, ride beside another train, steer a boat across a flowing river with velocity arrows (466). (#401)
- New lab `greek-theatre` “Fourteen Thousand Seats”: shape the seats of a Greek theatre and test what each seat sees and hears, look at masks from the top row, drop a coin on the stage at Epidaurus (465). (#400)
- New lab `alphabet` “Letters on the Move”: count the signs a scribe must learn, turn old picture-signs into today’s letters, sail the alphabet from Tyre to Greece, Rome and the Slavs (464). (#399)
- New lab `static` “Rub a Balloon”: rub a balloon on a jumper and count the charges that hop across, hang two charged balloons side by side, shuffle across a carpet to a spark (463). (#398)
- New lab `cladogram` “Family Tree of Animals”: grow a branching tree from seven shared traits, guess who is whose closer relative with the tree hidden, follow the bird branch past the asteroid (462). (#397)
- New lab `thermopylae` “Hold the Pass”: make the pass at Thermopylae wider or narrower and see how many can fight at once, follow the mountain path behind the Greeks, run the road from Marathon (461). (#396)
- New lab `chart-tricks` “Chart Tricks”: peel the sticker off a chart’s axis and watch the headline change, stretch a cat picture and compare areas, spot the trick in five newspaper charts (460). (#395)
- New lab `tsunami` “The Giant Wave”: shake the sea floor and watch a low, fast wave grow tall at the shore, read the warning signs and get everyone uphill, race the wave across the Pacific (459). (#394)
- New lab `drinking-water` “Only a Drop to Drink”: pour all Earth’s water into 100 glasses and find the fresh part, salt the water until an egg floats, make fresh water from the sea with a sun still (458). (#393)
- New lab `dino-tracks` “Footprints in the Mud”: send a dinosaur across the mud and read its speed from the stride, guess size and gait from bare trackways, pick the story a rock surface tells (457). (#392)
- New lab `half-life` “The Atom Clock”: flip a coin for each of 400 atoms and watch the curve, predict the shape of decay, date a bone, wood, charcoal and Ötzi with carbon-14 (456). (#391)
- New lab `star-life` “A Star’s Life”: slide a star’s mass and watch its colour and lifetime, play the lives of four stars to their endings, follow star dust into a new sun (455). (#390)
- New lab `constellations` “Join the Stars”: join the Big Dipper star by star, turn the night sky around the North Star, find the W, Orion’s belt and the ladle (454). (#389)

## 2026-11-08

### Labs
- New lab `scramble-africa` “Africa Divided”: switch a dot map of Africa from 1880 to 1914, look at who sat at the Berlin table, find the two countries that stayed independent (453). (#388)
- New lab `typefaces` “Letters Have a Voice”: read a shop sign from far away in five typefaces, give each shop the right letters, space letters so they look even (452). (#387)
- New lab `printmaking` “Back to Front”: carve a stamp and see the print come out mirrored, print a picture one colour block at a time, print an edition of ten (451). (#386)
- New lab `growing-orchestra` “The Growing Orchestra”: watch the orchestra fill the stage from 1720 to 1910, find where composers lived and worked, meet new instruments as they join (450). (#385)
- New lab `around-1900` “One Street, Thirty Years”: move one city street from 1880 to 1910, put six inventions in order, look into a home of 1910 (449). (#384)
- New lab `human-or-machine` “Human or Machine?”: race a robot at five tasks, chat with two strangers and spot the machine, sort photos as a team (448). (#383)
- New lab `where-am-i` “Where Am I?”: zoom from the planet to a front door like nesting dolls, name the continents and oceans, count a country’s neighbours (447). (#382)
- New lab `learn-or-memorise` “Learned or Memorised?”: train a memorising robot and a rule-finding robot on alien fruits, test them on new ones, give them more examples, catch a cheat test (446). (#381)
- New lab `pollination` “Little Helpers”: net an apple branch and count the apples, send ladybirds after aphids, watch beetles and worms recycle a cow pat (445). (#380)
- New lab `mouse-dragon-me` “Mouse, Dragon or Me?”: try three voices in everyday situations and see how both children feel, say a kind and firm no, build an I-statement (444). (#379)
- New lab `rome-falls` “How Rome Fell”: watch the Western Empire break up region by region, load a pillar with problems, follow the two halves of one empire (443). (#378)
- New lab `round-earth` “How the Greeks Knew”: watch a ship sink over the horizon, catch the Earth’s round shadow on the Moon, walk south and watch Canopus rise (442). (#377)
- New lab `plant-cell` “Inside a Leaf Cell”: build a plant cell and an animal cell, water a plant and watch its cells, shine light on leaf, stem and root (441). (#376)
- New lab `molting` “Armour That Doesn’t Grow”: watch a crab grow in steps as it molts, find out why insects stay small, sort arthropods by body plan (440). (#375)
- New lab `circuit-diagrams` “Draw the Circuit”: match a real circuit to its diagram, read a diagram to say which bulbs light, draw circuits with symbols (439). (#374)
- New lab `swim-bladder` “How a Fish Floats”: fill a fish’s swim bladder and watch it rise or sink, look inside the gills, stop a shark that has no bladder (438). (#373)
- New lab `weather-station` “My Weather Station”: turn the wind and read a vane and an anemometer, catch rain in a thin gauge and a wide bucket, hang the thermometer in the right place (437). (#372)
- New lab `asteroid` “The Day the Sky Went Dark”: watch the world darken after the asteroid, dig a cliff for the iridium clue, sort animals into survivors and those that died out (436). (#371)
- New lab `absolute-value` “How Far from Zero?”: ride a lift below the ground floor and measure the rope from zero, compare heights above and below the sea, tell “smaller” from “closer to zero” (435). (#370)
- New lab `elapsed-time` “How Long Until?”: hop along a time line to time a train ride, ride a night bus across midnight, plan a trip with a change (434). (#369)
- New lab `pass-it-on` “Pass It On”: whisper a phrase along a line of six friends and watch it change, say it back to keep it right, take turns to be heard (433). (#368)
- New lab `hub-airports` “Change at the Hub”: link cities directly or through a hub and count the routes, measure the detour via Istanbul on a real map, send a storm over the hub (432). (#367)
- New lab `million` “How Big Is a Million?”: zoom out from one dot to a cube of a million, build seven-digit numbers on a train, count to a million one second at a time (431). (#366)
- New lab `peter-port` “A Window on the Sea”: sail two sea roads from Russia to Europe and time them, build St Petersburg on the Neva marshes year by year, climb the Table of Ranks (430). (#365)
- New lab `atmosphere` “Up Through the Air”: ride a weather balloon until it bursts, slice the sky into layers, weigh the air above one square metre (429). (#364)
- New lab `diffusion` “The Great Spread”: drop ink into hot and cold water and graph how it spreads, count oxygen crossing a thin wall both ways, race a small cell against a big one (428). (#363)
- New lab `five-notes` “Five Notes Around the World”: play only the black keys and hear why nothing clashes, try Amazing Grace and Ode to Joy on five notes, follow five-note music from Hungary to China, Java and the blues (427). (#362)
- New lab `cross-sections` “Slice It”: cut a glass cube with a tilting plane and collect the shapes up to a hexagon, slice cylinders, cones and a sphere, guess a hidden solid from its scan (426). (#361)
- New lab `ocean-floor` “Ping the Ocean Floor”: draw the ocean floor from echoes, name its parts, drop Mount Everest into the deepest trench (425). (#360)
- New lab `newton-cannon` “Falling Around the Earth”: fire Newton’s cannon faster and faster, drop a ball on four worlds, watch the Moon fall for one minute (424). (#359)
- Ten new labs (423): `tempo` “Fast or Loud?” (tempo and loudness as two separate dials, a mystery tune behind a curtain, crescendo and accelerando), `rubbing` “Rough or Smooth?” (crayon rubbings of hidden objects, marks that make fur, spikes and shine, texture versus pattern), `risk` “How Risky?” (likelihood × severity grid, controls that make a hazard less likely or less bad, 100 runs with and without a plan), `ask-class` “Ask the Class” (statistical questions, tally and dot plot of 24 answers, fixing a fuzzy question), `crusades` “Road to Jerusalem” (the three-year road of 1096–1099, one city holy to three faiths, trade with Venice and Genoa), `first-fleet` “Why Sail So Far?” (full prisons and the First Fleet of 1788, causes of later Australian colonies, Sydney Cove before the ships), `red-queen` “Running to Stay Still” (newt–snake arms race simulation with linked graph, freezing one side), `co2` “The Earth Breathes” (4 CO₂ particles in 10,000, the Mauna Loa curve from NOAA annual means, the seasonal swing and a fuel model), `advert` “Behind the Advert” (switching advert tricks on and off, the real size of the toy, spotting tricks), `comics` “Between the Panels” (panel order and the gutter, close and far shots, speech balloons and manga reading order). (#358)

## 2026-11-07

### Labs
- Ten new labs (413): `quick-look` “At a Glance” (see up to 5 without counting, then 7 as 5 and 2), `turn-around` “Turn Around!” (quarter, half and whole turns, left and right, clock turns), `rosetta` “Crack the Code” (find and decode the names of Ptolemy and Cleopatra, write your own name), `shake-table` “Shake Table” (braces, rubber base pads, resonance and a town plan for a quake), `hot-cold` “Too Hot, Too Cold” (fox ears under a heat camera, a fat glove in ice water, a penguin huddle), `ice-mirror` “White and Dark” (sunlight bounced by snow and soaked by the sea, the ice-melt loop, cold salty water sinking), `mountain-shift` “Up the Mountain” (species bands moving uphill as a mountain warms, slow and fast species, up versus north), `mole` “Count by Weighing” (count rice by weighing, moles on a balance, molar masses of molecules), `convert` “Change the Units” (length, area and volume conversions with ×10, ×100 and ×1000 steps), `voice-helper` “Talk to the Speaker” (the four steps of a voice assistant, noise, tool or friend). (#357)
- `light-speed`: in Trips the child picks both cities (From and To) from 18 cities in Europe, Russia and the USA, or the Moon, instead of fixed pairs per language; the prediction question and its options are built for the chosen route. Distances are straight-line distances × 1.2 for road bends; across the ocean the car shows “no road”. (#356)
- New lab `light-speed` “How Fast Is Light?”: race light, a snail and a car around the Earth through a tunnel, count light’s round trips between two cities in one second (city pairs differ by language: London–Edinburgh, Budapest–Poreč, Moscow–Vladivostok…, plus the Moon), and count the seconds from a lightning flash to the thunder (403). (#355)

## 2026-11-06

### Labs
- All labs with several parts: each tab carries its number, and under the lab a card says “Part 1 of 3” and has a big “Next: <part> →” button (on the last part, “Back to part 1”). Done once in `labs/lab.js` and `labs/lab.css`, so every lab built on the shell gets it. People did not notice parts 2 and 3 behind the tabs at the top. (#354)
- `next-word`: the Guess tab is now a loop. Before every word the child picks one of the three most common next words, the robot picks with the Surprise setting, and the lab says whether they matched, with a running score, until the sentence ends. Before, the child guessed once and the chips locked, and new words came only from a “Next word” button that few people noticed. (#353)
- `seasons`, `shadows`: latitude labels read “47.5° N” / “47,5° с. ш.” / “é. sz. 47,5°”; the old “47,5° С” looked like degrees Celsius. (#352)
- New lab `word-cousins` “Cousin Languages”: compare words for three, mother and water across nine languages, grow a family tree of languages, find where Hungarian’s cousins live (402). (#351)
- New lab `constantinople` “The City on Two Seas”: send ships and caravans through the crossroads of the world, attack the walls from sea and land, follow an emperor through 38 years (401). (#350)
- New lab `inscribed-angle` “Angles in a Circle”: move a point around a circle and find the rule for its angle, stand on a semicircle, pick the seat that sees the goal widest (400). (#349)
- New lab `factory-site` “Where to Build the Steelworks”: drag a steelworks around a map and watch the transport bill, make the ore heavier, add a river, visit real steel towns (399). (#348)
- New lab `idioms` “Not Really Gold”: watch a painter take phrases literally and find what they really mean, match funny pictures to meanings, sort similes from metaphors (398). (#347)
- New lab `enzymes` “Tiny Scissors”: match enzyme scissors to the food they cut, warm and cool them to find their best temperature, chew a cracker and see what changes (397). (#346)
- New lab `mad` “How Far from the Middle?”: tie strings from each value to the mean and lay them in a row, compare two teams with the same mean, add one far value (396). (#345)
- New lab `triangle-types` “The Triangle Table”: drag a triangle through a table of side and angle names, fill every cell you can and find out why two stay empty (395). (#344)
- New lab `light-years` “Light from Long Ago”: zoom from the Moon to Andromeda and time the light, see when it set off, find our place in the Milky Way (394). (#343)
- New lab `syncopation` “The Tripping Tune”: move notes off the beat and hear the music swing, compare a straight and a syncopated tune, play dotted rhythms (393). (#342)
- New lab `six-eight` “Six Notes, Two Ways”: group six notes in threes or twos, conduct the big beats, sort little tunes by how they sway (392). (#341)
- New lab `next-word` “Guess the Next Word”: watch a little robot write by guessing the next word, give it more text, see why it can sound sure and be wrong (391). (#340)
- New lab `snowshoes` “Press Lightly”: stand on snow in boots, skis or snowshoes, drag along the pressure–area curve, compare high heels with an elephant (390). (#339)
- New lab `ornament` “One Motif, Many Times”: stitch a border by sliding, flipping or turning one motif, turn a motif around a plate, find the rule behind folk borders (389). (#338)
- New lab `data-trail` “Crumbs Online”: follow Sam’s day and collect the crumbs, sort what is safe to share, switch the settings that hide them; `lab.css` wraps long fact source URLs (388). (#337)
- New lab `clock-24` “Twice Around the Clock”: turn a clock through a whole day past 12, read a 24-hour timetable, read Roman numerals on a clock face (387). (#336)
- New lab `making-change` “Count Up to the Change”: count up from the price to the money paid in coin jumps, make one amount in many ways, be the seller (386). (#335)
- New lab `abstract` “From Tree to Lines”: simplify a tree step by step into lines and colour, mix lines and colours into a feeling, make your own abstract picture (385). (#334)
- New lab `dino-hips` “Two Kinds of Hips”: swing the pubis to change a dinosaur’s group, sort six skeletons by their hips, find the branch where birds belong (384). (#333)
- New lab `magnitude` “The Earthquake Ladder”: shake a seismograph, stack the energy of each magnitude step, place real earthquakes on the ladder (383). (#332)
- New lab `egyptian-pose` “Draw Like an Egyptian”: turn each part of a figure to its clearest side, read a tomb painting for clues and drawing rules, draw on the 18-square grid (382). (#331)
- New lab `roman-legacy` “Rome Is Still Here”: find Greece and Rome in a modern street with a Roman lens, build words from Latin and Greek roots, meet the Romans in the calendar (381). (#330)
- New lab `glacier` “River of Ice”: pile snow on a glacier and warm its summers, follow a snowflake down into the ice, see the U-shaped valley a glacier leaves (380). (#329)
- New lab `migration` “Long Journeys”: follow an Arctic tern through two summers a year, three travellers and their reasons, plan a swallow’s year (379). (#328)
- New lab `south-pole` “Race to the Pole”: send Amundsen and Scott across the ice, lay food stores for the way there and back, test dogs, ponies and engines on snow (378). (#327)
- New lab `eye` “Inside the Eye”: send light from a tree into an eye and see the upside-down picture, dim the lights and watch the pupil, build a box camera with a hole and a lens (377). (#326)
- New lab `times-as-many` “Times or More?”: build a bear’s tower from copies of a kitten’s, lay ribbons end to end, tell “times as many” from “more” in little stories (376). (#325)
- New lab `pythagoras` “Three Squares”: pour square tanks on a triangle’s sides into each other, rearrange four triangles, fly a drone straight across a city (375). (#324)
- New lab `venice-trade` “The Pepper Road”: send pepper from India to Germany through Venice and count the hands, plan a galley’s harbours, race a second road round Africa (Venice series) (374). (#323)
- New lab `venice-facades` “Palaces on the Grand Canal”: sort Venice’s palaces by the shape of their arches, build a palace, sail through seven centuries on one canal (Venice series) (373). (#322)
- New lab `venice-piles` “A City on a Forest”: drive piles through Venice’s mud, flood St Mark’s Square with the Moon and the wind, float up a MOSE sea gate (Venice series) (372). (#321)
- New lab `doge-election` “Balls in the Urn”: elect a Doge of Venice in ten rounds of lots and votes, a thousand elections under two rules, the curve of a family’s chances (Venice series) (371). (#320)
- New lab `venice-colour` “Light Through Paint”: thin see-through layers of paint and a light beam, a Venetian colour seller’s shop, colouring glass on Murano (Venice series) (370). (#319)

## 2026-11-05

### Labs
- `sound-poems`: the speech therapist's kit is on the site: `scripts/sound-poems-kit.mjs` now builds it into `labs/sound-poems/kit/` (committed) instead of the ignored `dist/`, prints `poems.pdf` and `cards.pdf` with headless Chrome, packs the lab and both PDFs into `sound-poems-kit.zip`, and writes a download page (`labs/sound-poems/kit/`, in Russian). The same files go to a GitHub release. (#318)
- `sound-poems`: the speech therapist's kit gets the picture cards: the one-file lab includes `cards.js`, and `scripts/sound-poems-kit.mjs` also builds `cards.html`, all cards on a printable sheet to cut out (5 per row, by category). `glyph()` moves from the lab page into `cards.js`, so the kit can draw the small-word cards. (#317)
- `sound-poems`: the target sound is now in every line of every poem (the speech therapist's rule): 20 poems got new lines, approved by the author, and filler sounds (топ-топ, гуль-гуль-гуль, мур-мур, ой-ой-ой) went out on the way; «Пузик» is now «Зевака» (there is no word «пузик»). The checker makes a line without the target sound an error. (#316)
- `sound-poems`: fixes from the speech therapist's review. Prepositions are read on their own, as therapists say them to a child (no merging with the next word: «с жуком» keeps its С, «без» ends in [с]); «Рекс» has a hard Р, so the dog in «Зонтик» is now Рик; «В чемодане у Сонечки», «Сапоги — носами вбок». The checker now warns about lines without the target sound (20 poems left; Дуэт, Пижама and Птенец are rewritten and approved, the rest follow one by one). (#315)
- `sound-poems`: after the speech therapist's feedback: in the drawing step the child can pick picture cards instead of drawing (`labs/sound-poems/cards.js`: 241 cards in 14 categories — emoji up to Unicode 13, and glyphs for small words); the catalogue opens on the category whose card fits the word, the child picks the card; a cell keeps a drawing or `card:<id>`. Small words now use the speech therapists' usual schemes (the table our speech therapist sent, after O. S. Yatsel: a white cube and a red circle — в, на, под, над, за, из, от, к, у, перед, между, через, с, из-за, из-под, по). Printing the drawn sheet no longer piles the pictures up (fixed-width cells in a grid of narrower columns, and the sheet was confined to the stage column). New «📷 Сохранить картинкой»: the whole sheet as one PNG, shared or downloaded. (#314)
- `sound-poems`: `scripts/sound-poems-kit.mjs` builds a kit for the speech therapist into `dist/sound-poems-kit/`: the whole lab in one HTML file that opens offline from a disk, and every poem on one printable page. (#313)
- `sound-poems`: pair Л–Р, 3 poems (no Р’), each approved one by one; 57 poems in all. (#312)
- `sound-poems`: pair С–Ц, 3 poems under the speech therapist's rule for whistling sounds, each approved one by one; 54 poems in all. (#311)

## 2026-11-04

### Labs
- `sound-poems`: pair С–Ш, 3 poems under the whistling allowance for pairs, each approved one by one; 51 poems in all. (#310)
- `sound-poems`: eighth part, 3 poems on Ч (no Щ, Л or Р), each approved one by one; 48 poems in all. (#309)
- `sound-poems`: seventh part, 3 poems on Ц under the speech therapist's rule for whistling sounds, each approved one by one; 45 poems in all. (#308)

## 2026-11-03

### Labs
- `sound-poems`: each poem gets its own picture on its card (a 5th header field), so cards in one deal no longer repeat the same hero emoji. (#307)
- `sound-poems`: third З–Ж poem; the speech therapist's allowance for whistling sounds now also covers pairs with a whistling sound (З–Ж, С–Ш, С–Ц): up to 3 words per quatrain with Л or Р outside the target words, never Ч or Щ; 42 poems in all. (#306)
- `sound-poems`: first pair poems, З–Ж (2 poems, approved one by one; a third will follow); 41 poems in all. (#305)
- `sound-poems`: sixth part, 3 poems on Ж, each approved one by one; 39 poems in all. (#304)
- The "Why" button moves from under the picture to the right end of the tabs row (pinned on phones), freeing a row on small screens; single-view labs keep it under the picture. (#303)
- `sound-poems`: fifth part, 3 poems on С’ and 3 on З’ under the speech therapist's rule for whistling sounds, each approved one by one, all strict; 36 poems in all. (#302)
- `sound-poems`: the poem list becomes face-down hero cards — the child opens a card to meet the poem's hero (up to 3 cards per deal, a surprise card, reshuffle); the hero filter chips are gone. (#301)
- `sound-poems`: fourth part, 3 poems on З, each approved one by one, all strict; 30 poems in all. (#300)
- Phones: the top bar shrinks to one row of tabs while scrolling, the picture is capped so it fits on screen together with the first control, and a swipe on the picture scrolls the page (labs that drag on the picture keep it). (#299)
- `sound-poems`: third part, 3 poems on С, each approved one by one, all strict; 27 poems in all. New rule for whistling sounds (С’ З’ С З Ц) from the speech therapist: no hushing sounds at all, and a few later sounds such as Л and Р (at most 3 words per quatrain) only in words without the target sound; the checker and the adult view follow it. (#298)

## 2026-11-02

### Labs
- `sound-poems`: second part, 3 poems on Л’ and 3 on Р’, each approved one by one, all strict; 24 poems in all. (#280)
- New lab `unification` “Many States, One Nation”: toll gates from Hamburg to Munich, 39 German states become one empire, Garibaldi’s Thousand (369). (#297)
- New lab `ottoman` “The Empire on Three Continents”: 400 years of the Ottoman Empire on a map, Hungary in three parts after 1541, many peoples in one empire (368). (#296)
- New lab `moscow` “Gathering the Lands”: Moscow gathers its neighbours from 1300 to 1533, tribute to the Horde from Kulikovo to the Ugra, why Moscow (367). (#295)
- New lab `what-a-state` “Build a State”: four jigsaw pieces of a state, six real places judged from Vatican City to Antarctica, monarchy or republic, unitary or federal (366). (#294)
- New lab `taxes` “The Town Purse”: a street light paid by chipping in vs a small tax, a town budget with deficit and debt, flat vs progressive tax for three families (365). (#293)
- New lab `ice-core` “The Ice Archive”: drill into Antarctic ice and count yearly layers, crush a sample to measure ancient air, count down to Tambora’s ash (364). (#285)
- New lab `lines-test` “Which Line Is Longer?”: Asch’s line test in a classroom, what one honest friend changes, five ways to say no (363). (#286)
- New lab `metro` “Stations and Lines”: a city map turns into a graph, fewest stops vs fewest minutes, an adjacency table and a search tree (362). (#292)
- New lab `spreadsheet` “The Living Table”: a camping budget that recalculates in a wave, copying formulas with relative and absolute references, the right chart for the question (361). (#291)
- New lab `steepness` “The Steepness Number”: a ramp whose ratio stays fixed, sin and cos on a ladder, the sun’s angle from a tree’s shadow (360). (#290)
- New lab `lahar` “Living Under a Volcano”: evacuate towns before ash and mudflows, “once in 100 years” odds, an observatory’s warning signs and the Armero case (359). (#289)
- New lab `silver-prices` “More Coins, Same Bread”: coins vs bread in a market town, American silver and the price revolution, how a few per cent a year adds up (358). (#288)
- New lab `black-death` “The Year the Ships Came”: the plague of 1347 along the trade routes month by month, fewer hands and higher wages in a village, a chain of 14th-century crises (357). (#287)
- New lab `pin-factory` “The Toy Car Workshop”: all-rounders vs a line in a model workshop, find the bottleneck, core and supporting processes (356). (#284)
- New lab `two-islands` “Two Islands”: split working days between fish and coconuts and trade by boat, comparative advantage, a toy from Japan in your own money (355). (#283)
- New lab `like-terms` “Sort the Tiles”: sort algebra tiles into trays, test simplifications for every x, zero pairs of plus and minus tiles (354). (#282)
- New lab `chocolate-chain` “The Journey of a Chocolate Bar”: follow a cocoa bean from Ghana to a shop and break a link, cut a bar into everyone’s share of its price, a Fairtrade price floor (353). (#281)
- New lab `new-stuff` “New Stuff or Same Stuff?”: six kitchen changes under a particle magnifier, three experiments on a scale, and signs of change that are not proofs (352). (#279)
- New lab `variations` “Same Tune, New Clothes”: five disguises of one tune on a piano roll with gold skeleton notes, five dials, and how far you can go before it becomes a new tune (351). (#278)
- New lab `heads-tall` “How Many Heads Tall?”: a wooden mannequin grows beside a stack of its own heads, where the eyes really are, poses with limbs that keep their length (350). (#277)
- `sound-poems` (349): poems for speech therapy, in Russian only, for ages 4–7, asked for by a speech therapist (a second try after #264, rolled back for weak poems). The adult picks the sound being automated (С’ З’ С З Ш Ж Ц Ч Л’ Л Р Р’); no poem has a sound later in that order, and every poem also keeps the strict rule (whistling and hushing sounds apart, Л and Р apart). The target sound is highlighted where it is heard, not where it is written. The child draws the poem word by word (mnemonic table), then "I show" and "Tell it yourself" modes; the adult view breaks the poem down by sound position and checks any text or word. The list goes by sound and season, with heroes as an optional filter. First part: 18 poems, each read and approved one by one (Р 12, Ш 3, Л 3); the other sounds follow in later pull requests. `labs/sound-poems/phonetics.js` reads consonants by pronunciation; `scripts/sound-poems-check.mjs` checks every poem and runs in CI. New subject "Speech"; the overview shows Russian-only labs in a collapsed section in other languages. (#276)
- New lab `forest-garden` “Let the Field Rest”: run thirty years of a rainforest village’s farming, one field from garden back to forest, what four forest plants were used for (348). (#275)
- New lab `fact-opinion` “The Checking Machine”: a machine with a ruler, a thermometer and a map stamps facts true or false and jams on opinions, an advert to pull apart, a class poll (347). (#274)
- New lab `ways-to-pay` “Where Did the Money Go?”: cash, card and phone move coins between two glass jars, a month of pocket money one tap at a time, keep your PIN safe (346). (#273)
- New lab `look-ahead` “The Last Match”: a matches game against a robot that searches the game tree, colour a tree from the bottom up, watch game trees explode (345). (#272)
- New lab `twenty-questions` “Twenty Questions”: find a robot’s number with yes/no questions and count bits, grow a decision tree for eight animals, switches, bytes and file sizes (344). (#271)
- New lab `symbiosis` “Who Gains?”: separate six odd couples and watch two health meters, sort nine pairs into four baskets, look inside a lichen (343). (#270)
- New lab `passwords` “Guess My Password”: a robot tries every code on a brass lock, passwords from letters and three random words, who may know your password (342). (#269)
- New lab `boxes` “Three Boxes”: equal vs fair with three friends behind a fence, five everyday cases, staggered starts on a running track (341). (#268)
- New lab `part-of` “Part of a Pile”: deal sweets into bags to find 3/4 of 24, work backwards from a part, cut an hour, a metre and a class on a strip (340). (#267)
- New lab `peter-wolf` “A Voice for Every Hero”: six heroes on an evening meadow, each with its own instrument and tune; guess who plays, swap voices, give a voice to a new hero (original tunes; Prokofiev’s instrument assignments) (339). (#266)
- "Where next" under every lab: up to three easier labs to look at first ("Too hard?", labs on the prerequisites of the lab's topics) and up to three to go on to ("Too easy?", labs on the topics that build on it). `scripts/labs-catalog.mjs` derives them from the prerequisite graph as `before` / `after` in `labs/catalog.json`, keeping out labs reached both ways and preferring younger labs before and older ones after; new file `labs/next.js`, precached by the service worker (`sg-v4`). 288 of 331 labs get labs before, 255 get labs after. The new-lab skill makes it a rule for future labs. (#261)
- 7 labs after Tamás Varga's Hungarian maths method (338): `logic-blocks` (the 48-piece logic set, one difference at a time), `every-some` (true and false statements, and / or / not, two hoops), `all-ways` (listing every tower and outfit, tree diagrams), `rods` (Cuisenaire rods and missing numbers), `packs` (packing in threes, other bases, binary lamps), `pairs` (odd and even), `dice-race` (sums of two dice, certain / possible / impossible). They cover 21 topics that had no lab. (#262)

### Curricula
- France extended to collège (6e–3e, grades 6–9): sixième from the cycle 3 programmes already used (français and mathématiques 2025, histoire-géographie and sciences et technologie 2026), cycle 4 français and mathématiques (2026), technologie (2024) and histoire-géographie, physique-chimie and SVT (2020, still in force). 248 new items with 961 topic links (509 French items). Cycle 4 sciences and technology are set for the whole cycle and carry grade `7-9`. `parse_fr.py` takes several raw files and keeps the primary items first, so their mapped keys do not move. (#263)
- Finland: core curriculum for basic education POPS 2014 (Perusopetuksen opetussuunnitelman perusteet), from the ePerusteet API: content areas of 12 subjects for grade bands 1–2, 3–6 and 7–9, 97 items with 659 topic links; grade filter `fi-1`…`fi-9` shows the content of the grade's band. (#259)
- AI4K12 "Five Big Ideas in AI" as a curriculum layer, code `ai`: 122 items for grade bands K–2, 3–5 and 6–8, each keeping its AI4K12 concept code; objectives are paraphrased, not quoted (the AI4K12 charts are CC BY-NC-SA). Selectable in the viewer's school filter and shown as its own card on the curricula page, not counted as a country. (#258)

### Topics
- 8 extra topics `ai_01`–`ai_08` in `data/extra/` (machine perception, game trees, decision trees, training and test data, reinforcement learning, neural networks, language processing, working with an AI helper), with RU/HU translations and prerequisites (503 extra topics). (#258)

## 2026-11-01

### Labs
- 46 labs (331): 16 in one batch (#227), then one PR per lab (#228–#257), among them the periodic table, logic gates, latitude and longitude, linear perspective, Magna Carta, the Treaty of Verdun, the outbreak of World War I and the Cuban missile crisis.
- Labs overview: "Newest first" order (`?sort=new`, grouped by day) and a "New" badge. Every registry entry now needs `"added": "YYYY-MM-DD"`; `scripts/labs-catalog.mjs` fails without it. (#227)

## 2026-10-31

### Viewer
- App page (`?view=app`), linked from the home view and the sidebar: install steps for iPhone/iPad, Android and computers, the install button when the browser offers one, and a privacy panel (progress, the child's name and quick-check results stay in the browser; visits are counted with Google Analytics, which never sees the progress hash). (#225)
- Fix a green line across the top bar when the topic card is pulled up on phones. (#226)

### Labs
- 30 labs in three batches (285). (#218, #219, #220)
- Sound plays on iPhone and iPad in silent mode, in every lab (#221) and in the Robot Lab (#222).
- Beat and Rhythm: syncopation, more rhythms, a softer sound (#223) and a choice of instrument (#224).

## 2026-10-30

### Labs
- 14 labs (255), among them five "find the rule" labs where the child guesses a hidden rule from examples. (#215, #217)
- Lab quiz: wrong answers are crossed out and a hint ladder leads to the answer; the map records whether a topic went "easily" or "with hints" and asks for a second look after a week. The new-lab skill requires a hint per quiz question. (#216)

## 2026-10-29

### Labs
- 25 labs in five batches of five (241). (#210–#214)

## 2026-10-28

### Viewer
- Routes: plain wording ("How to get here · N steps", "Goals") (#203, #205); the path screen shows the route as a trail, then as a night sky of stars, with a list of steps (#204, #207).
- Check by subject: the check starts from the grade level and finds where knowledge ends in each section; topics the child probably knows are hatched. (#206)
- Ready-made routes grow to 61 (#208) and then 107 goals, now also for ages 5–6 and 12+ (#209). Only goal IDs are stored in `data/extra/routes.json`.

## 2026-10-27

### Data
- Sync with upstream Marble: Australian Curriculum v9 Foundation–Year 6 and Ontario mathematics mappings; 1,845 Marble topics, 3,941 dependencies. 2,589 new or changed strings per language translated to RU and HU (256 new topics, 85 changed topics, 809 prerequisite reasons, 13 labels). (#192) Upstream details are below.

### Curricula
- France: primary-school programmes CP–CM2 (grades 1–5) from the Bulletin officiel (etalab-2.0): French, mathematics, history-geography, science and technology; one item per school year and section. (#193)

### Labs
- 21 labs (216): Ballet Studio (#190, a piano plays a waltz or polka under the steps #191) and four batches of five (#198–#201).
- Redrawn graphics: Plates on the Move (#188), Volcano and Four Hunters (#189).
- Lab layout: the state card's title under the picture (#194), the explanation card under the headline on desktop (#195), a compact scene deck in Story Mountain (#196), the switch label in the Circuit Lab (#197); Notes on a Ladder plays on the first tap (#187); Read It Right gets a half-centimetre stepper (#202).

## 2026-10-26

### Labs
- 30 labs in two PRs (195). (#185, #186)

### Project
- Positioning as a map of knowledge and the paths through it: new titles, descriptions and social metadata on all pages; README names Marble as the foundation (#183); site description names children aged 4–16 (#184).

## 2026-10-25

### Labs
- 10 labs (165) and "Did you know?" facts (`lab.setFacts` in `labs/lab.js`), checked and sourced; labs gain depth with the age of the topic (rules in `.claude/skills/new-lab/`). (#181)
- Two Poles: real Natural Earth outlines on both polar maps and the globe (#180), without road-like lines on the ice (#182).

### Viewer
- Route: clickable section bars instead of the Sankey; on phones the topic card drags by its whole header and snaps to peek, half or full. (#179)

## 2026-10-24

### Viewer
- Home view (`?view=home`) with three doors: where the child is now, how to reach a topic, labs; the same doors on the map. The tour no longer opens by itself. (#178)
- Route to a topic from the topic card: known topics folded away, age stages merged, optional topics behind a toggle, stations with a lab marked; `?route=1`. (#173, #174)
- "My child" view: pick a country and grade, a quick check of 8 questions, a radar and bars by the school's own subjects, saved snapshots. (#175)
- "Routes" view with 18 ready-made goals. (#176)
- Marble's English subject is labelled "Reading & writing". (#177)

## 2026-10-22

### Viewer
- Own 2D-canvas graph (`graph2d.js`) from precomputed positions (`scripts/layout.mjs` → `data/layout.json`) instead of 3d-force-graph: no WebGL, no CDN, works offline. (#108)
- Topic card as a working tool: sticky head, quick check, lab, path with a progress bar, tabs (Links / About / At school / Full path); a bottom sheet on phones. (#106)
- Curricula page `curricula/`: every curriculum with issuer, grades, item and topic counts computed from the data, PISA/TIMSS context with sources. (#107)
- UI clean-up: "Curricula" naming, units on counts, removable filter pills, labs navigation (#105); collapsible subject legend on phones (#109); tapping a subject in the legend picks it (#116); the list view scrolls the page (#42); subject filters for Geography, History, Music and Reading in the labs overview (#44).
- Home-screen app manifest fixes. (#36, #40, #41)

### Data
- Marble's teaching research (`data/teaching-research.json`, 1,049 records) and its schema; 1,048 records match topics in this fork. (#35)
- Hungarian grammar topics (495 extra topics) and HU links to Language & Literature. (#110)

### Labs
- 114 labs (155), mostly one PR per lab (#37–#104, #112–#170, #172); visual redesigns of Food's Journey, Bones and Muscles, The Heart's Loop and Teeth Tell.
- Labs for speakers of one language (`lang` in the registry), with four Hungarian labs: short and long sounds, the ABC, runes, stems and suffixes. (#111–#115)

### Project
- Open to contributors: README, CONTRIBUTING, issue and PR templates, CI. (#75)
- The new-lab procedure as a project skill (`.claude/skills/new-lab/`) and `AGENTS.md`. (#43, #146)
- Google Analytics tag on every HTML page. (#171)

## 2026-10-21

### Curricula
- Singapore primary Mathematics and Science (#28), Sweden Lgr22 years 1–9 (#29), Japan Course of Study grades 1–9 (#30), Estonia basic school grades 1–9 (#32).

### Topics
- Visual Arts and Music branch from six school programmes (490 extra topics). (#31)

### Viewer
- Phones open the list first; "Next step" shows five ranked topics per subject. (#20)
- "Stuck on this?": walks back the prerequisite chain with quick questions to find the gap. (#21)
- Save and load progress as a JSON file, or share it as a link with the marks in the hash. (#22)
- Logo mark and favicon. (#25)
- Home-screen app (PWA): manifest, icons, service worker, offline labs, install hint. (#34)

### Labs
- 16 labs (41), among them a secret two-bulb mode in the Circuit Lab (#24) and Fraction Moves for 6th-grade fraction operations (#33). (#23, #27)
- `scripts/labs-candidates.mjs`: a ranked list of topics for new labs; project `CLAUDE.md`. (#26)

## 2026-10-20

### Curricula
- Germany (Bavaria, LehrplanPLUS: Grundschule 1–4, Gymnasium 5–9), USA and England from Marble's standards, a per-source filter, and an alphabetical curriculum list. (#9, #10)

### Topics
- 412 extra topics in `data/extra/` for curriculum content the Marble graph does not cover (geography, history, civics, computing, literature and more). (#9)

### Viewer
- Guided tour on the first visit and a `?` button. (#12)
- Labs navigation for hundreds of labs: an in-lab menu with search, nearby labs in the graph and the same subject; a filterable gallery; a "topics with a lab" filter. (#13)
- Layout fixes for the filters drawer, headline and legend. (#14, #15)
- Cold start by school grade: one button marks the lower grades as known; the quick-check question leads the topic card. (#17)
- A finished lab quiz marks its topics as "learning"; prerequisite reasons are printed in the topic card. (#18)
- List fallback when the graph cannot start; age stages of a topic in one row. (#19)

### Labs
- 22 labs (25), including the Robot Lab (#8) and two batches of ten and eleven. (#11, #16)

## 2026-10-19

### Viewer
- Redesign after withmarble.com/curriculum. (#5)

### Curricula
- School curricula of Hungary (NAT 2020 kerettanterv 1–8), Russia (federal work programmes 1–9) and Serbia (grades 1–8) linked to topics; viewer filter `?school=<country>-<grade>`. (#6)

### Labs
- First labs: magnets, seasons, fractions, in EN, RU and HU. (#7)

## 2026-10-18

### Added
- Russian and Hungarian translations of the Marble text and the i18n pipeline (`scripts/i18n-*.mjs`, `data/i18n/`). (#1)
- Viewer on GitHub Pages: an interactive graph (#2), then a list view with age, grade and subject filters and progress marks kept in the browser (#3).

---

# Upstream: Marble Skill Taxonomy dataset

Dataset releases are versioned independently of the taxonomy `version` field (the underlying taxonomy is `v1`).
The entries below come from upstream and were synced into this fork on 2026-10-27 (#192) and 2026-11-10 (#435).

## [Unreleased]

- Publish 3,733 scoped alignment contexts: 571 global, 50 framework and 3,112 jurisdiction contexts, retaining exact age bands and all 7,048 existing known topic–standard pairs. Add 14 reviewed primary associations on six existing English topics (7,062 total), with no new topics, claim changes or prerequisite changes. Record explicit dispositions for 41 unresolved legacy occurrences and preserve 95 jurisdiction age-only contexts. Add public local artifact generation and CI; research content and original export timestamps remain unchanged. See the [baseline decisions and limits](reports/scoped-alignment-baseline-2026-11-04.md). No live DB or authority cutover is implied.

- Map Ontario Grade 6 Language with 313 links across 168 topics: reuse 165 existing topics, add three focused whole claims, correct suffix evidence and add one hard plus seven soft prerequisites. Preserve old topic IDs, links and dependencies; retain 55 Full / 4 Partial specific expectations and explicit resource/performance conditions. Refresh the verified staging export (1,861 topics / 4,003 dependencies / 7,048 published links), preserve research records and publish the [code-by-code review](reports/ontario-grade6-language-2026-11-02.md).

- Map Ontario Grade 5 Language with 306 links on 161 existing topics and no additions. Preserve complete mastery claims; soften four unnecessary prerequisites and add the genuine sentence-combining core. Record 55 Full / 4 Partial specific expectations, preserve resource/performance conditions, and publish the [code-by-code review](reports/ontario-grade5-language-2026-11-02.md).

- Map Ontario Grade 7 Mathematics after auditing 52 specific and 12 overall expectations: 252 pairs on 171 existing topics and two spatial additions (solid symmetry and perspective drawing). Reuse existing square roots, repair two prerequisite gates and preserve old content, pairs, learner state and research. Refresh the verified staging export (1,852 topics / 3,979 edges); publish the [code-by-code report](reports/ontario-grade7-mathematics-2026-10-27.md).

- Map Ontario Grade 6 Mathematics after auditing 51 specific and 12 overall expectations: 244 pairs on 173 existing topics and five additions (two procedures, one focused extraction, two financial-content claims). Preserve all old topic bodies, pairs, learner records and research; repair three prerequisite gates. Refresh the verified staging export (1,850 topics / 3,967 edges); publish the [code-by-code report](reports/ontario-grade6-mathematics-2026-10-27.md).

- Map Ontario Grade 5 Mathematics after auditing 51 specific and 12 overall expectations: 190 pairs on 145 existing topics and three additions (stacked bars, tax categories/collectors, focused orthographic views). Preserve every old mastery body, curriculum pair, learner record and research record; repair unnecessary prerequisites. Refresh the verified staging export (1,845 topics / 3,941 edges); publish the [code-by-code report](reports/ontario-grade5-mathematics-2026-10-24.md).

- Map Ontario Grade 4 Mathematics after auditing 48 specific and 12 overall expectations: 186 pairs on 126 existing topics and four new claims (two gaps, two focused extractions). Repair unnecessary prerequisites and add eight source-backed foundation components. Preserve old topic bodies, all old pairs, learner records and research. Refresh the verified staging export (1,842 topics / 3,919 edges); publish the [code-by-code report](reports/ontario-grade4-mathematics-2026-10-24.md).

- Map Ontario Grade 3 Mathematics onto 114 existing topics with 155 topic-code pairs after auditing 46 specific and 12 overall expectations. Add no topics; extend the existing congruence concept to 3D matching, repair unnecessary prerequisite gates and add two source-backed foundation alignments. Preserve all old pairs, learner records and research. Refresh the verified staging export (1,838 topics / 3,887 edges); publish the [code-by-code report](reports/ontario-grade3-mathematics-2026-10-23.md).

- Map Ontario Grade 2 Mathematics after a reuse-first audit of 39 specific and 12 overall expectations. Add four focused elementary claims extracted from broader topics and one concurrent-code skill; clarify three existing evidence items and repair unnecessary prerequisite gates. Preserve all existing curriculum pairs, learner records and research. Refresh the verified staging export (1,838 topics / 3,878 edges); publish the [code-by-code report](reports/ontario-grade2-mathematics-2026-10-23.md).

- Complete the Australian retrospective cleanup: retire 106 of 314 additions, retain 208 with focused claims, and add seven missing focused skills/procedures (net 99 fewer topics than the audited 1,932-topic staging baseline). Redistribute clauses before retiring IDs; publish flattened destinations, all 314 + 14 decisions and nine source-issue closures. Correct weak associations and replace blanket Full claims with current mappings and explicit review limits. Preserve observed learner data and history; reconcile only the 52 explicitly approved inherited estimates. Refresh the verified staging projection (1,833 topics / 3,846 edges), derived centrality, research binding and checksums.
- Include the previously ingested Ontario elementary catalogue: nine official documents / 3,862 expectations, bringing the catalogue to 17 sources / 7,743 expectations. Ontario exports codes and official links only. Grade 1 Mathematics authoring remains a focused pass; catalogue availability is not a whole-curriculum coverage claim.

Earlier entries below are historical authoring snapshots. Their Australian Full labels are superseded by the current mapping reports and the explicit review limits above.


- Correct three existing nutrition teaching-research records to distinguish food groups from nutrients across teaching text, activities, representations and assessment; align balanced-plate activities with healthy-eating guides and keep citation links consistent. Update canonical source records and the public projection together, retaining identities and coverage counts.

- Complete Australian Foundation–Year 6 Design and Technologies coverage: all 29 standards Full, with 111 alignments across 78 topics. Add 30 topics and 89 prerequisites within existing Science, Life Skills and Geography subjects, including shared Design & Technology and Food & Cooking domains. Correct food-group versus nutrient terminology in three existing nutrition topics, and qualify two overstated claims. All 593 content descriptions in the agreed seven-area scope are now Full; publish a verified scope summary. PE, Arts, Languages, elaborations and achievement standards remain excluded. Preserve existing IDs, curriculum links, prerequisites and teaching-research records; refresh centrality, coverage and checksums.

- Complete Australian Foundation–Year 6 Digital Technologies coverage: all 38 standards Full, with 93 alignments across 74 topics. Add 38 Computing topics and 98 prerequisites; introduce six shared domains and move three existing general Computing topics out of Artificial Intelligence without changing their IDs or content. Reuse Mathematics algorithms, English digital creation and research, and existing design, privacy and citizenship topics. Preserve existing curriculum links, prerequisites and teaching-research records; refresh centrality, coverage and checksums.

- Complete the selected Australian Foundation–Year 6 Health strand: all 32 Personal, social and community health standards Full, with 117 alignments across 79 topics. Add 25 topics and 62 prerequisites within existing subjects, reuse two HASS-authored topics, and extend an existing discrimination topic with an implemented inclusion action. Review body-safety and online-reporting wording. Preserve all existing IDs, curriculum links, prerequisite edges and teaching-research records; refresh centrality, coverage and dataset checksums. PE remains excluded.

- Complete Australian Foundation–Year 6 HASS coverage: all 89 standards Full, with 210 alignments across 124 topics. Add 54 topics across shared subjects, introduce Geography with reusable domains, extend two existing Historical Thinking topics instead of duplicating them, and move three map topics from Mathematics to Geography while preserving their curriculum links. Separate bundled timeline/map and day/symbol/festival requirements. Publish the cross-country authoring policy and decision review. Preserve existing topic IDs, curriculum links, prerequisite edges and teaching-research records; refresh centrality, research coverage and dataset checksums.

- Fill the Australian Foundation–Year 6 Science gaps with 24 new topics and 63 prerequisite links, including safe investigations, comparisons of predictions and findings, observations and models, properties of materials, heat, changing landforms, habitat conditions, planetary patterns and seasons. The reviewed Science report now marks all 77 standards Full, with 245 alignments across 131 topics. Add a digital-observation link from the existing Mathematics data topic; preserve existing topic content, curriculum links and prerequisite edges. Refresh derived centrality, research coverage and dataset checksums; teaching-research records are unchanged.

- Fill the Australian Foundation–Year 6 English gaps with 82 new topics and 193 prerequisite links, including Australian and First Nations literature, phoneme manipulation, digital navigation, multimodal creation, comprehension, handwriting and presentations. The reviewed English report now marks all 189 standards Full, with 630 links across 267 topics. Shared learning brings Science to 46 Full / 30 Partial / 1 Missing and Digital Technologies to 6 / 20 / 12. Preserve existing topic content, curriculum links and prerequisite edges; refresh derived centrality, research coverage and dataset checksums. Teaching-research records are unchanged.

- Add explicit eighths-of-events learning to the Year 2 fractions-of-time topic, with a 16-minute activity split into eight equal 2-minute parts and a prerequisite on eighths. Clarify the $7 virtual-payment task as a $5 note plus a $2 coin. Mathematics coverage remains 139 Full; refresh graph centrality and dataset checksums.

- Fill the documented Australian Foundation–Year 6 Mathematics gaps with 61 new topics and 149 prerequisite links, including virtual manipulatives, Australian currency, algorithms, digital tools, geometry and statistical investigations. The reviewed Mathematics report now marks all 139 standards Full, with 442 links across 325 topics. Shared learning also closes three Digital Technologies and two Science standards and adds HASS map coverage. Replace five pounds-based Australian maths links with Australian-currency coverage; preserve all non-Australian links and existing topic content. Refresh derived centrality, research coverage for the new topics and dataset checksums; teaching-research records are unchanged.

- Align Australian Foundation–Year 6 Design and Technologies with 79 links across 48 existing topics. Publish a code-by-code audit of all 29 standards: 3 fully covered, 26 partly covered and 0 missing. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 Digital Technologies with 47 links across 30 existing topics. Publish a code-by-code audit of all 38 standards: 2 fully covered, 23 partly covered and 13 missing. Preserve existing curriculum links and topic content; correct two prerequisite directions around Foundation pictograms, refresh derived centrality and approximate age spans, and update the teaching-research topic-file binding.

- Align selected Australian Foundation–Year 6 Health content with 84 links across 52 existing topics. Review all 32 Personal, social and community health standards: 11 fully covered, 19 partly covered and 2 missing. Exclude the 27 PE standards. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 HASS with 144 links across 66 existing topics. Publish a code-by-code audit of all 89 standards: 39 fully covered, 23 partly covered and 27 missing. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 Science with 208 links across 103 existing topics. Publish a code-by-code audit of all 77 standards: 43 fully covered, 33 partly covered and 1 missing. Preserve existing curriculum links, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 English with 540 links across 185 existing topics. Publish a code-by-code audit of all 189 standards: 110 fully covered, 76 partly covered and 3 missing, with explicit gaps for partial matches. Preserve existing curricula, topic content and prerequisite edges; refresh approximate age spans and the teaching-research topic-file binding.

- Align Australian Foundation–Year 6 Mathematics with 370 links across 266 existing topics, preserving existing curricula and prerequisite edges. Publish a code-by-code audit: 95 standards fully covered, 37 partly covered and 7 missing. Refresh approximate topic age spans and the teaching-research topic-file binding.

- Add 620 Australian Curriculum v9 Foundation–Year 6 content descriptions (`acara-v9`) from Marble's canonical standards catalogue, bringing the total to 8 curricula and 3,881 standards. Correct five Foundation Science inquiry strand assignments and restore six standards missed by the contributor's parser. Retain the existing graph and topic alignments; candidate Australian mappings are not included.
- Correct five later-age prerequisites and two adjacent dependency relationships, replacing later reinforcement with earlier foundational skills.
- Adjust the approximate starting age for Drawing Force Diagrams from 7 to 8 and regenerate graph centrality; retain teaching-research content while refreshing its topic-file checksum binding.
- Remove seven stale Science cluster summaries whose domains contain no topics, leaving 176 clusters.
- Validate that every cluster subject/domain pair exists among topics, with regression coverage for orphaned domains and subject mismatches.
- Add 1,051 teaching-research records for Science (547) and Mathematics (504), joined by stable topic ID, with explicit coverage for the other 540 topics.
- Align research after the chart split: pie-only teaching/assessment, restored earlier line-graph scope, a new construction-and-interpretation record, and corrected downstream assessment recovery routes.
- Publish portable learning guidance with activities, learner actions, feedback and evidence links; retain original pedagogy, assessment and historical source-verification metadata.
- Add teaching-research JSON Schema, cross-file/evidence-link validation, regression checks and a topic-file checksum binding.
- Mark curriculum-text publication omissions inline and by field path; exclude private database IDs, learner data and migration audit artifacts.
- Separate pie-chart and line-graph coverage: retain `mt_bESTSBB0wK` for pie charts and add `mt_HlNSurPVDp` for line graphs.
- Correct the earlier line-graph problem-solving topic's title and description; revise prerequisites and downstream links for the split.
- Restore 330 previously authored curriculum links by normalizing legacy alignment identifiers, including the UK Year 6 chart standard on both chart topics.
- Use discrete/continuous-data presentation as the prerequisite for later grouped-data charts; clarify their pie-chart prerequisite reason.
- Regenerate the canonical export and centrality scores: 1,591 topics and 3,225 dependencies.

## [1.0.0] — 2026-07-08

Initial public release.

### Included
- **1,590 micro-topics** across 8 subjects (`data/topics.json`).
- **3,221 prerequisite dependencies** with `hard`/`soft` strength + reasons (`data/dependencies.json`).
- **7 curricula / 3,261 standards** with 1,859 topic↔standard links (`data/curriculum-standards.json`).
- **183 domain clusters** (`data/clusters.json`).
- JSON Schemas + a dependency-free validator.

### Curriculum text shipped
- **Full text:** UK National Curriculum (OGL v3.0), Common Core ELA + Math (CCSS Public License).
- **Codes only** (verbatim text omitted pending rights clearance): NGSS K-5 + Middle School, C3 Framework, IB PYP PSPE. See [PROVENANCE.md](PROVENANCE.md).

### Excluded
- Semantic embeddings (derived / recomputable).
- All per-child and user data (never published).
