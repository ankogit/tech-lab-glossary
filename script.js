"use strict";
// my helpers...
const $ = function (t = null) {
  return new (class {
    constructor(t) {
      t &&
        ((this.nodes = t.nodeType
          ? [t]
          : NodeList.prototype.isPrototypeOf(t)
          ? t
          : document.querySelectorAll(t)),
        (this.n = this.nodes[0]));
    }
    each = (t) => (this.nodes.forEach((s) => t(s)), this);
    addClass = (t) =>
      this.each(
        (s) => s.classList.add(...t.split(",").map((t) => t.trim())),
        this
      );
    html = (t) => this.each((s) => (s.innerHTML = t));
    create = (t) => $(document.createElement(t));
    append = (t) => {
      let s = this.create(t);
      return this.n.appendChild(s.n), s;
    };
    remove = () => this.each((_node) => _node.remove());
    insertAfter = (t) => (t.n.after(this.n), this);
    setAttr = (t, s = "") => this.each((e) => e.setAttribute(t, s), this);
    sCreate = (t) => {
      let s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      return (
        s.setAttributeNS(
          "http://www.w3.org/2000/xmlns/",
          "xmlns:xlink",
          "http://www.w3.org/1999/xlink"
        ),
        s.setAttribute("viewBox", t),
        $(s)
      );
    };
    sAppend = (t) => (this.n.appendChild(t.n), this);
    sC = (t) => document.createElementNS("http://www.w3.org/2000/svg", t);
    id = (t) => (this.setAttr("id", t), this);
    d = (t) => (this.setAttr("d", t), this);
    fill = (t) => (this.setAttr("fill", t), this);
    stroke = (t) => (this.setAttr("stroke", t), this);
    strokeWidth = (t) => (this.setAttr("stroke-width", t), this);
    sBezier = (t, s, e, i) =>
      $(this.sC("path")).d(
        `M${t},${s} C ${(t + e) / 2},${s} ${(t + e) / 2},${i} ${e},${i}`
      );
  })(t);
};
// by resize repaint SVG
const resizeObserver = new ResizeObserver((entries) => {
  $("#mySVG").remove();
  drawLines(data);
});

function createMap(data) {
  //find depth of Elements
  function findDepth(id, depth = 0) {
    while (id !== null) {
      let aktEl = data.filter((x) => x.id == id);
      depth++;
      id = aktEl[0].parentId;
      if (id == null) depth = depth * aktEl[0].div;
    }
    return depth;
  }
  // first div at right side (-1*-1=1)
  var aktDiv = -1;
  // swap between left and right side
  data
    .filter((x) => x.parentId == null)
    .forEach((x) => {
      x.div = aktDiv;
      aktDiv *= -1;
    });
  // set root Elements div = 0
  data.find((x) => x.id == null).div = 0;
  // set divs for Childs
  data
    .filter((x) => x.parentId !== null && x.id !== null)
    .forEach((x) => (x.div = findDepth(x.id)));
  // find min and max Div-Number
  let minDiv = Math.min(...data.map((item) => item.div));
  let maxDiv = Math.max(...data.map((item) => item.div));
  // create Divs in container
  for (let i = minDiv; i <= maxDiv; i++) {
    $("#container").append("div").id(`div${i}`).addClass("f-col");
  }
  // put paragraphs in Div´s
  data.forEach((el) => {
    $(`#div${el.div}`)
      .append("p")
      .html(el.text)
      .id(`p${el.id}`)
      .append("span")
      .html(el.desc);
    // $(`#div${el.div}`).append('span').html(el.desc)
  });
}

