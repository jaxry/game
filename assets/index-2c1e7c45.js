class Component {
  element;
  parentComponent;
  childComponents = /* @__PURE__ */ new Set();
  destroyCallbacks = [];
  constructor(element = document.createElement("div")) {
    this.element = element;
  }
  newComponent(constructor, ...args) {
    const component = new constructor(...args);
    component.parentComponent = this;
    this.childComponents.add(component);
    return component;
  }
  appendTo(parent) {
    parent.append(this.element);
    this.onInit?.();
    return this;
  }
  putBefore(element) {
    element.before(this.element);
    this.onInit?.();
    return this;
  }
  putAfter(element) {
    element.after(this.element);
    this.onInit?.();
    return this;
  }
  onRemove(unsubscribe) {
    this.destroyCallbacks.push(unsubscribe);
  }
  remove() {
    this.element.remove();
    for (const callback of this.destroyCallbacks) {
      callback();
    }
    this.destroyCallbacks.length = 0;
    for (const component of this.childComponents) {
      component.remove();
    }
    this.parentComponent?.childComponents.delete(this);
    this.parentComponent = void 0;
  }
  on(event, listener) {
    this.onRemove(event.on(listener));
  }
}

function createElement(parent, tag, cls, text) {
  const element = document.createElement(tag);
  if (parent) {
    parent.append(element);
  }
  if (cls) {
    element.classList.add(cls);
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}
function createDiv(parent, cls, text) {
  return createElement(parent, "div", cls, text);
}
function createSpan(parent, cls, text) {
  return createElement(parent, "span", cls, text);
}
function createTextNode(parent, text) {
  const node = document.createTextNode(text);
  parent.append(document.createTextNode(text));
  return node;
}

const sheet = createElement(document.head, "style").sheet;
let nextId$2 = 1;
function addStyle(selector, style) {
  const contentStr = style.content ? `content: '${style.content}';` : ``;
  const index = sheet.insertRule(
    `${selector} {${contentStr}}`,
    sheet.cssRules.length
  );
  const rule = sheet.cssRules[index];
  Object.assign(rule.style, style);
}
function makeStyle(style) {
  const className = `style-${nextId$2++}`;
  if (style) {
    addStyle(`.${className}`, style);
  }
  return className;
}
function makeKeyframes(from, to) {
  const name = `makeKeyframes-${nextId$2++}`;
  const index = sheet.insertRule(`@keyframes ${name} { from {} to {} }`);
  const keyframes = sheet.cssRules[index];
  const fromKeyframe = keyframes.cssRules[0];
  Object.assign(fromKeyframe.style, from);
  const toKeyframe = keyframes.cssRules[1];
  Object.assign(toKeyframe.style, to);
  return name;
}
function hoverStyle(className, style) {
  addStyle(`.${className}:hover`, style);
}

function mod(x, n) {
  return (x % n + n) % n;
}
function clamp(min, max, x) {
  return Math.min(max, Math.max(min, x));
}
function toPrecision(x, numDecimals = 0) {
  return Math.round(x * 10 ** numDecimals) / 10 ** numDecimals;
}
function randomCentered(scale = 1) {
  return scale * (Math.random() - 0.5);
}
function noisy(x, scale = 1) {
  return x * (1 + randomCentered(scale));
}
function randomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}
function makeArray(size, map) {
  const array = new Array(size);
  for (let i = 0; i < size; i++) {
    array[i] = map(i);
  }
  return array;
}
function castArray(value) {
  return value === void 0 ? [] : Array.isArray(value) ? value : [value];
}
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function deleteElem(array, elem) {
  const index = array.indexOf(elem);
  if (index >= 0) {
    array.splice(index, 1);
  }
}
function sortDescending(array, accessor) {
  return array.sort((a, b) => accessor(b) - accessor(a));
}
function find(list, iteratee) {
  for (const elem of list) {
    if (iteratee(elem)) {
      return elem;
    }
  }
}
function mapFilter(iterable, mapFn) {
  const array = [];
  let i = 0;
  for (const x of iterable) {
    const fx = mapFn(x, i++);
    if (fx !== void 0) {
      array.push(fx);
    }
  }
  return array;
}
function reduce(iterable, reduceFn, initialValue) {
  let acc = initialValue;
  for (const x of iterable) {
    acc = reduceFn(acc, x);
  }
  return acc;
}
function every(iterable, iteratee) {
  for (const elem of iterable) {
    if (!iteratee(elem)) {
      return false;
    }
  }
  return true;
}
function randomSetElement(set) {
  let i = Math.floor(Math.random() * set.size);
  for (const elem of set) {
    if (i-- === 0) {
      return elem;
    }
  }
}
function getAndDelete(map, key) {
  const value = map.get(key);
  map.delete(key);
  return value;
}
function makeOrGet(map, key, makeFn) {
  if (!map.has(key)) {
    map.set(key, makeFn());
  }
  return map.get(key);
}
function swap(obj, i, j) {
  const t = obj[i];
  obj[i] = obj[j];
  obj[j] = t;
}
let lastZIndex = 0;
function moveToTop(node) {
  node.style.zIndex = (++lastZIndex).toString();
}
function px(num) {
  return `${num}px`;
}
function translate(x, y) {
  return `translate(${px(x)}, ${px(y)})`;
}

class LCH {
  constructor(l, c, h) {
    this.l = l;
    this.c = c;
    this.h = h;
  }
  toString() {
    return `oklch(${this.l}% ${this.c * 0.4 / 100} ${mod(this.h, 1) * 360})`;
  }
  addL(l) {
    return new LCH(this.l + l, this.c, this.h);
  }
  setL(l) {
    return new LCH(l, this.c, this.h);
  }
  addC(c) {
    return new LCH(this.l, this.c + c, this.h);
  }
  setC(c) {
    return new LCH(this.l, c, this.h);
  }
  addH(h) {
    return new LCH(this.l, this.c, this.h + h);
  }
  setH(h) {
    return new LCH(this.l, this.c, h);
  }
}

const baseSpeed = 800;
const duration = {
  short: 150,
  normal: baseSpeed,
  long: baseSpeed * 2
};
const fadeInKeyframes = makeKeyframes({ opacity: `0` }, { opacity: `1` });
function fadeIn(element, animDuration = duration.normal) {
  return element.animate({
    opacity: [`0`, `1`],
    scale: [`0`, `1`]
  }, {
    duration: animDuration,
    easing: `ease`,
    delay: animDuration / 4,
    fill: `backwards`
  });
}
function fadeOut(element, onFinish, animDuration = duration.normal) {
  const animation = element.animate({
    opacity: `0`,
    scale: `0`
  }, {
    duration: animDuration,
    easing: `ease`
  });
  animation.onfinish = onFinish;
  return animation;
}
const backgroundColor = new LCH(20, 5, Math.random());
const textColor = backgroundColor.setL(90);
const windowColor = backgroundColor.addL(15).addC(4).addH(randomSign() / 8);
const mapNodeColor = backgroundColor.addL(10).addC(4);
const mapNodeSimpleColor = backgroundColor.addL(5);
const mapEdgeColor = backgroundColor.addL(20);
const objectCardColor = new LCH(
  50,
  10,
  backgroundColor.h + randomSign() / 2
);
const objectCardPlayerColor = objectCardColor.addC(25);
const objectTextColor = objectCardColor.setL(textColor.l);
const actionColor = objectCardColor.setL(textColor.l).addC(25).addH(randomSign() / 4);
const actionTimeColor = actionColor.addH(randomSign() / 8);
const gameDataColor = textColor.addC(25).addH(randomSign() / 4);
const borderRadius = "0.25rem";
const boxShadow = `0rem 0.1rem 0.5rem #0003`;
const boxShadowLarge = `0rem 0.5rem 2rem #0004`;
const buttonStyle = makeStyle({
  width: `max-content`,
  padding: `0.25rem 0.5rem`,
  border: `2px solid #fff3`,
  borderRadius
});
hoverStyle(buttonStyle, {
  background: `#fff1`
});
const textButtonStyle = makeStyle({});
hoverStyle(textButtonStyle, {
  color: `#fff`
});
const dataStyle = makeStyle({
  color: gameDataColor
});

