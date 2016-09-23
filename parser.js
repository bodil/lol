const p = require("eulalie");

const reservedWords = ['if', 'then', 'else', 'while', 'do', 'fun', 'let']

const comment = p.seq(function*() {
  yield p.spaces;
  yield p.string("#");
  yield p.many(p.seq(function*() {
    const {value: c} = yield p.item;
    if (c === "\n") yield p.fail;
  }))
  yield p.string("\n");
  yield p.spaces;
})
const spaces = p.either([p.many1(comment), p.spaces]);
const spaces1 = p.either([p.many1(comment), p.spaces1]);

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
  const id = head + tail;
  if (reservedWords.indexOf(id) !== -1) yield p.fail;
  return id;
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
  yield spaces1;
  const {value: argName} = yield identifier;
  yield spaces1;
  const {value: body} = yield expr;
  return {
    type: "Fun",
    argName,
    body
  }
})

const callExpr = p.seq(function*() {
  yield p.string("(");
  yield spaces;
  const {value: fun} = yield expr;
  yield spaces1;
  const {value: arg} = yield expr;
  yield spaces;
  yield p.string(")");
  return {
    type: "Call",
    fun,
    arg
  }
})

const block = p.seq(function*() {
  yield p.string("{");
  yield spaces;
  const {value: seq} = yield sequence;
  yield spaces;
  yield p.string("}");
  return {
    type: "Block",
    scope: seq
  }
});

const ifExpr = p.seq(function*() {
  yield p.string("if");
  yield spaces1;
  const {value: cond} = yield expr;
  yield spaces1;
  yield p.string("then");
  yield spaces1;
  const {value: thenExpr} = yield expr;
  yield spaces1;
  yield p.string("else");
  yield spaces1;
  const {value: elseExpr} = yield expr;
  return {
    type: "If",
    cond,
    thenExpr,
    elseExpr
  }
})

const whileExpr = p.seq(function*() {
  yield p.string("while");
  yield spaces1;
  const {value: cond} = yield expr;
  yield spaces1;
  yield p.string("do");
  yield spaces1;
  const {value: body} = yield expr;
  return {
    type: "While",
    cond,
    body
  }
})

// if cond1 then if cond2 then a else c else d


const expr = p.seq(function*() {
  const {value: e} = yield p.either([
    funExpr,
    callExpr,
    ifExpr,
    whileExpr,
    block,
    identExpr,
    float,
    string
  ]);
  return e;
});

const expressionSequence = p.seq(function*() {
  const {value: head} = yield expr;
  yield spaces1;
  const {value: tail} = yield sequence;
  return {
    type: "ExpressionSequence",
    expr: head,
    scope: tail
  };
});

const letSequence = p.seq(function*() {
  yield p.string("let");
  yield spaces1;
  const {value: name} = yield identifier;
  yield spaces1;
  const {value: valueExpr} = yield expr;
  const {value: scope} = yield p.maybe(p.seq(function*() {
    yield spaces1;
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

module.exports = p.seq(function*() {
  yield spaces;
  const {value: e} = yield sequence;
  yield spaces;
  yield p.eof;
  return e;
});