function drawLines(data) {
  // find Coordinates from Container
  let mC = $("#container").n.getBoundingClientRect();
  // create SVG with same ViewportSize as Container
  $()
    .sCreate(`0,0,${mC.width},${mC.height}`)
    .setAttr("id", "mySVG")
    .insertAfter($("body > h1"));
  // set SVG at same Position as Container
  $("#mySVG").n.style = `top:${mC.top}px;left:${mC.left}px;
        width:${mC.width}px;height:${mC.height}px;`;
  // create Bezier from Element's to Parent´s
  data.forEach((el) => {
    if ("parentId" in el) {
      let aktEl = $(`#p${el.id}`).n.getBoundingClientRect();
      let parEl = $(`#p${el.parentId}`).n.getBoundingClientRect();
      let aktLeft =
        aktEl.left < parEl.left ? aktEl.left + aktEl.width : aktEl.left;
      let parLeft =
        aktEl.left > parEl.left ? parEl.left + parEl.width : parEl.left;
      $("#mySVG").sAppend(
        $()
          .sBezier(
            aktLeft - mC.left,
            aktEl.top - mC.top + aktEl.height / 2,
            parLeft - mC.left,
            parEl.top - mC.top + parEl.height / 2
          )
          .addClass("path")
      );
    }
  });
}
// const data = [
//   { id: null , text: "<b>Test<br>Mind Map</b>", desc: "Redis – это хранилище структур данных в памяти, используемое в качестве распределенной базы данных значений ключей в памяти, кэша и брокера сообщений с дополнительной долговечностью. Redis поддерживает различные виды абстрактных структур данных, таких как строки"},
//   { id: 1 , parentId: null, text: "Idea - 1" },
//   { id: 2 , parentId: null, text: "Dr. Helmut Zimmermann" },
//   { id: 3 , parentId: null, text: "Idea - 3" },
//   { id: 4 , parentId: 1, text: "order Cake and <b>Coffee</b>" },
//   { id: 5 , parentId: 1, text: "Idea - 1 - 2 " },
//   { id: 6 , parentId: 3, text: "Idea - 3 - 1 " },
//   { id: 7 , parentId: 3, text: "Idea- 3 - 2" },
//   { id: 123 , parentId: 3, text: "Idea- 3 - 2" },
//   { id: 10 , parentId: 2, text: "Idea - 2 - 1" },
//   { id: 12 , parentId: 2, text: "Idea - 2 - 2" },
// ];

