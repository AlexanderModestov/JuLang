import { writeFileSync } from 'fs'

const topics = [
  { id: 'definite-article', name: 'Определённый артикль', level: 'A1' },
  { id: 'indefinite-articles', name: 'Неопределённые артикли', level: 'A1' },
  { id: 'to-be', name: 'Глагол to be', level: 'A1' },
  { id: 'present-simple', name: 'Present Simple', level: 'A1' },
  { id: 'personal-pronouns', name: 'Личные местоимения', level: 'A1' },
  { id: 'negation', name: 'Отрицание', level: 'A1' },
  { id: 'adjective-order', name: 'Порядок прилагательных', level: 'A1' },
  { id: 'present-continuous', name: 'Present Continuous', level: 'A2' },
  { id: 'past-simple', name: 'Past Simple', level: 'A2' },
  { id: 'present-perfect', name: 'Present Perfect', level: 'A2' },
  { id: 'object-pronouns', name: 'Объектные местоимения', level: 'A2' },
  { id: 'possessive-adjectives', name: 'Притяжательные прилагательные', level: 'A2' },
  { id: 'future-will', name: 'Future с will', level: 'A2' },
  { id: 'comparative', name: 'Сравнительная степень', level: 'B1' },
  { id: 'superlative', name: 'Превосходная степень', level: 'B1' },
  { id: 'relative-clauses', name: 'Relative clauses', level: 'B1' },
  { id: 'past-continuous', name: 'Past Continuous', level: 'B1' },
  { id: 'first-conditional', name: '1st conditional', level: 'B1' },
  { id: 'passive-voice', name: 'Passive voice', level: 'B1' },
  { id: 'second-conditional', name: '2nd conditional', level: 'B2' },
  { id: 'third-conditional', name: '3rd conditional', level: 'B2' },
  { id: 'reported-speech', name: 'Reported speech', level: 'B2' },
  { id: 'past-perfect', name: 'Past Perfect', level: 'B2' },
  { id: 'future-perfect', name: 'Future Perfect', level: 'B2' },
  { id: 'inversion', name: 'Инверсия', level: 'C1' },
  { id: 'subjunctive', name: 'Subjunctive', level: 'C1' },
  { id: 'cleft-sentences', name: 'Cleft sentences', level: 'C2' },
  { id: 'ellipsis', name: 'Эллипсис', level: 'C2' },
]

