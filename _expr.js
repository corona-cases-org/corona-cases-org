// Helper to approximate {{#expr}} expression parsing as per
// https://www.mediawiki.org/wiki/Help:Extension:ParserFunctions##expr

// At the moment, this is a very rough approximation, but it adequately handles
// basic arithmetic expressions like `2*3+4`.

const mathjs = require('mathjs')

// Per https://mathjs.org/docs/expressions/security.html
const math = mathjs.create(mathjs.all)
const limitedEvaluate = math.evaluate

math.import({
  'import':     function () { throw new Error('Function import is disabled') },
  'createUnit': function () { throw new Error('Function createUnit is disabled') },
  'evaluate':   function () { throw new Error('Function evaluate is disabled') },
  'parse':      function () { throw new Error('Function parse is disabled') },
  'simplify':   function () { throw new Error('Function simplify is disabled') },
  'derivative': function () { throw new Error('Function derivative is disabled') }
}, { override: true })

function evaluateExpr(expr) {
  expr = expr.trim()
  if (expr === '' || expr == null) {
    return null
  }
  try {
    return limitedEvaluate(expr)
  } catch {
    return 'expression error: ' + expr
  }
}

module.exports = evaluateExpr