const data = [
  {
    id: null,
    text: "Глоссарий",
    desc: "Наведя курсор можно увидеть определение термина"
  },

  {
    id: 1,
    parentId: null,
    text: "Голосовой ассистент",
    desc:
      "Программное приложение, способное обрабатывать голосовые команды и выполнять соответствующие действия."
  },
  {
    id: 2,
    parentId: 1,
    text: "Транскрибирование",
    desc: "Процесс перевода устной речи в письменный текст."
  },
  {
    id: 3,
    parentId: 1,
    text: "Диктор",
    desc:
      "Человек, чьи голосовые данные используются для обучения моделей распознавания речи."
  },
  {
    id: 4,
    parentId: 1,
    text: "Акустическая модель",
    desc:
      "Модель, используемая для распознавания фонем и слов на основе акустических признаков речи."
  },
  {
    id: 5,
    parentId: 1,
    text: "Голосовые фичи",
    desc:
      "Характеристики голоса, используемые для анализа и распознавания речи."
  },
  {
    id: 6,
    parentId: null,
    text: "Утилита транскрибирования",
    desc:
      "Программное обеспечение, способное автоматически переводить речь в текст."
  },
  {
    id: 7,
    parentId: 6,
    text: "Модель распознавания голоса",
    desc:
      "Модель машинного обучения, способная распознавать и транскрибировать голосовые данные."
  },
  {
    id: 8,
    parentId: 6,
    text: "Алгоритм сегментации речи",
    desc:
      "Алгоритм, используемый для выделения отдельных слов или фраз из аудиозаписи."
  },
  {
    id: 9,
    parentId: 6,
    text: "Синтез речи",
    desc: "Процесс генерации искусственной речи на основе текстовых данных."
  },
  {
    id: 10,
    parentId: 6,
    text: "Голосовой интерфейс",
    desc:
      "Интерфейс, позволяющий взаимодействовать с устройством с помощью голосовых команд."
  },
  {
    id: 11,
    parentId: null,
    text: "Методы машинного обучения",
    desc:
      "Алгоритмы и модели, используемые для обучения систем распознавания и синтеза речи."
  },
  {
    id: 12,
    parentId: 11,
    text: "Данные обучения",
    desc:
      "Наборы звукозаписей и текстовых транскрипций, используемые для обучения моделей распознавания речи."
  },
  {
    id: 13,
    parentId: 11,
    text: "Mel-частотные кепстральные коэффициенты (MFCC)",
    desc:
      "Характеристики звуковых сигналов, широко используемые в анализе речи."
  },
  {
    id: 14,
    parentId: 11,
    text: "Подавление шума",
    desc:
      "Техника обработки аудиосигналов, направленная на уменьшение влияния фонового шума на распознавание речи."
  },
  {
    id: 15,
    parentId: 11,
    text: "Графематическое выравнивание",
    desc:
      "Процесс сопоставления фонем речи с соответствующими буквенными символами в тексте."
  },
  {
    id: 16,
    parentId: 11,
    text: "Подготовка данных",
    desc:
      "Процесс обработки и подготовки голосовых данных к использованию в обучении моделей распознавания речи."
  },
  {
    id: 17,
    parentId: 11,
    text: "Последовательная модель",
    desc:
      "Модель машинного обучения, способная работать с последовательными данными, такими как речь."
  },
  {
    id: 18,
    parentId: null,
    text: "Автоматическая речь",
    desc:
      "Технология, позволяющая генерировать речь автоматически на основе заданных текстовых данных."
  },
  {
    id: 19,
    parentId: 18,
    text: "Распознавание множественных говорящих",
    desc:
      "Способность распознавать и разделять речь нескольких говорящих, находящихся в одной среде."
  },
  {
    id: 20,
    parentId: 18,
    text: "Linguistic Unit",
    desc: "Минимальная единица речевого сигнала, такая как фонема или слово."
  },
  {
    id: 21,
    parentId: 18,
    text: "Сверточная нейронная сеть",
    desc:
      "Тип нейронной сети, используемый для обработки двумерных данных, таких как звуковые сигналы."
  },
  {
    id: 22,
    parentId: 18,
    text: "Рекуррентная нейронная сеть",
    desc:
      "Тип нейронной сети, способной обрабатывать последовательные данные, такие как речь."
  },
  {
    id: 23,
    parentId: 18,
    text: "Функциональное программирование",
    desc:
      "Парадигма программирования, используемая для разработки алгоритмов обработки голосовых данных."
  },
  {
    id: 24,
    parentId: null,
    text: "Веб-приложение",
    desc:
      "Программное обеспечение, предназначенное для доступа через веб-браузер и выполнения различных функций на стороне пользователя."
  },
  {
    id: 25,
    parentId: 24,
    text: "Фронтенд",
    desc:
      "Часть веб-приложения, отвечающая за внешний вид и взаимодействие с пользователем."
  },
  {
    id: 26,
    parentId: 24,
    text: "Бэкенд",
    desc:
      "Часть веб-приложения, отвечающая за обработку запросов, бизнес-логику приложения и взаимодействие с базой данных."
  },
  {
    id: 27,
    parentId: 24,
    text: "JavaScript (JS)",
    desc:
      "Язык программирования, применяемый для создания динамических элементов и функций на стороне клиента."
  },
  {
    id: 28,
    parentId: 24,
    text: "PHP",
    desc:
      "Скриптовый язык программирования, используемый для разработки серверной части веб-приложений."
  },
  {
    id: 29,
    parentId: 24,
    text: "API (Application Programming Interface)",
    desc:
      "Набор правил и протоколов, определяющий способы взаимодействия между различными компонентами программного обеспечения."
  },
  {
    id: 30,
    parentId: 24,
    text: "MVC (Model-View-Controller)",
    desc:
      "Паттерн разработки, который разделяет приложение на три основных компонента: модель, представление и контроллер."
  },
  {
    id: 31,
    parentId: 24,
    text: "AJAX (Asynchronous JavaScript and XML)",
    desc:
      "Технология, позволяющая отправлять и получать данные с сервера асинхронно без перезагрузки страницы."
  },
  {
    id: 32,
    parentId: 24,
    text: "RESTful API",
    desc:
      "Архитектурный стиль взаимодействия между клиентом и сервером, основанный на принципах HTTP."
  },
  {
    id: 33,
    parentId: 24,
    text: "Сеанс",
    desc:
      "Временное взаимодействие между пользователем и сервером в рамках одной сессии использования приложения."
  },
  {
    id: 34,
    parentId: 24,
    text: "Валидация",
    desc:
      "Процесс проверки вводимых пользователем данных на соответствие установленным правилам и стандартам."
  },
  {
    id: 35,
    parentId: 24,
    text: "HTML (HyperText Markup Language)",
    desc:
      "Язык разметки, используемый для создания структуры веб-страниц и приложений."
  },
  {
    id: 36,
    parentId: 24,
    text: "CSS (Cascading Style Sheets)",
    desc: "Язык таблиц стилей, определяющий внешний вид элементов веб-страницы."
  },
  {
    id: 37,
    parentId: 24,
    text: "Отправка форм",
    desc:
      "Процесс передачи данных от клиентского устройства к серверу для обработки."
  },
  {
    id: 38,
    parentId: 24,
    text: "Аутентификация",
    desc:
      "Процесс проверки подлинности пользователей, обеспечивающий доступ к защищенным ресурсам."
  },
  {
    id: 39,
    parentId: 24,
    text: "Шаблонизация",
    desc:
      "Процесс создания шаблонов для динамической генерации HTML-кода на стороне сервера."
  },
  {
    id: 40,
    parentId: 24,
    text: "XSS (Cross-Site Scripting)",
    desc:
      "Тип атаки на веб-приложения, целью которой является выполнение вредоносного кода на стороне клиента."
  },
  {
    id: 41,
    parentId: 24,
    text: "Сервер Apache",
    desc:
      "Веб-сервер, используемый для хостинга веб-приложений, также способен обработать PHP код."
  },
  {
    id: 42,
    parentId: 24,
    text: "Node.js",
    desc:
      "Среда выполнения JavaScript на сервере, обеспечивающая возможность создания масштабируемых сетевых приложений."
  },
  {
    id: 43,
    parentId: 24,
    text: "JSON (JavaScript Object Notation)",
    desc:
      "Формат обмена данными, широко применяемый в веб-приложениях для передачи структурированных данных."
  },
  {
    id: 44,
    parentId: 24,
    text: "Отладка",
    desc:
      "Процесс поиска, анализа и устранения ошибок в программном коде для обеспечения корректной работы приложения."
  },
  {
    id: 45,
    parentId: 24,
    text: "ORM (Object-Relational Mapping)",
    desc:
      "Технология, позволяющая устанавливать соответствие между объектами приложения и записями в реляционной базе данных."
  },
  {
    id: 46,
    parentId: 24,
    text: "Авторизация",
    desc:
      "Процесс предоставления разрешения на доступ к определенным ресурсам веб-приложения."
  },
  {
    id: 47,
    parentId: 24,
    text: "Интеграция БД",
    desc:
      "Процесс объединения данных из различных источников в реляционной базе данных."
  },
  {
    id: 48,
    parentId: 24,
    text: "Безопасность",
    desc:
      "Обеспечение защиты веб-приложения от посторонних угроз, таких как взлом, атаки или утечки данных."
  },
  {
    id: 49,
    parentId: 24,
    text: "Создание маршрутов",
    desc:
      "Процесс определения путей в веб-приложении для обработки различных HTTP-запросов."
  },
  {
    id: 50,
    parentId: 24,
    text: "Dependency Management",
    desc: "Процесс управления зависимостями и библиотеками веб-приложения."
  },
  {
    id: 51,
    parentId: 24,
    text: "Поле ввода данных",
    desc:
      "Элемент интерфейса, позволяющий пользователю вводить и отправлять информацию на сервер."
  },
  {
    id: 52,
    parentId: 24,
    text: "Методы запросов (GET, POST, PUT, DELETE)",
    desc:
      "Основные методы HTTP-запросов, используемые для взаимодействия с сервером."
  },
  {
    id: 53,
    parentId: 24,
    text: "Обновление данных",
    desc:
      "Процесс изменения информации в базе данных на стороне сервера с использованием веб-приложения."
  }
];
createMap(data);
resizeObserver.observe($("#container").n);
