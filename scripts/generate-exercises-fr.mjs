import { writeFileSync } from 'fs'

const topics = [
  { id: 'definite-articles', name: 'Определённые артикли', level: 'A1' },
  { id: 'indefinite-articles', name: 'Неопределённые артикли', level: 'A1' },
  { id: 'etre-avoir-present', name: 'Être/avoir в настоящем времени', level: 'A1' },
  { id: 'verbs-er', name: 'Глаголы на -er', level: 'A1' },
  { id: 'negation', name: 'Отрицание', level: 'A1' },
  { id: 'personal-pronouns', name: 'Личные местоимения', level: 'A1' },
  { id: 'adjective-agreement', name: 'Согласование прилагательных', level: 'A1' },
  { id: 'passe-compose-avoir', name: 'Passé composé с avoir', level: 'A2' },
  { id: 'passe-compose-etre', name: 'Passé composé с être', level: 'A2' },
  { id: 'imparfait', name: 'Imparfait', level: 'A2' },
  { id: 'pronouns-cod', name: 'Местоимения COD', level: 'A2' },
  { id: 'pronouns-coi', name: 'Местоимения COI', level: 'A2' },
  { id: 'reflexive-verbs', name: 'Возвратные глаголы', level: 'A2' },
  { id: 'futur-simple', name: 'Futur simple', level: 'A2' },
  { id: 'subjonctif-present', name: 'Subjonctif présent', level: 'B1' },
  { id: 'conditionnel-present', name: 'Conditionnel présent', level: 'B1' },
  { id: 'relative-pronouns', name: 'Относительные местоимения', level: 'B1' },
  { id: 'plus-que-parfait', name: 'Plus-que-parfait', level: 'B1' },
  { id: 'passive-voice', name: 'Страдательный залог', level: 'B1' },
  { id: 'gerondif', name: 'Герундий', level: 'B1' },
  { id: 'si-conditionals', name: 'Условные с si', level: 'B2' },
  { id: 'indirect-speech', name: 'Косвенная речь', level: 'B2' },
  { id: 'subjonctif-passe', name: 'Subjonctif passé', level: 'B2' },
  { id: 'conditionnel-passe', name: 'Conditionnel passé', level: 'B2' },
  { id: 'futur-anterieur', name: 'Futur antérieur', level: 'B2' },
  { id: 'passe-simple', name: 'Passé simple', level: 'C1' },
  { id: 'subjonctif-imparfait', name: 'Subjonctif imparfait', level: 'C1' },
  { id: 'ne-expletif', name: 'Ne explétif', level: 'C1' },
  { id: 'literary-tenses', name: 'Литературные времена', level: 'C2' },
  { id: 'stylistic-inversion', name: 'Стилистическая инверсия', level: 'C2' },
]

// Exercise data per topic: [mc[], fb[], tr[], ma[]]
// mc: [question, options[], correctAnswer, explanation]
// fb: [question, correctAnswer, explanation]
// tr: [question, correctAnswer, acceptableAnswers[], explanation]
// ma: [instruction, pairs[[l,r]], explanation]

