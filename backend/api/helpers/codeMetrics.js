const luaLexer = require('luaparse')

module.exports = {
  Version: 5,

  run: async (code) => {
    if (!code.length) {
      return []
    }
    for (let i = 0; i < code.length; i++) {
      if (typeof code[i] !== 'object' || !code[i].lua || typeof code[i].lua !== 'string' || (code[i].keypath && code[i].keypath.match(/customVariables$/))) {
        continue
      }
      if (code[i].luacheck && code[i].luacheck.match(/^\d+ error/)) {
        continue
      }

      let metrics = new Metrics()
      let lua = code[i].lua
      metrics.countLoC(lua)

      lua = lua.replace(/break\s*;/g, 'break') // weird bugfixhack

      let tmpFn = `fn${Math.floor(Math.random()*1000)}`
      if (!code[i].keypath.match(/\.actions\.(init|start|finish)\.custom/)) {
        let luax
        while (luax !== lua) {
          luax = lua
          lua = lua.replace(/^\s*--\[(=*)\[[\s\S]*?\]\1\]/gm, '').replace(/^\s*--.*$/m, '')
        }
        lua = lua.replace(/^\s*function\s*\(/, `function ${tmpFn}(`)
        metrics.tokens = -1
      }

      //
      try {
        let ast = luaLexer.parse(lua, {comments: false, locations: true, scope: true})
        metrics.walkAST(ast)
        metrics.globals.delete(tmpFn)
        metrics.finalize()
      }
      catch (e) {
        console.log(e, code[i].name, code[i].keypath, '\n'+lua+'\n\n\n\n\n')
        throw 'diedie'
      }

      code[i].metrics = metrics
    }
    return code
  }
}

class Metrics {
  constructor () {
    this.dependencies = new Set()
    this.highlights = new Set()
    this.tokens = 0
    this.complexities = [0]
    this.complexityIndex = 0
    this.operators = []
    this.operands = []
    this.nloc = 0
    this.globals = new Set()
  }

  countLoC (lua) {
    // remove multi-line comments, single line comments and empty lines
    let lines = lua.replace(/--\[(=*)\[[\s\S]*?--\]\1\]/, '').replace(/--.*$/gm, '').replace(/\n\s*\n/gm, '\n').trim()
    if (lines) {
      this.nloc = (lines.match(/\n/g) || []).length + 1
    }
    else {
      this.nloc = 0
    }
  }

  astStringValue (strObj) {
    if (!strObj || strObj.type !== 'StringLiteral') {
      return ''
    }
    if (strObj.value) {
      return strObj.value
    }
    if (strObj.raw) {
      let str = strObj.raw.replace(/^("|')|("|')$/g, '')
      if (str !== strObj.raw) {
        return str
      }
      let ml = strObj.raw.match(/^\[(=*)\[/)
      if (ml) {
        str = strObj.raw.replace(new RegExp(`^\\[${ml[1]}\\[|\\]${ml[1]}\\]$`, 'g'), '')
      }
      return str || strObj.raw
    }
    return ''
  }

  finalize () {
    this._operators = [...new Set(this.operators)]
    this._operands = [...new Set(this.operands)]

    this.halstead = {
      N: this.operators.length + this.operands.length,
      n: this._operators.length + this._operands.length
    }
    this.halstead.volume = (this.halstead.N * Math.log2(this.halstead.n)) || 0
    this.maintainability = (Math.max(0, (171 - (5.2 * Math.log(this.halstead.volume)) - (0.23 * this.ccn) - 16.2 * Math.log(this.nloc))*100 / 171)) || 0

    this.dependencies = [...this.dependencies]
    this.highlights = [...this.highlights]
    this.globals = [...this.globals]
    this.globals.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase())
    })
    this.globals = this.globals.filter(g => !g.match(/^aura_env/))

    delete this.operators
    delete this._operators
    delete this.operands
    delete this._operands
    delete this.complexities
    delete this.complexityIndex
  }

  walkMemberExpression(ast) {
    if (!ast) {
      return
    }
    else if (ast.type === 'Identifier' && ast.isLocal === false) {
      return ast.name
    }
    else {
      let g = this.walkMemberExpression(ast.base)
      if (g && ast.type === 'IndexExpression' && ast.index) {
        return g + '[' + this.walkMemberExpression(ast.index) + ']' + (ast.identifier?.name || '')
      }
      else if (g && ast.type === 'IndexExpression') {
        return g + '[' + (ast.index.raw || ast.index.name) + ']' + (ast.identifier?.name || '')
      }
      else if (g && ast.type === 'CallExpression') {
        return g + '(...)'
      }
      else if (g) {
        return g + ast.indexer + (ast.identifier?.name || '')
      }
      else {
        return ''
      }
    }
  }

  walkAST(ast, complexity = 0) {
    if (!ast) {
      return
    }
    let prevComplexityIndex
    if (ast.globals) {
      ast.globals.forEach(g => {
        this.globals.add(g.name)
      })
    }

    if (!ast.type) {

    }
    // for halstead operands
    else if (ast.type === 'Identifier' && this.operators[this.operators.length - 1] !== ast.name) {
      this.operands.push(ast.name)
    }
    else if (ast.type.match(/^(Numeric|Vararg|String|Nil|Boolean)Literal$/)) {
      this.operands.push(ast.raw)
    }
    // halstead operators
    else if (ast.type === 'AssignmentStatement') {
      this.operators.push('=')
    }
    else if (ast.type === 'LocalStatement') {
      ast.variables.forEach(v => {
        if (this.operands.indexOf(v.name) >= 0) {
          this.operands.push(Math.floor(Math.random()*1000) + v.name)
        }
      })
      if (ast.init.length) {
        this.operators.push('=')
        if (ast.init.length > 1 || ast.variables.length > 1) {
          this.operators = this.operators.concat(new Array((ast.init.length + ast.variables.length - 2)).fill(','))
        }
      }
    }
    else if (ast.type === 'MemberExpression' && ast.indexer) {
      this.operators.push(ast.indexer)
    }
    else if (ast.type === 'IndexExpression' && ast.indexer) {
      this.operators.push('[]')
    }
    else if (ast.type === 'TableConstructorExpression') {
      this.operators.push('{}')
    }
    else if (ast.type === 'TableValue' && this.operators[this.operators.length - 1] !== ',') {
      this.operators.push(',')
    }
    else if (ast.type === 'CallExpression') {
      if (ast.base.name) {
        this.operators.push(ast.base.name)
      }
      else if (ast.base.identifier && ast.base.identifier.name) {
        this.operators.push(ast.base.identifier.name)
        ast.base.name = ast.base.identifier.name
      }
      this.operators.push('()')
    }
    else if (ast.type === 'FunctionDeclaration') {
      this.operators.push('()')
    }
    else if (ast.type === 'UnaryExpression' || ast.type === 'BinaryExpression') {
      this.operators.push(ast.operator)
    }
    else if (ast.type.match(/^(Return|Break|Repeat|While|Do|If|IfElse|Else)Statement$/)) {
      this.operators.push(ast.type.replace(/Statement/, ''))
    }
    else if (ast.type.match(/^(IfElse|Else)Cause$/)) {
      this.operators.push(ast.type.replace(/Cause/, ''))
    }
    else if (ast.type === 'ForNumericStatement') {
      this.operators.push('for')
      this.operators.push(',')
      if (ast.step) {
        this.operators.push(',')
      }
    }
    else {
      // console.log(ast)
    }

    // collect props of globals
    if (ast.type === 'Identifier' && ast.isLocal === false) {
      this.globals.add(ast.name)
    }
    else if (ast.type === 'MemberExpression') {
      let findGlobal = this.walkMemberExpression(ast)
      if (findGlobal) {
        this.globals.add(findGlobal)
      }
    }

    // add up tokens and complexity
    if (ast.type && ast.type !== 'Chunk') {
      this.tokens++
    }
    if (ast.type === 'FunctionDeclaration') {
      this.complexities.push(0)
      prevComplexityIndex = this.complexityIndex
      this.complexityIndex = this.complexities.length - 1
    }
    if (ast.type && ast.type.match(/^((Break|While|Do|Repeat|ForNumeric|ForGeneric)Statement|(If|Elseif|Else)Clause|LogicalExpression)$/)) {
      this.complexities[this.complexityIndex]++
    }

    // check for certain expressions
    if (ast.type && ast.type.match(/^(Call|Member|Index)Expression$/)) {
      // check dependencies from libstub
      try {
        if (ast.base.name === 'LibStub' && ast.arguments[0].type === 'StringLiteral') {
          let lib = this.astStringValue(ast.arguments[0])
          if (lib) {
            this.dependencies.add(lib)
          }
        }
      }
      catch{}

      try {
        if (ast.base.name === 'getglobal') {
          this.globals.add(`getglobal(${ast.arguments[0].raw})`)
        }
      }
      catch{}
    }

    //
    else if (ast.type === 'StringLiteral') {
      let s = this.astStringValue(ast)
      if (s) {
        s = s.replace(/\\{1,2}/g, '/')
        let m
        let regexFilePath = /^Interface\/AddOns\/([^\/]+)\//gi
        while ((m = regexFilePath.exec(s)) !== null) {
          if (m.index === regexFilePath.lastIndex) {
            regexFilePath.lastIndex++
          }
          this.dependencies.add(m[1])
        }
      }
    }

    // walk next nodes
    for (const [key, o] of Object.entries(ast)) {
      if (key === 'globals' || key === 'loc') {
        continue
      }
      else if (Array.isArray(o)) {
        o.forEach(item => {
          this.walkAST(item, complexity)
        })
      }
      else if (typeof o === 'object') {
        this.walkAST(o, complexity)
      }
    }
    if (ast.type === 'FunctionDeclaration') {
      this.complexityIndex = prevComplexityIndex
    }
    this.ccn = Math.max(...this.complexities)
  }
}