let nextConstructorId = 1;
const idToConstructor = /* @__PURE__ */ new Map();
const constructorToId = /* @__PURE__ */ new WeakMap();
const constructorToTransform = /* @__PURE__ */ new WeakMap();
const constructorToDeserializeCallback = /* @__PURE__ */ new WeakMap();
function serializable(constructor, options) {
  const id = nextConstructorId++;
  idToConstructor.set(id, constructor);
  constructorToId.set(constructor, id);
  addInheritedProperty(
    constructor,
    constructorToTransform,
    (transform, parentTransform) => {
      return parentTransform ? { ...parentTransform, ...transform } : transform;
    },
    options?.transform
  );
  addInheritedProperty(
    constructor,
    constructorToDeserializeCallback,
    (callback, parentCallback) => {
      return parentCallback ? combineFunctions(parentCallback, callback) : callback;
    },
    options?.afterDeserialize
  );
}
serializable.ignore = () => void 0;
function serialize(toSerialize) {
  const sharedObjects = new SharedObjects();
  sharedObjects.find(toSerialize);
  function prepare(value, makeSharedReference = true) {
    if (isPrimitive(value)) {
      return value;
    }
    const object = value;
    const sharedId = makeSharedReference && sharedObjects.getId(object);
    if (sharedId !== false) {
      return `→${sharedId}`;
    }
    if (object instanceof Set) {
      const $s = mapFilter(object, (value2) => prepare(value2));
      return $s.length ? { $s } : void 0;
    } else if (object instanceof Map) {
      const $m = mapFilter(
        object,
        ([key, value2]) => [prepare(key), prepare(value2)]
      );
      return $m.length ? { $m } : void 0;
    } else if (Array.isArray(object)) {
      const mapped = mapFilter(object, (value2) => prepare(value2));
      return mapped.length ? mapped : void 0;
    } else if (object.constructor === Object) {
      return prepareObjectLiteral(object);
    } else {
      return prepareInstance(object);
    }
  }
  function prepareObjectLiteral(object) {
    const copy = {};
    for (const key in object) {
      copy[key] = prepare(object[key]);
    }
    return copy;
  }
  function prepareInstance(object) {
    let copy = {};
    const id = constructorToId.get(object.constructor);
    if (!id) {
      if (object.constructor.name && object.constructor.$serialize !== false) {
        console.warn(
          object.constructor.name,
          `class needs to be passed to 'serializable'`
        );
      }
      return;
    }
    let i = 0;
    for (const key in object) {
      const encodedKey = getPropEncoding(i++);
      const value = object[key];
      const transform = getTransformToFn(object, key);
      const transformed = transform && value !== void 0 ? transform(value) : value;
      const prepared = prepare(transformed);
      if (prepared !== void 0) {
        copy[encodedKey] = prepared;
      }
    }
    copy.$c = id;
    return copy;
  }
  const toStringify = {
    object: prepare(toSerialize),
    shared: mapFilter(
      sharedObjects.usedSharedObjects,
      (object) => prepare(object, false)
    )
  };
  return JSON.stringify(toStringify);
}
function deserialize(json) {
  const { object, shared } = JSON.parse(json);
  const sharedRevived = shared.map((object2) => {
    return instantiateFromTemplate(object2);
  });
  function revive(value, copy) {
    if (typeof value === "string" && value[0] === "→") {
      return sharedRevived[parseFloat(value.slice(1))];
    } else if (isPrimitive(value)) {
      return value;
    }
    copy = copy ?? instantiateFromTemplate(value);
    if (copy instanceof Set) {
      for (const item of value.$s) {
        copy.add(revive(item));
      }
    } else if (copy instanceof Map) {
      for (const [key, item] of value.$m) {
        copy.set(revive(key), revive(item));
      }
    } else if (copy.constructor === Object || Array.isArray(copy)) {
      for (const key in value) {
        copy[key] = revive(value[key]);
      }
    } else {
      const propEncoding2 = getPropEncodingMap(copy);
      for (const encodedKey in value) {
        if (encodedKey[0] === "$") {
          continue;
        }
        const revived = revive(value[encodedKey]);
        const key = propEncoding2[encodedKey];
        const transform = getTransformFromFn(copy, key);
        copy[key] = transform?.(revived) ?? revived;
      }
      constructorToDeserializeCallback.get(copy.constructor)?.(copy);
    }
    return copy;
  }
  for (let i = 0; i < shared.length; i++) {
    revive(shared[i], sharedRevived[i]);
  }
  return revive(object);
}
function instantiateFromTemplate(object) {
  if (object.$c) {
    const Constructor2 = idToConstructor.get(object.$c);
    return new Constructor2();
  } else if (Array.isArray(object)) {
    return [];
  } else if (object.$s) {
    return /* @__PURE__ */ new Set();
  } else if (object.$m) {
    return /* @__PURE__ */ new Map();
  } else {
    return {};
  }
}
function getTransformToFn(object, key) {
  const transform = constructorToTransform.get(object.constructor)?.[key];
  return Array.isArray(transform) ? transform[0] : transform;
}
function getTransformFromFn(object, key) {
  const transform = constructorToTransform.get(object.constructor)?.[key];
  return Array.isArray(transform) ? transform[1] : void 0;
}
function addInheritedProperty(constructor, constructorToProp, transform, property) {
  const parentProp = findParentInMap(constructor, constructorToProp);
  if (parentProp && property === void 0) {
    constructorToProp.set(constructor, parentProp);
  } else if (property !== void 0) {
    const transformed = transform(property, parentProp);
    constructorToProp.set(constructor, transformed);
  }
}
function findParentInMap(constructor, map) {
  let parent = Object.getPrototypeOf(constructor);
  while (parent?.name) {
    if (map.has(parent)) {
      return map.get(parent);
    }
    parent = Object.getPrototypeOf(parent);
  }
}
class SharedObjects {
  // Use set instead of array
  // This allows for iterating over set while adding extra elements via
  // more calls to this.getId
  usedSharedObjects = /* @__PURE__ */ new Set();
  objectSet = /* @__PURE__ */ new WeakSet();
  sharedObjects = /* @__PURE__ */ new WeakMap();
  find(object) {
    if (isPrimitive(object)) {
      return;
    }
    if (this.objectSet.has(object)) {
      this.sharedObjects.set(object, -1);
      return;
    }
    if (object instanceof Set || object instanceof Array) {
      this.objectSet.add(object);
      for (const value of object) {
        this.find(value);
      }
    } else if (object instanceof Map) {
      this.objectSet.add(object);
      for (const [key, value] of object) {
        this.find(key);
        this.find(value);
      }
    } else if (object.constructor === Object || constructorToId.has(object.constructor)) {
      this.objectSet.add(object);
      for (const key in object) {
        this.find(object[key]);
      }
    }
  }
  getId(object) {
    let id = this.sharedObjects.get(object);
    if (id === void 0) {
      return false;
    }
    if (id === -1) {
      id = this.usedSharedObjects.size;
      this.sharedObjects.set(object, id);
      this.usedSharedObjects.add(object);
    }
    return id;
  }
}
const propEncoding = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const propEncodingMaps = /* @__PURE__ */ new WeakMap();
function getPropEncoding(i) {
  if (i >= propEncoding.length) {
    throw new Error("Your class has more props than serialize supports.");
  }
  return propEncoding[i];
}
function getPropEncodingMap(object) {
  return makeOrGet(propEncodingMaps, object.constructor, () => {
    const propMap = {};
    let i = 0;
    for (const key in object) {
      propMap[getPropEncoding(i++)] = key;
    }
    return propMap;
  });
}
function isPrimitive(value) {
  return value === null || typeof value !== "object";
}
function combineFunctions(fn1, fn2) {
  return (...args) => {
    fn1(...args);
    fn2(...args);
  };
}

class GameTime {
  static second = 1;
  static millisecond = 1e-3 * GameTime.second;
  static minute = 60 * GameTime.second;
  static hour = 60 * GameTime.minute;
  static day = 24 * GameTime.hour;
  current = 0;
  static displaySeconds(time) {
    return (time * GameTime.second).toFixed(1);
  }
  getSecondOfMinute() {
    return Math.floor(this.current / GameTime.second) % 60;
  }
  getMinuteOfHour() {
    return Math.floor(this.current / GameTime.minute) % 60;
  }
  getHourOfDay() {
    return Math.floor(this.current / GameTime.hour) % 24;
  }
  getTimeOfDay() {
    return this.getHourOfDay().toString().padStart(2, `0`) + `:` + this.getMinuteOfHour().toString().padStart(2, `0`) + `:` + this.getSecondOfMinute().toString().padStart(2, `0`);
  }
}
serializable(GameTime);

class Observable {
  listeners = /* @__PURE__ */ new Set();
  on(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  emit(data) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
}

class PriorityQueue {
  elements = [];
  priority = [];
  get length() {
    return this.elements.length;
  }
  add(element, priority) {
    this.elements.push(element);
    this.priority.push(priority);
    let i = this.elements.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      const parentPriority = this.priority[parent];
      if (priority < parentPriority) {
        swap(this.elements, i, parent);
        swap(this.priority, i, parent);
        i = parent;
      } else {
        return;
      }
    }
  }
  pop() {
    if (this.elements.length === 1) {
      this.priority.pop();
      return this.elements.pop();
    }
    const head = this.elements[0];
    this.elements[0] = this.elements.pop();
    this.priority[0] = this.priority.pop();
    let i = 0;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < this.elements.length && this.priority[left] < this.priority[smallest]) {
        smallest = left;
      }
      if (right < this.elements.length && this.priority[right] < this.priority[smallest]) {
        smallest = right;
      }
      if (smallest !== i) {
        swap(this.elements, i, smallest);
        swap(this.priority, i, smallest);
        i = smallest;
      } else {
        return head;
      }
    }
  }
  peekPriority() {
    return this.priority[0];
  }
  clear() {
    this.elements.length = 0;
    this.priority.length = 0;
  }
}
serializable(PriorityQueue, {
  transform: {
    priority: (priority) => priority.map((p) => toPrecision(p, 3))
  }
});

class GameObjectType {
  name;
  description;
  effects;
  energy;
  isContainer;
  composedOf;
  element;
}
const typeToId = /* @__PURE__ */ new Map();
const idToType = /* @__PURE__ */ new Map();
let nextId$1 = 1;
const elementToType = /* @__PURE__ */ new Map();
function makeType(template) {
  const type = Object.assign(new GameObjectType(), template);
  const id = nextId$1++;
  typeToId.set(type, id);
  idToType.set(id, type);
  if (type.element) {
    elementToType.set(type.element, type);
  }
  return type;
}
function getIdFromType(type) {
  return typeToId.get(type);
}
function getTypeFromId(id) {
  return idToType.get(id);
}

class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  vx = 0;
  vy = 0;
}

