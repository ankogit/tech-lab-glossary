"use strict";

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

//перерисовка SVG при изменении размера экрана
const resizeObserver = new ResizeObserver((entries) => {
  $("#mySVG").remove();
  drawLines(data);
});

function createMap(data) {
  //находим глубину элементов
  function findDepth(id, depth = 0) {
    while (id !== null) {
      let aktEl = data.filter((x) => x.id == id);
      depth++;
      id = aktEl[0].parentId;
      if (id == null) depth = depth * aktEl[0].div;
    }
    return depth;
  }
  // первый div с правой стороны (-1*-1=1)
  var aktDiv = -1;
  // заменить левую и правую стороны
  data
    .filter((x) => x.parentId == null)
    .forEach((x) => {
      x.div = aktDiv;
      aktDiv *= -1;
    });
  // установить корневые элементы div = 0
  data.find((x) => x.id == null).div = 0;
  // установить для дочерних элементов
  data
    .filter((x) => x.parentId !== null && x.id !== null)
    .forEach((x) => (x.div = findDepth(x.id)));
  // найти мин, макс Div-номер
  let minDiv = Math.min(...data.map((item) => item.div));
  let maxDiv = Math.max(...data.map((item) => item.div));
  // создать Div в контейнере
  for (let i = minDiv; i <= maxDiv; i++) {
    $("#container").append("div").id(`div${i}`).addClass("f-col");
  }
  // добавить P в Div
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
  // найти координаты контейнера
  let mC = $("#container").n.getBoundingClientRect();
  // создать SVG в томже Viewport что и контейнер
  $()
    .sCreate(`0,0,${mC.width},${mC.height}`)
    .setAttr("id", "mySVG")
    .insertAfter($("body > h1"));
  // установить SVG поцицию такую же что и у контейнера
  $("#mySVG").n.style = `top:${mC.top}px;left:${mC.left}px;
        width:${mC.width}px;height:${mC.height}px;`;
  // создать кривую безье от элемента до родителя
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
let data = [];
// { id: 1 , parentId: null, text: "Idea - 1" },

fetch("https://mandarinshow.ru/api/mind-map")
  .then((response) => response.json())
  .then((dataFromBackend) => {
    data = dataFromBackend;
    createMap(data);
    resizeObserver.observe($("#container").n);
  })
  .catch((error) => console.error("Ошибка при запросе к бэкенду:", error));

// createMap(data);
// resizeObserver.observe($("#container").n);