const data = {
'definite-articles': {
mc: [
  ["Je vais à ___ école.", ["le","la","l'","les"], "l'", "Перед гласной используется l'"],
  ["___ garçon joue dans le jardin.", ["Le","La","L'","Les"], "Le", "Le — артикль мужского рода единственного числа"],
  ["Elle aime ___ fleurs.", ["le","la","l'","les"], "les", "Les — артикль множественного числа"],
  ["Nous regardons ___ télévision.", ["le","la","l'","les"], "la", "La — артикль женского рода единственного числа"],
  ["___ enfants jouent dehors.", ["Le","La","L'","Les"], "Les", "Les используется перед существительными множественного числа"],
],
fb: [
  ["___ chat est noir.", "Le", "Le — определённый артикль мужского рода"],
  ["___ maison est grande.", "La", "La — определённый артикль женского рода"],
  ["J'aime ___ musique.", "la", "La используется перед женским родом"],
  ["___ ami de Pierre est sympa.", "L'", "L' используется перед гласной"],
  ["___ livres sont sur la table.", "Les", "Les — определённый артикль множественного числа"],
],
tr: [
  ["Кошка чёрная.", "Le chat est noir.", ["La chatte est noire."], "Le/La зависит от рода существительного"],
  ["Дети играют в саду.", "Les enfants jouent dans le jardin.", [], "Les — артикль множественного числа"],
  ["Я люблю музыку.", "J'aime la musique.", [], "La используется с абстрактными понятиями"],
  ["Книга на столе.", "Le livre est sur la table.", [], "Le — артикль м.р. для livre"],
  ["Солнце светит.", "Le soleil brille.", [], "Le soleil — мужской род"],
],
ma: [
  ["Соедините артикль с существительным", [["le","garçon"],["la","fille"],["l'","école"],["les","enfants"]], "Артикль зависит от рода и числа"],
  ["Подберите правильный артикль", [["le","livre"],["la","maison"],["l'","ami"],["les","fleurs"]], "Le — м.р., la — ж.р., l' — перед гласной, les — мн.ч."],
  ["Соедините артикль с существительным", [["le","chat"],["la","table"],["l'","arbre"],["les","chiens"]], "Выбор артикля зависит от рода и числа"],
  ["Подберите правильный артикль", [["le","soleil"],["la","lune"],["l'","eau"],["les","étoiles"]], "Определённый артикль указывает на конкретный предмет"],
  ["Соедините артикль с существительным", [["le","père"],["la","mère"],["l'","enfant"],["les","parents"]], "Род определяется по существительному"],
],
},

'indefinite-articles': {
mc: [
  ["J'ai ___ chat.", ["un","une","des","le"], "un", "Un — неопределённый артикль мужского рода"],
  ["Elle a ___ idée.", ["un","une","des","la"], "une", "Une — неопределённый артикль женского рода"],
  ["Il y a ___ livres sur la table.", ["un","une","des","les"], "des", "Des — неопределённый артикль множественного числа"],
  ["C'est ___ bon film.", ["un","une","des","le"], "un", "Un перед существительным мужского рода"],
  ["Je vois ___ étoiles.", ["un","une","des","les"], "des", "Des — неопределённый артикль мн.ч."],
],
fb: [
  ["J'ai ___ frère.", "un", "Un — неопределённый артикль м.р."],
  ["Elle a ___ sœur.", "une", "Une — неопределённый артикль ж.р."],
  ["Il y a ___ pommes dans le panier.", "des", "Des — неопределённый артикль мн.ч."],
  ["C'est ___ belle journée.", "une", "Une перед существительным женского рода"],
  ["J'achète ___ journal.", "un", "Un перед существительным мужского рода"],
],
tr: [
  ["У меня есть кошка.", "J'ai un chat.", ["J'ai une chatte."], "Un — неопределённый артикль"],
  ["На столе книги.", "Il y a des livres sur la table.", [], "Des — неопределённый артикль мн.ч."],
  ["Это хороший фильм.", "C'est un bon film.", [], "Un перед м.р."],
  ["У неё есть идея.", "Elle a une idée.", [], "Une перед ж.р."],
  ["Я вижу детей.", "Je vois des enfants.", [], "Des — мн.ч."],
],
ma: [
  ["Соедините артикль с существительным", [["un","garçon"],["une","fille"],["des","enfants"],["un","livre"]], "Un — м.р., une — ж.р., des — мн.ч."],
  ["Подберите неопределённый артикль", [["un","chat"],["une","maison"],["des","fleurs"],["une","idée"]], "Артикль зависит от рода и числа"],
  ["Соедините артикль с существительным", [["un","ami"],["une","amie"],["des","amis"],["un","problème"]], "Problème — мужской род несмотря на окончание -e"],
  ["Подберите неопределённый артикль", [["un","jour"],["une","nuit"],["des","heures"],["un","moment"]], "Jour — м.р., nuit — ж.р."],
  ["Соедините артикль с существительным", [["un","homme"],["une","femme"],["des","gens"],["une","personne"]], "Personne — всегда женский род"],
],
},

'etre-avoir-present': {
mc: [
  ["Je ___ étudiant.", ["suis","es","est","sommes"], "suis", "Je suis — я есть/являюсь"],
  ["Tu ___ un livre.", ["as","ai","a","avons"], "as", "Tu as — ты имеешь"],
  ["Nous ___ contents.", ["sommes","êtes","sont","suis"], "sommes", "Nous sommes — мы являемся"],
  ["Ils ___ faim.", ["ont","a","avons","as"], "ont", "Ils ont — они имеют"],
  ["Elle ___ belle.", ["est","es","suis","sont"], "est", "Elle est — она является"],
],
fb: [
  ["Je ___ français.", "suis", "Être: je suis"],
  ["Tu ___ 20 ans.", "as", "Avoir: tu as (возраст выражается через avoir)"],
  ["Nous ___ une grande maison.", "avons", "Avoir: nous avons"],
  ["Vous ___ gentils.", "êtes", "Être: vous êtes"],
  ["Elles ___ fatiguées.", "sont", "Être: elles sont"],
],
tr: [
  ["Я студент.", "Je suis étudiant.", ["Je suis étudiante."], "Être используется для описания состояния"],
  ["У него есть машина.", "Il a une voiture.", [], "Avoir выражает обладание"],
  ["Мы счастливы.", "Nous sommes heureux.", ["Nous sommes heureuses."], "Être + прилагательное"],
  ["Тебе 18 лет.", "Tu as 18 ans.", ["Tu as dix-huit ans."], "Возраст выражается через avoir"],
  ["Они голодны.", "Ils ont faim.", ["Elles ont faim."], "Avoir faim — быть голодным"],
],
ma: [
  ["Соедините местоимение с формой être", [["je","suis"],["tu","es"],["il/elle","est"],["nous","sommes"]], "Спряжение глагола être в настоящем времени"],
  ["Соедините местоимение с формой avoir", [["j'","ai"],["tu","as"],["il/elle","a"],["nous","avons"]], "Спряжение глагола avoir в настоящем времени"],
  ["Соедините местоимение с формой être", [["vous","êtes"],["ils/elles","sont"],["je","suis"],["tu","es"]], "Формы être для разных местоимений"],
  ["Соедините местоимение с формой avoir", [["vous","avez"],["ils/elles","ont"],["j'","ai"],["tu","as"]], "Формы avoir для разных местоимений"],
  ["Выберите правильный глагол", [["je ... fatigué","suis"],["j' ... faim","ai"],["tu ... 20 ans","as"],["elle ... belle","est"]], "Être для состояний, avoir для обладания и возраста"],
],
},

'verbs-er': {
mc: [
  ["Je ___ la télévision.", ["regarde","regardes","regardent","regardons"], "regarde", "Je + глагол без окончания (основа + e)"],
  ["Tu ___ français.", ["parle","parles","parlons","parlent"], "parles", "Tu + основа + es"],
  ["Nous ___ ensemble.", ["travaille","travailles","travaillons","travaillent"], "travaillons", "Nous + основа + ons"],
  ["Ils ___ au football.", ["joue","joues","jouons","jouent"], "jouent", "Ils + основа + ent"],
  ["Vous ___ bien.", ["chante","chantes","chantez","chantent"], "chantez", "Vous + основа + ez"],
],
fb: [
  ["Elle ___ la radio.", "écoute", "Il/elle + основа + e"],
  ["Tu ___ beaucoup.", "manges", "Tu + основа + es (manger: mange+s)"],
  ["Nous ___ en France.", "habitons", "Nous + основа + ons"],
  ["Je ___ le bus.", "cherche", "Je + основа + e"],
  ["Vous ___ au cinéma.", "allez", "Aller — неправильный глагол, но спрягается как -er"],
],
tr: [
  ["Я говорю по-французски.", "Je parle français.", [], "Parler — глагол 1-й группы (-er)"],
  ["Они работают вместе.", "Ils travaillent ensemble.", ["Elles travaillent ensemble."], "Ils/elles + основа + ent"],
  ["Мы играем в футбол.", "Nous jouons au football.", [], "Nous + основа + ons"],
  ["Ты хорошо поёшь.", "Tu chantes bien.", [], "Tu + основа + es"],
  ["Она слушает музыку.", "Elle écoute de la musique.", [], "Elle + основа + e"],
],
ma: [
  ["Соедините местоимение с формой parler", [["je","parle"],["tu","parles"],["nous","parlons"],["ils","parlent"]], "Окончания -er глаголов: -e, -es, -e, -ons, -ez, -ent"],
  ["Соедините местоимение с формой manger", [["je","mange"],["tu","manges"],["vous","mangez"],["elles","mangent"]], "Manger спрягается по правилам -er глаголов"],
  ["Соедините окончание с местоимением", [["-e","je/il/elle"],["-es","tu"],["-ons","nous"],["-ez","vous"]], "Окончания глаголов 1-й группы"],
  ["Соедините глагол с переводом", [["parler","говорить"],["manger","есть"],["jouer","играть"],["travailler","работать"]], "Основные глаголы 1-й группы"],
  ["Соедините местоимение с формой travailler", [["il","travaille"],["nous","travaillons"],["vous","travaillez"],["elles","travaillent"]], "Спряжение travailler"],
],
},

'negation': {
mc: [
  ["Je ___ parle ___ français.", ["ne...pas","ne...plus","ne...jamais","n'...pas"], "ne...pas", "Ne...pas — основная форма отрицания"],
  ["Il ___ mange ___.", ["ne...pas","ne...plus","ne...rien","n'...pas"], "ne...pas", "Ne перед глаголом, pas после"],
  ["Elle ___ aime ___ le café.", ["ne...pas","n'...pas","ne...plus","n'...plus"], "n'...pas", "N' перед гласной вместо ne"],
  ["Nous ___ avons ___ d'argent.", ["ne...pas","n'...pas","ne...plus","n'...plus"], "n'...pas", "N' + avons + pas"],
  ["Tu ___ viens ___ demain?", ["ne...pas","n'...pas","ne...jamais","ne...plus"], "ne...pas", "Ne...pas окружает глагол"],
],
fb: [
  ["Je ne ___ pas.", "sais", "Ne + глагол + pas"],
  ["Il n'aime ___ le lait.", "pas", "Ne...pas — отрицание"],
  ["Nous ___ mangeons pas ici.", "ne", "Ne стоит перед глаголом"],
  ["Tu ne parles ___ anglais.", "pas", "Pas стоит после глагола"],
  ["Elle ___ est pas contente.", "n'", "N' перед гласной"],
],
tr: [
  ["Я не говорю по-английски.", "Je ne parle pas anglais.", [], "Ne...pas окружает глагол"],
  ["Он не любит кофе.", "Il n'aime pas le café.", [], "N' перед гласной"],
  ["Мы не работаем сегодня.", "Nous ne travaillons pas aujourd'hui.", [], "Ne...pas вокруг глагола"],
  ["Они не играют.", "Ils ne jouent pas.", ["Elles ne jouent pas."], "Стандартное отрицание"],
  ["Ты не понимаешь.", "Tu ne comprends pas.", [], "Ne...pas с глаголом 3-й группы"],
],
ma: [
  ["Соедините утверждение с отрицанием", [["Je parle","Je ne parle pas"],["Il mange","Il ne mange pas"],["Tu sais","Tu ne sais pas"],["Elle aime","Elle n'aime pas"]], "Ne/n' перед глаголом, pas после"],
  ["Соедините части отрицания", [["ne","перед глаголом"],["pas","после глагола"],["n'","перед гласной"],["ne...pas","отрицание"]], "Структура французского отрицания"],
  ["Соедините предложение с переводом", [["Je ne sais pas","Я не знаю"],["Il n'a pas","У него нет"],["Elle ne veut pas","Она не хочет"],["Nous ne pouvons pas","Мы не можем"]], "Отрицание с разными глаголами"],
  ["Соедините утверждение с отрицанием", [["J'ai","Je n'ai pas"],["Tu es","Tu n'es pas"],["Il va","Il ne va pas"],["Nous avons","Nous n'avons pas"]], "N' используется перед гласной"],
  ["Соедините слово с функцией", [["ne","первая часть отрицания"],["pas","вторая часть отрицания"],["plus","больше не"],["jamais","никогда"]], "Разные формы отрицания"],
],
},

'personal-pronouns': {
mc: [
  ["___ suis français.", ["Je","Tu","Il","Nous"], "Je", "Je — я"],
  ["___ parles bien.", ["Je","Tu","Il","Vous"], "Tu", "Tu — ты"],
  ["___ sommes amis.", ["Je","Tu","Nous","Ils"], "Nous", "Nous — мы"],
  ["___ êtes prêts?", ["Tu","Nous","Vous","Ils"], "Vous", "Vous — вы"],
  ["___ ont un chien.", ["Il","Elle","Nous","Ils"], "Ils", "Ils — они (м.р.)"],
],
fb: [
  ["___ suis étudiant.", "Je", "Je — местоимение 1-го лица ед.ч."],
  ["___ es très gentil.", "Tu", "Tu — местоимение 2-го лица ед.ч."],
  ["___ est médecin.", "Il", "Il — он (или elle — она)"],
  ["___ parlons français.", "Nous", "Nous — мы"],
  ["___ chantent bien.", "Elles", "Elles — они (ж.р.)"],
],
tr: [
  ["Я учитель.", "Je suis professeur.", [], "Je — я"],
  ["Ты говоришь по-французски.", "Tu parles français.", [], "Tu — ты"],
  ["Она красивая.", "Elle est belle.", [], "Elle — она"],
  ["Мы друзья.", "Nous sommes amis.", [], "Nous — мы"],
  ["Они работают.", "Ils travaillent.", ["Elles travaillent."], "Ils/Elles — они"],
],
ma: [
  ["Соедините местоимение с переводом", [["je","я"],["tu","ты"],["il","он"],["elle","она"]], "Личные местоимения единственного числа"],
  ["Соедините местоимение с переводом", [["nous","мы"],["vous","вы"],["ils","они (м.)"],["elles","они (ж.)"]], "Личные местоимения множественного числа"],
  ["Соедините местоимение с формой être", [["je","suis"],["tu","es"],["il","est"],["nous","sommes"]], "Спряжение être с местоимениями"],
  ["Соедините лицо с местоимением", [["1-е ед.ч.","je"],["2-е ед.ч.","tu"],["3-е ед.ч.","il/elle"],["1-е мн.ч.","nous"]], "Лица и числа местоимений"],
  ["Соедините местоимение с формой avoir", [["j'","ai"],["tu","as"],["nous","avons"],["vous","avez"]], "Avoir с местоимениями"],
],
},

'adjective-agreement': {
mc: [
  ["La fille est ___.", ["grand","grande","grands","grandes"], "grande", "Женский род: добавляется -e"],
  ["Les garçons sont ___.", ["petit","petite","petits","petites"], "petits", "Мужской род мн.ч.: добавляется -s"],
  ["Elle est ___.", ["heureux","heureuse","heureux","heureuses"], "heureuse", "Heureux → heureuse в женском роде"],
  ["Les fleurs sont ___.", ["beau","belle","beaux","belles"], "belles", "Beau → belles в женском роде мн.ч."],
  ["Le livre est ___.", ["nouveau","nouvelle","nouveaux","nouvelles"], "nouveau", "Мужской род ед.ч. — nouveau"],
],
fb: [
  ["La maison est ___. (grand)", "grande", "Женский род: grand → grande"],
  ["Les filles sont ___. (petit)", "petites", "Женский род мн.ч.: petit → petites"],
  ["Il est ___. (français)", "français", "Мужской род не меняется"],
  ["Elle est ___. (intelligent)", "intelligente", "Ж.р.: intelligent → intelligente"],
  ["Les chats sont ___. (noir)", "noirs", "М.р. мн.ч.: noir → noirs"],
],
tr: [
  ["Она красивая.", "Elle est belle.", [], "Beau → belle в женском роде"],
  ["Дома большие.", "Les maisons sont grandes.", [], "Ж.р. мн.ч.: grand → grandes"],
  ["Он умный.", "Il est intelligent.", [], "М.р. ед.ч. без изменений"],
  ["Девочки маленькие.", "Les filles sont petites.", [], "Petit → petites"],
  ["Цветок красный.", "La fleur est rouge.", [], "Rouge не меняется по роду"],
],
ma: [
  ["Соедините м.р. с ж.р.", [["grand","grande"],["petit","petite"],["beau","belle"],["nouveau","nouvelle"]], "Образование женского рода прилагательных"],
  ["Соедините ед.ч. с мн.ч. (м.р.)", [["grand","grands"],["petit","petits"],["beau","beaux"],["nouveau","nouveaux"]], "Образование множественного числа"],
  ["Соедините прилагательное с переводом", [["grand","большой"],["petit","маленький"],["beau","красивый"],["nouveau","новый"]], "Основные прилагательные"],
  ["Соедините м.р. с ж.р.", [["français","française"],["heureux","heureuse"],["blanc","blanche"],["vieux","vieille"]], "Особые формы женского рода"],
  ["Соедините ед.ч. с мн.ч. (ж.р.)", [["grande","grandes"],["petite","petites"],["belle","belles"],["nouvelle","nouvelles"]], "Множественное число женского рода"],
],
},

'passe-compose-avoir': {
mc: [
  ["J'ai ___ un film.", ["regardé","regarder","regarde","regardés"], "regardé", "Passé composé: avoir + participe passé (-er → -é)"],
  ["Tu as ___ la porte.", ["fermé","fermer","ferme","fermée"], "fermé", "Participe passé не согласуется с avoir (обычно)"],
  ["Nous avons ___ le dîner.", ["fini","finir","finis","finissons"], "fini", "Finir → fini (2-я группа: -ir → -i)"],
  ["Elle a ___ une lettre.", ["écrit","écrire","écris","écrite"], "écrit", "Écrire → écrit (неправильный глагол)"],
  ["Ils ont ___ du café.", ["bu","boire","bois","boivent"], "bu", "Boire → bu (неправильный глагол)"],
],
fb: [
  ["J'ai ___ un gâteau. (manger)", "mangé", "Manger → mangé"],
  ["Tu as ___ tes devoirs. (faire)", "fait", "Faire → fait"],
  ["Il a ___ le journal. (lire)", "lu", "Lire → lu"],
  ["Nous avons ___ la chanson. (chanter)", "chanté", "Chanter → chanté"],
  ["Vous avez ___ le film. (voir)", "vu", "Voir → vu"],
],
tr: [
  ["Я смотрел фильм.", "J'ai regardé un film.", [], "Avoir + participe passé"],
  ["Она написала письмо.", "Elle a écrit une lettre.", [], "Écrire → écrit"],
  ["Мы закончили работу.", "Nous avons fini le travail.", [], "Finir → fini"],
  ["Они купили хлеб.", "Ils ont acheté du pain.", [], "Acheter → acheté"],
  ["Ты сделал домашнее задание.", "Tu as fait tes devoirs.", [], "Faire → fait"],
],
ma: [
  ["Соедините инфинитив с participe passé", [["manger","mangé"],["finir","fini"],["faire","fait"],["voir","vu"]], "Образование причастий прошедшего времени"],
  ["Соедините инфинитив с participe passé", [["écrire","écrit"],["lire","lu"],["boire","bu"],["prendre","pris"]], "Неправильные причастия"],
  ["Соедините предложение с переводом", [["J'ai mangé","Я поел"],["Tu as fini","Ты закончил"],["Il a lu","Он прочитал"],["Nous avons vu","Мы увидели"]], "Passé composé с avoir"],
  ["Соедините местоимение с формой avoir", [["j'","ai"],["tu","as"],["il/elle","a"],["nous","avons"]], "Вспомогательный глагол avoir"],
  ["Соедините глагол с группой", [["mangé","1-я (-er)"],["fini","2-я (-ir)"],["fait","неправильный"],["vu","неправильный"]], "Группы глаголов и причастия"],
],
},

'passe-compose-etre': {
mc: [
  ["Elle est ___ à Paris.", ["allé","allée","allés","allées"], "allée", "С être причастие согласуется: elle → -ée"],
  ["Ils sont ___ hier.", ["arrivé","arrivée","arrivés","arrivées"], "arrivés", "Мн.ч. м.р.: -és"],
  ["Je suis ___ tôt. (м.р.)", ["parti","partie","partis","parties"], "parti", "Je (м.р.) → parti"],
  ["Nous sommes ___ en retard. (ж.р.)", ["arrivé","arrivée","arrivés","arrivées"], "arrivées", "Nous (ж.р.) → -ées"],
  ["Tu es ___ quand? (ж.р.)", ["venu","venue","venus","venues"], "venue", "Tu (ж.р.) → venue"],
],
fb: [
  ["Elle est ___ à l'école. (aller)", "allée", "Согласование с подлежащим: elle → -ée"],
  ["Ils sont ___ à 8h. (partir)", "partis", "Мн.ч. м.р.: parti → partis"],
  ["Je suis ___ en France. (naître, м.р.)", "né", "Naître → né"],
  ["Elles sont ___ au cinéma. (aller)", "allées", "Ж.р. мн.ч.: allé → allées"],
  ["Il est ___ tard. (rentrer)", "rentré", "Rentrer → rentré (м.р. ед.ч.)"],
],
tr: [
  ["Она пошла в школу.", "Elle est allée à l'école.", [], "Aller + être, согласование с elle"],
  ["Они приехали вчера.", "Ils sont arrivés hier.", ["Elles sont arrivées hier."], "Согласование причастия"],
  ["Я родился в Париже.", "Je suis né à Paris.", ["Je suis née à Paris."], "Naître — глагол с être"],
  ["Мы вернулись домой.", "Nous sommes rentrés à la maison.", ["Nous sommes rentrées à la maison."], "Rentrer — глагол движения"],
  ["Она упала.", "Elle est tombée.", [], "Tomber — глагол с être"],
],
ma: [
  ["Соедините глагол с причастием", [["aller","allé(e)"],["venir","venu(e)"],["partir","parti(e)"],["naître","né(e)"]], "Глаголы, спрягающиеся с être"],
  ["Соедините подлежащее с причастием (aller)", [["il","allé"],["elle","allée"],["ils","allés"],["elles","allées"]], "Согласование причастия с être"],
  ["Соедините глаголы-антонимы (с être)", [["aller","venir"],["monter","descendre"],["naître","mourir"],["entrer","sortir"]], "Пары глаголов движения с être"],
  ["Соедините глагол с вспомогательным", [["aller","être"],["manger","avoir"],["venir","être"],["finir","avoir"]], "Выбор вспомогательного глагола"],
  ["Соедините форму с лицом", [["suis allé","je (м.)"],["es allée","tu (ж.)"],["est allé","il"],["sommes allés","nous (м.)"]], "Passé composé с être"],
],
},

'imparfait': {
mc: [
  ["Quand j'étais petit, je ___ au football.", ["jouais","joue","ai joué","jouerai"], "jouais", "Imparfait для привычных действий в прошлом"],
  ["Il ___ beau hier.", ["faisait","fait","a fait","fera"], "faisait", "Faire à l'imparfait: faisait"],
  ["Nous ___ à Paris.", ["habitions","habitons","avons habité","habiterons"], "habitions", "Nous + основа (nous-формы) + -ions"],
  ["Tu ___ beaucoup.", ["travaillais","travailles","as travaillé","travailleras"], "travaillais", "Tu + основа + -ais"],
  ["Elles ___ contentes.", ["étaient","sont","ont été","seront"], "étaient", "Être à l'imparfait: étaient"],
],
fb: [
  ["Quand j'___ petit... (être)", "étais", "Être: j'étais (основа ét-)"],
  ["Il ___ tous les jours. (pleuvoir)", "pleuvait", "Pleuvoir: il pleuvait"],
  ["Nous ___ du café. (boire)", "buvions", "Boire: nous buvions (основа buv-)"],
  ["Tu ___ la télé. (regarder)", "regardais", "Regarder: tu regardais"],
  ["Vous ___ en vacances. (être)", "étiez", "Être: vous étiez"],
],
tr: [
  ["Когда я был маленьким, я играл в футбол.", "Quand j'étais petit, je jouais au football.", [], "Imparfait для описания прошлого"],
  ["Было красиво.", "Il faisait beau.", ["C'était beau."], "Imparfait для описания погоды"],
  ["Мы жили в Париже.", "Nous habitions à Paris.", [], "Habiter à l'imparfait"],
  ["Она всегда пела.", "Elle chantait toujours.", [], "Imparfait для привычек"],
  ["Шёл дождь.", "Il pleuvait.", [], "Imparfait для погоды"],
],
ma: [
  ["Соедините местоимение с окончанием imparfait", [["je","-ais"],["tu","-ais"],["il/elle","-ait"],["nous","-ions"]], "Окончания imparfait"],
  ["Соедините местоимение с окончанием imparfait", [["vous","-iez"],["ils/elles","-aient"],["je","-ais"],["nous","-ions"]], "Все окончания imparfait"],
  ["Соедините инфинитив с основой imparfait", [["parler","parl-"],["finir","finiss-"],["faire","fais-"],["boire","buv-"]], "Основа imparfait = nous-форма présent без -ons"],
  ["Соедините предложение с переводом", [["je parlais","я говорил"],["tu mangeais","ты ел"],["il faisait","он делал"],["nous allions","мы ходили"]], "Imparfait основных глаголов"],
  ["Соедините время с употреблением", [["imparfait","привычка в прошлом"],["imparfait","описание в прошлом"],["passé composé","завершённое действие"],["imparfait","длительное действие"]], "Употребление imparfait vs passé composé"],
],
},

'pronouns-cod': {
mc: [
  ["Je ___ vois. (le film)", ["le","la","les","lui"], "le", "Le заменяет м.р. ед.ч. прямое дополнение"],
  ["Tu ___ aimes. (les fleurs)", ["le","la","les","leur"], "les", "Les заменяет мн.ч. прямое дополнение"],
  ["Il ___ regarde. (Marie)", ["le","la","les","lui"], "la", "La заменяет ж.р. ед.ч. прямое дополнение"],
  ["Nous ___ mangeons. (la pizza)", ["le","la","les","lui"], "la", "La — прямое дополнение ж.р."],
  ["Elle ___ achète. (les livres)", ["le","la","les","leur"], "les", "Les — прямое дополнение мн.ч."],
],
fb: [
  ["Je ___ mange. (la pomme)", "la", "La — COD женского рода"],
  ["Tu ___ connais. (Pierre)", "le", "Le — COD мужского рода"],
  ["Nous ___ regardons. (les photos)", "les", "Les — COD множественного числа"],
  ["Il ___ appelle. (Marie)", "l'", "L' перед гласной"],
  ["Elle ___ aime. (le chocolat)", "l'", "L' перед гласной (aime)"],
],
tr: [
  ["Я его вижу.", "Je le vois.", [], "Le — прямое дополнение м.р."],
  ["Она их любит.", "Elle les aime.", [], "Les — прямое дополнение мн.ч."],
  ["Ты её знаешь.", "Tu la connais.", [], "La — прямое дополнение ж.р."],
  ["Мы его едим.", "Nous le mangeons.", [], "Le перед глаголом"],
  ["Он меня видит.", "Il me voit.", [], "Me — прямое дополнение 1-го лица"],
],
ma: [
  ["Соедините COD с родом/числом", [["le","м.р. ед.ч."],["la","ж.р. ед.ч."],["les","мн.ч."],["l'","перед гласной"]], "Местоимения прямого дополнения"],
  ["Соедините предложение с местоимением", [["Je vois Pierre","le"],["Je vois Marie","la"],["Je vois les enfants","les"],["Je vois Anne","l'"]], "Выбор COD по контексту"],
  ["Соедините лицо с местоимением COD", [["1-е ед.ч.","me"],["2-е ед.ч.","te"],["3-е м.р.","le"],["3-е ж.р.","la"]], "Местоимения COD по лицам"],
  ["Соедините местоимение с примером", [["me","Il me voit"],["te","Elle te connaît"],["le","Je le regarde"],["les","Tu les aimes"]], "COD в предложениях"],
  ["Соедините предложение с заменой", [["Je mange la pomme","Je la mange"],["Il lit le livre","Il le lit"],["Tu vois les chats","Tu les vois"],["Elle aime Anne","Elle l'aime"]], "Замена существительного на COD"],
],
},

'pronouns-coi': {
mc: [
  ["Je ___ parle. (à Pierre)", ["le","lui","leur","la"], "lui", "Lui — COI для 3-го лица ед.ч."],
  ["Tu ___ donnes un cadeau. (aux enfants)", ["les","lui","leur","la"], "leur", "Leur — COI для 3-го лица мн.ч."],
  ["Elle ___ téléphone. (à moi)", ["me","le","lui","la"], "me", "Me — COI для 1-го лица"],
  ["Il ___ écrit. (à Marie)", ["la","lui","leur","le"], "lui", "Lui — для м.р. и ж.р. ед.ч."],
  ["Nous ___ répondons. (à vous)", ["vous","leur","lui","les"], "vous", "Vous — COI для 2-го лица мн.ч."],
],
fb: [
  ["Je ___ parle. (à Marie)", "lui", "Lui — COI 3-е лицо ед.ч."],
  ["Tu ___ donnes le livre. (à tes amis)", "leur", "Leur — COI 3-е лицо мн.ч."],
  ["Elle ___ téléphone. (à toi)", "te", "Te — COI 2-е лицо ед.ч."],
  ["Il ___ écrit. (à nous)", "nous", "Nous — COI 1-е лицо мн.ч."],
  ["Je ___ envoie un message. (à lui)", "lui", "Lui заменяет à + personne"],
],
tr: [
  ["Я ему говорю.", "Je lui parle.", [], "Lui — косвенное дополнение ед.ч."],
  ["Она им звонит.", "Elle leur téléphone.", [], "Leur — косвенное дополнение мн.ч."],
  ["Ты мне пишешь.", "Tu m'écris.", [], "Me → m' перед гласной"],
  ["Он нам отвечает.", "Il nous répond.", [], "Nous — COI 1-е лицо мн.ч."],
  ["Я тебе даю книгу.", "Je te donne le livre.", [], "Te — COI 2-е лицо ед.ч."],
],
ma: [
  ["Соедините лицо с местоимением COI", [["1-е ед.ч.","me"],["2-е ед.ч.","te"],["3-е ед.ч.","lui"],["3-е мн.ч.","leur"]], "Косвенные дополнения по лицам"],
  ["Соедините COD и COI", [["le","прямое (м.р.)"],["la","прямое (ж.р.)"],["lui","косвенное (ед.ч.)"],["leur","косвенное (мн.ч.)"]], "Разница между COD и COI"],
  ["Соедините предложение с местоимением", [["parler à Pierre","lui"],["parler aux enfants","leur"],["parler à moi","me"],["parler à toi","te"]], "Замена à + personne на COI"],
  ["Соедините глагол с типом дополнения", [["parler à","COI"],["voir","COD"],["téléphoner à","COI"],["regarder","COD"]], "Глаголы с прямым и косвенным дополнением"],
  ["Соедините предложение с заменой", [["Je parle à Pierre","Je lui parle"],["Tu écris à Marie","Tu lui écris"],["Il donne aux enfants","Il leur donne"],["Elle répond à nous","Elle nous répond"]], "Замена существительного на COI"],
],
},

'reflexive-verbs': {
mc: [
  ["Je ___ lève à 7h.", ["me","te","se","nous"], "me", "Je me — возвратное местоимение 1-го лица"],
  ["Tu ___ couches tard.", ["me","te","se","vous"], "te", "Tu te — 2-е лицо"],
  ["Il ___ lave.", ["me","te","se","nous"], "se", "Il se — 3-е лицо"],
  ["Nous ___ promenons.", ["me","se","nous","vous"], "nous", "Nous nous — 1-е лицо мн.ч."],
  ["Elles ___ habillent.", ["me","se","nous","vous"], "se", "Elles se — 3-е лицо мн.ч."],
],
fb: [
  ["Je ___ réveille à 6h.", "me", "Se réveiller: je me réveille"],
  ["Tu ___ brosses les dents.", "te", "Se brosser: tu te brosses"],
  ["Elle ___ maquille.", "se", "Se maquiller: elle se maquille"],
  ["Nous ___ couchons tôt.", "nous", "Se coucher: nous nous couchons"],
  ["Vous ___ levez tard.", "vous", "Se lever: vous vous levez"],
],
tr: [
  ["Я просыпаюсь в 7 часов.", "Je me réveille à 7 heures.", ["Je me réveille à sept heures."], "Se réveiller — просыпаться"],
  ["Она одевается.", "Elle s'habille.", [], "S'habiller — одеваться (s' перед гласной)"],
  ["Мы гуляем в парке.", "Nous nous promenons dans le parc.", [], "Se promener — гулять"],
  ["Ты ложишься рано.", "Tu te couches tôt.", [], "Se coucher — ложиться"],
  ["Они моются.", "Ils se lavent.", ["Elles se lavent."], "Se laver — мыться"],
],
ma: [
  ["Соедините местоимение с возвратным", [["je","me"],["tu","te"],["il/elle","se"],["nous","nous"]], "Возвратные местоимения"],
  ["Соедините глагол с переводом", [["se lever","вставать"],["se coucher","ложиться"],["se laver","мыться"],["s'habiller","одеваться"]], "Основные возвратные глаголы"],
  ["Соедините форму с лицом", [["je me lève","я встаю"],["tu te lèves","ты встаёшь"],["il se lève","он встаёт"],["nous nous levons","мы встаём"]], "Спряжение se lever"],
  ["Соедините подлежащее с возвратным", [["vous","vous"],["ils/elles","se"],["je","me"],["tu","te"]], "Все возвратные местоимения"],
  ["Соедините глагол с типом", [["se laver","возвратный"],["laver","обычный"],["se coucher","возвратный"],["coucher","обычный"]], "Возвратная vs обычная форма"],
],
},

'futur-simple': {
mc: [
  ["Je ___ demain.", ["partirai","pars","suis parti","partais"], "partirai", "Futur simple: инфинитив + окончание -ai"],
  ["Tu ___ le film.", ["regarderas","regardes","as regardé","regardais"], "regarderas", "Futur: инфинитив + -as"],
  ["Nous ___ en France.", ["irons","allons","sommes allés","allions"], "irons", "Aller: futur irrégulier — ir-"],
  ["Il ___ beau demain.", ["fera","fait","a fait","faisait"], "fera", "Faire: futur irrégulier — fer-"],
  ["Elles ___ à la fête.", ["viendront","viennent","sont venues","venaient"], "viendront", "Venir: futur irrégulier — viendr-"],
],
fb: [
  ["Je ___ français. (parler)", "parlerai", "Parler + ai = parlerai"],
  ["Tu ___ le dîner. (préparer)", "prépareras", "Préparer + as = prépareras"],
  ["Il ___ demain. (pleuvoir)", "pleuvra", "Pleuvoir: futur — pleuvra"],
  ["Nous ___ ensemble. (travailler)", "travaillerons", "Travailler + ons = travaillerons"],
  ["Vous ___ contents. (être)", "serez", "Être: futur — ser-"],
],
tr: [
  ["Завтра я уеду.", "Demain je partirai.", ["Je partirai demain."], "Futur simple для будущих действий"],
  ["Мы поедем во Францию.", "Nous irons en France.", [], "Aller → ir- (основа futur)"],
  ["Будет хорошая погода.", "Il fera beau.", [], "Faire → fer- (основа futur)"],
  ["Ты увидишь.", "Tu verras.", [], "Voir → verr- (основа futur)"],
  ["Они придут завтра.", "Ils viendront demain.", ["Elles viendront demain."], "Venir → viendr- (основа futur)"],
],
ma: [
  ["Соедините местоимение с окончанием futur", [["je","-ai"],["tu","-as"],["il/elle","-a"],["nous","-ons"]], "Окончания futur simple"],
  ["Соедините инфинитив с основой futur", [["aller","ir-"],["faire","fer-"],["être","ser-"],["avoir","aur-"]], "Неправильные основы futur simple"],
  ["Соедините инфинитив с основой futur", [["voir","verr-"],["venir","viendr-"],["pouvoir","pourr-"],["vouloir","voudr-"]], "Неправильные основы futur simple"],
  ["Соедините предложение с переводом", [["je parlerai","я буду говорить"],["tu iras","ты пойдёшь"],["il fera","он сделает"],["nous serons","мы будем"]], "Futur simple основных глаголов"],
  ["Соедините местоимение с окончанием futur", [["vous","-ez"],["ils/elles","-ont"],["je","-ai"],["tu","-as"]], "Все окончания futur simple"],
],
},

'subjonctif-present': {
mc: [
  ["Il faut que je ___.", ["fasse","fais","fait","ferai"], "fasse", "Subjonctif: que je fasse (faire)"],
  ["Je veux que tu ___.", ["viennes","viens","es venu","viendras"], "viennes", "Subjonctif: que tu viennes (venir)"],
  ["Il est possible qu'il ___.", ["pleuve","pleut","a plu","pleuvra"], "pleuve", "Subjonctif après il est possible que"],
  ["Bien que nous ___ fatigués.", ["soyons","sommes","étions","serons"], "soyons", "Subjonctif après bien que"],
  ["Je doute qu'elle ___ raison.", ["ait","a","avait","aura"], "ait", "Subjonctif après je doute que"],
],
fb: [
  ["Il faut que tu ___ tes devoirs. (faire)", "fasses", "Subjonctif de faire: que tu fasses"],
  ["Je veux qu'il ___. (venir)", "vienne", "Subjonctif de venir: qu'il vienne"],
  ["Bien qu'elle ___ malade. (être)", "soit", "Subjonctif de être: qu'elle soit"],
  ["Il est important que nous ___. (savoir)", "sachions", "Subjonctif de savoir: que nous sachions"],
  ["Pour que vous ___ heureux. (être)", "soyez", "Subjonctif de être: que vous soyez"],
],
tr: [
  ["Нужно, чтобы я это сделал.", "Il faut que je le fasse.", [], "Il faut que + subjonctif"],
  ["Я хочу, чтобы ты пришёл.", "Je veux que tu viennes.", [], "Vouloir que + subjonctif"],
  ["Хотя он устал.", "Bien qu'il soit fatigué.", [], "Bien que + subjonctif"],
  ["Я сомневаюсь, что она права.", "Je doute qu'elle ait raison.", [], "Douter que + subjonctif"],
  ["Чтобы мы были счастливы.", "Pour que nous soyons heureux.", [], "Pour que + subjonctif"],
],
ma: [
  ["Соедините инфинитив с формой subjonctif (je)", [["faire","fasse"],["être","sois"],["avoir","aie"],["aller","aille"]], "Неправильные формы subjonctif"],
  ["Соедините выражение с наклонением", [["il faut que","subjonctif"],["je sais que","indicatif"],["je veux que","subjonctif"],["je pense que","indicatif"]], "Когда использовать subjonctif"],
  ["Соедините конструкцию с subjonctif", [["bien que","хотя"],["pour que","чтобы"],["avant que","до того как"],["à moins que","если только не"]], "Союзы, требующие subjonctif"],
  ["Соедините инфинитив с формой subjonctif (il)", [["faire","fasse"],["venir","vienne"],["pouvoir","puisse"],["savoir","sache"]], "Subjonctif неправильных глаголов"],
  ["Соедините предложение с типом", [["Je veux que tu viennes","subjonctif"],["Je sais qu'il vient","indicatif"],["Il faut que nous partions","subjonctif"],["Je crois qu'elle est là","indicatif"]], "Subjonctif vs indicatif"],
],
},

'conditionnel-present': {
mc: [
  ["Je ___ aller au cinéma.", ["voudrais","veux","ai voulu","voudrai"], "voudrais", "Conditionnel: основа futur + окончания imparfait"],
  ["Tu ___ venir?", ["pourrais","peux","as pu","pourras"], "pourrais", "Conditionnel de pouvoir: pourrais"],
  ["Il ___ beau demain.", ["ferait","fait","a fait","fera"], "ferait", "Conditionnel de faire: ferait"],
  ["Nous ___ en France.", ["irions","allons","sommes allés","irons"], "irions", "Conditionnel de aller: irions"],
  ["Vous ___ m'aider?", ["pourriez","pouvez","avez pu","pourrez"], "pourriez", "Conditionnel вежливой просьбы"],
],
fb: [
  ["Je ___ un café. (vouloir)", "voudrais", "Conditionnel вежливой просьбы"],
  ["Tu ___ partir? (aimer)", "aimerais", "Conditionnel: aimer + ais"],
  ["Il ___ riche. (être)", "serait", "Conditionnel de être: serait"],
  ["Nous ___ voyager. (pouvoir)", "pourrions", "Conditionnel de pouvoir: pourrions"],
  ["Elles ___ contentes. (être)", "seraient", "Conditionnel de être: seraient"],
],
tr: [
  ["Я бы хотел кофе.", "Je voudrais un café.", [], "Conditionnel вежливости"],
  ["Ты мог бы мне помочь?", "Tu pourrais m'aider?", ["Pourrais-tu m'aider?"], "Conditionnel вежливой просьбы"],
  ["Мы бы поехали во Францию.", "Nous irions en France.", [], "Conditionnel de aller"],
  ["Было бы хорошо.", "Ce serait bien.", [], "Conditionnel de être"],
  ["Она бы хотела прийти.", "Elle aimerait venir.", ["Elle voudrait venir."], "Conditionnel желания"],
],
ma: [
  ["Соедините инфинитив с основой conditionnel", [["aller","ir-"],["faire","fer-"],["être","ser-"],["avoir","aur-"]], "Основа conditionnel = основа futur"],
  ["Соедините местоимение с окончанием", [["je","-ais"],["tu","-ais"],["il","-ait"],["nous","-ions"]], "Окончания conditionnel = окончания imparfait"],
  ["Соедините предложение с употреблением", [["Je voudrais","вежливость"],["Il serait","гипотеза"],["Tu pourrais","просьба"],["On dirait","предположение"]], "Употребление conditionnel"],
  ["Соедините форму с инфинитивом", [["voudrais","vouloir"],["pourrais","pouvoir"],["saurais","savoir"],["devrais","devoir"]], "Conditionnel неправильных глаголов"],
  ["Соедините время с формулой", [["futur","основа + -ai, -as, -a..."],["conditionnel","основа + -ais, -ais, -ait..."],["imparfait","основа nous + -ais..."],["présent","основа + окончания группы"]], "Сравнение образования времён"],
],
},

'relative-pronouns': {
mc: [
  ["L'homme ___ parle est mon père.", ["qui","que","dont","où"], "qui", "Qui — подлежащее относительного предложения"],
  ["Le livre ___ je lis est bon.", ["qui","que","dont","où"], "que", "Que — прямое дополнение"],
  ["La ville ___ je suis né.", ["qui","que","dont","où"], "où", "Où — место"],
  ["La fille ___ je parle.", ["qui","que","dont","où"], "dont", "Dont заменяет de + существительное"],
  ["Le film ___ tu m'as parlé.", ["qui","que","dont","où"], "dont", "Dont — parler de qqch"],
],
fb: [
  ["L'homme ___ est là est mon ami.", "qui", "Qui — подлежащее"],
  ["Le gâteau ___ tu as fait est délicieux.", "que", "Que — прямое дополнение"],
  ["La maison ___ j'habite est grande.", "où", "Où — место"],
  ["Le professeur ___ j'ai besoin.", "dont", "Dont — avoir besoin de"],
  ["Le jour ___ je suis arrivé.", "où", "Où — время"],
],
tr: [
  ["Человек, который говорит, — мой отец.", "L'homme qui parle est mon père.", [], "Qui — подлежащее"],
  ["Книга, которую я читаю, хорошая.", "Le livre que je lis est bon.", [], "Que — прямое дополнение"],
  ["Город, где я родился.", "La ville où je suis né.", [], "Où — место"],
  ["Девушка, о которой я говорю.", "La fille dont je parle.", [], "Dont — parler de"],
  ["Фильм, который мне нравится.", "Le film que j'aime.", ["Le film qui me plaît."], "Que — дополнение"],
],
ma: [
  ["Соедините местоимение с функцией", [["qui","подлежащее"],["que","прямое дополнение"],["dont","de + сущ."],["où","место/время"]], "Функции относительных местоимений"],
  ["Соедините предложение с местоимением", [["L'homme ... parle","qui"],["Le livre ... je lis","que"],["La ville ... j'habite","où"],["Le film ... je parle","dont"]], "Выбор относительного местоимения"],
  ["Соедините глагол с местоимением", [["parler de → ","dont"],["habiter à → ","où"],["sujet → ","qui"],["COD → ","que"]], "Какое местоимение после какого глагола"],
  ["Соедините пример с переводом", [["qui parle","который говорит"],["que je lis","который я читаю"],["dont j'ai besoin","в котором я нуждаюсь"],["où j'habite","где я живу"]], "Перевод конструкций"],
  ["Соедините предложение с функцией", [["La femme qui chante","подлежащее"],["Le livre que j'aime","дополнение"],["L'endroit où je vis","место"],["L'ami dont je parle","de + сущ."]], "Анализ функции местоимения"],
],
},

'plus-que-parfait': {
mc: [
  ["J'___ déjà mangé.", ["avais","ai","avait","aurais"], "avais", "Plus-que-parfait: imparfait de avoir + participe passé"],
  ["Elle ___ partie avant moi.", ["était","est","a été","serait"], "était", "Plus-que-parfait: imparfait de être + participe passé"],
  ["Nous ___ fini le travail.", ["avions","avons","avaient","aurions"], "avions", "Plus-que-parfait: nous avions + p.p."],
  ["Ils ___ arrivés en retard.", ["étaient","sont","ont été","seraient"], "étaient", "Plus-que-parfait: ils étaient + p.p."],
  ["Tu ___ vu ce film?", ["avais","as","avait","aurais"], "avais", "Plus-que-parfait: tu avais + vu"],
],
fb: [
  ["J'___ déjà mangé quand il est arrivé.", "avais", "Avoir à l'imparfait: j'avais"],
  ["Elle ___ partie avant nous.", "était", "Être à l'imparfait: elle était"],
  ["Nous ___ terminé le projet.", "avions", "Avoir à l'imparfait: nous avions"],
  ["Ils ___ rentrés tard.", "étaient", "Être à l'imparfait: ils étaient"],
  ["Tu ___ compris la leçon.", "avais", "Avoir à l'imparfait: tu avais"],
],
tr: [
  ["Я уже поел, когда он пришёл.", "J'avais déjà mangé quand il est arrivé.", [], "Plus-que-parfait для предшествующего действия"],
  ["Она уже ушла.", "Elle était déjà partie.", [], "Partir — с être"],
  ["Мы закончили работу.", "Nous avions fini le travail.", [], "Plus-que-parfait с avoir"],
  ["Они уже приехали.", "Ils étaient déjà arrivés.", [], "Arriver — с être"],
  ["Ты видел этот фильм?", "Tu avais vu ce film?", ["Avais-tu vu ce film?"], "Plus-que-parfait с avoir"],
],
ma: [
  ["Соедините время с формулой", [["passé composé","présent avoir/être + p.p."],["plus-que-parfait","imparfait avoir/être + p.p."],["futur antérieur","futur avoir/être + p.p."],["conditionnel passé","conditionnel avoir/être + p.p."]], "Составные времена"],
  ["Соедините подлежащее с avoir (imparfait)", [["j'","avais"],["tu","avais"],["il","avait"],["nous","avions"]], "Avoir à l'imparfait"],
  ["Соедините подлежащее с être (imparfait)", [["j'","étais"],["tu","étais"],["il","était"],["nous","étions"]], "Être à l'imparfait"],
  ["Соедините предложение с переводом", [["j'avais mangé","я поел (до)"],["elle était partie","она ушла (до)"],["nous avions vu","мы видели (до)"],["ils étaient arrivés","они приехали (до)"]], "Plus-que-parfait выражает предшествование"],
  ["Соедините с правильным временем", [["действие до другого в прошлом","plus-que-parfait"],["завершённое действие в прошлом","passé composé"],["описание в прошлом","imparfait"],["привычка в прошлом","imparfait"]], "Выбор прошедшего времени"],
],
},

'passive-voice': {
mc: [
  ["Le gâteau ___ par Marie.", ["est fait","fait","a fait","faisait"], "est fait", "Страдательный залог: être + participe passé"],
  ["La lettre ___ par Pierre.", ["est écrite","écrit","a écrit","écrivait"], "est écrite", "Причастие согласуется: lettre (ж.р.) → écrite"],
  ["Les livres ___ par les étudiants.", ["sont lus","lisent","ont lu","lisaient"], "sont lus", "Мн.ч.: sont + lus"],
  ["Le film ___ en 2020.", ["a été tourné","a tourné","tournait","est tourné"], "a été tourné", "Passé composé passif: a été + p.p."],
  ["La maison ___ demain.", ["sera vendue","vendra","a vendu","vendait"], "sera vendue", "Futur passif: sera + p.p."],
],
fb: [
  ["Le livre est ___ par l'auteur. (écrire)", "écrit", "Страдательный залог: être + p.p."],
  ["La porte est ___ par le vent. (ouvrir)", "ouverte", "Ouvrir → ouverte (ж.р. — la porte)"],
  ["Les gâteaux sont ___ par Marie. (faire)", "faits", "Faire → faits (мн.ч.)"],
  ["La lettre a été ___ hier. (envoyer)", "envoyée", "Envoyée — ж.р. (la lettre)"],
  ["Le repas sera ___ à midi. (servir)", "servi", "Servir → servi"],
],
tr: [
  ["Торт сделан Мари.", "Le gâteau est fait par Marie.", [], "Être + participe passé + par"],
  ["Письмо было написано вчера.", "La lettre a été écrite hier.", [], "Passé composé passif"],
  ["Дом будет продан.", "La maison sera vendue.", [], "Futur passif"],
  ["Книги читаются студентами.", "Les livres sont lus par les étudiants.", [], "Мн.ч. в пассиве"],
  ["Дверь открыта.", "La porte est ouverte.", [], "État résultant"],
],
ma: [
  ["Соедините actif с passif", [["Marie fait le gâteau","Le gâteau est fait par Marie"],["Pierre écrit la lettre","La lettre est écrite par Pierre"],["Le vent ouvre la porte","La porte est ouverte par le vent"],["Les élèves lisent les livres","Les livres sont lus par les élèves"]], "Трансформация actif → passif"],
  ["Соедините время с формой être", [["présent","est"],["passé composé","a été"],["imparfait","était"],["futur","sera"]], "Être в разных временах (пассив)"],
  ["Соедините participe passé с родом", [["fait","м.р. ед.ч."],["faite","ж.р. ед.ч."],["faits","м.р. мн.ч."],["faites","ж.р. мн.ч."]], "Согласование причастия в пассиве"],
  ["Соедините элемент с функцией", [["être","вспомогательный глагол"],["participe passé","основное значение"],["par","предлог агенса"],["Marie","агенс действия"]], "Структура пассивного предложения"],
  ["Соедините залог с примером", [["actif","Marie fait le gâteau"],["passif présent","Le gâteau est fait"],["passif passé","Le gâteau a été fait"],["passif futur","Le gâteau sera fait"]], "Времена в пассивном залоге"],
],
},

'gerondif': {
mc: [
  ["___ mangeant, il regarde la télé.", ["En","Dans","Par","Avec"], "En", "Герундий: en + participe présent"],
  ["Elle chante en ___.", ["dansant","danser","danse","dansé"], "dansant", "Participe présent: основа nous + -ant"],
  ["Il s'est blessé en ___.", ["tombant","tomber","tombe","tombé"], "tombant", "Tomber → tombant"],
  ["En ___ bien, tu réussiras.", ["travaillant","travailler","travaille","travaillé"], "travaillant", "Travailler → travaillant"],
  ["J'ai appris en ___.", ["lisant","lire","lis","lu"], "lisant", "Lire → lisant"],
],
fb: [
  ["En ___, il a trouvé la solution. (chercher)", "cherchant", "Chercher → cherchant"],
  ["Elle écoute de la musique en ___. (courir)", "courant", "Courir → courant"],
  ["En ___ la porte, j'ai vu Marie. (ouvrir)", "ouvrant", "Ouvrir → ouvrant"],
  ["Il a répondu en ___. (sourire)", "souriant", "Sourire → souriant"],
  ["En ___ tôt, tu arriveras à l'heure. (partir)", "partant", "Partir → partant"],
],
tr: [
  ["Он смотрит телевизор, кушая.", "Il regarde la télé en mangeant.", [], "En + participe présent"],
  ["Она упала, бегая.", "Elle est tombée en courant.", [], "Герундий одновременного действия"],
  ["Работая усердно, ты добьёшься успеха.", "En travaillant dur, tu réussiras.", [], "Герундий условия/причины"],
  ["Он учится, читая.", "Il apprend en lisant.", [], "Герундий способа"],
  ["Выходя из дома, я встретил Пьера.", "En sortant de la maison, j'ai rencontré Pierre.", [], "Герундий времени"],
],
ma: [
  ["Соедините инфинитив с participe présent", [["manger","mangeant"],["finir","finissant"],["faire","faisant"],["avoir","ayant"]], "Образование participe présent"],
  ["Соедините инфинитив с participe présent", [["être","étant"],["savoir","sachant"],["lire","lisant"],["écrire","écrivant"]], "Неправильные participes présents"],
  ["Соедините функцию с примером", [["время","En arrivant, j'ai vu..."],["причина","En étant malade, il..."],["условие","En travaillant, tu..."],["способ","Il apprend en lisant"]], "Функции герундия"],
  ["Соедините предложение с переводом", [["en mangeant","кушая"],["en parlant","говоря"],["en lisant","читая"],["en marchant","идя пешком"]], "Перевод герундия"],
  ["Соедините глагол с основой", [["nous mangeons → mange-","mangeant"],["nous finissons → finiss-","finissant"],["nous faisons → fais-","faisant"],["nous lisons → lis-","lisant"]], "Основа = nous-форма без -ons"],
],
},

'si-conditionals': {
mc: [
  ["Si j'___ riche, je voyagerais.", ["étais","suis","serai","serais"], "étais", "Si + imparfait → conditionnel présent (2-й тип)"],
  ["Si tu viens, je ___ content.", ["serai","serais","suis","étais"], "serai", "Si + présent → futur (1-й тип)"],
  ["Si elle ___ venue, on aurait dîné.", ["était","est","sera","serait"], "était", "Si + plus-que-parfait → conditionnel passé (3-й тип)"],
  ["Si nous avions su, nous ___ venus.", ["serions","sommes","serons","étions"], "serions", "3-й тип: conditionnel passé"],
  ["Si j'ai le temps, j' ___ au cinéma.", ["irai","irais","allais","suis allé"], "irai", "1-й тип: futur simple"],
],
fb: [
  ["Si j'___ le temps, je lirais. (avoir)", "avais", "2-й тип: si + imparfait"],
  ["Si tu étudies, tu ___ l'examen. (réussir)", "réussiras", "1-й тип: futur simple"],
  ["Si elle était venue, je l'___ vu. (avoir)", "aurais", "3-й тип: conditionnel passé"],
  ["Si nous ___ riches, nous voyagerions. (être)", "étions", "2-й тип: si + imparfait"],
  ["Si j'___ su, je ne serais pas venu. (avoir)", "avais", "3-й тип: si + plus-que-parfait"],
],
tr: [
  ["Если я буду богатым, я буду путешествовать.", "Si je suis riche, je voyagerai.", [], "1-й тип: si + présent → futur"],
  ["Если бы я был богатым, я бы путешествовал.", "Si j'étais riche, je voyagerais.", [], "2-й тип: si + imparfait → conditionnel"],
  ["Если бы я знал, я бы пришёл.", "Si j'avais su, je serais venu.", [], "3-й тип: si + pqp → cond. passé"],
  ["Если ты придёшь, я буду рад.", "Si tu viens, je serai content.", [], "1-й тип: si + présent → futur"],
  ["Если бы она была здесь, было бы лучше.", "Si elle était là, ce serait mieux.", [], "2-й тип"],
],
ma: [
  ["Соедините тип условия с формулой", [["1-й (реальный)","si + présent → futur"],["2-й (нереальный)","si + imparfait → conditionnel"],["3-й (невозможный)","si + pqp → cond. passé"],["общий","si + présent → présent"]], "Три типа условных предложений"],
  ["Соедините si-часть с результатом", [["Si je suis riche","je voyagerai"],["Si j'étais riche","je voyagerais"],["Si j'avais été riche","j'aurais voyagé"],["Si tu viens","je serai content"]], "Согласование времён в условных"],
  ["Соедините время с типом условия", [["présent в si","1-й тип"],["imparfait в si","2-й тип"],["plus-que-parfait в si","3-й тип"],["futur в результате","1-й тип"]], "Определение типа условия"],
  ["Соедините пример с типом", [["Si j'ai le temps, j'irai","1-й тип"],["Si j'avais le temps, j'irais","2-й тип"],["Si j'avais eu le temps, je serais allé","3-й тип"],["Si tu étudies, tu réussiras","1-й тип"]], "Примеры условных предложений"],
  ["Соедините запрет с правилом", [["si + futur","НЕПРАВИЛЬНО"],["si + conditionnel","НЕПРАВИЛЬНО"],["si + présent","1-й тип ОК"],["si + imparfait","2-й тип ОК"]], "После si нельзя futur и conditionnel"],
],
},

'indirect-speech': {
mc: [
  ["Il dit qu'il ___ fatigué.", ["est","était","sera","soit"], "est", "Косвенная речь, présent → présent (глагол в présent)"],
  ["Il a dit qu'il ___ fatigué.", ["était","est","sera","soit"], "était", "Косвенная речь, présent → imparfait"],
  ["Elle a dit qu'elle ___ le lendemain.", ["viendrait","vient","venait","vienne"], "viendrait", "Futur → conditionnel в косвенной речи"],
  ["Il a demandé ___ j'habitais.", ["où","que","qui","quoi"], "où", "Косвенный вопрос: où"],
  ["Elle m'a demandé ___ je voulais.", ["ce que","que","qu'est-ce que","quoi"], "ce que", "Qu'est-ce que → ce que"],
],
fb: [
  ["Il a dit qu'il ___ malade. (être, прямая: est)", "était", "Présent → imparfait в косвенной речи"],
  ["Elle a dit qu'elle ___ hier. (venir, прямая: est venue)", "était venue", "Passé composé → plus-que-parfait"],
  ["Il a dit qu'il ___ demain. (venir, прямая: viendra)", "viendrait", "Futur → conditionnel"],
  ["Elle a demandé ___ je faisais. (прямая: Qu'est-ce que tu fais?)", "ce que", "Question directe → indirecte"],
  ["Il a dit que nous ___ partir. (devoir, прямая: devez)", "devions", "Présent → imparfait"],
],
tr: [
  ["Он сказал, что устал.", "Il a dit qu'il était fatigué.", [], "Согласование времён"],
  ["Она сказала, что придёт завтра.", "Elle a dit qu'elle viendrait le lendemain.", [], "Futur → conditionnel, demain → le lendemain"],
  ["Он спросил, где я живу.", "Il a demandé où j'habitais.", ["Il m'a demandé où j'habitais."], "Косвенный вопрос"],
  ["Она сказала, что видела фильм.", "Elle a dit qu'elle avait vu le film.", [], "Passé composé → plus-que-parfait"],
  ["Он спросил, что я делаю.", "Il a demandé ce que je faisais.", [], "Qu'est-ce que → ce que"],
],
ma: [
  ["Соедините прямую речь с косвенной (temps)", [["présent","imparfait"],["passé composé","plus-que-parfait"],["futur","conditionnel"],["imparfait","imparfait"]], "Согласование времён в косвенной речи"],
  ["Соедините маркер времени", [["aujourd'hui","ce jour-là"],["demain","le lendemain"],["hier","la veille"],["maintenant","à ce moment-là"]], "Замена маркеров времени"],
  ["Соедините вопрос с косвенной формой", [["Où habites-tu?","Il demande où tu habites"],["Qu'est-ce que tu fais?","Il demande ce que tu fais"],["Est-ce que tu viens?","Il demande si tu viens"],["Qui est-ce?","Il demande qui c'est"]], "Косвенные вопросы"],
  ["Соедините прямую речь с косвенной", [["Je suis fatigué","Il a dit qu'il était fatigué"],["Je viendrai","Il a dit qu'il viendrait"],["J'ai vu","Il a dit qu'il avait vu"],["Je veux","Il a dit qu'il voulait"]], "Трансформация в косвенную речь"],
  ["Соедините элемент с правилом", [["que","вводит утверждение"],["si","вводит да/нет вопрос"],["ce que","вводит вопрос о предмете"],["où/quand","вводит вопрос о месте/времени"]], "Союзы косвенной речи"],
],
},

'subjonctif-passe': {
mc: [
  ["Je suis content qu'il ___ venu.", ["soit","est","a été","serait"], "soit", "Subjonctif passé: subj. présent de être + p.p."],
  ["Je doute qu'elle ___ fini.", ["ait","a","avait","aurait"], "ait", "Subjonctif passé: subj. présent de avoir + p.p."],
  ["Bien qu'ils ___ partis.", ["soient","sont","étaient","seraient"], "soient", "Subjonctif passé de partir"],
  ["Il est possible qu'elle ___ oublié.", ["ait","a","avait","aurait"], "ait", "Subjonctif passé de oublier"],
  ["Avant qu'il ___ arrivé.", ["soit","est","a été","serait"], "soit", "Avant que + subjonctif passé"],
],
fb: [
  ["Je suis content que tu ___ réussi.", "aies", "Subjonctif passé: que tu aies + p.p."],
  ["Bien qu'elle ___ partie.", "soit", "Subjonctif passé: qu'elle soit + p.p."],
  ["Il est dommage que nous ___ échoué.", "ayons", "Subjonctif passé: que nous ayons + p.p."],
  ["Avant qu'ils ___ fini.", "aient", "Subjonctif passé: qu'ils aient + p.p."],
  ["Je doute qu'il ___ compris.", "ait", "Subjonctif passé: qu'il ait + p.p."],
],
tr: [
  ["Я рад, что он пришёл.", "Je suis content qu'il soit venu.", [], "Subjonctif passé для завершённого действия"],
  ["Я сомневаюсь, что она закончила.", "Je doute qu'elle ait fini.", [], "Douter que + subj. passé"],
  ["Хотя они ушли.", "Bien qu'ils soient partis.", [], "Bien que + subj. passé"],
  ["До того как он приехал.", "Avant qu'il soit arrivé.", ["Avant qu'il ne soit arrivé."], "Avant que + subj. passé"],
  ["Жаль, что мы проиграли.", "Il est dommage que nous ayons perdu.", ["C'est dommage que nous ayons perdu."], "Subjonctif passé сожаления"],
],
ma: [
  ["Соедините формулу с временем", [["subj. présent avoir/être + p.p.","subjonctif passé"],["présent avoir/être + p.p.","passé composé"],["imparfait avoir/être + p.p.","plus-que-parfait"],["conditionnel avoir/être + p.p.","conditionnel passé"]], "Составные времена и наклонения"],
  ["Соедините подлежащее с avoir (subj.)", [["que j'","aie"],["que tu","aies"],["qu'il","ait"],["que nous","ayons"]], "Avoir au subjonctif"],
  ["Соедините подлежащее с être (subj.)", [["que je","sois"],["que tu","sois"],["qu'il","soit"],["que nous","soyons"]], "Être au subjonctif"],
  ["Соедините пример с наклонением", [["qu'il soit venu","subjonctif passé"],["qu'il vienne","subjonctif présent"],["il est venu","indicatif passé composé"],["il viendrait","conditionnel présent"]], "Различение наклонений"],
  ["Соедините конструкцию с subj. passé", [["je suis content que","+ subj. passé"],["il est possible que","+ subj. passé"],["avant que","+ subj. passé"],["bien que","+ subj. passé"]], "Конструкции с subjonctif passé"],
],
},

'conditionnel-passe': {
mc: [
  ["J'___ aimé venir.", ["aurais","ai","avais","aurai"], "aurais", "Conditionnel passé: conditionnel de avoir + p.p."],
  ["Elle ___ partie plus tôt.", ["serait","est","était","sera"], "serait", "Conditionnel passé avec être"],
  ["Nous ___ pu le faire.", ["aurions","avons","avions","aurons"], "aurions", "Conditionnel passé de pouvoir"],
  ["Il ___ dû étudier.", ["aurait","a","avait","aura"], "aurait", "Conditionnel passé de devoir"],
  ["Elles ___ venues si elles avaient su.", ["seraient","sont","étaient","seront"], "seraient", "Conditionnel passé dans le 3e type conditionnel"],
],
fb: [
  ["J'___ voulu t'aider.", "aurais", "Conditionnel passé: j'aurais + p.p."],
  ["Elle ___ restée.", "serait", "Conditionnel passé: elle serait + p.p."],
  ["Nous ___ aimé partir.", "aurions", "Conditionnel passé: nous aurions + p.p."],
  ["Tu ___ pu venir.", "aurais", "Conditionnel passé: tu aurais + p.p."],
  ["Ils ___ partis ensemble.", "seraient", "Conditionnel passé: ils seraient + p.p."],
],
tr: [
  ["Я бы хотел прийти.", "J'aurais aimé venir.", ["J'aurais voulu venir."], "Conditionnel passé — сожаление"],
  ["Она бы ушла раньше.", "Elle serait partie plus tôt.", [], "Conditionnel passé avec être"],
  ["Мы могли бы это сделать.", "Nous aurions pu le faire.", [], "Conditionnel passé de pouvoir"],
  ["Ему следовало бы учиться.", "Il aurait dû étudier.", [], "Conditionnel passé de devoir — упрёк"],
  ["Они бы пришли, если бы знали.", "Ils seraient venus s'ils avaient su.", ["Elles seraient venues si elles avaient su."], "3-й тип условных"],
],
ma: [
  ["Соедините формулу с временем", [["conditionnel avoir/être + p.p.","conditionnel passé"],["futur avoir/être + p.p.","futur antérieur"],["imparfait avoir/être + p.p.","plus-que-parfait"],["subj. présent avoir/être + p.p.","subjonctif passé"]], "Составные времена"],
  ["Соедините подлежащее с avoir (cond.)", [["j'","aurais"],["tu","aurais"],["il","aurait"],["nous","aurions"]], "Avoir au conditionnel"],
  ["Соедините употребление с примером", [["сожаление","J'aurais aimé venir"],["упрёк","Tu aurais dû étudier"],["3-й тип условных","Si j'avais su, j'aurais..."],["нереализованная возможность","Il aurait pu réussir"]], "Употребление conditionnel passé"],
  ["Соедините conditionnel passé с переводом", [["j'aurais fait","я бы сделал"],["elle serait venue","она бы пришла"],["nous aurions pu","мы могли бы"],["ils auraient dû","им следовало бы"]], "Перевод conditionnel passé"],
  ["Соедините подлежащее с être (cond.)", [["je","serais"],["tu","serais"],["il","serait"],["nous","serions"]], "Être au conditionnel"],
],
},

'futur-anterieur': {
mc: [
  ["J'___ fini avant midi.", ["aurai","ai","avais","aurais"], "aurai", "Futur antérieur: futur de avoir + p.p."],
  ["Elle ___ partie quand tu arriveras.", ["sera","est","était","serait"], "sera", "Futur antérieur avec être"],
  ["Nous ___ terminé le projet.", ["aurons","avons","avions","aurions"], "aurons", "Futur antérieur: nous aurons + p.p."],
  ["Quand tu ___ lu ce livre, tu comprendras.", ["auras","as","avais","aurais"], "auras", "Futur antérieur dans une subordonnée de temps"],
  ["Ils ___ déjà mangé.", ["auront","ont","avaient","auraient"], "auront", "Futur antérieur: ils auront + p.p."],
],
fb: [
  ["J'___ fini avant ce soir.", "aurai", "Futur antérieur: j'aurai + p.p."],
  ["Elle ___ arrivée demain matin.", "sera", "Futur antérieur: elle sera + p.p."],
  ["Nous ___ compris la leçon.", "aurons", "Futur antérieur: nous aurons + p.p."],
  ["Quand tu ___ terminé, appelle-moi.", "auras", "Futur antérieur: tu auras + p.p."],
  ["Ils ___ tout mangé.", "auront", "Futur antérieur: ils auront + p.p."],
],
tr: [
  ["Я закончу до полудня.", "J'aurai fini avant midi.", [], "Futur antérieur pour une action future achevée"],
  ["Когда ты прочитаешь эту книгу, ты поймёшь.", "Quand tu auras lu ce livre, tu comprendras.", [], "Futur antérieur dans une subordonnée"],
  ["Она уже уедет, когда ты придёшь.", "Elle sera déjà partie quand tu arriveras.", [], "Futur antérieur + futur simple"],
  ["Мы закончим проект к пятнице.", "Nous aurons terminé le projet avant vendredi.", [], "Futur antérieur — до определённого момента"],
  ["Они уже поедят.", "Ils auront déjà mangé.", [], "Futur antérieur — завершённость"],
],
ma: [
  ["Соедините подлежащее с avoir (futur)", [["j'","aurai"],["tu","auras"],["il","aura"],["nous","aurons"]], "Avoir au futur simple"],
  ["Соедините подлежащее с être (futur)", [["je","serai"],["tu","seras"],["il","sera"],["nous","serons"]], "Être au futur simple"],
  ["Соедините время с употреблением", [["futur antérieur","действие до другого в будущем"],["futur simple","действие в будущем"],["passé composé","завершённое действие в прошлом"],["plus-que-parfait","действие до другого в прошлом"]], "Употребление futur antérieur"],
  ["Соедините пример с переводом", [["j'aurai fini","я закончу (до)"],["tu auras lu","ты прочитаешь (до)"],["il sera parti","он уедет (до)"],["nous aurons compris","мы поймём (до)"]], "Futur antérieur выражает предшествование в будущем"],
  ["Соедините конструкцию с правилом", [["Quand + futur antérieur","после quand в будущем"],["Dès que + futur antérieur","как только"],["Lorsque + futur antérieur","когда"],["Après que + futur antérieur","после того как"]], "Союзы с futur antérieur"],
],
},

'passe-simple': {
mc: [
  ["Il ___ la porte. (ouvrir)", ["ouvrit","ouvre","a ouvert","ouvrait"], "ouvrit", "Passé simple: 3-я группа -it"],
  ["Ils ___ en France. (aller)", ["allèrent","vont","sont allés","allaient"], "allèrent", "Passé simple: 1-я группа -èrent"],
  ["Elle ___ un livre. (écrire)", ["écrivit","écrit","a écrit","écrivait"], "écrivit", "Passé simple: écrire → écrivit"],
  ["Je ___ la vérité. (dire)", ["dis","dit","ai dit","disais"], "dis", "Passé simple: je dis (dire)"],
  ["Nous ___ contents. (être)", ["fûmes","sommes","avons été","étions"], "fûmes", "Passé simple de être: nous fûmes"],
],
fb: [
  ["Il ___ pendant des heures. (parler)", "parla", "Passé simple 1-я группа: -a"],
  ["Elles ___ au château. (arriver)", "arrivèrent", "Passé simple 1-я группа: -èrent"],
  ["Il ___ le roi. (voir)", "vit", "Passé simple de voir: il vit"],
  ["Elle ___ la lettre. (lire)", "lut", "Passé simple de lire: elle lut"],
  ["Ils ___ de la maison. (sortir)", "sortirent", "Passé simple de sortir: -irent"],
],
tr: [
  ["Он открыл дверь.", "Il ouvrit la porte.", [], "Passé simple — литературное прошедшее"],
  ["Она написала книгу.", "Elle écrivit un livre.", [], "Écrire → écrivit"],
  ["Они пошли во Францию.", "Ils allèrent en France.", [], "Aller → allèrent"],
  ["Он увидел короля.", "Il vit le roi.", [], "Voir → vit"],
  ["Она прочитала письмо.", "Elle lut la lettre.", [], "Lire → lut"],
],
ma: [
  ["Соедините инфинитив с формой passé simple (il)", [["parler","parla"],["finir","finit"],["voir","vit"],["être","fut"]], "Passé simple 3-го лица ед.ч."],
  ["Соедините инфинитив с формой passé simple (ils)", [["parler","parlèrent"],["finir","finirent"],["avoir","eurent"],["être","furent"]], "Passé simple 3-го лица мн.ч."],
  ["Соедините группу с окончанием (il)", [["-er","- a"],["-ir","-it"],["-oir","-ut / -it"],["-re","-it / -ut"]], "Окончания passé simple по группам"],
  ["Соедините passé simple с passé composé", [["il parla","il a parlé"],["elle écrivit","elle a écrit"],["ils virent","ils ont vu"],["elles furent","elles ont été"]], "Соответствие времён"],
  ["Соедините инфинитив с формой (je)", [["parler","parlai"],["finir","finis"],["avoir","eus"],["être","fus"]], "Passé simple 1-го лица"],
],
},

'subjonctif-imparfait': {
mc: [
  ["Il fallait qu'il ___.", ["parlât","parle","parlait","parlerait"], "parlât", "Subjonctif imparfait: основа passé simple + -ât"],
  ["Je voulais qu'elle ___.", ["vînt","vienne","venait","viendrait"], "vînt", "Subjonctif imparfait de venir: vînt"],
  ["Bien qu'il ___ fatigué.", ["fût","soit","était","serait"], "fût", "Subjonctif imparfait de être: fût"],
  ["Il souhaitait que nous ___.", ["finissions","finissons","avons fini","finirions"], "finissions", "Subjonctif imparfait = subj. présent для nous"],
  ["Pour qu'elles ___.", ["partissent","partent","partaient","partiraient"], "partissent", "Subjonctif imparfait: основа p.s. + -ssent"],
],
fb: [
  ["Il fallait qu'il ___ la vérité. (dire)", "dît", "Subjonctif imparfait de dire: dît"],
  ["Je voulais qu'elle ___ heureuse. (être)", "fût", "Subjonctif imparfait de être: fût"],
  ["Bien qu'il ___ du talent. (avoir)", "eût", "Subjonctif imparfait de avoir: eût"],
  ["Pour qu'il ___ le comprendre. (pouvoir)", "pût", "Subjonctif imparfait de pouvoir: pût"],
  ["Il souhaitait qu'elle ___. (venir)", "vînt", "Subjonctif imparfait de venir: vînt"],
],
tr: [
  ["Нужно было, чтобы он говорил.", "Il fallait qu'il parlât.", [], "Subjonctif imparfait — литературная форма"],
  ["Я хотел, чтобы она пришла.", "Je voulais qu'elle vînt.", [], "Subjonctif imparfait de venir"],
  ["Хотя он был усталым.", "Bien qu'il fût fatigué.", [], "Subjonctif imparfait de être"],
  ["Чтобы он мог понять.", "Pour qu'il pût comprendre.", [], "Subjonctif imparfait de pouvoir"],
  ["Он хотел, чтобы мы закончили.", "Il souhaitait que nous finissions.", [], "Subjonctif imparfait de finir"],
],
ma: [
  ["Соедините инфинитив с формой (il)", [["être","fût"],["avoir","eût"],["venir","vînt"],["dire","dît"]], "Subjonctif imparfait 3-го лица"],
  ["Соедините passé simple с subj. imparfait (il)", [["parla","parlât"],["finit","finît"],["vit","vît"],["fut","fût"]], "Образование: основа p.s. + accent circonflexe"],
  ["Соедините время с употреблением", [["subj. imparfait","литературный стиль"],["subj. présent","разговорный стиль"],["indicatif imparfait","описание прошлого"],["conditionnel","гипотеза"]], "Употребление subjonctif imparfait"],
  ["Соедините пример с формой", [["qu'il parlât","subj. imparfait"],["qu'il parle","subj. présent"],["il parlait","indicatif imparfait"],["il parlerait","conditionnel"]], "Различение форм"],
  ["Соедините лицо с окончанием", [["je","-sse"],["tu","-sses"],["il","-^t"],["nous","-ssions"]], "Окончания subjonctif imparfait"],
],
},

'ne-expletif': {
mc: [
  ["Je crains qu'il ___ soit trop tard.", ["ne","n'","pas","rien"], "ne", "Ne explétif после craindre que"],
  ["Avant qu'il ___ parte.", ["ne","n'","pas","plus"], "ne", "Ne explétif после avant que"],
  ["À moins qu'elle ___ vienne.", ["ne","n'","pas","rien"], "ne", "Ne explétif после à moins que"],
  ["Il est plus grand que je ___ pensais.", ["ne","n'","pas","le"], "ne", "Ne explétif после comparatif d'inégalité"],
  ["De peur qu'il ___ tombe.", ["ne","n'","pas","rien"], "ne", "Ne explétif après de peur que"],
],
fb: [
  ["Je crains qu'il ___ pleuve.", "ne", "Ne explétif — sans valeur négative"],
  ["Avant qu'il ___ arrive.", "n'", "N' explétif devant voyelle"],
  ["À moins que tu ___ viennes.", "ne", "Ne explétif après à moins que"],
  ["Il est plus fort que je ___ croyais.", "ne", "Ne explétif après comparatif"],
  ["De peur qu'elle ___ soit en retard.", "ne", "Ne explétif après de peur que"],
],
tr: [
  ["Я боюсь, что будет дождь.", "Je crains qu'il ne pleuve.", [], "Ne explétif после craindre"],
  ["До того, как он уйдёт.", "Avant qu'il ne parte.", [], "Ne explétif après avant que"],
  ["Если только она не придёт.", "À moins qu'elle ne vienne.", [], "Ne explétif après à moins que"],
  ["Он сильнее, чем я думал.", "Il est plus fort que je ne croyais.", ["Il est plus fort que je ne le croyais."], "Ne explétif dans la comparaison"],
  ["Из страха, что он упадёт.", "De peur qu'il ne tombe.", [], "Ne explétif après de peur que"],
],
ma: [
  ["Соедините выражение с ne explétif", [["craindre que","+ ne"],["avant que","+ ne"],["à moins que","+ ne"],["de peur que","+ ne"]], "Конструкции с ne explétif"],
  ["Соедините тип с значением ne", [["ne explétif","без отрицания"],["ne...pas","полное отрицание"],["ne...plus","больше не"],["ne...jamais","никогда"]], "Ne explétif vs ne négatif"],
  ["Соедините пример с анализом", [["Je crains qu'il ne pleuve","страх, не отрицание"],["Je ne veux pas","отрицание"],["Avant qu'il ne parte","предшествование, не отрицание"],["Il ne vient jamais","отрицание"]], "Различение ne explétif и отрицания"],
  ["Соедините фр. конструкцию с русской", [["Je crains que... ne","Боюсь, что..."],["Avant que... ne","До того как..."],["À moins que... ne","Если только не..."],["De peur que... ne","Из страха, что..."]], "Перевод конструкций с ne explétif"],
  ["Соедините правило с контекстом", [["литературный стиль","ne explétif обязателен"],["разговорный стиль","ne explétif необязателен"],["после craindre","ne explétif типичен"],["после comparatif","ne explétif в литературном стиле"]], "Уровни стиля"],
],
},

'literary-tenses': {
mc: [
  ["Il ___ la ville. (quitter, passé simple)", ["quitta","quitte","a quitté","quittait"], "quitta", "Passé simple — основное литературное время"],
  ["Quand il ___ fini, il partit. (passé antérieur)", ["eut","a","avait","aurait"], "eut", "Passé antérieur: passé simple de avoir + p.p."],
  ["Elle ___ arrivée quand il la vit. (passé antérieur)", ["fut","est","était","serait"], "fut", "Passé antérieur: passé simple de être + p.p."],
  ["Il fallait qu'il ___ la vérité. (subj. imparfait)", ["sût","sache","savait","saurait"], "sût", "Subjonctif imparfait dans le style littéraire"],
  ["Il eût ___ qu'elle vînt. (subj. plus-que-parfait)", ["fallu","falloir","faut","faudrait"], "fallu", "Subjonctif plus-que-parfait littéraire"],
],
fb: [
  ["Il ___ de la pièce. (sortir, passé simple)", "sortit", "Passé simple de sortir: il sortit"],
  ["Dès qu'il ___ fini, il s'en alla. (passé antérieur)", "eut", "Passé antérieur: eut + p.p."],
  ["Elle ___ revenue quand on l'appela. (passé antérieur)", "fut", "Passé antérieur: fut + p.p."],
  ["Il souhaita qu'on le ___. (comprendre, subj. imp.)", "comprît", "Subjonctif imparfait: comprît"],
  ["Il eût ___ mieux faire. (pouvoir, subj. pqp)", "pu", "Subjonctif plus-que-parfait: eût pu"],
],
tr: [
  ["Он покинул город.", "Il quitta la ville.", [], "Passé simple — литературный стиль"],
  ["Когда он закончил, он ушёл.", "Quand il eut fini, il partit.", [], "Passé antérieur + passé simple"],
  ["Она вернулась, когда её позвали.", "Elle fut revenue quand on l'appela.", [], "Passé antérieur littéraire"],
  ["Он вышел из комнаты.", "Il sortit de la pièce.", [], "Passé simple de sortir"],
  ["Как только он пришёл, все замолчали.", "Dès qu'il fut arrivé, tous se turent.", [], "Passé antérieur + passé simple"],
],
ma: [
  ["Соедините время с формулой", [["passé simple","основа + окончания"],["passé antérieur","p.s. avoir/être + p.p."],["subj. imparfait","основа p.s. + sse/t"],["subj. plus-que-parfait","subj. imp. avoir/être + p.p."]], "Литературные времена"],
  ["Соедините с разговорным эквивалентом", [["passé simple","passé composé"],["passé antérieur","plus-que-parfait"],["subj. imparfait","subj. présent"],["subj. pqp","subj. passé"]], "Литературное → разговорное"],
  ["Соедините пример с временем", [["il parla","passé simple"],["il eut parlé","passé antérieur"],["qu'il parlât","subj. imparfait"],["qu'il eût parlé","subj. plus-que-parfait"]], "Определение литературных времён"],
  ["Соедините инфинитив с passé simple (il)", [["dire","dit"],["écrire","écrivit"],["lire","lut"],["voir","vit"]], "Passé simple неправильных глаголов"],
  ["Соедините маркер с временем", [["Dès que + passé antérieur","предшествование"],["passé simple","основное повествование"],["subj. imparfait","подчинённое предложение"],["imparfait","описание / фон"]], "Употребление в нарративе"],
],
},

'stylistic-inversion': {
mc: [
  ["« Bonjour », ___.", ["dit-il","il dit","a-t-il dit","il a dit"], "dit-il", "Инверсия в прямой речи"],
  ["Peut-être ___-il raison.", ["a","est","va","fait"], "a", "Инверсия после peut-être"],
  ["À peine ___-il arrivé qu'il repartit.", ["fut","est","a","sera"], "fut", "Инверсия после à peine"],
  ["Aussi ___-il décidé de partir.", ["a","est","fait","va"], "a", "Инверсия после aussi (=c'est pourquoi)"],
  ["Sans doute ___-elle la vérité.", ["dit","a dit","disait","dira"], "dit", "Инверсия после sans doute"],
],
fb: [
  ["« Viens ici », ___-elle.", "dit", "Инверсия в dialogue: dit-elle"],
  ["Peut-être ___-ils tort.", "ont", "Инверсия после peut-être: ont-ils"],
  ["À peine ___-il sorti qu'il plut.", "fut", "Инверсия après à peine"],
  ["Aussi ___-nous surpris.", "fûmes", "Инверсия après aussi (littéraire)"],
  ["Encore ___-il prouver sa théorie.", "faut", "Encore faut-il — ещё нужно"],
],
tr: [
  ["« Здравствуй », — сказал он.", "« Bonjour », dit-il.", [], "Инверсия в прямой речи"],
  ["Возможно, он прав.", "Peut-être a-t-il raison.", [], "Инверсия после peut-être"],
  ["Едва он пришёл, как уехал.", "À peine fut-il arrivé qu'il repartit.", [], "Инверсия после à peine"],
  ["Поэтому он решил уехать.", "Aussi a-t-il décidé de partir.", [], "Aussi (= c'est pourquoi) + инверсия"],
  ["Без сомнения, она говорит правду.", "Sans doute dit-elle la vérité.", [], "Инверсия после sans doute"],
],
ma: [
  ["Соедините выражение с инверсией", [["Peut-être","Peut-être est-il..."],["À peine","À peine fut-il..."],["Sans doute","Sans doute a-t-il..."],["Aussi","Aussi décida-t-il..."]], "Выражения, вызывающие инверсию"],
  ["Соедините тип инверсии с примером", [["прямая речь","dit-il"],["après peut-être","peut-être viendra-t-il"],["après à peine","à peine eut-il fini"],["après aussi","aussi partit-il"]], "Типы стилистической инверсии"],
  ["Соедините порядок слов", [["обычный","Il a raison"],["инверсия","A-t-il raison"],["обычный","Elle dit la vérité"],["инверсия","dit-elle"]], "Обычный порядок vs инверсия"],
  ["Соедините вставку -t- с правилом", [["a-t-il","между a и il"],["dit-il","не нужна (dit заканчивается на t)"],["parle-t-elle","между parle и elle"],["peut-être est-il","не нужна"]], "Когда вставлять euphonique -t-"],
  ["Соедините стиль с регистром", [["инверсия после peut-être","литературный"],["peut-être que + обычный порядок","разговорный"],["dit-il","стандартный нарратив"],["il a dit","разговорный нарратив"]], "Уровень языка"],
],
},
}