let nextId = 1;
class GameObject {
  id = nextId++;
  type;
  effects;
  activeAction;
  container;
  containedAs;
  contains;
  // connections to other game objects on a 2D planar graph
  connections;
  position;
  energy;
  events;
  childEvents;
  constructor(type) {
    this.type = type;
  }
  on(event, listener) {
    if (!this.events) {
      this.events = new GameObjectEvents();
    }
    if (!this.events[event]) {
      this.events[event] = /* @__PURE__ */ new Set();
    }
    this.events[event].add(listener);
    return new ActiveGameObjectEvent(this.events[event], listener);
  }
  onChildren(event, listener) {
    if (!this.childEvents) {
      this.childEvents = new GameObjectEvents();
    }
    if (!this.childEvents[event]) {
      this.childEvents[event] = /* @__PURE__ */ new Set();
    }
    this.childEvents[event].add(listener);
    return new ActiveGameObjectEvent(this.childEvents[event], listener);
  }
  emit(event, ...data) {
    const listeners = this.events?.[event];
    if (listeners) {
      for (const listener of listeners) {
        listener(...data);
      }
    }
    const childListeners = this.container?.childEvents?.[event];
    if (childListeners) {
      for (const listener of childListeners) {
        listener(this, ...data);
      }
    }
  }
}
class GameObjectEvents {
  // objects being contained or taken out of the event object
  enter;
  leave;
  // actions starting/finishing on a contained object of the event object
  actionStart;
  actionEnd;
  speak;
}
var ContainedAs = /* @__PURE__ */ ((ContainedAs2) => {
  ContainedAs2[ContainedAs2["inside"] = 0] = "inside";
  ContainedAs2[ContainedAs2["holding"] = 1] = "holding";
  return ContainedAs2;
})(ContainedAs || {});
class ActiveGameObjectEvent {
  constructor(listeners, listener) {
    this.listeners = listeners;
    this.listener = listener;
  }
  unsubscribe() {
    this.listeners.delete(this.listener);
  }
}
serializable(GameObject, {
  transform: {
    id: serializable.ignore,
    events: serializable.ignore,
    childEvents: serializable.ignore,
    container: serializable.ignore,
    // added back in Game class
    type: [
      (type) => getIdFromType(type),
      (id) => getTypeFromId(id)
    ],
    position: [
      (position) => ({
        x: toPrecision(position.x, 0),
        y: toPrecision(position.y, 0)
      }),
      ({ x, y }) => new Point(x, y)
    ]
  }
});

function moveTo(container, object, containedAs) {
  if (!container.type.isContainer) {
    console.warn(container, " is not a container");
  }
  if (!container.contains) {
    container.contains = /* @__PURE__ */ new Set();
  }
  const from = object.container;
  object.emit("leave", container);
  removeFromContainer(object);
  object.container = container;
  object.containedAs = containedAs;
  container.contains.add(object);
  object.emit("enter", from);
}
function putInsideContainer(container, item) {
  moveTo(container, item, ContainedAs.inside);
}
function holdItem(container, item) {
  moveTo(container, item, ContainedAs.holding);
}
function removeFromContainer(object) {
  object.container?.contains.delete(object);
}
function isAncestor(ancestor, item) {
  do {
    if (item === ancestor) {
      return true;
    } else if (item.container === ancestor.container) {
      return false;
    }
    item = item.container;
  } while (item);
  return false;
}
function isContainedWith(object, neighbor) {
  return isAncestor(object.container, neighbor);
}
function* children(object) {
  if (!object.contains) {
    return;
  }
  yield* object.contains;
}
function* childrenOfType(object, type) {
  for (const child of children(object)) {
    if (child.containedAs === type) {
      yield child;
    }
  }
}
function numberOfChildren(object, type) {
  return reduce(childrenOfType(object, type), (count) => count + 1, 0);
}

class Game {
  time = new GameTime();
  event = {
    tick: new Observable(),
    playerChange: new Observable(),
    worldModified: new Observable()
  };
  player;
  world;
  timedEffects = new PriorityQueue();
}
serializable(Game, {
  transform: {
    event: serializable.ignore
  },
  afterDeserialize: (game2) => {
    rehydrateObject(game2.world);
  }
});
function rehydrateObject(object) {
  if (object.effects) {
    for (const effect of object.effects) {
      effect.object = object;
      effect.passiveActivation();
    }
  }
  for (const child of children(object)) {
    child.container = object;
    rehydrateObject(child);
  }
}
let game;
function setGameInstance(instance) {
  game = instance;
  window.game = game;
}

class SpatialGrid {
  constructor(cellSize) {
    this.cellSize = cellSize;
  }
  center = new Point(0, 0);
  grid = /* @__PURE__ */ new Map();
  add(position, item) {
    const hash = szudzikPairSigned(
      Math.floor((position.x - this.center.x) / this.cellSize),
      Math.floor((position.y - this.center.y) / this.cellSize)
    );
    let items = this.grid.get(hash);
    if (!items) {
      items = [];
      this.grid.set(hash, items);
    }
    items.push(item);
  }
  get(position, offsetX = 0, offsetY = 0) {
    return this.grid.get(szudzikPairSigned(
      Math.floor((position.x - this.center.x) / this.cellSize + offsetX),
      Math.floor((position.y - this.center.y) / this.cellSize + offsetY)
    ));
  }
  clear() {
    for (const [key, items] of this.grid) {
      if (items.length === 0) {
        this.grid.delete(key);
      } else {
        items.length = 0;
      }
    }
  }
}
function szudzikPairSigned(x, y) {
  const a = x >= 0 ? 2 * x : -2 * x - 1;
  const b = y >= 0 ? 2 * y : -2 * y - 1;
  return a >= b ? a * a + a + b : b * b + a;
}

const repelRatio = 6e3;
const velocityDecay = 1 - 1 / 2;
const alphaDecay = 1;
const stopVelocityScaled = repelRatio / 64;
const maxVelocity = repelRatio / 4;
const highStartAlpha = 1 / 12;
const lowStartAlpha = highStartAlpha / 16;
const maxDistance = repelRatio / 4;
const maxDistance2 = maxDistance * maxDistance;
const renderedConnectionDistance = repelRatio / 10;
class ForceDirectedSim {
  onUpdate;
  alpha;
  startingAlpha;
  grid;
  frozen = /* @__PURE__ */ new Set();
  nodes = [];
  edges = [];
  currentAnimation = null;
  simulateFully(startingNode, highEnergy = true) {
    this.setAlpha(highEnergy ? highStartAlpha : lowStartAlpha);
    this.init(startingNode);
    while (this.applyForces()) {
    }
    this.onUpdate?.();
  }
  animate(startingNode, highEnergy = false) {
    this.setAlpha(highEnergy ? highStartAlpha : lowStartAlpha);
    if (this.currentAnimation) {
      return;
    }
    this.init(startingNode);
    const tick = () => {
      const repeat = this.applyForces();
      this.onUpdate?.();
      this.currentAnimation = repeat ? requestAnimationFrame(tick) : null;
    };
    tick();
  }
  stop() {
    cancelAnimationFrame(this.currentAnimation);
    this.currentAnimation = null;
  }
  freeze(node) {
    this.frozen.add(node);
  }
  unfreeze(node) {
    this.frozen.delete(node);
  }
  setAlpha(alpha) {
    this.alpha = alpha;
    this.startingAlpha = alpha;
  }
  init(startingNode) {
    const graph = getZoneGraph(startingNode);
    this.nodes = [...graph.nodes.keys()];
    this.edges = [...graph.edges.values()];
    this.grid = new SpatialGrid(2 * maxDistance);
  }
  applyForces() {
    this.grid.clear();
    for (const node of this.nodes) {
      this.grid.add(node.position, node);
    }
    this.repelNodes();
    this.attractConnectedNodes();
    const highestVelocity = this.applyVelocity();
    this.setGridCenter();
    this.alpha *= alphaDecay;
    return highestVelocity > stopVelocityScaled * this.startingAlpha;
  }
  repelNodes() {
    for (const node of this.nodes) {
      for (let dx = 0; dx <= 1; dx++) {
        for (let dy = 0; dy <= 1; dy++) {
          const otherNodes = this.grid.get(node.position, -0.5 + dx, -0.5 + dy);
          if (!otherNodes)
            continue;
          for (const other of otherNodes) {
            if (other.id <= node.id) {
              continue;
            }
            const dx2 = other.position.x - node.position.x;
            const dy2 = other.position.y - node.position.y;
            const dist2 = dx2 * dx2 + dy2 * dy2;
            if (dist2 > maxDistance2) {
              continue;
            }
            const dist = Math.sqrt(dist2);
            const force = repelRatio / dist;
            const fx = this.alpha * force * force * dx2 / dist;
            const fy = this.alpha * force * force * dy2 / dist;
            node.position.vx -= fx;
            node.position.vy -= fy;
            other.position.vx += fx;
            other.position.vy += fy;
          }
        }
      }
    }
  }
  attractConnectedNodes() {
    for (const { source, target } of this.edges) {
      const dx = target.position.x - source.position.x;
      const dy = target.position.y - source.position.y;
      const fx = this.alpha * dx;
      const fy = this.alpha * dy;
      source.position.vx += fx;
      source.position.vy += fy;
      target.position.vx -= fx;
      target.position.vy -= fy;
    }
  }
  setGridCenter() {
    this.grid.center.x = 0;
    this.grid.center.y = 0;
    for (const { position } of this.nodes) {
      this.grid.center.x += position.x;
      this.grid.center.y += position.y;
    }
    this.grid.center.x /= this.nodes.length;
    this.grid.center.y /= this.nodes.length;
  }
  applyVelocity() {
    for (const { position } of this.frozen) {
      position.vx = 0;
      position.vy = 0;
    }
    let highestVelocity = 0;
    for (const { position } of this.nodes) {
      position.vx = clamp(-maxVelocity, maxVelocity, position.vx);
      position.vy = clamp(-maxVelocity, maxVelocity, position.vy);
      highestVelocity = Math.max(
        highestVelocity,
        position.vx * position.vx + position.vy * position.vy
      );
      position.x += position.vx;
      position.y += position.vy;
      position.vx *= velocityDecay;
      position.vy *= velocityDecay;
    }
    return Math.sqrt(highestVelocity);
  }
}

