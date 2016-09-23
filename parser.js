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
    type: "IdentifierExpr",
    name: id
  };
});

const funExpr = p.seq(function*() {
  yield p.string("fun");
  yield p.spaces1;
  const {value: argName} = yield identifier;
  yield p.spaces1;
  const {value: body} = yield expr;
  return {
    type: "Fun",
    argName,
    body
  }
})

const callExpr = p.seq(function*() {
  yield p.string("(");
  yield p.spaces;
  const {value: fun} = yield expr;
  yield p.spaces1;
  const {value: arg} = yield expr;
  yield p.spaces;
  yield p.string(")");
  return {
    type: "Call",
    fun,
    arg
  }
})

const expr = p.seq(function*() {
  const {value: e} = yield p.either([
    funExpr,
    callExpr,
    identExpr,
    float,
    string
  ]);
  return e;
});

const expressionSequence = p.seq(function*() {
  const {value: head} = yield expr;
  yield p.spaces1;
  const {value: tail} = yield p.maybe(sequence);
  return {
    type: "ExpressionSequence",
    expr: head,
    scope: tail
  };
});

const letSequence = p.seq(function*() {
  yield p.string("let");
  yield p.spaces1;
  const {value: name} = yield identifier;
  yield p.spaces1;
  const {value: valueExpr} = yield expr;
  const {value: scope} = yield p.maybe(p.seq(function*() {
    yield p.spaces1;
    const {value: e} = yield sequence;
    return e;
  }));
  const node = scope === "" ? {type: "EmptySequence"} : scope;
  return {
    type: "Let",
    name,
    expr: valueExpr,
    scope: node
  };
});

const emptySequence = p.unit({
  type: "EmptySequence"
});

const sequence = p.either([
  letSequence,
  expressionSequence,
  emptySequence
]);

const block = p.seq(function*() {

});

module.exports = p.seq(function*() {
  yield p.spaces;
  const {value: e} = yield sequence;
  yield p.spaces;
  yield p.eof;
  return e;
});