const data = {
'definite-article': {
mc: [
  ["I go to ___ school every day.", ["a","an","the","—"], "the", "The используется с конкретными, известными объектами"],
  ["___ sun is shining.", ["A","An","The","—"], "The", "The перед уникальными объектами"],
  ["She plays ___ piano.", ["a","an","the","—"], "the", "The перед музыкальными инструментами"],
  ["___ children are in the garden.", ["A","An","The","—"], "The", "The — конкретные дети (известные из контекста)"],
  ["He is ___ best student.", ["a","an","the","—"], "the", "The перед превосходной степенью"],
],
fb: [
  ["___ moon is beautiful tonight.", "The", "The перед уникальными объектами"],
  ["___ book on the table is mine.", "The", "The — конкретная книга"],
  ["___ United Kingdom is in Europe.", "The", "The перед некоторыми странами"],
  ["She is ___ tallest girl in class.", "the", "The перед превосходной степенью"],
  ["___ water in this glass is cold.", "The", "The — конкретная вода"],
],
tr: [
  ["Книга на столе.", "The book is on the table.", [], "The для определённого предмета"],
  ["Солнце светит.", "The sun is shining.", [], "The перед уникальными объектами"],
  ["Дети в саду.", "The children are in the garden.", [], "The — конкретные дети"],
  ["Она лучшая ученица.", "She is the best student.", [], "The перед превосходной степенью"],
  ["Луна красивая сегодня.", "The moon is beautiful tonight.", ["The moon is beautiful today."], "The перед уникальными объектами"],
],
ma: [
  ["Соедините правило с примером", [["уникальный объект","the sun"],["известный из контекста","the book (on the table)"],["превосходная степень","the best"],["музыкальный инструмент","the piano"]], "Когда используется the"],
  ["Соедините с артиклем", [["___ moon","the"],["___ apple (любое)","an"],["___ boy (любой)","a"],["___ best film","the"]], "Выбор артикля"],
  ["Соедините артикль с функцией", [["the","определённый"],["a/an","неопределённый"],["— (нулевой)","общее понятие"],["the","единственный в своём роде"]], "Функции артиклей"],
  ["Соедините предложение с правилом", [["The Volga is long","реки"],["The UK","некоторые страны"],["The Atlantic","океаны"],["The Alps","горные цепи"]], "The с географическими названиями"],
  ["Соедините с правильным артиклем", [["___ earth","the"],["___ sky","the"],["___ cat (мой)","the"],["___ cats (вообще)","—"]], "The vs нулевой артикль"],
],
},

'indefinite-articles': {
mc: [
  ["I have ___ cat.", ["a","an","the","—"], "a", "A перед согласным звуком"],
  ["She is ___ engineer.", ["a","an","the","—"], "an", "An перед гласным звуком"],
  ["He bought ___ umbrella.", ["a","an","the","—"], "an", "An перед гласным звуком (umbrella)"],
  ["This is ___ university.", ["a","an","the","—"], "a", "A перед /juː/ (university)"],
  ["I saw ___ hour ago.", ["a","an","the","—"], "an", "An перед немым h (hour)"],
],
fb: [
  ["I need ___ pen.", "a", "A перед согласным"],
  ["She is ___ actress.", "an", "An перед гласным"],
  ["He is ___ honest man.", "an", "An перед немым h"],
  ["I want ___ new phone.", "a", "A перед согласным"],
  ["It was ___ easy question.", "an", "An перед гласным"],
],
tr: [
  ["У меня есть кошка.", "I have a cat.", [], "A — неопределённый артикль"],
  ["Она инженер.", "She is an engineer.", [], "An перед гласным звуком"],
  ["Он купил зонтик.", "He bought an umbrella.", [], "An перед гласным"],
  ["Это хороший фильм.", "It is a good film.", ["It's a good movie."], "A перед согласным"],
  ["Мне нужна ручка.", "I need a pen.", [], "A перед согласным"],
],
ma: [
  ["Соедините с a или an", [["___ cat","a"],["___ apple","an"],["___ university","a"],["___ hour","an"]], "A/an зависит от звука, не буквы"],
  ["Соедините правило с примером", [["перед согласным звуком","a dog"],["перед гласным звуком","an egg"],["перед /juː/","a uniform"],["перед немым h","an hour"]], "Правила выбора a/an"],
  ["Соедините с правильным артиклем", [["___ European","a"],["___ umbrella","an"],["___ honest person","an"],["___ book","a"]], "A/an: звук, а не буква"],
  ["Соедините функцию с артиклем", [["один из многих","a/an"],["конкретный","the"],["впервые упоминается","a/an"],["профессия","a/an"]], "Функции a/an vs the"],
  ["Соедините предложение с артиклем", [["I am ___ teacher","a"],["She has ___ idea","an"],["It is ___ old house","an"],["He is ___ student","a"]], "Практика a/an"],
],
},

'to-be': {
mc: [
  ["I ___ a student.", ["am","is","are","be"], "am", "I am"],
  ["She ___ happy.", ["am","is","are","be"], "is", "She is"],
  ["They ___ at school.", ["am","is","are","be"], "are", "They are"],
  ["We ___ friends.", ["am","is","are","be"], "are", "We are"],
  ["It ___ cold today.", ["am","is","are","be"], "is", "It is"],
],
fb: [
  ["I ___ from Russia.", "am", "I am"],
  ["He ___ a doctor.", "is", "He is"],
  ["You ___ very kind.", "are", "You are"],
  ["The cats ___ black.", "are", "Множественное число + are"],
  ["She ___ my sister.", "is", "She is"],
],
tr: [
  ["Я студент.", "I am a student.", ["I'm a student."], "I am = I'm"],
  ["Она счастлива.", "She is happy.", ["She's happy."], "She is = She's"],
  ["Они в школе.", "They are at school.", ["They're at school."], "They are = They're"],
  ["Мы друзья.", "We are friends.", ["We're friends."], "We are = We're"],
  ["Сегодня холодно.", "It is cold today.", ["It's cold today."], "It is = It's"],
],
ma: [
  ["Соедините местоимение с формой to be", [["I","am"],["he/she/it","is"],["you","are"],["we/they","are"]], "Формы to be в Present Simple"],
  ["Соедините сокращение с полной формой", [["I'm","I am"],["he's","he is"],["they're","they are"],["we're","we are"]], "Сокращённые формы to be"],
  ["Соедините отрицание с формой", [["I","am not"],["he","is not / isn't"],["they","are not / aren't"],["she","is not / isn't"]], "Отрицание to be"],
  ["Соедините вопрос с ответом", [["Am I late?","Yes, you are"],["Is she here?","Yes, she is"],["Are they ready?","Yes, they are"],["Is it cold?","Yes, it is"]], "Вопросы с to be"],
  ["Соедините предложение с переводом", [["I am happy","Я счастлив"],["She is a teacher","Она учитель"],["We are here","Мы здесь"],["It is late","Уже поздно"]], "Перевод предложений с to be"],
],
},

'present-simple': {
mc: [
  ["She ___ to school every day.", ["go","goes","going","gone"], "goes", "3-е лицо ед.ч.: +s"],
  ["They ___ football on Sundays.", ["play","plays","playing","played"], "play", "They + глагол без -s"],
  ["He ___ coffee in the morning.", ["drink","drinks","drinking","drank"], "drinks", "He + глагол + s"],
  ["I ___ English.", ["speak","speaks","speaking","spoke"], "speak", "I + глагол без -s"],
  ["The cat ___ fish.", ["like","likes","liking","liked"], "likes", "3-е лицо ед.ч.: like → likes"],
],
fb: [
  ["She ___ her homework every day. (do)", "does", "3-е лицо: do → does"],
  ["We ___ to the cinema on Fridays. (go)", "go", "We + глагол без -s"],
  ["He ___ in London. (live)", "lives", "He + live → lives"],
  ["I ___ breakfast at 8. (have)", "have", "I + have"],
  ["They ___ English well. (speak)", "speak", "They + speak"],
],
tr: [
  ["Она ходит в школу каждый день.", "She goes to school every day.", [], "3-е лицо: go → goes"],
  ["Я говорю по-английски.", "I speak English.", [], "I + глагол без -s"],
  ["Они играют в футбол.", "They play football.", [], "They + глагол без -s"],
  ["Он пьёт кофе утром.", "He drinks coffee in the morning.", [], "He + drink → drinks"],
  ["Мы живём в Москве.", "We live in Moscow.", [], "We + live"],
],
ma: [
  ["Соедините местоимение с формой", [["I/you/we/they","play"],["he/she/it","plays"],["I","speak"],["she","speaks"]], "Окончание -s в 3-м лице ед.ч."],
  ["Соедините глагол с формой 3-го лица", [["go","goes"],["do","does"],["have","has"],["watch","watches"]], "Особые формы 3-го лица"],
  ["Соедините маркер с временем", [["every day","Present Simple"],["always","Present Simple"],["usually","Present Simple"],["now","Present Continuous"]], "Маркеры Present Simple"],
  ["Соедините предложение с переводом", [["I work","Я работаю"],["She studies","Она учится"],["We live here","Мы живём здесь"],["He reads books","Он читает книги"]], "Present Simple в переводе"],
  ["Соедините утверждение с вопросом", [["She works","Does she work?"],["They play","Do they play?"],["He lives","Does he live?"],["I know","Do I know?"]], "Вопросы в Present Simple"],
],
},

'personal-pronouns': {
mc: [
  ["___ am a teacher.", ["I","Me","My","Mine"], "I", "I — подлежащее"],
  ["___ is very tall.", ["He","Him","His","He's"], "He", "He — подлежащее"],
  ["___ are my friends.", ["They","Them","Their","Theirs"], "They", "They — подлежащее"],
  ["___ live in Moscow.", ["We","Us","Our","Ours"], "We", "We — подлежащее"],
  ["___ plays the guitar.", ["She","Her","Hers","She's"], "She", "She — подлежащее"],
],
fb: [
  ["___ am from Russia.", "I", "I — подлежащее 1-го лица"],
  ["___ is a doctor.", "He", "He — подлежащее 3-го лица м.р. (или She)"],
  ["___ are students.", "They", "They — подлежащее 3-го лица мн.ч."],
  ["___ are happy.", "We", "We — подлежащее 1-го лица мн.ч."],
  ["___ is my cat.", "It", "It — подлежащее для неодушевлённых/животных"],
],
tr: [
  ["Я учитель.", "I am a teacher.", ["I'm a teacher."], "I — я"],
  ["Он высокий.", "He is tall.", ["He's tall."], "He — он"],
  ["Они мои друзья.", "They are my friends.", ["They're my friends."], "They — они"],
  ["Мы счастливы.", "We are happy.", ["We're happy."], "We — мы"],
  ["Она играет на гитаре.", "She plays the guitar.", [], "She — она"],
],
ma: [
  ["Соедините местоимение с переводом", [["I","я"],["you","ты/вы"],["he","он"],["she","она"]], "Личные местоимения"],
  ["Соедините местоимение с переводом", [["it","оно"],["we","мы"],["they","они"],["you","ты/вы"]], "Все личные местоимения"],
  ["Соедините местоимение с формой to be", [["I","am"],["he/she/it","is"],["we/they","are"],["you","are"]], "To be + местоимения"],
  ["Соедините лицо с местоимением", [["1-е ед.ч.","I"],["2-е","you"],["3-е м.р.","he"],["3-е ж.р.","she"]], "Лица и числа"],
  ["Соедините субъектное с объектным", [["I","me"],["he","him"],["she","her"],["they","them"]], "Субъектные и объектные местоимения"],
],
},

'negation': {
mc: [
  ["She ___ like coffee.", ["don't","doesn't","isn't","aren't"], "doesn't", "3-е лицо: doesn't + инфинитив"],
  ["They ___ go to school on Sundays.", ["don't","doesn't","isn't","aren't"], "don't", "They + don't"],
  ["He ___ a teacher.", ["don't","doesn't","isn't","aren't"], "isn't", "He is not = isn't"],
  ["I ___ understand.", ["don't","doesn't","isn't","aren't"], "don't", "I + don't"],
  ["We ___ ready yet.", ["don't","doesn't","isn't","aren't"], "aren't", "We are not = aren't"],
],
fb: [
  ["She ___ speak French.", "doesn't", "3-е лицо: doesn't + инфинитив"],
  ["They ___ want to go.", "don't", "They + don't"],
  ["I ___ like this film.", "don't", "I + don't"],
  ["He ___ here today.", "isn't", "He is not → isn't"],
  ["We ___ have time.", "don't", "We + don't"],
],
tr: [
  ["Она не любит кофе.", "She doesn't like coffee.", ["She does not like coffee."], "Doesn't + инфинитив"],
  ["Я не понимаю.", "I don't understand.", ["I do not understand."], "Don't + инфинитив"],
  ["Они не играют.", "They don't play.", ["They do not play."], "Don't для мн.ч."],
  ["Он не учитель.", "He isn't a teacher.", ["He is not a teacher.","He's not a teacher."], "Isn't = is not"],
  ["Мы не готовы.", "We aren't ready.", ["We are not ready.","We're not ready."], "Aren't = are not"],
],
ma: [
  ["Соедините местоимение с отрицанием (Present Simple)", [["I/you/we/they","don't + verb"],["he/she/it","doesn't + verb"],["I","am not"],["he/she/it","isn't"]], "Отрицание в Present Simple"],
  ["Соедините полную форму с сокращённой", [["do not","don't"],["does not","doesn't"],["is not","isn't"],["are not","aren't"]], "Сокращённые формы отрицания"],
  ["Соедините утверждение с отрицанием", [["She likes","She doesn't like"],["They go","They don't go"],["He is","He isn't"],["We have","We don't have"]], "Трансформация в отрицание"],
  ["Соедините вспомогательный с местоимением", [["don't","I/you/we/they"],["doesn't","he/she/it"],["isn't","he/she/it"],["aren't","we/you/they"]], "Выбор вспомогательного"],
  ["Соедините предложение с переводом", [["I don't know","Я не знаю"],["She doesn't work","Она не работает"],["They aren't here","Их нет здесь"],["He isn't ready","Он не готов"]], "Перевод отрицаний"],
],
},

'adjective-order': {
mc: [
  ["She has a ___ dress.", ["beautiful red silk","red beautiful silk","silk red beautiful","red silk beautiful"], "beautiful red silk", "Порядок: мнение + цвет + материал"],
  ["It's a ___ house.", ["big old stone","old big stone","stone big old","big stone old"], "big old stone", "Порядок: размер + возраст + материал"],
  ["He drives a ___ car.", ["small Japanese blue","small blue Japanese","blue small Japanese","Japanese blue small"], "small blue Japanese", "Порядок: размер + цвет + происхождение"],
  ["I bought a ___ table.", ["round wooden large","large round wooden","wooden large round","large wooden round"], "large round wooden", "Порядок: размер + форма + материал"],
  ["She wore a ___ hat.", ["lovely little black","black little lovely","little lovely black","little black lovely"], "lovely little black", "Порядок: мнение + размер + цвет"],
],
fb: [
  ["It's a ___ (Italian / old / beautiful) car.", "beautiful old Italian", "Мнение + возраст + происхождение"],
  ["She has ___ (blue / big / beautiful) eyes.", "beautiful big blue", "Мнение + размер + цвет"],
  ["He lives in a ___ (white / small / lovely) house.", "lovely small white", "Мнение + размер + цвет"],
  ["I bought a ___ (wooden / round / small) table.", "small round wooden", "Размер + форма + материал"],
  ["She wore a ___ (silk / long / red) dress.", "long red silk", "Размер + цвет + материал"],
],
tr: [
  ["У неё красивое красное шёлковое платье.", "She has a beautiful red silk dress.", [], "Мнение + цвет + материал"],
  ["Это большой старый каменный дом.", "It's a big old stone house.", ["It is a big old stone house."], "Размер + возраст + материал"],
  ["Он водит маленькую синюю японскую машину.", "He drives a small blue Japanese car.", [], "Размер + цвет + происхождение"],
  ["Я купил большой круглый деревянный стол.", "I bought a large round wooden table.", [], "Размер + форма + материал"],
  ["У неё красивые большие голубые глаза.", "She has beautiful big blue eyes.", [], "Мнение + размер + цвет"],
],
ma: [
  ["Соедините категорию с порядком", [["1. мнение","beautiful, lovely"],["2. размер","big, small"],["3. возраст","old, new"],["4. цвет","red, blue"]], "Порядок прилагательных: OSASCOMP"],
  ["Соедините категорию с порядком", [["5. происхождение","French, Japanese"],["6. материал","wooden, silk"],["7. назначение","sleeping (bag)"],["1. мнение","nice, ugly"]], "Продолжение порядка"],
  ["Соедините с правильным порядком", [["big + red","a big red ball"],["old + wooden","an old wooden chair"],["small + French","a small French café"],["beautiful + long","a beautiful long river"]], "Практика порядка"],
  ["Соедините прилагательное с категорией", [["beautiful","мнение"],["small","размер"],["old","возраст"],["red","цвет"]], "Определение категории прилагательного"],
  ["Соедините прилагательное с категорией", [["Japanese","происхождение"],["wooden","материал"],["round","форма"],["lovely","мнение"]], "Определение категории"],
],
},

'present-continuous': {
mc: [
  ["She ___ now.", ["is reading","reads","read","has read"], "is reading", "Present Continuous: am/is/are + -ing"],
  ["They ___ football at the moment.", ["are playing","play","played","have played"], "are playing", "Are + playing"],
  ["I ___ to music right now.", ["am listening","listen","listened","have listened"], "am listening", "Am + listening"],
  ["He ___ dinner now.", ["is cooking","cooks","cooked","has cooked"], "is cooking", "Is + cooking"],
  ["We ___ for the bus.", ["are waiting","wait","waited","have waited"], "are waiting", "Are + waiting"],
],
fb: [
  ["She ___ TV now. (watch)", "is watching", "Is + watching"],
  ["They ___ in the park. (run)", "are running", "Are + running (удвоение n)"],
  ["I ___ a book. (read)", "am reading", "Am + reading"],
  ["He ___ to work. (drive)", "is driving", "Is + driving"],
  ["We ___ lunch. (have)", "are having", "Are + having"],
],
tr: [
  ["Она сейчас читает.", "She is reading now.", ["She's reading now."], "Present Continuous для действия сейчас"],
  ["Они играют в футбол.", "They are playing football.", ["They're playing football."], "Are + playing"],
  ["Я слушаю музыку.", "I am listening to music.", ["I'm listening to music."], "Am + listening"],
  ["Он готовит ужин.", "He is cooking dinner.", ["He's cooking dinner."], "Is + cooking"],
  ["Мы ждём автобус.", "We are waiting for the bus.", ["We're waiting for the bus."], "Are + waiting"],
],
ma: [
  ["Соедините местоимение с am/is/are", [["I","am"],["he/she/it","is"],["you/we/they","are"],["she","is"]], "Вспомогательный глагол в Present Continuous"],
  ["Соедините маркер с временем", [["now","Present Continuous"],["at the moment","Present Continuous"],["every day","Present Simple"],["always","Present Simple"]], "Маркеры Present Continuous"],
  ["Соедините инфинитив с -ing формой", [["run","running"],["write","writing"],["swim","swimming"],["make","making"]], "Образование -ing формы"],
  ["Соедините предложение с переводом", [["I am reading","Я читаю (сейчас)"],["She is sleeping","Она спит (сейчас)"],["They are working","Они работают (сейчас)"],["He is eating","Он ест (сейчас)"]], "Present Continuous в переводе"],
  ["Соедините утверждение с вопросом", [["She is reading","Is she reading?"],["They are playing","Are they playing?"],["He is working","Is he working?"],["I am late","Am I late?"]], "Вопросы в Present Continuous"],
],
},

'past-simple': {
mc: [
  ["I ___ to school yesterday.", ["went","go","gone","going"], "went", "Go → went (неправильный глагол)"],
  ["She ___ a book last week.", ["read","reads","reading","has read"], "read", "Read → read (Past Simple)"],
  ["They ___ football yesterday.", ["played","play","playing","have played"], "played", "Play → played (правильный)"],
  ["He ___ home early.", ["came","come","comes","coming"], "came", "Come → came"],
  ["We ___ dinner at 7.", ["had","have","has","having"], "had", "Have → had"],
],
fb: [
  ["She ___ her homework yesterday. (do)", "did", "Do → did"],
  ["I ___ the film last night. (watch)", "watched", "Watch → watched (правильный)"],
  ["They ___ to Paris last summer. (go)", "went", "Go → went"],
  ["He ___ a new car. (buy)", "bought", "Buy → bought"],
  ["We ___ a great time. (have)", "had", "Have → had"],
],
tr: [
  ["Я ходил в школу вчера.", "I went to school yesterday.", [], "Go → went"],
  ["Она прочитала книгу.", "She read a book.", [], "Read → read (произносится /red/)"],
  ["Они играли в футбол.", "They played football.", [], "Play → played"],
  ["Он пришёл домой рано.", "He came home early.", [], "Come → came"],
  ["Мы хорошо провели время.", "We had a great time.", [], "Have → had"],
],
ma: [
  ["Соедините инфинитив с Past Simple", [["go","went"],["come","came"],["see","saw"],["take","took"]], "Неправильные глаголы"],
  ["Соедините инфинитив с Past Simple", [["buy","bought"],["make","made"],["write","wrote"],["eat","ate"]], "Неправильные глаголы (2)"],
  ["Соедините маркер с временем", [["yesterday","Past Simple"],["last week","Past Simple"],["ago","Past Simple"],["every day","Present Simple"]], "Маркеры Past Simple"],
  ["Соедините утверждение с вопросом", [["She went","Did she go?"],["He played","Did he play?"],["They came","Did they come?"],["I saw","Did I see?"]], "Вопросы в Past Simple"],
  ["Соедините правильный глагол с формой", [["work","worked"],["play","played"],["stop","stopped"],["study","studied"]], "Правильные глаголы в Past Simple"],
],
},

'present-perfect': {
mc: [
  ["I ___ this film.", ["have seen","saw","see","am seeing"], "have seen", "Present Perfect: have + past participle"],
  ["She ___ to Paris.", ["has been","was","is","goes"], "has been", "She has been"],
  ["They ___ their homework.", ["have finished","finished","finish","are finishing"], "have finished", "They have finished"],
  ["He ___ here since 2020.", ["has lived","lived","lives","is living"], "has lived", "Since + Present Perfect"],
  ["We ___ eaten lunch yet.", ["haven't","didn't","don't","aren't"], "haven't", "Haven't + past participle"],
],
fb: [
  ["I ___ never ___ sushi. (eat)", "have eaten", "Have + past participle"],
  ["She ___ just ___ home. (come)", "has come", "Has + past participle"],
  ["They ___ ___ here for 5 years. (live)", "have lived", "Have + past participle"],
  ["He ___ already ___ the book. (read)", "has read", "Has + past participle"],
  ["We ___ ___ this film before. (see)", "have seen", "Have + past participle"],
],
tr: [
  ["Я видел этот фильм.", "I have seen this film.", ["I've seen this film.","I have seen this movie."], "Present Perfect для опыта"],
  ["Она была в Париже.", "She has been to Paris.", ["She's been to Paris."], "Has been — опыт"],
  ["Они закончили домашнее задание.", "They have finished their homework.", ["They've finished their homework."], "Have finished — результат"],
  ["Он живёт здесь с 2020 года.", "He has lived here since 2020.", ["He's lived here since 2020."], "Since + Present Perfect"],
  ["Мы ещё не ели.", "We haven't eaten yet.", ["We have not eaten yet."], "Haven't + yet"],
],
ma: [
  ["Соедините маркер с Present Perfect", [["already","have already done"],["just","has just arrived"],["yet","haven't done yet"],["never","have never been"]], "Маркеры Present Perfect"],
  ["Соедините инфинитив с past participle", [["go","gone"],["see","seen"],["do","done"],["eat","eaten"]], "Past participles неправильных глаголов"],
  ["Соедините местоимение с have/has", [["I/you/we/they","have"],["he/she/it","has"],["I","have"],["she","has"]], "Have или has"],
  ["Соедините время с употреблением", [["Present Perfect","результат в настоящем"],["Past Simple","завершённое действие в прошлом"],["Present Perfect","опыт"],["Past Simple","конкретное время в прошлом"]], "Present Perfect vs Past Simple"],
  ["Соедините предложение с переводом", [["I have done","Я сделал (результат)"],["She has gone","Она ушла (результат)"],["They have lived","Они жили/живут"],["He has seen","Он видел (опыт)"]], "Перевод Present Perfect"],
],
},

'object-pronouns': {
mc: [
  ["I can see ___.", ["he","him","his","he's"], "him", "Him — объектное местоимение (he → him)"],
  ["She told ___ a story.", ["I","me","my","mine"], "me", "Me — объектное местоимение (I → me)"],
  ["Give ___ the book.", ["she","her","hers","she's"], "her", "Her — объектное местоимение (she → her)"],
  ["I like ___.", ["they","them","their","theirs"], "them", "Them — объектное местоимение (they → them)"],
  ["Can you help ___?", ["we","us","our","ours"], "us", "Us — объектное местоимение (we → us)"],
],
fb: [
  ["Please call ___. (I)", "me", "I → me"],
  ["I saw ___ at the park. (she)", "her", "She → her"],
  ["Tell ___ the truth. (he)", "him", "He → him"],
  ["I gave ___ a present. (they)", "them", "They → them"],
  ["She loves ___. (we)", "us", "We → us"],
],
tr: [
  ["Я могу его видеть.", "I can see him.", [], "He → him"],
  ["Она рассказала мне историю.", "She told me a story.", [], "I → me"],
  ["Дай ей книгу.", "Give her the book.", [], "She → her"],
  ["Я люблю их.", "I like them.", ["I love them."], "They → them"],
  ["Ты можешь нам помочь?", "Can you help us?", [], "We → us"],
],
ma: [
  ["Соедините субъектное с объектным", [["I","me"],["he","him"],["she","her"],["we","us"]], "Субъектные → объектные местоимения"],
  ["Соедините субъектное с объектным", [["they","them"],["you","you"],["it","it"],["he","him"]], "Местоимения (2)"],
  ["Соедините предложение с местоимением", [["I see (him/he)","him"],["Tell (she/her)","her"],["Give (I/me) the book","me"],["Help (they/them)","them"]], "Выбор объектного местоимения"],
  ["Соедините функцию с падежом", [["подлежащее","I, he, she"],["дополнение","me, him, her"],["после предлога","with him, for her"],["после глагола","see them, tell us"]], "Позиция объектных местоимений"],
  ["Соедините пример с переводом", [["Tell me","Скажи мне"],["Give him","Дай ему"],["Help her","Помоги ей"],["Call us","Позвони нам"]], "Перевод"],
],
},

'possessive-adjectives': {
mc: [
  ["This is ___ book.", ["I","me","my","mine"], "my", "My — притяжательное прилагательное (I)"],
  ["She loves ___ cat.", ["she","her","hers","she's"], "her", "Her — притяжательное (she)"],
  ["They like ___ house.", ["they","them","their","theirs"], "their", "Their — притяжательное (they)"],
  ["He forgot ___ keys.", ["he","him","his","he's"], "his", "His — притяжательное (he)"],
  ["We love ___ country.", ["we","us","our","ours"], "our", "Our — притяжательное (we)"],
],
fb: [
  ["This is ___ pen. (I)", "my", "I → my"],
  ["She likes ___ teacher. (she)", "her", "She → her"],
  ["They sold ___ car. (they)", "their", "They → their"],
  ["He lost ___ phone. (he)", "his", "He → his"],
  ["___ name is Anna. (she)", "Her", "She → Her"],
],
tr: [
  ["Это моя книга.", "This is my book.", ["It's my book.","It is my book."], "I → my"],
  ["Она любит свою кошку.", "She loves her cat.", [], "She → her"],
  ["Им нравится их дом.", "They like their house.", [], "They → their"],
  ["Он забыл свои ключи.", "He forgot his keys.", [], "He → his"],
  ["Мы любим нашу страну.", "We love our country.", [], "We → our"],
],
ma: [
  ["Соедините местоимение с притяжательным", [["I","my"],["you","your"],["he","his"],["she","her"]], "Притяжательные прилагательные"],
  ["Соедините местоимение с притяжательным", [["it","its"],["we","our"],["they","their"],["you","your"]], "Притяжательные (2)"],
  ["Соедините притяжательное с местоимением", [["my","mine"],["your","yours"],["his","his"],["her","hers"]], "Притяжательные прилагательные vs местоимения"],
  ["Соедините предложение с переводом", [["my book","моя книга"],["his car","его машина"],["their house","их дом"],["our city","наш город"]], "Перевод притяжательных"],
  ["Соедините ошибку с правильным вариантом", [["it's (принадлежность)","its"],["your (ты есть)","you're"],["their (они есть)","they're"],["its (оно есть)","it's"]], "its vs it's, your vs you're"],
],
},

'future-will': {
mc: [
  ["I ___ help you.", ["will","am","do","have"], "will", "Will + инфинитив для будущего"],
  ["She ___ come tomorrow.", ["will","is","does","has"], "will", "Will для всех лиц"],
  ["They ___ not agree.", ["will","are","do","have"], "will", "Will not = won't"],
  ["It ___ rain tomorrow.", ["will","is","does","has"], "will", "Will для предсказаний"],
  ["We ___ see you later.", ["will","are","do","have"], "will", "Will для обещаний"],
],
fb: [
  ["I ___ call you later.", "will", "Will + инфинитив"],
  ["She ___ be here at 5.", "will", "Will для будущего"],
  ["They ___ not come. (сокращённо)", "won't", "Will not = won't"],
  ["It ___ be sunny tomorrow.", "will", "Will для прогноза"],
  ["We ___ help them.", "will", "Will для решения"],
],
tr: [
  ["Я тебе помогу.", "I will help you.", ["I'll help you."], "Will + инфинитив"],
  ["Она придёт завтра.", "She will come tomorrow.", ["She'll come tomorrow."], "Will для будущего"],
  ["Они не согласятся.", "They will not agree.", ["They won't agree."], "Won't = will not"],
  ["Завтра будет дождь.", "It will rain tomorrow.", ["It'll rain tomorrow."], "Will для предсказаний"],
  ["Мы увидимся позже.", "We will see you later.", ["We'll see you later."], "Will для обещаний"],
],
ma: [
  ["Соедините сокращение с полной формой", [["I'll","I will"],["won't","will not"],["she'll","she will"],["they'll","they will"]], "Сокращения с will"],
  ["Соедините употребление с примером", [["обещание","I will help you"],["предсказание","It will rain"],["решение","I'll have coffee"],["предложение","I'll carry your bag"]], "Употребление will"],
  ["Соедините утверждение с вопросом", [["She will come","Will she come?"],["They will help","Will they help?"],["It will rain","Will it rain?"],["He will go","Will he go?"]], "Вопросы с will"],
  ["Соедините предложение с переводом", [["I will go","Я пойду"],["She will call","Она позвонит"],["They won't come","Они не придут"],["We will see","Мы увидим"]], "Перевод с will"],
  ["Соедините время с маркером", [["will","tomorrow"],["will","next week"],["will","in the future"],["Present Simple","every day"]], "Маркеры будущего времени"],
],
},

'comparative': {
mc: [
  ["She is ___ than her sister.", ["taller","more tall","tallest","most tall"], "taller", "Короткие прилагательные: + -er"],
  ["This book is ___ than that one.", ["more interesting","interestinger","most interesting","interesting"], "more interesting", "Длинные прилагательные: more + adj"],
  ["He runs ___ than me.", ["faster","more fast","fastest","most fast"], "faster", "Fast → faster"],
  ["This film is ___ than the last one.", ["better","gooder","more good","best"], "better", "Good → better (неправильное)"],
  ["Today is ___ than yesterday.", ["worse","badder","more bad","worst"], "worse", "Bad → worse (неправильное)"],
],
fb: [
  ["She is ___ than her brother. (tall)", "taller", "Tall → taller"],
  ["This is ___ than I expected. (difficult)", "more difficult", "More + difficult"],
  ["He is ___ than his father. (strong)", "stronger", "Strong → stronger"],
  ["This test is ___ than the last. (easy)", "easier", "Easy → easier"],
  ["She sings ___ than me. (good)", "better", "Good → better"],
],
tr: [
  ["Она выше своей сестры.", "She is taller than her sister.", [], "Tall → taller + than"],
  ["Эта книга интереснее.", "This book is more interesting.", ["This book is more interesting than that one."], "More + interesting"],
  ["Он бегает быстрее меня.", "He runs faster than me.", [], "Fast → faster"],
  ["Этот фильм лучше.", "This film is better.", ["This movie is better."], "Good → better"],
  ["Сегодня хуже, чем вчера.", "Today is worse than yesterday.", [], "Bad → worse"],
],
ma: [
  ["Соедините прилагательное с формой", [["tall","taller"],["big","bigger"],["happy","happier"],["beautiful","more beautiful"]], "Образование сравнительной степени"],
  ["Соедините неправильную форму", [["good","better"],["bad","worse"],["far","farther/further"],["little","less"]], "Неправильные сравнительные формы"],
  ["Соедините правило с примером", [["1 слог: +er","taller"],["1 слог (CVC): удвоение +er","bigger"],["2 слога на -y: -ier","happier"],["2+ слога: more","more beautiful"]], "Правила образования"],
  ["Соедините предложение с переводом", [["taller than","выше чем"],["more expensive","дороже"],["better than","лучше чем"],["faster than","быстрее чем"]], "Перевод сравнений"],
  ["Соедините структуру с примером", [["as...as","as tall as"],["not as...as","not as fast as"],["...er than","taller than"],["more...than","more interesting than"]], "Структуры сравнения"],
],
},

'superlative': {
mc: [
  ["She is ___ girl in class.", ["the tallest","the taller","tallest","taller"], "the tallest", "The + adj + -est"],
  ["This is ___ book I've read.", ["the most interesting","the more interesting","most interesting","more interesting"], "the most interesting", "The most + длинное прилагательное"],
  ["He is ___ student.", ["the best","the goodest","the better","the most good"], "the best", "Good → the best"],
  ["It was ___ day of my life.", ["the worst","the baddest","the worse","the most bad"], "the worst", "Bad → the worst"],
  ["She is ___ person I know.", ["the kindest","the most kind","the kinder","more kind"], "the kindest", "Kind → the kindest"],
],
fb: [
  ["She is ___ person in the room. (old)", "the oldest", "Old → the oldest"],
  ["This is ___ film ever. (good)", "the best", "Good → the best"],
  ["He is ___ runner on the team. (fast)", "the fastest", "Fast → the fastest"],
  ["It was ___ test of the year. (difficult)", "the most difficult", "The most + difficult"],
  ["She is ___ girl in school. (smart)", "the smartest", "Smart → the smartest"],
],
tr: [
  ["Она самая высокая в классе.", "She is the tallest in the class.", ["She is the tallest in class."], "The + adj + -est"],
  ["Это лучшая книга.", "This is the best book.", [], "Good → the best"],
  ["Он самый быстрый бегун.", "He is the fastest runner.", [], "Fast → the fastest"],
  ["Это был худший день.", "It was the worst day.", [], "Bad → the worst"],
  ["Она самый добрый человек.", "She is the kindest person.", [], "Kind → the kindest"],
],
ma: [
  ["Соедините прилагательное с формой", [["tall","the tallest"],["big","the biggest"],["happy","the happiest"],["beautiful","the most beautiful"]], "Образование превосходной степени"],
  ["Соедините неправильную форму", [["good","the best"],["bad","the worst"],["far","the farthest/furthest"],["little","the least"]], "Неправильные формы"],
  ["Соедините сравнительную с превосходной", [["taller","the tallest"],["better","the best"],["more interesting","the most interesting"],["worse","the worst"]], "Сравнительная → превосходная"],
  ["Соедините правило с примером", [["1 слог: the + -est","the tallest"],["2 слога на -y: the + -iest","the happiest"],["2+ слога: the most","the most beautiful"],["CVC: удвоение + -est","the biggest"]], "Правила образования"],
  ["Соедините предложение с переводом", [["the tallest","самый высокий"],["the best","лучший"],["the most expensive","самый дорогой"],["the worst","худший"]], "Перевод превосходной степени"],
],
},

'relative-clauses': {
mc: [
  ["The man ___ lives here is my uncle.", ["who","which","where","whose"], "who", "Who — для людей (подлежащее)"],
  ["The book ___ I read was good.", ["who","which","where","whose"], "which", "Which — для предметов (или that)"],
  ["The city ___ I was born is small.", ["who","which","where","whose"], "where", "Where — для мест"],
  ["The girl ___ bag was stolen called the police.", ["who","which","where","whose"], "whose", "Whose — чей/чья"],
  ["The film ___ we watched was boring.", ["who","which","where","that"], "that", "That — универсальное (для людей и предметов)"],
],
fb: [
  ["The woman ___ called you is my mother.", "who", "Who для людей"],
  ["The car ___ he bought is red.", "which", "Which для предметов (или that)"],
  ["The house ___ I live is old.", "where", "Where для мест"],
  ["The boy ___ father is a doctor is my friend.", "whose", "Whose = чей"],
  ["The restaurant ___ we ate was expensive.", "where", "Where для мест"],
],
tr: [
  ["Человек, который здесь живёт, — мой дядя.", "The man who lives here is my uncle.", ["The man that lives here is my uncle."], "Who — для людей"],
  ["Книга, которую я прочитал, была хорошей.", "The book which I read was good.", ["The book that I read was good."], "Which/that — для предметов"],
  ["Город, где я родился, маленький.", "The city where I was born is small.", [], "Where — для мест"],
  ["Девочка, чья сумка была украдена.", "The girl whose bag was stolen.", [], "Whose — чей"],
  ["Фильм, который мы смотрели.", "The film that we watched.", ["The film which we watched."], "That/which — для предметов"],
],
ma: [
  ["Соедините местоимение с функцией", [["who","для людей"],["which","для предметов"],["where","для мест"],["whose","принадлежность"]], "Relative pronouns"],
  ["Соедините предложение с местоимением", [["The man ... is tall","who"],["The book ... I like","which/that"],["The place ... I work","where"],["The girl ... car is red","whose"]], "Выбор relative pronoun"],
  ["Соедините that с заменяемым", [["who → ","that (люди)"],["which → ","that (предметы)"],["where → ","that нельзя"],["whose → ","that нельзя"]], "Когда можно использовать that"],
  ["Соедините тип clause с примером", [["defining","The man who lives here"],["non-defining","My mother, who is 60, ..."],["defining","The book that I read"],["non-defining","Paris, where I was born, ..."]], "Defining vs non-defining"],
  ["Соедините пример с переводом", [["who lives here","который живёт здесь"],["which I bought","которую я купил"],["where I work","где я работаю"],["whose car","чья машина"]], "Перевод relative clauses"],
],
},

'past-continuous': {
mc: [
  ["I ___ when you called.", ["was sleeping","slept","am sleeping","have slept"], "was sleeping", "Past Continuous: was/were + -ing"],
  ["They ___ football at 3 p.m.", ["were playing","played","are playing","have played"], "were playing", "Were + playing"],
  ["She ___ while he was reading.", ["was cooking","cooked","is cooking","has cooked"], "was cooking", "Was + cooking"],
  ["We ___ TV when it started to rain.", ["were watching","watched","are watching","have watched"], "were watching", "Were + watching"],
  ["He ___ to music all evening.", ["was listening","listened","is listening","has listened"], "was listening", "Was + listening"],
],
fb: [
  ["I ___ a book when she arrived. (read)", "was reading", "Was + reading"],
  ["They ___ dinner at 8. (have)", "were having", "Were + having"],
  ["She ___ when I called. (sleep)", "was sleeping", "Was + sleeping"],
  ["We ___ along the beach. (walk)", "were walking", "Were + walking"],
  ["He ___ for the exam. (study)", "was studying", "Was + studying"],
],
tr: [
  ["Я спал, когда ты позвонил.", "I was sleeping when you called.", [], "Past Continuous + Past Simple"],
  ["Они играли в футбол в 3 часа.", "They were playing football at 3 p.m.", [], "Were + playing"],
  ["Она готовила, пока он читал.", "She was cooking while he was reading.", [], "Два параллельных действия"],
  ["Мы смотрели телевизор.", "We were watching TV.", [], "Were + watching"],
  ["Шёл дождь весь день.", "It was raining all day.", [], "Was + raining"],
],
ma: [
  ["Соедините местоимение с was/were", [["I","was"],["he/she/it","was"],["you/we/they","were"],["she","was"]], "Was или were"],
  ["Соедините употребление с примером", [["фоновое действие","I was reading when..."],["параллельные действия","While she was cooking, he was reading"],["прерванное действие","I was sleeping when the phone rang"],["описание прошлого","The sun was shining"]], "Употребление Past Continuous"],
  ["Соедините маркер с временем", [["when (+ Past Simple)","Past Continuous"],["while","Past Continuous"],["at 3 p.m. yesterday","Past Continuous"],["yesterday","Past Simple"]], "Маркеры Past Continuous"],
  ["Соедините предложение с переводом", [["I was reading","Я читал (в процессе)"],["She was cooking","Она готовила (в процессе)"],["They were playing","Они играли (в процессе)"],["It was raining","Шёл дождь"]], "Перевод Past Continuous"],
  ["Соедините Past Simple с Past Continuous", [["I read a book","завершённое"],["I was reading a book","в процессе"],["She cooked dinner","завершённое"],["She was cooking dinner","в процессе"]], "Past Simple vs Past Continuous"],
],
},

'first-conditional': {
mc: [
  ["If it rains, I ___ at home.", ["will stay","would stay","stayed","stay"], "will stay", "1st conditional: if + Present → will + inf"],
  ["If you study, you ___ the exam.", ["will pass","would pass","passed","pass"], "will pass", "Will + инфинитив в результате"],
  ["If she ___, tell her I called.", ["comes","will come","came","would come"], "comes", "Present Simple после if"],
  ["I ___ help you if you ask.", ["will","would","did","do"], "will", "Will в главном предложении"],
  ["If they don't hurry, they ___ the bus.", ["will miss","would miss","missed","miss"], "will miss", "Will + miss"],
],
fb: [
  ["If it ___, we will stay inside. (rain)", "rains", "Present Simple после if"],
  ["If you ___ hard, you will succeed. (work)", "work", "Present Simple после if"],
  ["I will call you if I ___ time. (have)", "have", "Present Simple после if"],
  ["If she comes, I ___ happy. (be)", "will be", "Will + be в результате"],
  ["If they ___, we will start without them. (not come)", "don't come", "Present Simple отрицание после if"],
],
tr: [
  ["Если пойдёт дождь, я останусь дома.", "If it rains, I will stay at home.", ["If it rains, I'll stay at home."], "1st conditional"],
  ["Если ты будешь учиться, ты сдашь экзамен.", "If you study, you will pass the exam.", ["If you study, you'll pass the exam."], "Present + will"],
  ["Я помогу тебе, если ты попросишь.", "I will help you if you ask.", ["I'll help you if you ask."], "Will в главном предложении"],
  ["Если она придёт, скажи ей.", "If she comes, tell her.", [], "Повелительное наклонение в результате"],
  ["Если они опоздают, мы начнём без них.", "If they are late, we will start without them.", ["If they're late, we'll start without them."], "1st conditional"],
],
ma: [
  ["Соедините часть с временем", [["if-clause","Present Simple"],["main clause","will + infinitive"],["if + отрицание","don't/doesn't"],["результат","will/won't"]], "Структура 1st conditional"],
  ["Соедините if-часть с результатом", [["If it rains","I will stay home"],["If you study","you will pass"],["If she comes","I will be happy"],["If they don't hurry","they will miss the bus"]], "Примеры 1st conditional"],
  ["Соедините тип с формулой", [["1st conditional","if + Present → will"],["2nd conditional","if + Past → would"],["0 conditional","if + Present → Present"],["3rd conditional","if + Past Perfect → would have"]], "Типы условных предложений"],
  ["Соедините предложение с переводом", [["If it rains","Если пойдёт дождь"],["I will stay","Я останусь"],["If you ask","Если ты попросишь"],["She will help","Она поможет"]], "Перевод 1st conditional"],
  ["Соедините правило с примером", [["после if нет will","If she comes (не will come)"],["will в результате","...I will help"],["можно менять порядок","I will stay if it rains"],["запятая после if-clause","If it rains, I will..."]], "Правила 1st conditional"],
],
},

'passive-voice': {
mc: [
  ["The cake ___ by Mary.", ["is made","makes","made","making"], "is made", "Passive: am/is/are + past participle"],
  ["The letter ___ yesterday.", ["was sent","sent","sends","is sent"], "was sent", "Past passive: was/were + p.p."],
  ["English ___ all over the world.", ["is spoken","speaks","spoke","speaking"], "is spoken", "Present passive"],
  ["The house ___ next year.", ["will be built","will build","builds","is building"], "will be built", "Future passive: will be + p.p."],
  ["The book ___ already.", ["has been read","has read","is read","was read"], "has been read", "Present Perfect passive: has been + p.p."],
],
fb: [
  ["The window ___ by the ball. (break, past)", "was broken", "Past passive: was + broken"],
  ["English ___ in many countries. (speak)", "is spoken", "Present passive: is + spoken"],
  ["The cake ___ by my mother. (make)", "is made", "Present passive: is + made"],
  ["The car ___ tomorrow. (repair, future)", "will be repaired", "Future passive: will be + p.p."],
  ["The report ___ already. (write, Present Perfect)", "has been written", "Present Perfect passive"],
],
tr: [
  ["Торт сделан Мэри.", "The cake is made by Mary.", [], "Passive: is + past participle + by"],
  ["Письмо было отправлено вчера.", "The letter was sent yesterday.", [], "Past passive"],
  ["На английском говорят во всём мире.", "English is spoken all over the world.", [], "Present passive"],
  ["Дом будет построен.", "The house will be built.", [], "Future passive"],
  ["Книга уже прочитана.", "The book has already been read.", [], "Present Perfect passive"],
],
ma: [
  ["Соедините active с passive", [["Mary makes cake","The cake is made by Mary"],["They sent the letter","The letter was sent"],["People speak English","English is spoken"],["They will build","It will be built"]], "Active → Passive"],
  ["Соедините время с формой passive", [["Present Simple","is/are + p.p."],["Past Simple","was/were + p.p."],["Future","will be + p.p."],["Present Perfect","has/have been + p.p."]], "Времена в passive"],
  ["Соедините элемент с функцией", [["by","агенс действия"],["is/was","вспомогательный"],["past participle","основное значение"],["subject","получатель действия"]], "Структура passive"],
  ["Соедините инфинитив с past participle", [["make","made"],["write","written"],["speak","spoken"],["build","built"]], "Past participles для passive"],
  ["Соедините предложение с переводом", [["is made","сделан"],["was sent","был отправлен"],["will be built","будет построен"],["has been read","был прочитан"]], "Перевод passive"],
],
},

'second-conditional': {
mc: [
  ["If I ___ rich, I would travel.", ["were","am","will be","would be"], "were", "2nd conditional: if + Past Simple"],
  ["If she knew, she ___ you.", ["would tell","will tell","tells","told"], "would tell", "Would + инфинитив в результате"],
  ["If I ___ you, I would study more.", ["were","am","will be","would be"], "were", "If I were (сослагательное)"],
  ["He would buy a car if he ___ money.", ["had","has","will have","would have"], "had", "Past Simple после if"],
  ["If they lived here, they ___ happier.", ["would be","will be","are","were"], "would be", "Would + be"],
],
fb: [
  ["If I ___ a bird, I would fly. (be)", "were", "If I were (сослагательное)"],
  ["If she ___ harder, she would pass. (study)", "studied", "Past Simple после if"],
  ["He would help if he ___ time. (have)", "had", "Past Simple после if"],
  ["If they ___ English, they would get the job. (speak)", "spoke", "Past Simple после if"],
  ["I ___ travel if I had money. (will → would)", "would", "Would в главном предложении"],
],
tr: [
  ["Если бы я был богатым, я бы путешествовал.", "If I were rich, I would travel.", ["If I was rich, I would travel."], "2nd conditional — нереальное условие"],
  ["Если бы она знала, она бы сказала.", "If she knew, she would tell you.", [], "Would + инфинитив"],
  ["На твоём месте я бы учился больше.", "If I were you, I would study more.", [], "If I were you — совет"],
  ["Он бы купил машину, если бы имел деньги.", "He would buy a car if he had money.", [], "Past Simple + would"],
  ["Если бы они жили здесь, они были бы счастливее.", "If they lived here, they would be happier.", [], "2nd conditional"],
],
ma: [
  ["Соедините часть с временем", [["if-clause","Past Simple"],["main clause","would + infinitive"],["if I were","сослагательное"],["would + verb","результат"]], "Структура 2nd conditional"],
  ["Соедините тип с вероятностью", [["1st conditional","реальное/вероятное"],["2nd conditional","нереальное/маловероятное"],["3rd conditional","невозможное (прошлое)"],["0 conditional","всегда истинное"]], "Вероятность условных"],
  ["Соедините if-часть с результатом", [["If I were rich","I would travel"],["If she knew","she would tell"],["If he had time","he would help"],["If they spoke English","they would get the job"]], "Примеры 2nd conditional"],
  ["Соедините предложение с переводом", [["If I were you","На твоём месте"],["I would go","Я бы пошёл"],["If she had time","Если бы у неё было время"],["He would help","Он бы помог"]], "Перевод 2nd conditional"],
  ["Соедините ошибку с правилом", [["If I would be","НЕПРАВИЛЬНО (would не после if)"],["If I were","ПРАВИЛЬНО"],["If she will know","НЕПРАВИЛЬНО (will не после if)"],["If she knew","ПРАВИЛЬНО"]], "Типичные ошибки"],
],
},

'third-conditional': {
mc: [
  ["If I had known, I ___ come.", ["would have","would","will have","had"], "would have", "3rd conditional: would have + p.p."],
  ["If she ___ studied, she would have passed.", ["had","has","would","did"], "had", "If + Past Perfect"],
  ["If they had left earlier, they ___ missed the train.", ["wouldn't have","didn't","won't have","hadn't"], "wouldn't have", "Wouldn't have + p.p."],
  ["If I ___ seen you, I would have said hello.", ["had","have","did","was"], "had", "Had + past participle после if"],
  ["She would have helped if she ___ known.", ["had","has","would","did"], "had", "Had known — Past Perfect"],
],
fb: [
  ["If I ___ known, I would have called. (have)", "had", "If + had + p.p."],
  ["She would have come if she ___ been invited. (have)", "had", "If + had + p.p."],
  ["If they ___ left earlier, they would have arrived. (have)", "had", "If + had + p.p."],
  ["I would have helped if I ___ been there. (have)", "had", "If + had + p.p."],
  ["If he ___ studied, he would have passed. (have)", "had", "If + had + p.p."],
],
tr: [
  ["Если бы я знал, я бы пришёл.", "If I had known, I would have come.", [], "3rd conditional — нереальное прошлое"],
  ["Если бы она училась, она бы сдала.", "If she had studied, she would have passed.", [], "Had studied + would have passed"],
  ["Если бы они уехали раньше, они бы не опоздали.", "If they had left earlier, they wouldn't have missed the train.", [], "Wouldn't have + p.p."],
  ["Я бы помог, если бы был там.", "I would have helped if I had been there.", [], "Would have + p.p."],
  ["Если бы я тебя видел, я бы поздоровался.", "If I had seen you, I would have said hello.", [], "Had seen + would have said"],
],
ma: [
  ["Соедините часть с временем", [["if-clause","Past Perfect (had + p.p.)"],["main clause","would have + p.p."],["отрицание if","if + hadn't + p.p."],["отрицание main","wouldn't have + p.p."]], "Структура 3rd conditional"],
  ["Соедините тип с формулой", [["1st","if + Present → will"],["2nd","if + Past → would"],["3rd","if + Past Perfect → would have p.p."],["mixed","if + Past Perfect → would"]], "Все типы условных"],
  ["Соедините if-часть с результатом", [["If I had known","I would have come"],["If she had studied","she would have passed"],["If they had left","they wouldn't have been late"],["If he had called","I would have answered"]], "Примеры 3rd conditional"],
  ["Соедините предложение с переводом", [["If I had known","Если бы я знал"],["I would have come","Я бы пришёл"],["She wouldn't have failed","Она бы не провалилась"],["If they had hurried","Если бы они поторопились"]], "Перевод 3rd conditional"],
  ["Соедините пример с типом", [["If it rains, I will stay","1st conditional"],["If it rained, I would stay","2nd conditional"],["If it had rained, I would have stayed","3rd conditional"],["If I were you, I would...","2nd conditional"]], "Определение типа"],
],
},

'reported-speech': {
mc: [
  ["He said he ___ tired.", ["was","is","will be","has been"], "was", "Present → Past в reported speech"],
  ["She said she ___ come tomorrow.", ["would","will","can","may"], "would", "Will → would"],
  ["They told me they ___ finished.", ["had","have","has","did"], "had", "Present Perfect → Past Perfect"],
  ["He asked ___ I was happy.", ["if","that","what","which"], "if", "Yes/no вопрос → if/whether"],
  ["She asked ___ I lived.", ["where","that","if","what"], "where", "Wh-вопрос сохраняет wh-слово"],
],
fb: [
  ["He said he ___ hungry. (is → past)", "was", "Is → was"],
  ["She said she ___ help. (will → past)", "would", "Will → would"],
  ["They said they ___ seen the film. (have → past)", "had", "Have → had"],
  ["He asked ___ I wanted. (what)", "what", "Wh-вопрос → what + обычный порядок"],
  ["She said she ___ going to leave. (is → past)", "was", "Is → was"],
],
tr: [
  ["Он сказал, что устал.", "He said he was tired.", ["He said that he was tired."], "Is → was"],
  ["Она сказала, что придёт завтра.", "She said she would come the next day.", ["She said she would come tomorrow."], "Will → would, tomorrow → the next day"],
  ["Они сказали, что закончили.", "They said they had finished.", ["They said that they had finished."], "Have finished → had finished"],
  ["Он спросил, счастлив ли я.", "He asked if I was happy.", ["He asked whether I was happy."], "Are you happy? → if I was happy"],
  ["Она спросила, где я живу.", "She asked where I lived.", [], "Where do you live? → where I lived"],
],
ma: [
  ["Соедините прямую речь с reported", [["is","was"],["will","would"],["can","could"],["have","had"]], "Tense shift в reported speech"],
  ["Соедините маркер времени", [["today","that day"],["tomorrow","the next day"],["yesterday","the day before"],["now","then"]], "Замена маркеров времени"],
  ["Соедините тип с введением", [["утверждение","said (that)"],["да/нет вопрос","asked if/whether"],["wh-вопрос","asked + wh-word"],["приказ","told + to + inf"]], "Виды reported speech"],
  ["Соедините прямую речь с косвенной", [["\"I am happy\"","He said he was happy"],["\"I will come\"","She said she would come"],["\"Do you like it?\"","He asked if I liked it"],["\"Where is it?\"","She asked where it was"]], "Трансформация"],
  ["Соедините предложение с переводом", [["He said he was tired","Он сказал, что устал"],["She asked if I was happy","Она спросила, счастлив ли я"],["They told me to go","Они сказали мне идти"],["He asked where I lived","Он спросил, где я живу"]], "Перевод reported speech"],
],
},

'past-perfect': {
mc: [
  ["I ___ already eaten when she arrived.", ["had","have","has","did"], "had", "Past Perfect: had + p.p."],
  ["She ___ never been to Paris before that trip.", ["had","has","have","did"], "had", "Had + never + p.p."],
  ["After they ___ left, I went to bed.", ["had","have","has","did"], "had", "After + Past Perfect"],
  ["He told me he ___ finished the work.", ["had","has","have","did"], "had", "Past Perfect в reported speech"],
  ["By the time I arrived, they ___ gone.", ["had","have","has","did"], "had", "By the time + Past Perfect"],
],
fb: [
  ["I ___ already finished when he called.", "had", "Had + already + p.p."],
  ["She ___ never seen snow before.", "had", "Had + never + p.p."],
  ["After they ___ eaten, they left.", "had", "After + had + p.p."],
  ["By 6 o'clock, he ___ done all the work.", "had", "By + time + had + p.p."],
  ["When I arrived, the film ___ already started.", "had", "Had + already + p.p."],
],
tr: [
  ["Я уже поел, когда она пришла.", "I had already eaten when she arrived.", [], "Past Perfect для предшествующего действия"],
  ["Она никогда не была в Париже до этого.", "She had never been to Paris before.", [], "Had never + p.p."],
  ["После того как они ушли, я лёг спать.", "After they had left, I went to bed.", [], "After + Past Perfect"],
  ["К 6 часам он всё закончил.", "By 6 o'clock, he had finished everything.", ["By 6 o'clock, he had done everything."], "By + time + Past Perfect"],
  ["Когда я пришёл, фильм уже начался.", "When I arrived, the film had already started.", ["When I arrived, the movie had already started."], "Past Perfect + Past Simple"],
],
ma: [
  ["Соедините формулу с временем", [["had + p.p.","Past Perfect"],["have/has + p.p.","Present Perfect"],["was/were + -ing","Past Continuous"],["will have + p.p.","Future Perfect"]], "Составные времена"],
  ["Соедините маркер с Past Perfect", [["already","had already done"],["never","had never seen"],["by the time","by the time I arrived, he had..."],["after","after she had left..."]], "Маркеры Past Perfect"],
  ["Соедините Past Simple с Past Perfect", [["she arrived (потом)","Past Simple"],["I had eaten (до)","Past Perfect"],["he called (потом)","Past Simple"],["I had finished (до)","Past Perfect"]], "Порядок событий"],
  ["Соедините предложение с переводом", [["I had eaten","Я поел (до)"],["She had gone","Она ушла (до)"],["They had finished","Они закончили (до)"],["He had never seen","Он никогда не видел (до)"]], "Перевод Past Perfect"],
  ["Соедините инфинитив с past participle", [["eat","eaten"],["go","gone"],["see","seen"],["finish","finished"]], "Past participles для Past Perfect"],
],
},

'future-perfect': {
mc: [
  ["By next year, I ___ graduated.", ["will have","will","have","had"], "will have", "Future Perfect: will have + p.p."],
  ["She ___ finished by then.", ["will have","will","has","had"], "will have", "Will have + p.p."],
  ["By 2030, they ___ built the bridge.", ["will have","will","have","had"], "will have", "Will have + p.p."],
  ["He ___ left by the time you arrive.", ["will have","will","has","had"], "will have", "Will have + p.p."],
  ["We ___ eaten by 8 o'clock.", ["will have","will","have","had"], "will have", "Will have + p.p."],
],
fb: [
  ["By next year, I ___ ___ here for 5 years. (live)", "will have lived", "Will have + p.p."],
  ["She ___ ___ the book by Friday. (finish)", "will have finished", "Will have + p.p."],
  ["By the time you come, I ___ ___ . (leave)", "will have left", "Will have + p.p."],
  ["They ___ ___ the project by December. (complete)", "will have completed", "Will have + p.p."],
  ["He ___ ___ 100 books by the end of the year. (read)", "will have read", "Will have + p.p."],
],
tr: [
  ["К следующему году я закончу университет.", "By next year, I will have graduated.", [], "Future Perfect: will have + p.p."],
  ["Она закончит к тому времени.", "She will have finished by then.", ["She'll have finished by then."], "Will have + p.p."],
  ["К 2030 году они построят мост.", "By 2030, they will have built the bridge.", [], "By + future time + will have + p.p."],
  ["Он уже уйдёт к тому моменту, когда ты придёшь.", "He will have left by the time you arrive.", [], "Will have + p.p. + by the time"],
  ["Мы поедим к 8 часам.", "We will have eaten by 8 o'clock.", [], "Will have + p.p. + by"],
],
ma: [
  ["Соедините формулу с временем", [["will have + p.p.","Future Perfect"],["will + inf","Future Simple"],["had + p.p.","Past Perfect"],["have/has + p.p.","Present Perfect"]], "Составные времена с have"],
  ["Соедините маркер с Future Perfect", [["by next year","will have + p.p."],["by then","will have + p.p."],["by the time","will have + p.p."],["by 2030","will have + p.p."]], "By + время = Future Perfect"],
  ["Соедините предложение с переводом", [["I will have finished","Я закончу (к)"],["She will have left","Она уйдёт (к)"],["They will have built","Они построят (к)"],["He will have read","Он прочитает (к)"]], "Перевод Future Perfect"],
  ["Соедините время с функцией", [["Future Perfect","действие до момента в будущем"],["Past Perfect","действие до момента в прошлом"],["Present Perfect","результат в настоящем"],["Future Simple","действие в будущем"]], "Функции Perfect времён"],
  ["Соедините инфинитив с past participle", [["finish","finished"],["leave","left"],["build","built"],["read","read"]], "Past participles"],
],
},

'inversion': {
mc: [
  ["Never ___ I seen such beauty.", ["have","had","did","was"], "have", "Never + вспомогательный + подлежащее"],
  ["Not only ___ she smart, but also kind.", ["is","does","has","was"], "is", "Not only + инверсия"],
  ["Rarely ___ he make mistakes.", ["does","is","has","was"], "does", "Rarely + does + подлежащее + инфинитив"],
  ["Hardly ___ I arrived when it started to rain.", ["had","have","did","was"], "had", "Hardly + had + подлежащее + p.p."],
  ["Under no circumstances ___ you leave.", ["should","would","do","are"], "should", "Under no circumstances + инверсия"],
],
fb: [
  ["Never ___ I been so happy.", "have", "Never + have + I"],
  ["Not only ___ he clever, but hardworking.", "is", "Not only + is + he"],
  ["Seldom ___ we see such talent.", "do", "Seldom + do + we"],
  ["Hardly ___ she finished when he called.", "had", "Hardly + had + she + p.p."],
  ["Only then ___ I understand.", "did", "Only then + did + I"],
],
tr: [
  ["Никогда я не видел такой красоты.", "Never have I seen such beauty.", [], "Never + вспомогательный + подлежащее"],
  ["Она не только умная, но и добрая.", "Not only is she smart, but also kind.", [], "Not only + инверсия"],
  ["Редко он допускает ошибки.", "Rarely does he make mistakes.", [], "Rarely + does + подлежащее"],
  ["Едва я пришёл, как начался дождь.", "Hardly had I arrived when it started to rain.", [], "Hardly + had + подлежащее"],
  ["Только тогда я понял.", "Only then did I understand.", [], "Only then + did + I"],
],
ma: [
  ["Соедините наречие с инверсией", [["Never","Never have I..."],["Rarely","Rarely does he..."],["Hardly","Hardly had she..."],["Not only","Not only is she..."]], "Наречия, требующие инверсию"],
  ["Соедините обычный порядок с инверсией", [["I have never seen","Never have I seen"],["He rarely makes","Rarely does he make"],["She had hardly finished","Hardly had she finished"],["She is not only smart","Not only is she smart"]], "Обычный → инверсия"],
  ["Соедините конструкцию с правилом", [["Never/Rarely/Seldom","+ вспомогательный + подлежащее"],["Hardly/Scarcely","+ had + подлежащее + p.p."],["Not only","+ вспомогательный + подлежащее"],["Only then/Only when","+ did/had + подлежащее"]], "Правила инверсии"],
  ["Соедините наречие с переводом", [["never","никогда"],["rarely","редко"],["hardly","едва"],["seldom","редко"]], "Перевод наречий"],
  ["Соедините пример с регистром", [["Never have I seen","формальный/литературный"],["I have never seen","нейтральный"],["Rarely does he...","формальный"],["He rarely...","нейтральный"]], "Регистр инверсии"],
],
},

'subjunctive': {
mc: [
  ["I suggest that he ___ early.", ["leave","leaves","left","leaving"], "leave", "Subjunctive: that + подлежащее + инфинитив без -s"],
  ["It is essential that she ___ on time.", ["be","is","was","being"], "be", "Subjunctive: be (не is)"],
  ["The doctor recommended that he ___ more water.", ["drink","drinks","drank","drinking"], "drink", "Subjunctive после recommend"],
  ["I insist that she ___ the meeting.", ["attend","attends","attended","attending"], "attend", "Subjunctive после insist"],
  ["If I ___ you, I would study more.", ["were","was","am","be"], "were", "Were в сослагательном (if I were)"],
],
fb: [
  ["I suggest that he ___ harder. (work)", "work", "Subjunctive: инфинитив без -s"],
  ["It is important that she ___ here. (be)", "be", "Subjunctive: be"],
  ["They demanded that he ___ . (resign)", "resign", "Subjunctive после demand"],
  ["I recommend that she ___ a doctor. (see)", "see", "Subjunctive после recommend"],
  ["If I ___ rich, I would help everyone. (be)", "were", "Subjunctive: if I were"],
],
tr: [
  ["Я предлагаю, чтобы он ушёл раньше.", "I suggest that he leave early.", ["I suggest he leave early."], "Subjunctive после suggest"],
  ["Важно, чтобы она пришла вовремя.", "It is essential that she be on time.", ["It's essential that she be on time."], "Subjunctive: be (не is)"],
  ["Врач рекомендовал, чтобы он пил больше воды.", "The doctor recommended that he drink more water.", [], "Subjunctive после recommend"],
  ["Я настаиваю, чтобы она пришла на встречу.", "I insist that she attend the meeting.", [], "Subjunctive после insist"],
  ["Если бы я был тобой, я бы учился больше.", "If I were you, I would study more.", [], "Subjunctive: if I were"],
],
ma: [
  ["Соедините глагол с subjunctive", [["suggest","I suggest he leave"],["recommend","I recommend she see"],["insist","I insist he come"],["demand","They demand she resign"]], "Глаголы + subjunctive"],
  ["Соедините выражение с subjunctive", [["It is essential that","+ subjunctive"],["It is important that","+ subjunctive"],["It is necessary that","+ subjunctive"],["It is vital that","+ subjunctive"]], "Конструкции с subjunctive"],
  ["Соедините обычную форму с subjunctive", [["he goes","(that) he go"],["she is","(that) she be"],["he has","(that) he have"],["she works","(that) she work"]], "Indicative → Subjunctive"],
  ["Соедините предложение с переводом", [["I suggest he leave","Предлагаю, чтобы он ушёл"],["It's essential she be here","Важно, чтобы она была"],["If I were you","На вашем месте"],["I insist he come","Настаиваю, чтобы он пришёл"]], "Перевод subjunctive"],
  ["Соедините стиль с альтернативой", [["AmE subjunctive","I suggest he leave"],["BrE should","I suggest he should leave"],["AmE subjunctive","It's essential she be"],["BrE should","It's essential she should be"]], "AmE vs BrE subjunctive"],
],
},

'cleft-sentences': {
mc: [
  ["It ___ John who broke the window.", ["was","is","were","had"], "was", "It was... who/that — cleft для выделения"],
  ["What I ___ is a good rest.", ["need","needs","needed","needing"], "need", "What I need is... — pseudo-cleft"],
  ["It is ___ that I want to talk to.", ["you","your","yours","yourself"], "you", "It is you that... — cleft с местоимением"],
  ["___ she did was amazing.", ["What","It","That","Which"], "What", "What she did... — pseudo-cleft"],
  ["It was in Paris ___ we met.", ["that","what","which","who"], "that", "It was... that — cleft для обстоятельства"],
],
fb: [
  ["It ___ Mary who called you.", "was", "It was + подлежащее + who"],
  ["___ I need is more time.", "What", "What I need is... — pseudo-cleft"],
  ["It is the red dress ___ I want.", "that", "It is... that — cleft"],
  ["___ happened was unexpected.", "What", "What happened was... — pseudo-cleft"],
  ["It was yesterday ___ she arrived.", "that", "It was + время + that"],
],
tr: [
  ["Именно Джон разбил окно.", "It was John who broke the window.", ["It was John that broke the window."], "It was... who — cleft"],
  ["Мне нужен хороший отдых.", "What I need is a good rest.", [], "What I need is... — pseudo-cleft"],
  ["Именно с тобой я хочу поговорить.", "It is you that I want to talk to.", [], "It is... that — cleft"],
  ["То, что она сделала, было удивительно.", "What she did was amazing.", [], "What + clause + was — pseudo-cleft"],
  ["Именно в Париже мы познакомились.", "It was in Paris that we met.", [], "It was + place + that"],
],
ma: [
  ["Соедините тип с формулой", [["it-cleft","It was X who/that..."],["wh-cleft","What X is/was Y"],["reversed wh-cleft","Y is what X"],["all-cleft","All I need is..."]], "Типы cleft sentences"],
  ["Соедините обычное предложение с cleft", [["John broke the window","It was John who broke the window"],["I need rest","What I need is rest"],["She called yesterday","It was yesterday that she called"],["He said that","That is what he said"]], "Трансформация в cleft"],
  ["Соедините выделяемый элемент с типом", [["подлежащее (кто)","It was John who..."],["дополнение (что)","It was the book that..."],["обстоятельство (где)","It was in Paris that..."],["обстоятельство (когда)","It was yesterday that..."]], "Что выделяет cleft"],
  ["Соедините элемент с ролью", [["It","формальное подлежащее"],["was/is","связка"],["who/that","относительное местоимение"],["выделяемый элемент","фокус предложения"]], "Структура it-cleft"],
  ["Соедините пример с переводом", [["It was John who...","Именно Джон..."],["What I need is...","То, что мне нужно — это..."],["All I want is...","Всё, что я хочу — это..."],["It is here that...","Именно здесь..."]], "Перевод cleft sentences"],
],
},

'ellipsis': {
mc: [
  ["I can swim and she can ___.", ["too","swim too","do too","also swim"], "too", "Ellipsis: опускание повторяющегося глагола"],
  ["He likes coffee but I ___.", ["don't","like not","not like","am not"], "don't", "Ellipsis: I don't (like coffee)"],
  ["She said she would come, but she ___.", ["didn't","not","don't","wasn't"], "didn't", "Ellipsis: she didn't (come)"],
  ["'Are you ready?' 'Yes, I ___.'", ["am","do","have","ready"], "am", "Short answer: Yes, I am"],
  ["He can speak French and so ___ I.", ["can","do","am","have"], "can", "So + вспомогательный + I"],
],
fb: [
  ["She likes tea and I do ___.", "too", "Ellipsis: I do too (like tea)"],
  ["'Can you help?' 'Yes, I ___.'", "can", "Short answer: Yes, I can"],
  ["He went to Paris and so ___ she.", "did", "So + did + she (= she also went)"],
  ["I haven't seen the film. Neither ___ he.", "has", "Neither + has + he"],
  ["She wanted to leave but she ___.", "didn't", "Ellipsis: she didn't (leave)"],
],
tr: [
  ["Я умею плавать, и она тоже.", "I can swim and she can too.", ["I can swim and so can she."], "Ellipsis: опускание swim"],
  ["Он любит кофе, а я нет.", "He likes coffee but I don't.", [], "Ellipsis: I don't (like coffee)"],
  ["Она сказала, что придёт, но не пришла.", "She said she would come, but she didn't.", [], "Ellipsis: she didn't (come)"],
  ["Он поехал в Париж, и она тоже.", "He went to Paris and so did she.", [], "So + did + she"],
  ["Я не видел этот фильм. И он тоже.", "I haven't seen this film. Neither has he.", ["I haven't seen the film. Nor has he."], "Neither + has + he"],
],
ma: [
  ["Соедините тип ellipsis с примером", [["short answer","Yes, I am"],["so/neither","So do I / Neither do I"],["auxiliary only","She can too"],["substitution","I think so"]], "Типы эллипсиса"],
  ["Соедините утверждение с so-ответом", [["I like coffee","So do I"],["She can swim","So can he"],["They have been","So have we"],["He will come","So will she"]], "So + вспомогательный + подлежащее"],
  ["Соедините отрицание с neither-ответом", [["I don't like it","Neither do I"],["She can't swim","Neither can he"],["They haven't been","Neither have we"],["He won't come","Neither will she"]], "Neither + вспомогательный + подлежащее"],
  ["Соедините полную форму с эллипсисом", [["I can swim too","I can too"],["She doesn't like coffee","She doesn't"],["He has been there too","He has too"],["They won't come either","They won't either"]], "Опускание повторяющегося глагола"],
  ["Соедините пример с переводом", [["So do I","Я тоже"],["Neither do I","Я тоже нет"],["Yes, I can","Да, могу"],["She didn't","Она не (сделала)"]], "Перевод эллипсиса"],
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
const outPath = process.argv[2] || 'src/data/exercises-en.json'
writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
console.log(`Written ${exercises.length} exercises for ${topics.length} topics to ${outPath}`)