function connectZones(source, target, autoPosition = false) {
  if (!source.connections) {
    source.connections = [];
  }
  if (!target.connections) {
    target.connections = [];
  }
  if (source.connections.includes(target)) {
    return;
  }
  if (autoPosition) {
    positionZone(source, target);
  }
  source.connections.push(target);
  target.connections.push(source);
}
function positionZone(source, target) {
  const theta = 2 * Math.PI * Math.random();
  const dx = renderedConnectionDistance * Math.cos(theta);
  const dy = renderedConnectionDistance * Math.sin(theta);
  target.position.x = source.position.x + dx;
  target.position.y = source.position.y + dy;
}
function removeConnections(a) {
  if (a.connections) {
    for (const b of a.connections) {
      deleteElem(b.connections, a);
    }
    a.connections.length = 0;
  }
}
function connectionDistance(a, b) {
  return 1;
}
function getZoneGraph(startingNode, maxDepth = Infinity) {
  const nodes = /* @__PURE__ */ new Map();
  const edges = /* @__PURE__ */ new Set();
  const visited = /* @__PURE__ */ new Set();
  const queue = [startingNode];
  nodes.set(startingNode, 0);
  if (!startingNode.connections) {
    return { nodes, edges };
  }
  while (queue.length) {
    const node = queue.shift();
    const depth = nodes.get(node);
    visited.add(node);
    for (const neighbor of node.connections) {
      if (visited.has(neighbor)) {
        continue;
      }
      edges.add({ source: node, target: neighbor });
      if (!nodes.has(neighbor)) {
        nodes.set(neighbor, depth + 1);
        if (depth < maxDepth - 1) {
          queue.push(neighbor);
        }
      }
    }
  }
  return { nodes, edges };
}
function getEdgeHash({ source, target }) {
  if (source.id < target.id) {
    return `${source.id}-${target.id}`;
  } else {
    return `${target.id}-${source.id}`;
  }
}
function findShortestPath(source, destination) {
  if (!source.connections || !destination.connections) {
    return;
  }
  const cameFrom = /* @__PURE__ */ new Map();
  const costSoFar = /* @__PURE__ */ new Map();
  const frontier = new PriorityQueue();
  frontier.add(source, 0);
  cameFrom.set(source, source);
  costSoFar.set(source, 0);
  while (frontier.length) {
    const current = frontier.pop();
    if (current === destination) {
      return reconstructPath(source, destination, cameFrom);
    }
    const currentCost = costSoFar.get(current);
    for (const next of current.connections) {
      const newCost = currentCost + connectionDistance();
      const neighborCost = costSoFar.get(next);
      if (neighborCost === void 0 || newCost < neighborCost) {
        const heuristic = 0;
        frontier.add(next, newCost + heuristic);
        costSoFar.set(next, newCost);
        cameFrom.set(next, current);
      }
    }
  }
}
function reconstructPath(source, destination, cameFrom) {
  const path = [];
  let current = destination;
  while (current !== source) {
    path.push(current);
    current = cameFrom.get(current);
  }
  return path;
}
function isNeighbor(a, b) {
  return a.connections && a.connections.includes(b);
}

class GameComponent extends Component {
  newEffect(constructor, ...args) {
    const effect = new constructor(...args).activate();
    this.onRemove(() => {
      effect.deactivate();
    });
    return effect;
  }
}

function runEffectIn(effect, timeFromNow) {
  if (effect.run) {
    game.timedEffects.add(effect, game.time.current + timeFromNow);
  }
}
function advanceTime(elapsedGameTime = 0) {
  const finalTime = game.time.current + elapsedGameTime;
  while (finalTime >= game.timedEffects.peekPriority()) {
    game.time.current = game.timedEffects.peekPriority();
    const effect = game.timedEffects.pop();
    if (effect.isActive) {
      effect.run();
    }
  }
  game.time.current = finalTime;
  game.event.tick.emit();
}
let timeout = null;
function gameLoop() {
  advanceTime(100 * GameTime.millisecond);
  timeout = setTimeout(gameLoop, 100);
}
function startGameLoop() {
  if (!timeout) {
    timeout = setTimeout(gameLoop, 100);
  }
}
function pauseGameLoop() {
  clearTimeout(timeout);
  timeout = null;
}

class Effect {
  // The object associated with the effect.
  // When the object is destroyed, the effect is automatically cleaned up.
  object;
  isActive = false;
  eventList;
  constructor(object) {
    this.object = object;
  }
  on(obj, event, listener) {
    return this.registerEvent(obj.on(event, listener));
  }
  onChildren(obj, event, listener) {
    return this.registerEvent(obj.onChildren(event, listener));
  }
  onObject(event, listener) {
    return this.on(this.object, event, listener);
  }
  onObjectChildren(event, listener) {
    return this.onChildren(this.object, event, listener);
  }
  // used when turning on the event after loading a save
  passiveActivation() {
    this.isActive = true;
    this.events?.();
  }
  activate() {
    if (this.isActive) {
      return this;
    }
    this.passiveActivation();
    if (!this.object.effects) {
      this.object.effects = /* @__PURE__ */ new Set();
    }
    this.object.effects.add(this);
    this.onActivate?.();
    return this;
  }
  deactivate() {
    if (!this.isActive) {
      return this;
    }
    this.isActive = false;
    this.object.effects.delete(this);
    if (this.eventList) {
      for (const event of this.eventList) {
        event.unsubscribe();
      }
      this.eventList.length = 0;
    }
    this.onDeactivate?.();
    return this;
  }
  changeObject(object) {
    this.deactivate();
    this.object = object;
    this.activate();
  }
  replace(effect) {
    effect.deactivate();
    this.activate();
    return this;
  }
  runIn(seconds) {
    runEffectIn(this, seconds);
  }
  registerEvent(event) {
    if (!this.eventList) {
      this.eventList = [];
    }
    this.eventList.push(event);
    return event;
  }
}
serializable(Effect, {
  transform: {
    object: serializable.ignore,
    // added back in Game class
    eventList: serializable.ignore,
    isActive: serializable.ignore
  }
});
function removeEffects(obj) {
  if (obj.effects) {
    for (const effect of obj.effects) {
      effect.deactivate();
    }
    obj.effects.clear();
  }
}

class Action extends Effect {
  static duration = 2;
  finishTime;
  get duration() {
    return this.constructor.duration;
  }
  get name() {
    return this.constructor.name;
  }
  activate() {
    if (this.isActive) {
      return this;
    }
    super.activate();
    this.object.activeAction?.deactivate();
    this.object.activeAction = this;
    this.finishTime = game.time.current + this.duration;
    this.runIn(this.duration);
    this.object.emit("actionStart", this);
    return this;
  }
  deactivate() {
    if (!this.isActive) {
      return this;
    }
    super.deactivate();
    if (this.object.activeAction === this) {
      this.object.activeAction = void 0;
    }
    this.object.emit("actionEnd", this);
    return this;
  }
  run() {
    if (this.condition()) {
      this.do?.();
    }
    this.deactivate();
  }
  condition() {
    return true;
  }
}
serializable(Action, {
  transform: {
    finishTime: (time) => toPrecision(time, 1)
  }
});

class TargetAction extends Action {
  constructor(object, target) {
    super(object);
    this.target = target;
  }
  condition() {
    return isContainedWith(this.object, this.target) && this.object !== this.target;
  }
}

class TravelAction extends TargetAction {
  static duration = 3;
  get name() {
    return `travel`;
  }
  condition() {
    return !isAncestor(this.object, this.target);
  }
  do() {
    putInsideContainer(this.target, this.object);
  }
}
serializable(TravelAction);

function transferEnergyTo(to, from, amount) {
  if (!from.energy)
    return 0;
  amount = amount ? Math.min(from.energy, amount) : from.energy;
  from.energy -= amount;
  to.energy = (to.energy ?? 0) + amount;
  return amount;
}

function getWorld() {
  return game.world;
}

function destroy(obj) {
  removeFromContainer(obj);
  removeConnections(obj);
  removeEffects(obj);
  transferEnergyTo(getWorld(), obj);
  obj.emit("leave");
  for (const child of children(obj)) {
    destroy(child);
  }
}

class Eat extends TargetAction {
  get name() {
    return ["Eat", this.target];
  }
  condition() {
    return super.condition() && this.target.energy > 0;
  }
  do() {
    transferEnergyTo(this.object, this.target);
    destroy(this.target);
  }
}
serializable(Eat);

class Hold extends TargetAction {
  get name() {
    return ["Hold", this.target];
  }
  condition() {
    return super.condition() && !(this.target.container === this.object && this.target.containedAs === ContainedAs.holding) && numberOfChildren(this.object, ContainedAs.holding) < 2;
  }
  do() {
    holdItem(this.object, this.target);
  }
}
serializable(Hold);

class Drop extends TargetAction {
  get name() {
    return ["Drop", this.target];
  }
  condition() {
    return isAncestor(this.object, this.target) && this.object !== this.target;
  }
  do() {
    putInsideContainer(this.object.container, this.target);
  }
}
serializable(Drop);

class PutInside extends TargetAction {
  get name() {
    return [`Put in`, this.target];
  }
  condition() {
    return isContainedWith(this.object, this.target) && this.target.type.isContainer && numberOfChildren(this.object, ContainedAs.holding) > 0 && every(
      childrenOfType(this.object, ContainedAs.holding),
      (item) => !isAncestor(item, this.target)
    );
  }
  do() {
    for (const item of childrenOfType(this.object, ContainedAs.holding)) {
      putInsideContainer(this.target, item);
    }
  }
}
serializable(PutInside);

function spawn(type, container) {
  const object = new GameObject(type);
  if (container) {
    putInsideContainer(container, object);
  }
  if (type.effects) {
    for (const EffectConstructor of type.effects) {
      new EffectConstructor(object).activate();
    }
  }
  return object;
}

