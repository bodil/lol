const p = require("eulalie");

const float = p.seq(function*() {
  const {value: num} = yield p.float;
  return {
    type: "Number",
    value: num
  };
});

const string = p.seq(function*() {
  const {value: str} = yield p.quotedString;
  return {
    type: "String",
    value: str
  };
});

const identifier = p.seq(function*() {
  const {value: head} = yield p.letter;
  const {value: tail} = yield p.many(p.alphanum)
  return head + tail;
});

const identExpr = p.seq(function*() {
  const {value: id} = yield identifier;
  return {
    type: "Identifier",
    name: id
  };
});

const expr = p.seq(function*() {
  const {value: e} = yield p.either([
    identExpr,
    float,
    string
  ]);
  return e;
});

const simpleGreedyExpr = p.seq(function*() {
  const {value: head} = yield expr;
  yield p.spaces1;
  const {value: tail} = yield p.maybe(greedyExpr);
  return {
    type: "Scope",
    expr: head,
    nextExpr: tail
  };
});

const letExpr = p.seq(function*() {
  yield p.string("let");
  yield p.spaces1;
  const {value: name} = yield identifier;
  yield p.spaces1;
  const {value: valueExpr} = yield expr;
  const {value: nextExpr} = yield p.maybe(p.seq(function*() {
    yield p.spaces1;
    const {value: e} = yield greedyExpr;
    return e;
  }));
  const node = nextExpr === "" ? {type: "Empty"} : nextExpr;
  return {
    type: "Let",
    name,
    expr: valueExpr,
    nextExpr: node
  };
});

const empty = p.unit({
  type: "Empty"
});

const greedyExpr = p.either([
  letExpr,
  simpleGreedyExpr,
  empty
]);

const block = p.seq(function*() {

});

module.exports = p.seq(function*() {
  yield p.spaces;
  const {value: e} = yield greedyExpr;
  yield p.spaces;
  yield p.eof;
  return e;
});