// Build exercises array
const exercises = []
const typeMap = { mc: 'multiple_choice', fb: 'fill_blank', tr: 'translate', ma: 'matching' }

for (const topic of topics) {
  const topicData = data[topic.id]
  if (!topicData) {
    console.error(`Missing data for topic: ${topic.id}`)
    continue
  }
  const lvl = topic.level.toLowerCase()

  for (const [typeKey, items] of Object.entries(topicData)) {
    const exType = typeMap[typeKey]
    items.forEach((item, i) => {
      const num = String(i + 1).padStart(2, '0')
      const id = `${lvl}-${topic.id}-${typeKey}-${num}`
      const base = { id, topicId: topic.id, level: topic.level, type: exType }

      if (typeKey === 'mc') {
        exercises.push({ ...base, question: item[0], options: item[1], correctAnswer: item[2], explanation: item[3] })
      } else if (typeKey === 'fb') {
        exercises.push({ ...base, question: item[0], correctAnswer: item[1], explanation: item[2] })
      } else if (typeKey === 'tr') {
        const obj = { ...base, question: item[0], correctAnswer: item[1], explanation: item[3] }
        if (item[2] && item[2].length > 0) obj.acceptableAnswers = item[2]
        exercises.push(obj)
      } else if (typeKey === 'ma') {
        exercises.push({
          ...base,
          instruction: item[0],
          pairs: item[1].map(p => ({ left: p[0], right: p[1] })),
          explanation: item[2],
        })
      }
    })
  }
}

const result = { topics, exercises }
const outPath = process.argv[2] || 'src/data/exercises-fr.json'
writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
console.log(`Written ${exercises.length} exercises for ${topics.length} topics to ${outPath}`)