function disassemble(object) {
  if (!object.type.composedOf)
    return;
  const energyPerPart = Math.floor(
    object.energy / object.type.composedOf.length
  );
  for (const type of object.type.composedOf) {
    const part = spawn(type, object.container);
    transferEnergyTo(part, object, energyPerPart);
  }
  destroy(object);
}

class Disassemble extends TargetAction {
  get name() {
    return ["Disassemble", this.target];
  }
  condition() {
    return super.condition() && this.target.type.composedOf?.length > 0;
  }
  do() {
    disassemble(this.target);
  }
}

function setPlayer(object) {
  game.player = object;
  game.event.playerChange.emit(object);
  return object;
}
function getPlayer() {
  return game.player;
}
function isPlayer(object) {
  return object === game.player;
}
let playerEffect = null;
function setPlayerEffect(effect) {
  playerEffect?.deactivate();
  playerEffect = effect;
  playerEffect.activate();
}
function playerTravelToZone(zone) {
  const player = getPlayer();
  if (isNeighbor(player.container, zone)) {
    setPlayerEffect(new TravelAction(player, zone));
  }
}
function getPlayerActions(target) {
  const actions = [
    new Eat(game.player, target),
    new Hold(game.player, target),
    new Drop(game.player, target),
    new PutInside(game.player, target),
    new Disassemble(game.player, target)
  ];
  return actions.filter((action) => action.condition());
}

let isDragging = false;
let childDragged = false;
function makeDraggable(element, options) {
  function down(e) {
    if (childDragged) {
      return;
    }
    const returned = options.onDown?.(e);
    if (returned === false) {
      return;
    }
    childDragged = true;
    isDragging = false;
    const controller = new AbortController();
    const signal = controller.signal;
    document.body.addEventListener("pointermove", () => {
      isDragging = true;
    }, { once: true, signal });
    if (options.onDrag) {
      document.body.addEventListener("pointermove", options.onDrag, { signal });
    }
    if (options.onOver) {
      document.body.addEventListener("pointerover", options.onOver, { signal });
    }
    window.addEventListener("pointerup", (e2) => {
      options.onUp?.(e2);
      controller.abort();
    }, { once: true });
  }
  element.addEventListener("pointerdown", down);
  if (options.startEnabled) {
    down(options.startEnabled);
  }
  return () => {
    element.removeEventListener("pointerdown", down);
  };
}
window.addEventListener("pointerup", () => {
  childDragged = false;
});
function onClickNotDrag(element, handler) {
  element.addEventListener("click", (e) => {
    if (!isDragging) {
      handler(e);
    }
  });
}
function cancelDrag(element) {
  element.addEventListener("pointerdown", (e) => {
    childDragged = true;
  });
}

function onResize(element, callback) {
  let first = true;
  let oldWidth = 0;
  let oldHeight = 0;
  const observer = new ResizeObserver((entries) => {
    if (first || !document.contains(element))
      return first = false;
    const width = entries[0].borderBoxSize[0].inlineSize;
    const height = entries[0].borderBoxSize[0].blockSize;
    const dw = width - oldWidth;
    const dh = height - oldHeight;
    callback(width, height, dw, dh);
    oldWidth = width;
    oldHeight = height;
  });
  queueMicrotask(() => {
    oldWidth = element.offsetWidth;
    oldHeight = element.offsetHeight;
    observer.observe(element);
  });
  return () => {
    observer.disconnect();
  };
}

const animatedBackgroundTemplate = {
  position: `absolute`,
  top: `0`,
  left: `0`,
  zIndex: `-1`
};
const currentAnimation = /* @__PURE__ */ new WeakMap();
function animatedBackground(element, backgroundStyle, animDuration = duration.normal, ease = false) {
  const background = createDiv(null, backgroundStyle);
  element.prepend(background);
  queueMicrotask(() => {
    background.style.width = px(element.offsetWidth);
    background.style.height = px(element.offsetHeight);
    onResize(element, (width, height) => {
      const oldWidth = background.offsetWidth;
      const oldHeight = background.offsetHeight;
      const animation = background.animate({
        width: [px(oldWidth), px(width)],
        height: [px(oldHeight), px(height)]
      }, {
        duration: animDuration,
        easing: ease ? `ease-in-out` : `ease`,
        fill: `both`
      });
      animation.commitStyles();
      currentAnimation.get(element)?.cancel();
      currentAnimation.set(element, animation);
    });
  });
  return background;
}

class ActionComponent extends Component {
  constructor(action) {
    super();
    this.action = action;
    this.element.classList.add(containerStyle$9);
    const name = createSpan(this.element);
    formatName(name, action);
    const time = createSpan(this.element, timeStyle);
    function update() {
      const t = Math.max(0, action.finishTime - game.time.current);
      time.textContent = GameTime.displaySeconds(t);
    }
    update();
    this.on(game.event.tick, update);
  }
}
function formatName(container, action) {
  for (const n of castArray(action.name)) {
    typeof n === "string" ? createTextNode(container, ` ${n} `) : createSpan(container, objectStyle, n.type.name);
  }
  createTextNode(container, ` `);
}
const containerStyle$9 = makeStyle({
  width: `max-content`,
  fontWeight: `bold`,
  color: actionColor
});
addStyle(`.${containerStyle$9}::first-letter`, {
  textTransform: `capitalize`
});
const objectStyle = makeStyle({
  color: textColor,
  fontWeight: `normal`
});
const timeStyle = makeStyle({
  color: actionTimeColor
});

const positions = /* @__PURE__ */ new WeakMap();
function animatedContents(container, animDuration = duration.normal, ease = false) {
  let first = true;
  const resizeObserver = new ResizeObserver(() => {
    if (first)
      return first = false;
    for (const element of container.children) {
      if (!document.contains(element)) {
        continue;
      }
      animate(element, animDuration, ease);
    }
  });
  function initElement(element) {
    positions.set(element, getPosition(element));
    resizeObserver.observe(element);
  }
  const mutationObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      for (const element of mutation.addedNodes) {
        initElement(element);
      }
    }
  });
  queueMicrotask(() => {
    mutationObserver.observe(container, {
      childList: true,
      attributes: false
    });
    for (const element of container.children) {
      initElement(element);
    }
  });
}
function animate(element, animDuration, ease) {
  const previousPosition = positions.get(element);
  const position = getPosition(element);
  const dx = previousPosition.x - position.x;
  const dy = previousPosition.y - position.y;
  previousPosition.x = position.x;
  previousPosition.y = position.y;
  if (dx === 0 && dy === 0)
    return;
  element.animate({
    translate: [`${dx}px ${dy}px`, "0 0"]
  }, {
    duration: animDuration,
    easing: ease ? `ease-in-out` : `ease`,
    composite: `accumulate`
  });
}
function getPosition(element) {
  return {
    x: element.offsetLeft,
    y: element.offsetTop
  };
}

class Window extends Component {
  posX = 0;
  posY = 0;
  focused = false;
  removeEventsController = new AbortController();
  constructor() {
    super();
    this.element.classList.add(containerStyle$8);
    outsideElement.append(this.element);
    this.setupRemoveEvents();
    makeDraggable(this.element, {
      onDrag: (e) => {
        this.posX += e.movementX;
        this.posY += e.movementY;
        this.updatePosition();
      }
    });
    this.element.animate({
      opacity: [`0`, `1`],
      scale: [`1 0`, `1 1`]
    }, {
      duration: duration.short,
      easing: `ease`
    });
  }
  renderAt(x, y) {
    this.onInit?.();
    this.posX = x - this.element.offsetWidth / 2;
    this.posY = y - this.element.offsetHeight / 2;
    this.updatePosition();
    return this;
  }
  animateRemove() {
    this.removeEventsController.abort();
    this.element.animate({
      opacity: [`1`, `0`],
      scale: [`1 1`, `1 0`]
    }, {
      duration: duration.short,
      easing: `ease`
    }).onfinish = () => {
      this.remove();
    };
  }
  closeAll() {
    for (const window of ancestorWindows(this)) {
      window.animateRemove();
    }
  }
  setupRemoveEvents() {
    const signal = this.removeEventsController.signal;
    this.element.addEventListener("pointerenter", (e) => {
      for (const window of ancestorWindows(this)) {
        window.focused = true;
      }
    }, { signal });
    this.element.addEventListener("pointerleave", (e) => {
      this.focused = false;
      setTimeout(() => {
        for (const window of ancestorWindows(this)) {
          if (!window.focused) {
            window.animateRemove();
          }
          window.focused = false;
        }
      });
    }, { signal });
  }
  updatePosition() {
    this.element.style.translate = `${this.posX}px ${this.posY}px`;
  }
}
const containerStyle$8 = makeStyle({
  position: `fixed`,
  top: `0`,
  left: `0`,
  padding: `0.5rem`,
  background: windowColor,
  borderRadius,
  boxShadow: boxShadowLarge
});
function* ancestorWindows(component) {
  while (component) {
    if (component instanceof Window) {
      yield component;
    }
    component = component.parentComponent;
  }
}

class ObjectCardWindow extends Window {
  constructor(object) {
    super();
    this.object = object;
  }
  onInit() {
    this.element.classList.add(containerStyle$7);
    createDiv(this.element, void 0, this.object.type.name);
    if (this.object.energy) {
      const energy = createDiv(this.element, void 0, "Energy: ");
      const energyValue = createSpan(energy, dataStyle);
      this.on(game.event.tick, () => {
        energyValue.textContent = this.object.energy.toString();
      });
    }
    if (this.object.type.isContainer) {
      this.newComponent(Inventory, this.object).appendTo(this.element);
    }
    const actions = createDiv(this.element, actionsStyle);
    for (const action of getPlayerActions(this.object)) {
      const name = action.constructor.name.replaceAll(/[A-Z]/g, " $&");
      const button = createElement(actions, "button", buttonStyle, name);
      button.addEventListener("click", () => {
        this.closeAll();
        action.activate();
      });
    }
  }
}
const containerStyle$7 = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  gap: `0.5rem`
});
const actionsStyle = makeStyle({
  display: `flex`,
  gap: `0.25rem`
});

class ObjectCard extends GameComponent {
  constructor(object) {
    super();
    this.object = object;
  }
  actionComponent;
  holdingComponent;
  onInit() {
    this.element.classList.add(containerStyle$6);
    this.element.classList.toggle(playerStyle, isPlayer(this.object));
    createDiv(this.element, titleStyle, this.object.type.name);
    queueMicrotask(() => {
      this.makeHolding();
      this.showAction();
    });
    this.element.addEventListener("pointerdown", (e) => {
      if (e.button !== 0)
        return;
      e.stopPropagation();
      this.showWindow(e.clientX, e.clientY);
    });
    this.newEffect(ObjectCardEffect, this.object, this);
    animatedBackground(this.element, backgroundStyle$1);
    animatedContents(this.element);
    cancelDrag(this.element);
  }
  showWindow(x, y) {
    this.newComponent(ObjectCardWindow, this.object).renderAt(x, y);
  }
  showMessage(message) {
    const element = createElement(this.element, "q", messageStyle, message);
    fadeIn(element);
    element.animate({
      opacity: [`1`, `0`]
    }, {
      duration: 4e3,
      easing: `ease-in`
    }).onfinish = () => {
      element.remove();
    };
  }
  showAction() {
    const action = this.object.activeAction;
    if (!action)
      return;
    this.actionComponent = this.newComponent(ActionComponent, action).appendTo(this.element);
    fadeIn(this.actionComponent.element);
  }
  hideAction() {
    if (!this.actionComponent)
      return;
    const actionComponent = this.actionComponent;
    this.actionComponent = void 0;
    fadeOut(actionComponent.element, () => actionComponent.remove());
  }
  makeHolding() {
    if (this.holdingComponent || !numberOfChildren(this.object, ContainedAs.holding)) {
      return;
    }
    this.holdingComponent = this.newComponent(
      Inventory,
      this.object,
      ContainedAs.holding
    ).appendTo(this.element);
    this.holdingComponent.element.classList.add(holdingStyle);
    fadeIn(this.holdingComponent.element);
  }
  hideHoldingIfEmpty() {
    if (!this.holdingComponent || numberOfChildren(this.object, ContainedAs.holding)) {
      return;
    }
    const holdingComponent = this.holdingComponent;
    this.holdingComponent = void 0;
    fadeOut(holdingComponent.element, () => holdingComponent.remove());
  }
}
class ObjectCardEffect extends Effect {
  constructor(object, card) {
    super(object);
    this.card = card;
  }
  static $serialize = false;
  events() {
    this.onObject("actionStart", () => {
      this.card.showAction();
    });
    this.onObject("actionEnd", () => {
      this.card.hideAction();
    });
    this.onObject("speak", (message) => {
      this.card.showMessage(message);
    });
    this.onObjectChildren("enter", (child) => {
      if (child.containedAs !== ContainedAs.holding)
        return;
      this.card.makeHolding();
    });
    this.onObjectChildren("leave", (child) => {
      if (child.containedAs !== ContainedAs.holding)
        return;
      queueMicrotask(() => {
        this.card.hideHoldingIfEmpty();
      });
    });
  }
}
const containerStyle$6 = makeStyle({
  position: `relative`,
  display: `flex`,
  flexDirection: `column`,
  gap: `0.2rem`,
  padding: `0.75rem`,
  color: objectTextColor
});
hoverStyle(containerStyle$6, {
  filter: `brightness(1.1)`
});
const backgroundStyle$1 = makeStyle({
  ...animatedBackgroundTemplate,
  background: objectCardColor,
  borderRadius,
  boxShadow
});
const playerStyle = makeStyle({});
addStyle(`.${playerStyle} > .${backgroundStyle$1}`, {
  background: objectCardPlayerColor
});
const titleStyle = makeStyle({
  color: textColor
});
const messageStyle = makeStyle({
  display: `block`
});
const holdingStyle = makeStyle({
  paddingLeft: `1.25rem`
});
addStyle(`.${holdingStyle}::before`, {
  content: `🖐`,
  position: `absolute`,
  top: `0`,
  left: `0`,
  animation: `${fadeInKeyframes} ${duration.normal}ms`
});

class Inventory extends GameComponent {
  constructor(object, containerType = ContainedAs.inside) {
    super();
    this.object = object;
    this.containerType = containerType;
  }
  objectToCard = /* @__PURE__ */ new Map();
  onInit() {
    this.element.classList.add(containerStyle$5);
    for (const child of children(this.object)) {
      this.makeCard(child, false);
    }
    this.newEffect(InventoryEffect, this.object, this);
    animatedContents(this.element, duration.long, true);
  }
  makeRow() {
    const row = createDiv(this.element, rowStyle);
    animatedContents(row, duration.long, true);
    return row;
  }
  getShortestRow() {
    if (!this.element.children.length) {
      return this.makeRow();
    }
    const { element, width } = shortestElement(this.element.children);
    return width > this.element.offsetHeight && element.children.length > 1 ? this.makeRow() : element;
  }
  makeCard(object, animate = true) {
    if (object.containedAs !== this.containerType) {
      return;
    }
    makeOrGet(this.objectToCard, object, () => {
      const card = this.newComponent(ObjectCard, object).appendTo(this.getShortestRow());
      animate && fadeIn(card.element, duration.long);
      return card;
    });
  }
  removeCard(object) {
    const card = getAndDelete(this.objectToCard, object);
    if (!card)
      return;
    const row = card.element.parentElement;
    fadeOut(card.element, () => {
      card.remove();
      !row.children.length && row.remove();
    });
  }
}
class InventoryEffect extends Effect {
  constructor(object, inventory) {
    super(object);
    this.inventory = inventory;
  }
  static $serialize = false;
  events() {
    this.onObjectChildren("enter", (child) => {
      this.inventory.makeCard(child);
    });
    this.onObjectChildren("leave", (child) => {
      this.inventory.removeCard(child);
    });
  }
}
function shortestElement(elements) {
  return reduce(elements, (shortest, element) => {
    const width = element.offsetWidth;
    return width < shortest.width ? { width, element } : shortest;
  }, { width: Infinity, element: null });
}
const containerStyle$5 = makeStyle({
  position: `relative`,
  display: `flex`,
  flexDirection: `column`,
  gap: `0.75rem`
});
const rowStyle = makeStyle({
  position: `relative`,
  width: `max-content`,
  display: `flex`,
  alignItems: `flex-start`,
  gap: `0.75rem`
});

class MapNode extends GameComponent {
  constructor(zone, map) {
    super();
    this.zone = zone;
    this.map = map;
  }
  content = createDiv(this.element, contentStyle);
  background = animatedBackground(
    this.content,
    backgroundStyle,
    duration.long,
    true
  );
  inventory;
  onInit() {
    this.element.classList.add(containerStyle$4);
    this.element.addEventListener("pointerenter", () => {
      moveToTop(this.element);
    });
    onClickNotDrag(this.element, () => {
      playerTravelToZone(this.zone);
    });
    this.newEffect(TravelAnimationEffect, this.zone, this.map);
    onResize(this.content, (width, height, dw, dh) => {
      this.element.animate({
        transform: [translate(dw / 2, dh / 2), `translate(0, 0)`]
      }, {
        composite: `add`,
        easing: `ease-in-out`,
        duration: duration.long
      });
    });
  }
  fullZone() {
    if (this.inventory)
      return;
    this.inventory = this.newComponent(Inventory, this.zone, ContainedAs.inside).appendTo(this.content);
    fadeIn(this.inventory.element);
    this.background.classList.add(fullBackgroundStyle);
  }
  simpleZone() {
    if (!this.inventory)
      return;
    const inventory = this.inventory;
    this.inventory = void 0;
    fadeOut(inventory.element, () => {
      inventory.remove();
      this.background.classList.remove(fullBackgroundStyle);
    });
  }
}
class TravelAnimationEffect extends Effect {
  constructor(zone, map) {
    super(zone);
    this.map = map;
  }
  static $serialize = false;
  events() {
    this.onObjectChildren("actionStart", (object, action) => {
      if (action instanceof TravelAction) {
        this.map.travelAnimation.start(action);
      }
    });
    this.onObjectChildren("actionEnd", (object, action) => {
      if (action instanceof TravelAction) {
        this.map.travelAnimation.stop(action);
      }
    });
  }
}
const containerStyle$4 = makeStyle({
  position: `absolute`
});
const contentStyle = makeStyle({
  position: `absolute`,
  translate: `-50% -50%`,
  minWidth: `3rem`,
  minHeight: `3rem`,
  padding: `1rem`
});
const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  boxShadow,
  borderRadius: `50%`,
  background: mapNodeSimpleColor,
  transition: `all ${duration.long}ms ease`
});
const fullBackgroundStyle = makeStyle({
  borderRadius,
  background: mapNodeColor
});

function addPanZoom(element, transform, onTransform) {
  makeDraggable(element, {
    onDrag: (e) => {
      transform.x += e.movementX;
      transform.y += e.movementY;
      onTransform(false);
    }
  });
  element.addEventListener("wheel", (e) => {
    e.preventDefault();
    const { clientX, clientY, deltaY } = e;
    const amount = 1.1;
    const { top, left } = element.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const change = Math.sign(deltaY) < 0 ? amount : 1 / amount;
    transform.x = x - change * (x - transform.x);
    transform.y = y - change * (y - transform.y);
    transform.scale *= change;
    onTransform(true);
  });
}

class TravelAnimation {
  constructor(container) {
    this.container = container;
  }
  actionToElement = /* @__PURE__ */ new WeakMap();
  scale = `1`;
  start(action) {
    const elem = createDiv(
      this.container,
      containerStyle$3,
      action.object.type.name
    );
    elem.style.scale = this.scale;
    this.actionToElement.set(action, elem);
    const from = action.object.container.position;
    const to = action.target.position;
    const actionDuration = action.duration / GameTime.millisecond;
    elem.animate({
      translate: [
        `${from.x}px ${from.y}px`,
        `${to.x}px ${to.y}px`
      ]
    }, {
      duration: actionDuration,
      easing: "ease",
      composite: "add"
    }).onfinish = () => {
      this.stop(action);
    };
    const fadeDuration = duration.short / actionDuration;
    elem.animate({
      opacity: [0, 1, 1, 0],
      offset: [0, fadeDuration, 1 - fadeDuration]
    }, { duration: actionDuration });
  }
  stop(action) {
    getAndDelete(this.actionToElement, action)?.remove();
  }
  setScale(scale) {
    this.scale = scale;
    for (const elem of this.container.children) {
      elem.style.scale = this.scale;
    }
  }
}
const containerStyle$3 = makeStyle({
  position: `absolute`,
  pointerEvents: "none",
  translate: `-50% -50%`
});

function throttle(fn) {
  let queued = 0;
  const callFn = () => {
    queued = 0;
    fn();
  };
  const throttledFn = () => {
    if (queued) {
      return;
    }
    queued = requestAnimationFrame(callFn);
  };
  return throttledFn;
}

class MapComponent extends Component {
  maxDepthFromCenter = 3;
  fullZoneDepth = this.maxDepthFromCenter - 1;
  map = createDiv(this.element, mapStyle$1);
  edgeContainer = createDiv(this.map);
  zoneContainer = createDiv(this.map, zoneContainerStyle);
  travelIcons = createDiv(this.map);
  travelAnimation = new TravelAnimation(this.travelIcons);
  transform = {
    x: 0,
    y: 0,
    scale: 1
  };
  zoneToComponent = /* @__PURE__ */ new Map();
  edgeToElem = /* @__PURE__ */ new Map();
  updatePositions = throttle(() => {
    for (const [zone, component] of this.zoneToComponent) {
      component.element.style.translate = `${zone.position.x}px ${zone.position.y}px`;
    }
    for (const { line, edge } of this.edgeToElem.values()) {
      const { x, y, angle, length } = getEdgePositionAndAngle(edge);
      line.style.translate = `${x}px ${y}px`;
      line.style.rotate = `${angle}rad`;
      line.style.width = px(length);
    }
  });
  firstRender = true;
  forceDirectedSim = new ForceDirectedSim();
  onInit() {
    this.element.classList.add(containerStyle$2);
    addPanZoom(this.element, this.transform, (updateScale) => {
      updateScale && this.updateScale();
      this.updateTransform(false);
    });
    this.forceDirectedSim.onUpdate = () => {
      this.updatePositions();
    };
  }
  render(centerZone, panToCenter = false, startForceSim = false) {
    const graph = getZoneGraph(centerZone, this.maxDepthFromCenter);
    for (const [zone, depth] of graph.nodes) {
      const component = makeOrGet(this.zoneToComponent, zone, () => {
        return this.makeNode(zone);
      });
      depth > this.fullZoneDepth ? component.simpleZone() : component.fullZone();
    }
    for (const [zone, component] of this.zoneToComponent) {
      !graph.nodes.has(zone) && this.removeNode(zone, component);
    }
    const currentEdges = /* @__PURE__ */ new Set();
    for (const edge of graph.edges) {
      const hash = getEdgeHash(edge);
      currentEdges.add(hash);
      makeOrGet(this.edgeToElem, hash, () => {
        return this.makeEdge(edge);
      });
    }
    for (const [hash, { line }] of this.edgeToElem) {
      !currentEdges.has(hash) && this.removeEdge(hash, line);
    }
    this.updatePositions();
    this.updateScale();
    if (this.firstRender) {
      this.forceDirectedSim.simulateFully(centerZone);
    } else if (startForceSim) {
      this.forceDirectedSim.stop();
      this.forceDirectedSim.animate(centerZone);
    }
    if (panToCenter) {
      this.centerOnZone(centerZone, !this.firstRender);
    }
    this.firstRender = false;
  }
  makeNode(zone) {
    const node = this.newComponent(MapNode, zone, this).appendTo(this.zoneContainer);
    makeDraggable(node.element, {
      onDown: () => {
        this.forceDirectedSim.freeze(zone);
      },
      onUp: () => {
        this.forceDirectedSim.unfreeze(zone);
      },
      onDrag: (e) => {
        zone.position.x += e.movementX / this.transform.scale;
        zone.position.y += e.movementY / this.transform.scale;
        this.forceDirectedSim.animate(zone);
      }
    });
    fadeIn(node.element, duration.long);
    return node;
  }
  removeNode(zone, component) {
    fadeOut(component.element, () => {
      component.remove();
    }, duration.long);
    this.zoneToComponent.delete(zone);
  }
  makeEdge(edge) {
    const line = createDiv(this.edgeContainer, edgeStyle);
    fadeIn(line, duration.long);
    return { line, edge };
  }
  removeEdge(hash, line) {
    fadeOut(line, () => {
      line.remove();
    }, duration.long);
    this.edgeToElem.delete(hash);
  }
  centerOnZone(zone, animate = true) {
    this.transform.x = -zone.position.x * this.transform.scale + this.element.offsetWidth / 2;
    this.transform.y = -zone.position.y * this.transform.scale + +this.element.offsetHeight / 2;
    this.updateTransform(animate);
  }
  updateScale() {
    const invScale = (1 / this.transform.scale).toString();
    for (const component of this.zoneToComponent.values()) {
      component.element.style.transform = `scale(${invScale})`;
    }
    for (const { line } of this.edgeToElem.values()) {
      line.style.transform = `scale(1, ${invScale})`;
    }
    this.travelAnimation.setScale(invScale);
  }
  updateTransform(animate = true) {
    const { x, y, scale } = this.transform;
    const transform = `${translate(x, y)} scale(${scale})`;
    this.map.animate({
      transform
    }, {
      duration: animate ? duration.long : 0,
      easing: "ease-in-out",
      fill: "forwards"
    }).commitStyles();
  }
}
const edgeWidth = 2;
function getEdgePositionAndAngle({ source, target }) {
  const dirX = target.position.x - source.position.x;
  const dirY = target.position.y - source.position.y;
  const length = Math.sqrt(dirX * dirX + dirY * dirY);
  const angle = Math.atan2(dirY, dirX);
  const x = 0.5 * (source.position.x + target.position.x - length);
  const y = 0.5 * (source.position.y + target.position.y - edgeWidth);
  return { x, y, angle, length };
}
const containerStyle$2 = makeStyle({
  position: "relative",
  contain: `strict`
});
const zoneContainerStyle = makeStyle({
  position: `relative`,
  zIndex: `0`
});
const mapStyle$1 = makeStyle({
  position: `absolute`
});
const edgeStyle = makeStyle({
  position: `absolute`,
  background: mapEdgeColor,
  height: `${edgeWidth}px`
});

class Node {
  position;
  edges = [];
  constructor(x = Math.random(), y = Math.random()) {
    this.position = new Point(x, y);
  }
  connect(other) {
    this.edges.push(other);
    other.edges.push(this);
  }
}

const triHeight = Math.sqrt(3) / 2;
function generateTriGrid(rows) {
  const columns = rows;
  const size = rows * columns;
  const nodes = makeArray(size, () => new Node());
  function connect(a, b) {
    if (Math.random() < 0.5) {
      a.connect(b);
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    const zone = nodes[i];
    const row = Math.floor(i / rows);
    const column = i % rows;
    if (column > 0) {
      connect(zone, nodes[i - 1]);
    }
    if (row > 0) {
      connect(zone, nodes[i - rows]);
    }
    if (row > 0 && column < rows - 1) {
      connect(zone, nodes[i - rows + 1]);
    }
    zone.position.x = column + 0.5 * row;
    zone.position.y = row * triHeight;
  }
  return nodes;
}

const typeZone = makeType({
  name: `zone`,
  isContainer: true
});

function spawnZone() {
  const zone = spawn(typeZone, getWorld());
  zone.position = new Point();
  return zone;
}

function makeZonesFromNodes(nodes, edges) {
  const nodeToZone = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    const zone = spawnZone();
    if (node.position) {
      zone.position.x = node.position.x * renderedConnectionDistance;
      zone.position.y = node.position.y * renderedConnectionDistance;
    }
    nodeToZone.set(node, zone);
  }
  for (const [a, b] of edges) {
    connectZones(nodeToZone.get(a), nodeToZone.get(b));
  }
  return [...nodeToZone.values()];
}

function findConnectedGraphs(nodes) {
  const visited = /* @__PURE__ */ new Map();
  const graphs = [];
  let nextGraphId = 0;
  for (const node of nodes) {
    if (visited.has(node)) {
      continue;
    }
    graphs.push({ nodes: [], edges: [] });
    traverse(node, nextGraphId++);
  }
  function traverse(node, graphId) {
    visited.set(node, graphId);
    graphs[graphId].nodes.push(node);
    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        graphs[graphId].edges.push([node, edge]);
      }
    }
    for (const edge of node.edges) {
      if (!visited.has(edge)) {
        traverse(edge, graphId);
      }
    }
  }
  return graphs;
}

function createMap(rows) {
  const nodes = generateTriGrid(rows);
  const connectedGraphs = findConnectedGraphs(nodes);
  sortDescending(connectedGraphs, (graph) => graph.nodes.length);
  return makeZonesFromNodes(connectedGraphs[0].nodes, connectedGraphs[0].edges);
}

const typeChest = makeType({
  name: `chest`,
  description: `A box to put stuff in`,
  isContainer: true
});

const s4Permutations = [
  { name: "()", code: "1234" },
  { name: "(12)", code: "2134" },
  { name: "(13)", code: "3214" },
  { name: "(14)", code: "4231" },
  { name: "(23)", code: "1324" },
  { name: "(24)", code: "1432" },
  { name: "(34)", code: "1243" },
  { name: "(12)(34)", code: "2143" },
  { name: "(13)(24)", code: "3412" },
  { name: "(14)(23)", code: "4321" },
  { name: "(123)", code: "2314" },
  { name: "(124)", code: "2431" },
  { name: "(132)", code: "3124" },
  { name: "(134)", code: "3241" },
  { name: "(142)", code: "4132" },
  { name: "(143)", code: "4213" },
  { name: "(234)", code: "1342" },
  { name: "(243)", code: "1423" },
  { name: "(1234)", code: "2341" },
  { name: "(1243)", code: "2413" },
  { name: "(1324)", code: "3421" },
  { name: "(1342)", code: "3142" },
  { name: "(1423)", code: "4312" },
  { name: "(1432)", code: "4123" }
];
for (const [i, p] of s4Permutations.entries()) {
  p.index = i;
}
makeCayleyTable(s4Permutations);
function makeCayleyTable(permutations) {
  const codeToPermutation = /* @__PURE__ */ new Map();
  for (const p of permutations) {
    codeToPermutation.set(p.code, p);
  }
  function computeProduct(a, b) {
    let product = "";
    for (const digit of a.code) {
      product += b.code[Number(digit) - 1];
    }
    return codeToPermutation.get(product);
  }
  return permutations.map((p) => {
    return permutations.map((q) => computeProduct(p, q));
  });
}

const typeWood = makeType({
  name: "wood",
  element: s4Permutations[1]
});

class Photosynthesis extends Effect {
  onActivate() {
    this.run();
  }
  run() {
    if (this.object.energy >= 64) {
      return this.deactivate();
    }
    transferEnergyTo(this.object, getWorld(), 1);
    this.runIn(noisy(4));
  }
}
serializable(Photosynthesis);
const typeTree = makeType({
  name: "tree",
  effects: [Photosynthesis],
  composedOf: [typeWood, typeWood]
});

class SpawnTrees extends Effect {
  queue() {
    this.runIn(noisy(16));
  }
  onActivate() {
    this.queue();
  }
  run() {
    if (getWorld().energy > 0) {
      spawn(typeTree, randomSetElement(this.object.contains));
    }
    this.queue();
  }
}
serializable(SpawnTrees);

const typeWorld = makeType({
  name: `world`,
  isContainer: true,
  effects: [SpawnTrees]
});

class Metabolism extends Effect {
  onActivate() {
    this.run();
  }
  run() {
    transferEnergyTo(getWorld(), this.object, 1);
    this.runIn(noisy(1));
  }
}
serializable(Metabolism);

const typePlayer = makeType({
  name: `Boof Nasty`,
  isContainer: true,
  effects: [Metabolism]
});

function speak(object, message) {
  object.emit("speak", message);
}

class Villager extends Effect {
  queued = false;
  home = this.object.container;
  path;
  gatherType = typeTree;
  events() {
    this.onObject("actionEnd", () => {
      this.queueRun();
    });
    this.onObject("enter", () => {
      this.queueRun();
    });
  }
  onActivate() {
    this.queueRun();
  }
  queueRun() {
    if (this.queued)
      return;
    this.runIn(noisy(3));
    this.queued = true;
  }
  run() {
    this.queued = false;
    const holdingWood = find(
      children(this.object),
      (object) => object.type === this.gatherType
    );
    holdingWood ? this.returnWood() : this.findWood();
  }
  returnWood() {
    if (this.object.container === this.home) {
      this.depositWood();
    } else {
      this.travelHome();
    }
  }
  depositWood() {
    const chest = find(
      children(this.object.container),
      (object) => object.type === typeChest
    );
    if (chest) {
      new PutInside(this.object, chest).activate();
    }
  }
  travelHome() {
    const validPath = this.path?.length && isNeighbor(this.object.container, this.path.at(-1));
    if (!validPath) {
      this.path = findShortestPath(this.object.container, this.home);
      speak(this.object, `Bring wood home!`);
    }
    if (!this.path)
      return;
    const next = this.path.pop();
    new TravelAction(this.object, next).activate();
    if (this.path.length === 0) {
      this.path = void 0;
    }
  }
  findWood() {
    const wood = findType(this.object, this.gatherType);
    if (wood) {
      new Hold(this.object, wood).activate();
    } else {
      const neighboringZone = randomElement(this.object.container.connections);
      new TravelAction(this.object, neighboringZone).activate();
      speak(this.object, `Looking for wood.`);
    }
  }
}
serializable(Villager);
function findType(object, type) {
  return find(children(object.container), (item) => item.type === type && !isAlreadyBeingGrabbed(item));
}
function isAlreadyBeingGrabbed(item) {
  return find(
    children(item.container),
    (object) => object.activeAction instanceof Hold && object.activeAction.target === item
  );
}
const typeVillager = makeType({
  name: "villager",
  isContainer: true,
  description: "hmmmmph",
  effects: [Villager]
});

function initGame(game) {
  game.world = spawn(typeWorld);
  getWorld().energy = 2 ** 10;
  const zones = createMap(5);
  const zone = randomElement(zones);
  const chest = spawn(typeChest, zone);
  spawn(typeTree, chest);
  advanceTime(2 * GameTime.minute);
  for (let i = 0; i < 3; i++) {
    spawn(typeVillager, zone);
  }
  const player = spawn(typePlayer, zone);
  player.energy = 60;
  setPlayer(player);
  spawn(typeTree, player);
  spawn(typeTree, player);
}

function loadGame() {
  return loadSaveFile().then((saveFile) => {
    setGameInstance(deserialize(saveFile));
  }, () => {
    const newGame = new Game();
    setGameInstance(newGame);
    initGame(newGame);
  });
}
function saveGameToFile() {
  const save = serialize(game);
  console.log(save);
  const request = indexedDB.open("game");
  request.onsuccess = () => {
    const db = request.result;
    db.transaction("saves", "readwrite").objectStore("saves").put(save, "save");
  };
}
function loadSaveFile() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("game");
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("saves");
    };
    request.onsuccess = () => {
      const db = request.result;
      const val = db.transaction("saves").objectStore("saves").get("save");
      val.onsuccess = () => {
        val.result !== void 0 ? resolve(val.result) : reject(val.result);
      };
    };
  });
}
function deleteSaveFile() {
  const request = indexedDB.open("game");
  request.onsuccess = () => {
    const db = request.result;
    db.transaction("saves", "readwrite").objectStore("saves").delete("save");
  };
}

class GameUI extends GameComponent {
  onInit() {
    this.element.classList.add(containerStyle$1);
    this.createMap();
    this.createGameBar();
    this.setupWindowVisibility();
    startGameLoop();
  }
  createMap() {
    const map = this.newComponent(MapComponent).appendTo(this.element);
    map.element.classList.add(mapStyle);
    const mapEffect = this.newEffect(class extends Effect {
      events() {
        this.onObject("enter", () => {
          map.render(this.object.container, true);
        });
      }
    }, getPlayer());
    this.on(game.event.playerChange, (player) => {
      mapEffect.changeObject(player);
    });
    this.on(game.event.worldModified, () => {
      map.render(getPlayer().container, false, true);
    });
    map.render(getPlayer().container, true);
    return map;
  }
  createGameBar() {
    const bar = createDiv(this.element, barStyle);
    const info = createDiv(bar, infoStyle);
    const energy = createDiv(info, void 0, "Energy Pool: ");
    const energyValue = createSpan(energy, dataStyle);
    this.on(game.event.tick, () => {
      energyValue.textContent = getWorld().energy.toString();
    });
    const saveLoadContainer = createDiv(bar, saveLoadContainerStyle);
    const save = createElement(
      saveLoadContainer,
      "button",
      textButtonStyle,
      "Save"
    );
    save.addEventListener("click", saveGameToFile);
    const load = createElement(
      saveLoadContainer,
      "button",
      textButtonStyle,
      "Load"
    );
    load.addEventListener("click", restartGame);
    const erase = createElement(
      saveLoadContainer,
      "button",
      textButtonStyle,
      "Erase"
    );
    erase.addEventListener("click", deleteSaveFile);
  }
  setupWindowVisibility() {
    function visibilityChange() {
      document.hidden ? pauseGameLoop() : startGameLoop();
    }
    document.addEventListener("visibilitychange", visibilityChange);
    this.onRemove(() => {
      document.removeEventListener("visibilitychange", visibilityChange);
    });
  }
}
const containerStyle$1 = makeStyle({
  height: `100%`,
  display: `flex`
});
const barStyle = makeStyle({
  display: `flex`,
  position: `absolute`,
  left: `0`,
  right: `0`
});
const infoStyle = makeStyle({
  flex: `1 1 auto`
});
const saveLoadContainerStyle = makeStyle({
  display: `flex`,
  gap: `1rem`
});
const mapStyle = makeStyle({
  flex: `1 1 0`
});

const main = '';

class App extends Component {
  onInit() {
    this.element.classList.add(containerStyle);
    this.newComponent(GameUI).appendTo(this.element);
    this.element.append(outsideElement);
  }
}
const containerStyle = makeStyle({
  fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
  colorScheme: `dark`,
  background: backgroundColor,
  color: textColor,
  height: `100vh`,
  contain: `strict`,
  userSelect: `none`
});
const outsideElemStyle = makeStyle({
  zIndex: `99`
});
const outsideElement = createDiv(null, outsideElemStyle);

let app;
function restartGame() {
  loadGame().then(() => {
    app?.remove();
    app = new App().appendTo(document.body);
  });
}
restartGame();
