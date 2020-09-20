/*
    https://github.com/Herrtt/luamin.js/
    Stravant thing in js
    Written by Herrtt (originally by Stravant)
*/ 


// I copied some comments
// no, it was not worth it
// please leave me alone
// I tried to copy+paste all comments, but no. I got bored.
// Be happy.

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const print = console.log
const error = console.error
const assert = function(a,b) {
  if (!a) {
      throw b
  }
}

function parseFloat(str, radix) { // Thanks stackoverflow (hex numbers with decimal)
  var parts = str.split(".");
  if (parts.length > 1) {
      return parseInt(parts[0], radix) + parseInt(parts[1], radix) / Math.pow(radix, parts[1].length);
  }
  return parseInt(parts[0], radix);
}

/** 
* 
* regex to make arr : (arr)\[(\S*)\]
* replace value : $1.includes($2)
* 
*/

let WhiteChars = [
  ' ', 
  '\n', 
  '\t', 
  '\r'
]

//unused

/* let EscapeForCharacter = {
  '\r': '\\r', 
  '\n': '\\n',
  '\t': '\\t',
  '"': '\\"',
  "'": "\\'",
  '\\': '\\'
} */

let Main_CharacterForEscape = {
  'r': '\r', 
  'n': '\n',
  't': '\t',
  '"': '"',
  "'": "'",
  '\\': '\\',
}

const CharacterForEscape = new Proxy(Main_CharacterForEscape, { 
  get(a, b) { return parseFloat(b) }
})

let AllIdentStartChars = [
  'A',    'B',    'C',    'D',
  'E',    'F',    'G',    'H',
  'I',    'J',    'K',    'L',
  'M',    'N',    'O',    'P',
  'Q',    'R',    'S',    'T',
  'U',    'V',    'W',    'X',
  'Y',    'Z',    '_',    'a',
  'b',    'c',    'd',    'e',
  'f',    'g',    'h',    'i',
  'j',    'k',    'l',    'm',
  'n',    'o',    'p',    'q',
  'r',    's',    't',    'u',
  'v',    'w',    'x',    'y',
  'z'
]

let AllIdentChars = [
  '0',    '1',    '2',    '3',
  '4',    '5',    '6',    '7',
  '8',    '9',    
  
  
  'A',    'B',
  'C',    'D',    'E',    'F',
  'G',    'H',    'I',    'J',
  'K',    'L',    'M',    'N',
  'O',    'P',    'Q',    'R',
  'S',    'T',    'U',    'V',
  'W',    'X',    'Y',    'Z',
  '_',    'a',    'b',    'c',
  'd',    'e',    'f',    'g',
  't',    'u',    'v',    'w',
  'h',    'i',    'j',    'k',
  'l',    'm',    'n',    'o',
  'p',    'q',    'r',    's',
  'x',    'y',    'z',     // this was actually fucking retarded to add, pls dont do this to me
]

let Digits = [
  '0','1','2','3',
  '4','5','6','7',
  '8','9',
]

let HexDigits = [
  //digits
  '0','1','2','3',
  '4','5','6','7',
  '8','9',

  //letters
  'a','b','c','d','e','f',
  'A','B','C','D','E','F',
]

let Symbols = [
  '+', '-', '*', ')', ';',  
  '/', '^', '%', '#',
  ',', '{', '}', ':',
  '[', ']', '(','.',
]

let EqualSymbols = [
  '~', '=', '>', '<',
]

let Keywords = [
  'and',      'break',    'do',   'else', 
  'elseif',   'end',      'false','for',
  'function', 'goto',     'if',   'in',
  'local',    'nil',      'not',  'or', 
  'repeat',   'return',   'then', 'true', 
  'until',    'while',
]

let BlockFollowKeyword = [
  'else',     'elseif', 
  'until',    'end'
]

let UnopSet = [
  '-',    'not',  '#',
]

let BinopSet = [
  '+',    '-',     '*',   '/',    '%',    '^',    '#',    //algorithmic
  
  '..',   '.',     ':',   //dots / colons
  
  '>',    '<',     '<=',  '>=',   '~=',   '==',   //arrows / conditional
  
'and',  'or'    // conditional 
]

/* let GlobalRenameIgnore = {
} //unused */
let BinaryPriority = {
  '+': [6, 6],
  '-': [6, 6],
  '*': [7, 7],
  '/': [7, 7],
  '%': [7, 7],
  '^': [10, 9],
  '..': [5, 4],
  '==': [3, 3],
  '~=': [3, 3],
  '>': [3, 3],
  '<': [3, 3],
  '>=': [3, 3],
  '<=': [3, 3],
  'and': [2, 2],
  'or': [1, 1],
}

let UnaryPriority = 8
// Eof, Ident, KeyWord, Number, String, Symbol


function CreateLuaTokenStream(text) {
  // Tracking for the current position in the buffer, and
  // the current line / character we are on

  let p = 0
  let length = text.length

  // Output buffer for tokens
  let tokenBuffer = []

  // Get a character or '' if at eof
  function look(n) {
      n = n || 0
      if (p <= length) {
          return text.substr(p + n, 1)
      } else {
          return ''
      }
  }

  function get() {
      if (p <= length) {
          let c = text.substr(p, 1)
          p++
          return c
      } else {
          return ''
      }
  }

  // Error
  function error(str) {
      let q = 0
      let line = 1
      let char = 1
      while (q <= p) {
          if (text.substr(q,1) == '\n') {
              line++
              char = 1
          } else {
              char++
          }
      }
      let i_;
      for (i_ = 0; i_ < tokenBuffer; i_++) {
          let token = tokenBuffer[i_]
          print(`${token.Type}<${token.Source}>`)
      }
      throw `file<${line}:${char}>: ${str}`
  }

  // Consume a long data with equals count of `eqcount`
  function longdata(eqcount) {
      while (true) {
          let c = get()
          if (c == '') {
              error("Unfinished long string.")
          } else if(c == ']') {
              let done = true // Until contested
              let i;
              for (i=1; i<=eqcount; i++) {
                  if (look() == '=') {
                      p++
                  } else {
                      done = false
                      break
                  }
              }
              if (done && get() == ']') {
                  return
              }
          }
      }
  }


  // Get the opening part for a long data `[` `=`` * `[`
  // Precondition: The first `[` has been consumed
  // Return: nil or the equals count

  function getopen() {
      let startp = p
      while (look() == '=') {
          p++
      }
      if (look() == '[') {
          p++
          return p - startp - 1
      } else {
          p = startp
          return
      }
  }


  // Add token
  let whiteStart = 0
  let tokenStart = 0
  let tokens = 0
  function token(type) {
      tokens++

      let src = text.substr(tokenStart, (p - tokenStart))
      if (type == "Number") {
          if (src.substr(0,2) == "0x") {
              src = parseInt(src, 16)
          }
      }
      let tk = {
          'Type': type,
          'LeadingWhite': text.substr(whiteStart, (tokenStart - whiteStart)),
          'Source': src
      }
      tokenBuffer.push(tk)

      whiteStart = p
      tokenStart = p
      return tk
  }

  // Parse tokens loop
  while (true) {
      // Mark the whitespace start
      whiteStart = p
      while (true) { // Whitespaces
          let c = look()
          if (c == '') {
              break
          } else if(c == '-') {

              if (look(1) == "-") {
                  p += 2

                  // Consume comment body
                  if (look() == "[") {

                      p++
                      let eqcount = getopen()
                      if (eqcount != null) {
                          // Long comment body
                          longdata(eqcount)
                          whiteStart = p
                      } else {
                          // Normal comment body
                          while (true) {
                              let c2 = get()
                              if (c2 == "" || c2 == "\n") {
                                  //whiteStart = p
                                  break
                              }
                          }
                      }
                  } else {
                      // Normal comment body
                      while (true) {
                          let c2 = get()
                          if (c2 == "" || c2 == "\n") {
                              //whiteStart = p
                              break
                          }
                      }
                  }
              } else {
                  break
              }
          } else if(WhiteChars.includes(c)) {
              p++
          } else {
              break
          }
      }

      
      let leadingWhite = text.substr(whiteStart, (p - whiteStart))
      // Mark the token start
      tokenStart = p

      // Switch on token type
      let c1 = get()
      if (c1 == '') {
          // End of file
          token('Eof')
          break
      } else if(c1 == '\'' || c1 == '\"') {
          // String constant
          while (true) {
              let c2 = get()
              if (c2 == '\\') {
                  let c3 = get()
                  let esc = CharacterForEscape[c3]
                  if (esc == null) {
                      throw (`Invalid Escape Sequence \`${c3}\`.`)
                  }
              } else if(c2 == c1) {
                  break
              } else if(c2 == "") {
                  throw ("Unfinished string!")
              }
          }
          token('String')
      } else if(AllIdentStartChars.includes(c1)) {
          // Ident or keyword
          while (AllIdentChars.includes(look())) {
              p++
          }

          if (Keywords.includes(text.substr(tokenStart, (p - tokenStart)))) {
              token("Keyword")
          } else {
              token("Ident")
          }
          
      } else if(Digits.includes(c1) || (c1 == '.' && Digits.includes(look()))) {
          // Number
          if (c1 == '0' && look() == 'x') {
              p++
              // Hex number
              while (HexDigits.includes(look())) {
                  p++
              }
          } else {
              // Normal number
              while (Digits.includes(look())) {
                  p++
              }

              if (look() == '.') {
                  // With decimal point
                  p++
                  while (Digits.includes(look())) {
                      p++
                  }
              }

              if (look() == 'e' || look() == 'E') {
                  // With exponent
                  p++
                  if (look() == '-') {
                      p++
                  }
                  while (Digits.includes(look())) {
                      p++
                  }
              }
          }
          token("Number")
      } else if(c1 == '[') {
          // Symbol or Long String
          let eqCount = getopen()
          if (eqCount != null) {
              // Long String
              longdata(eqCount)
              token("String")
          } else {
              // Symbol
              token("Symbol")
          }
      } else if(c1 == '.') {
          // Greedily consume up to 3 `.` for . / .. / ... tokens
          if (look() == '.') {
              get()
              if (look() == '.') {
                  get()
              }
          }
          token("Symbol")
      } else if(EqualSymbols.includes(c1)) {
          if (look() == "=") {
              p++
          }
          token("Symbol")
      } else if(Symbols.includes(c1)) {
          token("Symbol")
      } else {
          throw(`Bad symbol \`${c1}\` in source.`)
      }
  }

  return tokenBuffer
}

//Removelater


function CreateLuaParser(text) {
  // Token stream and pointer into it
  let tokens = CreateLuaTokenStream(text)

  let p = 0
  function get() {
      let tok = tokens[p]
      if (p < tokens.length) {
          p++
      }
      return tok
  }
  function peek(n) {
      n = p + (n || 0)
      return tokens[n] || tokens[tokens.length - 1]
  }

  function getTokenStartPosition(token) {
      let line = 1
      let char = 0
      let tkNum = 0
      while (true) {
          let tk = tokens[tkNum]
          let text
          if (tk == token) {
              text = tk.LeadingWhite
          } else {
              text = tk.LeadingWhite + tk.Source
          }

          let i
          for (i=0; i<=text.length; i++) {
              let c = text.substr(i, 1)
              if (c == '\n') {
                  line++
                  char = 0
              } else {
                  char++
              }
          }
          
          if (tk == token) {
              break
          }
          tkNum++
      }
      return `${line}:${char+1}`
  }

  function debugMark() {
      let tk = peek()
      return `<${tk.Type} \`${tk.Source}\`> at: ${getTokenStartPosition(tk)}`
  }

  function isBlockFollow() {
      let tok = peek()
      return tok.Type == 'Eof' || (tok.Type == 'Keyword' && BlockFollowKeyword.includes(tok.Source))   
  }

  function isUnop() {
      return UnopSet.includes(peek().Source) || false
  }

  function isBinop() {
      return BinopSet.includes(peek().Source) || false
  }

  function expect(type, source) {
      let tk = peek()
      if (tk.Type == type && (source == null || tk.Source == source)) {
          return get()
      } else {
          let i
          for (i=-3; i<=3; i++) {
              print(`Tokens[${i}] = \`${peek(i).Source}\``)
          }
          if (source) {
              let a = `${getTokenStartPosition(tk)}: \`${source}\` expected.`
              throw a
          } else {
              let a = `${getTokenStartPosition(tk)}: ${type} expected.`
              throw a
          }
      }
  }

  function MkNode(node) {
      let getf = node.GetFirstToken
      let getl = node.GetLastToken

      let self = node
      node.GetFirstToken = function() {
          let t = getf(self)
          assert(t)
          return t
      }

      node.GetLastToken = function() {
          let t = getl(self)
          assert(t)
          return t
      }

      return node
  }

  let block
  let expr

  function exprlist(locals, upvals) {
      let exprList = [expr(locals, upvals)]
      let commaList = []
      while (peek().Source == ",") {
          commaList.push(get())
          exprList.push(expr(locals, upvals))
      }
      return [exprList, commaList]
  }

  function prefixexpr(locals, upvals) {
      if (!locals) {
          assert(false, "no locals")
      }
      let tk = peek()
      if (tk.Source == '(') {
          let oparenTk = get()
          let inner = expr(locals, upvals)
          let cparenTk = expect('Symbol', ')')
          let node
          node = MkNode({
              'Type': 'ParenExpr',
              'Expression': inner,
              'Token_OpenParen': oparenTk,
              'Token_CloseParen': cparenTk,
              'GetFirstToken': () => node.Token_OpenParen,
              'GetLastToken': () => node.Token_CloseParen,
          })
          return node
      } else if(tk.Type == "Ident") {
          let node
          node = MkNode({
              'Type': 'VariableExpr',
              'Token': get(),
              'GetFirstToken': () => node.Token,
              'GetLastToken': () => node.Token,
          })

          if (locals[node.Token.Source] != null) {
              locals[node.Token.Source].Tokens.push(node.Token)
              locals[node.Token.Source].UseCountIncrease()
          } else if(upvals[node.Token.Source] != null) {
              upvals[node.Token.Source].Tokens.push(node.Token)
              upvals[node.Token.Source].UseCountIncrease()
          }

          return node
      } else {
          print(debugMark())

          let a = (`${getTokenStartPosition(tk)}: Unexpected symbol. ${tk.Type} ${tk.Source}`)
          throw a
      }
  }

  function tableexpr(locals, upvals) {
      let obrace = expect("Symbol", "{")
      let entries = []
      let seperators = []
      let length = 0

      let lastIndex

      let valLen = 0
      while (peek().Source != "}") {
          let indx
          let val
          if (peek().Source == '[') {
              // Index
              let obrac = get()
              let index = expr(locals, upvals)
              let cbrac = expect("Symbol", "]")
              let eq = expect("Symbol", "=")
              let value = expr(locals, upvals)

              indx = index.Token && index.Token.Source
              val = value

              entries.push({
                  "EntryType": "Index",
                  "Index": index,
                  "Value": value,
                  "Token_OpenBracket": obrac,
                  "Token_CloseBracket": cbrac,
                  "Token_Equals": eq,
              })
          } else if(peek().Type == "Ident" && peek(1).Source == "=") {
              // Field
              let field = get()
              let eq = get()
              let value = expr(locals, upvals)
              
              indx = field
              val = value
              entries.push({
                  "EntryType": "Field",
                  "Field": field,
                  "Value": value,
                  "Token_Equals": eq,
              })
          } else {
              // Value
      
              let value = expr(locals, upvals)
              //console.log(value)
              
              //if (lastIndex)

              entries.push({
                  "EntryType": "Value",
                  "Value": value,
              })
          }

          if (peek().Source == "," || peek().Source == ";") {
              seperators.push(get())
          } else {
              break
          }
      }

      let cbrace = expect("Symbol", "}")
      let node
      node = MkNode({
          "Type": "TableLiteral",
          "EntryList": entries,
          "Token_SeperatorList": seperators,
          "Token_OpenBrace": obrace,
          "Token_CloseBrace": cbrace,
          "GetFirstToken": () => node.Token_OpenBrace,
          "GetLastToken": () => node.Token_CloseBrace,
      })
      return node
  }


  function varlist(acceptVarg) {
      let varList = []
      let commaList = []
      if (peek().Type == "Ident") {
          varList.push(get())
      } else if(peek().Source == "..." && acceptVarg) {
          return [varList, commaList, get()]
      }
      while (peek().Source == ",") {
          commaList.push(get())
          if (peek().Source == "..." && acceptVarg) {
              return [varList, commaList, get()]
          } else {
              let id = expect("Ident")
              varList.push(id)
          }
      }
      return [varList, commaList]
  }

  function blockbody(terminator, locals, upvals) {
      let body = block(locals, upvals)
      let after = peek()
      if (after.Type == "Keyword" && after.Source == terminator) {
          get()
          return [body, after]
      } else {
          print(after.Type, after.Source)
          throw `${getTokenStartPosition(after)}: ${terminator} expected.`
      }
  }

  function funcdecl(isAnonymous, locals, upvals, local) {
      let functionKw = get()

      let nameChain
      let nameChainSeperator

      if (!isAnonymous) {
          nameChain = []
          nameChainSeperator = []

          let token = expect("Ident")
          nameChain.push(token)

          while (peek().Source == ".") { 
              nameChainSeperator.push(get())
              nameChain.push(expect("Ident"))
          }

          if (peek().Source == ":") {
              nameChainSeperator.push(get())
              nameChain.push(expect("Ident"))
          }
      }

      let oparenTk = expect("Symbol", "(")

      let [argList, argCommaList, vargToken] = varlist(true)
      let cparenTk = expect("Symbol", ")")
      let [fbody, enTk] = blockbody("end", locals, upvals)

      let node
      node = MkNode({
          "Type": (isAnonymous == true ? "FunctionLiteral" : "FunctionStat"),
          "NameChain": nameChain,
          "ArgList": argList,
          "Body": fbody,

          "Token_Function": functionKw,
          "Token_NameChainSeperator": nameChainSeperator,
          "Token_OpenParen": oparenTk,
          "Token_Varg": vargToken,
          "Token_ArgCommaList": argCommaList,
          "Token_CloseParen": cparenTk,
          "Token_End": enTk,
          "GetFirstToken": () => node.Token_Function,
          "GetLastToken": () => node.Token_End,
      })
      return node
  }

  function functionargs(locals, upvals) {
      let tk = peek()
      if (tk.Source == "(") {
          let oparenTk = get()
          let argList = []
          let argCommaList = []
          while (peek().Source != ")") {
              argList.push(expr(locals, upvals))
              if (peek().Source == ",") {
                  argCommaList.push(get())
              } else {
                  break
              }
          }

          let cparenTk = expect("Symbol", ")")
          let
          node = MkNode({
              "CallType": "ArgCall",
              "ArgList": argList,

              "Token_CommaList": argCommaList,
              "Token_OpenParen": oparenTk,
              "Token_CloseParen": cparenTk,
              "GetFirstToken": () => node.Token_OpenParen,
              "GetLastToken": () => node.Token_CloseParen,
          })
          return node
      } else if(tk.Source == "{") {
          let node
          node = MkNode({
              "CallType": "TableCall",
              "TableExpr": expr(locals, upvals),
              "GetFirstToken": () => node.TableExpr.GetFirstToken(),
              "GetLastToken": () => node.TableExpr.GetLastToken(),
          })
          return node
      } else if(tk.Type == "String") {
          let node
          node = MkNode({
              "CallType": "StringCall",
              "Token": get(),
              "GetFirstToken": () => node.Token,
              "GetLastToken": () => node.Token,
          })
          return node
      } else {
          throw "Function arguments expected."
      }
  }


  function primaryexpr(locals, upvals) {
      let base = prefixexpr(locals, upvals)
      assert(base, "nil prefixexpr")

      while (true) {
          let tk = peek()

          if (tk.Source == ".") {
              let dotTk = get()
              let fieldName = expect("Ident")
              let node
              node = MkNode({
                  "Type": "FieldExpr",
                  "Base": base,
                  "Field": fieldName,
                  "Token_Dot": dotTk,
                  "GetFirstToken": () => node.Base.GetFirstToken(),
                  "GetLastToken": () => node.Field,
              })
              base = node
          } else if(tk.Source == ":") {
              let colonTk = get()
              let methodName = expect("Ident")
              let fargs = functionargs(locals, upvals)
              let node
              node = MkNode({
                  "Type": "MethodExpr",
                  "Base": base,
                  "Method": methodName,
                  "FunctionArguments": fargs,
                  "Token_Colon": colonTk,
                  "GetFirstToken": () => node.Base.GetFirstToken(),
                  "GetLastToken": () => node.FunctionArguments.GetLastToken(),
              })
              base = node
          } else if(tk.Source == "[") {
              let obrac = get()
              let index = expr(locals, upvals)
              let cbrac = expect("Symbol", "]")
              let node
              node = MkNode({
                  "Type": "IndexExpr",
                  "Base": base,
                  "Index": index,
                  "Token_OpenBracket": obrac,
                  "Token_CloseBracket": cbrac,
                  "GetFirstToken": () => node.Base.GetFirstToken(),
                  "GetLastToken": () => node.Token_CloseBracket,
              })
              base = node
          } else if(tk.Source == "{" || tk.Source == "(" || tk.Type == "String") {
              let node
              node = MkNode({
                  "Type": "CallExpr",
                  "Base": base,
                  "FunctionArguments": functionargs(locals, upvals),
                  "GetFirstToken": () => node.Base.GetFirstToken(),
                  "GetLastToken": () => node.FunctionArguments.GetLastToken(),
              })
              base = node
          } else {
              return base
          }
      }
  }

  function simpleexpr(locals, upvals) {
      let tk = peek()
      if (tk.Type == "Number") {
          let node
          node = MkNode({
              "Type": "NumberLiteral",
              "Token": get(),
              "GetFirstToken": () => node.Token,
              "GetLastToken": () => node.Token
          })

          return node
      } else if(tk.Type == "String") {
          let node
          node = MkNode({
              "Type": "StringLiteral",
              "Token": get(),
              "GetFirstToken": () => node.Token,
              "GetLastToken": () => node.Token,
          })
          return node
      } else if(tk.Source == "nil") {
          let node
          node = MkNode({
              "Type": "NilLiteral",
              "Token": get(),
              "GetFirstToken": () => node.Token,
              "GetLastToken": () => node.Token,
          })
          return node
      } else if(tk.Source == "true" || tk.Source == "false") {
          let node
          node = MkNode({
              "Type": "BooleanLiteral",
              "Token": get(),
              "GetFirstToken": () => node.Token,
              "GetLastToken": () => node.Token,
          })
          return node
      } else if(tk.Source == "...") {
          let node
          node = MkNode({
              "Type": "VargLiteral",
              "Token": get(),
              "GetFirstToken": () => node.Token,
              "GetLastToken": () => node.Token,
          })
          return node
      } else if(tk.Source == "{") {
          return tableexpr(locals, upvals)
      } else if(tk.Source == "function") {
          return funcdecl(true, locals, upvals)
      } else {
          return primaryexpr(locals, upvals)
      }
  }

  function subexpr(limit, locals, upvals) {
      let curNode
      if (isUnop()) {
          let opTk = get()
          let ex = subexpr(UnaryPriority, locals, upvals)
          let node
          node = MkNode({
              "Type": "UnopExpr",
              "Token_Op": opTk,
              "Rhs": ex,
              "GetFirstToken": () => node.Token_Op,
              "GetLastToken": () => node.Rhs.GetLastToken(),
          })
          curNode = node
      } else {
          curNode = simpleexpr(locals, upvals)
          assert(curNode, "nil sipleexpr")
      }  
  
      while (isBinop() && BinaryPriority[peek().Source][0] > limit) {
          let opTk = get()
          let rhs = subexpr(BinaryPriority[opTk.Source][1], locals, upvals)
          assert(rhs, "RhsNeeded")
          let node
          node = MkNode({
              "Type": "BinopExpr",
              "Lhs": curNode,
              "Rhs": rhs,
              "Token_Op": opTk,
              "GetFirstToken": () => node.Lhs.GetFirstToken(),
              "GetLastToken": () => node.Rhs.GetLastToken(),
          })
          curNode = node
      }
      return curNode
  }

  expr = (locals, upvals) => subexpr(0, locals, upvals)

  function exprstat(locals, upvals) {
      let ex = primaryexpr(locals, upvals)

      if (ex.Type == "MethodExpr" || ex.Type == "CallExpr") {
          let node
          node = MkNode({
              "Type": "CallExprStat",
              "Expression": ex,
              "GetFirstToken": () => node.Expression.GetFirstToken(),
              "GetLastToken": () => node.Expression.GetLastToken(),
          })
          return node
      } else {
          let lhs = [ex]
          let lhsSeperator = []
          while (peek().Source == ",") {
              lhsSeperator.push(get())
              let lhsPart = primaryexpr(locals, upvals)
              if (lhsPart.Type == "MethodExpr" || lhsPart.Type == "CallExpr") {
                  throw "Bad left hand side of asignment"
              }
              lhs.push(lhsPart)
          }
          let eq = expect("Symbol", "=")
          let rhs = [expr(locals, upvals)]
          let rhsSeperator = []
          while (peek().Source == ",") {
              rhsSeperator.push(get())
              rhs.push(expr(locals, upvals))
          }

          let node
          node = MkNode({
              "Type": "AssignmentStat",
              "Rhs": rhs,
              "Lhs": lhs,
              "Token_Equals": eq,
              "Token_LhsSeperatorList": lhsSeperator,
              "Token_RhsSeperatorList": rhsSeperator,
              "GetFirstToken": () => node.Lhs[0].GetFirstToken(),
              "GetLastToken": () => node.Rhs[node.Rhs.length - 1].GetLastToken(),
          })

          return node
      }
  }

  function ifstat(locals, upvals) {
      let ifKw = get()
      let condition = expr(locals, upvals)
      let thenKw = expect("Keyword", "then")
      let ifBody = block(locals, upvals)
      let elseClauses = []
      while (peek().Source == "elseif" || peek().Source == "else") {
          let elseifKw = get()
          let elseifCondition
          let elseifThenKw
          if (elseifKw.Source == "elseif") {
              elseifCondition = expr(locals, upvals)
              elseifThenKw = expect("Keyword", "then")
          }
          let elseifBody = block(locals, upvals)
          elseClauses.push({
              "Condition": elseifCondition,
              "Body": elseifBody,

              "ClauseType": elseifKw.Source,
              "Token": elseifKw,
              "Token_Then": elseifThenKw,
          })
          if (elseifKw.Source == "else") {
              break
          }
      }
      let enKw = expect("Keyword", "end")
      let node
      node = MkNode({
          "Type": "IfStat",
          "Condition": condition,
          "Body": ifBody,
          "ElseClauseList": elseClauses,
          
          "Token_If": ifKw,
          "Token_Then": thenKw,
          "Token_End": enKw,
          "GetFirstToken": () => node.Token_If,
          "GetLastToken": () => node.Token_End,
      })
      return node
  }


  function dostat(locals, upvals) {
      let doKw = get()
      let [body, enKw] = blockbody("end", locals, upvals)
      
      let node
      node = MkNode({
          "Type": "DoStat",
          "Body": body,
          
          "Token_Do": doKw,
          "Token_End": enKw,
          "GetFirstToken": () => node.Token_Do,
          "GetLastToken": () => node.Token_End,
      })
      return node
  }

  function whilestat(locals, upvals) {
      let whileKw = get()
      let condition = expr(locals, upvals)
      let doKw = expect("Keyword", "do")
      let [body, enKw] = blockbody("end", locals, upvals)

      let node
      node = MkNode({
          "Type": "WhileStat",
          "Condition": condition,
          "Body": body,
          
          "Token_While": whileKw,
          "Token_Do": doKw,
          "Token_End": enKw,
          "GetFirstToken": () => node.Token_While,
          "GetLastToken": () => node.Token_End,
      })
      return node
  }

  function forstat(locals, upvals) {
      let forKw = get()
      let [loopVars, loopVarCommas] = varlist()
      let node = []
      if (peek().Source == "=") {
          let eqTk = get()
          let [exprList, exprCommaList] = exprlist(locals, upvals)
          if (exprList.length < 2 || exprList.length > 3) {
              throw "Expected 2 or 3 values for range bounds"
          }
          let doTk = expect("Keyword", "do")
          let [body, enTk] = blockbody("end", locals, upvals)
          let node
          node = MkNode({
              "Type": "NumericForStat",
              "VarList": loopVars,
              "RangeList": exprList,
              "Body": body,
              
              "Token_For": forKw,
              "Token_VarCommaList": loopVarCommas,
              "Token_Equals": eqTk,
              "Token_RangeCommaList": exprCommaList,
              "Token_Do": doTk,
              "Token_End": enTk,
              "GetFirstToken": () => node.Token_For,
              "GetLastToken": () => node.Token_End,
          })
          return node
      } else if(peek().Source == "in") {
          let inTk = get()
          let [exprList, exprCommaList] = exprlist(locals, upvals)
          let doTk = expect("Keyword", "do")
          let [body, enTk] = blockbody("end", locals, upvals)
          let node
          node = MkNode({
              "Type": "GenericForStat",
              "VarList": loopVars,
              "GeneratorList": exprList,
              "Body": body,

              "Token_For": forKw,
              "Token_VarCommaList": loopVarCommas,
              "Token_In": inTk,
              "Token_GeneratorCommaList": exprCommaList,
              "Token_Do": doTk,
              "Token_End": enTk,
              "GetFirstToken": () => node.Token_For,
              "GetLastToken": () => node.Token_End
          })
          return node
      }
  }

  function repeatstat(locals, upvals) {
      let repeatKw = get()
      let [body, untilTk] = blockbody("until", locals)
      let condition = expr(locals, upvals)

      let node
      node = MkNode({
          "Type": "RepeatStat",
          "Body": body,
          "Condition": condition,

          "Token_Repeat": repeatKw,
          "Token_Until": untilTk,
          "GetFirstToken": () => node.Token_Repeat,
          "GetLastToken": () => node.Condition.GetLastToken(),
      })
      return node
  }

  function localdecl(locals, upvals) {
      let localKw = get()
      if (peek().Source == "function") {
          let funcStat = funcdecl(false, locals, upvals, true)
          if (funcStat.NameChain.length > 1) {
              throw getTokenStartPosition(funcStat.Token_NameChainSeperator[0]) + ": `(` expected."
          }

          node = MkNode({
              "Type": "LocalFunctionStat",
              "FunctionStat": funcStat,
              "Token_Local": localKw,
              "GetFirstToken": () => node.Token_Local,
              "GetLastToken": () => node.FunctionStat.GetLastToken(),
          })
          return node
      } else if(peek().Type == "Ident") {
          let [varList, varCommaList] = varlist(false)
          let exprList = []
          let exprCommaList = []
          let eqToken
          if (peek().Source == "=") {
              eqToken = get()
              let [exprList1, exprCommaList1] = exprlist(locals, upvals)
              exprList = exprList1
              exprCommaList = exprCommaList1
          }
          

          let node
          node = MkNode({
              "Type": "LocalVarStat",
              "VarList": varList,
              "ExprList": exprList,
              "Token_Local": localKw,
              "Token_Equals": eqToken,
              "Token_VarCommaList": varCommaList,
              "Token_ExprCommaList": exprCommaList,
              "GetFirstToken": () => node.Token_Local,
              "GetLastToken": function() {
                  if (node.ExprList.length > 0) {
                      return node.ExprList[node.ExprList.length - 1].GetLastToken()
                  } else {
                      return node.VarList[node.VarList.length - 1]
                  }
              },
          })
          return node
      } else {
          throw "`function` or ident expected"
      }
  }

  function retstat(locals, upvals) {
      let returnKw = get()
      let exprList
      let commaList
      if (isBlockFollow() || peek().Source == ";") {
          exprList = []
          commaList = []
      } else {
          [exprList, commaList] = exprlist(locals, upvals)
      }
      let self
      self = {
          "Type": "ReturnStat",
          "ExprList": exprList,
          "Token_Return": returnKw,
          "Token_CommaList": commaList,
          "GetFirstToken": () => self.Token_Return,
          "GetLastToken": function() {
              if (self.ExprList.length > 0) {
                  return self.ExprList[self.ExprList.length- 1].GetLastToken()
              } else {
                  return self.Token_Return
              }
          },
      }
      return self
  }

  function breakstat(locals, upvals) {
      let breakKw = get()
      let self
      self = {
          "Type": "BreakStat",
          "Token_Break": breakKw,
          "GetFirstToken": () => self.Token_Break,
          "GetLastToken": () => self.Token_Break,
      }
      return self
  }

  function statement(locals, upvals) {
      let tok = peek()
      if (tok.Source == "if") {
          return [false, ifstat(locals, upvals)]
      } else if(tok.Source == "while") {
          return [false, whilestat(locals, upvals)]
      } else if(tok.Source == "do") {
          return [false, dostat(locals, upvals)]
      } else if(tok.Source == "for") {
          return [false, forstat(locals, upvals)]
      } else if(tok.Source == "repeat") {
          return [false, repeatstat(locals, upvals)]
      } else if(tok.Source == "function") {
          return [false, funcdecl(false, locals, upvals)]
      } else if(tok.Source == "local") {
          return [false, localdecl(locals, upvals)]
      } else if(tok.Source == "return") {
          return [true, retstat(locals, upvals)]
      } else if(tok.Source == "break") {
          return [true, breakstat(locals, upvals)]
      } else {
          return [false, exprstat(locals, upvals)]
      }
  }


  let blocks = 1
  block = function(a, b) {
      let myblocknum = blocks++
      let statements = []
      let semicolons = []
      let isLast = false

      let locals = []
      let upvals = []
      if (b != null) {
          for (let [i, v] of Object.entries(b)) {
              upvals[i] = v
          }
      }

      if (a != null) {
          for (let [i, v] of Object.entries(a)) {
              upvals[i] = v
          }
      }


      let thing
      let i = 0
      while (!isLast && !isBlockFollow()) {
          if (thing && thing == peek()) {
              print(`INFINITE LOOP POSSIBLE ON STATEMENT ${thing.Source} :`,thing)
          }
          thing = peek()

          let [isLast, stat] = statement(locals, upvals)
          if (stat) {
              statements.push(stat);


              switch (stat.Type) {
                  case "LocalVarStat":
                      stat.VarList.forEach(token => {

                          token.UseCount = 0
                          token.Number = i++
                          locals[token.Source] = token

                          let tokens = []
                          function lol() {
                              token.UseCount++
                              tokens.forEach(t => {
                                  t.UseCount = token.UseCount
                              })
                          }

                          token.Tokens = {}
                          token.Tokens.push = (t) => {
                              t.UseCountIncrease = lol
                              t.UseCount = token.UseCount
                              t.Tokens = token.Tokens
                              tokens.push(t)
                          }
                          token.Tokens.get = () => tokens

                          token.UseCountIncrease = lol
                      })
                      break

                  case "LocalFunctionStat":

                      let nameChain = stat.FunctionStat.NameChain
                      if (nameChain.length === 1) {
                          let token = nameChain[0]
                          token.UseCount = 0
                          token.Number = i++
                          locals[token.Source] = token

                          let tokens = []
                          function lol() {
                              token.UseCount++
                              tokens.forEach(t => {
                                  t.UseCount = token.UseCount
                              })
                          }

                          token.Tokens = {}
                          token.Tokens.push = (t) => {
                              t.UseCountIncrease = lol
                              t.UseCount = token.UseCount
                              t.Tokens = token.Tokens
                              tokens.push(t)
                          }
                          token.Tokens.get = () => tokens

                          token.UseCountIncrease = lol
                      }
                      break

                  default:
                      break
              }
          }

          let next = peek()
          if (next.Type == "Symbol" && next.Source == ";") {
              semicolons[statements.length - 1] = get()
          }
      }

      let node
      node = {
          "Type": "StatList",
          "StatementList": statements,
          "SemicolonList": semicolons,
          "GetFirstToken": function() {
              if (node.StatementList.length == 0) {
                  return
              } else {
                  return node.StatementList[0].GetFirstToken()
              }
          },
          "GetLastToken": function() {
              if (node.StatementList.length == 0) {
                  return
              } else if(node.SemicolonList[node.StatementList.length - 1]) {
                  return node.SemicolonList[node.StatementList.length - 1]
              } else {
                  return node.StatementList[node.StatementList.length - 1].GetLastToken()
              }
          },
      }
      return node
  }

  return block([], [])
}

function VisitAst(ast, visitors) {
  let ExprType = {
  'BinopExpr': true, 'UnopExpr': true, 
  'NumberLiteral': true, 'StringLiteral': true, 'NilLiteral': true, 'BooleanLiteral': true, 'VargLiteral': true,
  'FieldExpr': true, 'IndexExpr': true,
  'MethodExpr': true, 'CallExpr': true,
  'FunctionLiteral': true,
  'VariableExpr': true,
  'ParenExpr': true,
  'TableLiteral': true,
  }

  let StatType = {
  'StatList': true,
  'BreakStat': true,
  'ReturnStat': true,
  'LocalVarStat': true,
  'LocalFunctionStat': true,
  'FunctionStat': true,
  'RepeatStat': true,
  'GenericForStat': true,
  'NumericForStat': true,
  'WhileStat': true,
  'DoStat': true,
  'IfStat': true,
  'CallExprStat': true,
  'AssignmentStat': true,
  }

  for (var [visitorSubject, visitor] of Object.entries(visitors)) {
      if (!StatType[visitorSubject] && !ExprType[visitorSubject]) {
          throw `Invalid visitor target: \`${visitorSubject}\``
      }
  }


  function preVisit(exprOrStat) {
      if (exprOrStat != null) {
          let visitor = visitors[exprOrStat.Type]
          if (typeof(visitor) == "function") {
              return visitor(exprOrStat)
          } else if(visitor && visitor.Pre) {
              return visitor.Pre(exprOrStat)
          }
      }
  }

  function postVisit(exprOrStat) {
      let visitor = visitors[exprOrStat.Type]
      if (visitor && typeof(visitor) == "object" && visitor.Post) {
          return visitor.Post(exprOrStat)
      }
  }

  let visitExpr
  let visitStat

  visitExpr = function(expr) {
      if (preVisit(expr)) {
          return
      }

      if (expr.Type == "BinopExpr") {
          visitExpr(expr.Lhs)
          visitExpr(expr.Rhs)
      } else if(expr.Type == "UnopExpr") {
          visitExpr(expr.Rhs)
      } else if(expr.Type == "NumberLiteral" || expr.Type == "StringLiteral"
              || expr.Type == "NilLiteral" || expr.Type == "BooleanLiteral"
              || expr.Type == "VargLiteral") 
      {
          //No
      } else if(expr.Type == "FieldExpr") {
          visitExpr(expr.Base)
      } else if(expr.Type == "IndexExpr") {
          visitExpr(expr.Base)
          visitExpr(expr.Index)
      } else if(expr.Type == "MethodExpr" || expr.Type == "CallExpr") {
          visitExpr(expr.Base)
          if (expr.FunctionArguments.CallType == "ArgCall") {
              expr.FunctionArguments.ArgList.forEach((argExpr, index) => {
                  visitExpr(argExpr)
              })
          } else if(expr.FunctionArguments.CallType == "TableCall") {
              visitExpr(expr.FunctionArguments.TableExpr)
          }
      } else if(expr.Type == "FunctionLiteral") {
          visitStat(expr.Body)
      } else if(expr.Type == "VariableExpr") {
          // no
      } else if(expr.Type == "ParenExpr") {
          visitExpr(expr.Expression)

      } else if(expr.Type == "TableLiteral") {
          expr.EntryList.forEach((entry, index) => {
              if (entry.EntryType == "Field") {
                  visitExpr(entry.Value)
              } else if(entry.EntryType == "Index") {
                  visitExpr(entry.Index)
                  visitExpr(entry.Value)
              } else if(entry.EntryType == "Value") {
                  visitExpr(entry.Value)
              } else {
                  throw "unreachable"
              }
          })
      } else {
          throw `unreachable, type: ${expr.Type}: ${expr}`
      }
      postVisit(expr)
  }

  visitStat = function(stat) {
      if (preVisit(stat)) {
          return
      }

      if (stat.Type == "StatList") {
          stat.StatementList.forEach((ch, index) => {
              if (ch != null) {
                  if (ch === null || ch.Type === null) {
                      return
                  }
  
                  ch.Remove = () => {
                      stat.StatementList[index] = null
                  }

                  visitStat(ch)
              }
          })
      } else if(stat.Type == "BreakStat") {
          // no
      } else if(stat.Type == "ReturnStat") {
          stat.ExprList.forEach((expr, index) => {
              visitExpr(expr)
          })
      } else if(stat.Type == "LocalVarStat") {
          if (stat.Token_Equals) {
              stat.ExprList.forEach((expr, index) => {
                  visitExpr(expr)
              })
          }
      } else if(stat.Type == "LocalFunctionStat") {
          visitStat(stat.FunctionStat.Body)
      } else if(stat.Type == "FunctionStat") {
          visitStat(stat.Body)
      } else if(stat.Type == "RepeatStat") {
          visitStat(stat.Body)
          visitExpr(stat.Condition)
      } else if(stat.Type == "GenericForStat") {
          stat.GeneratorList.forEach((expr, index) => {
              visitExpr(expr)
          })
          visitStat(stat.Body)
      } else if(stat.Type == "NumericForStat") {
          stat.RangeList.forEach((expr, index) => {
              visitExpr(expr)
          })
          visitStat(stat.Body)
      } else if(stat.Type == "WhileStat") {
          visitExpr(stat.Condition)
          visitStat(stat.Body)
      } else if(stat.Type == "DoStat") {
          visitStat(stat.Body)
      } else if(stat.Type == "IfStat") {
          visitExpr(stat.Condition)
          visitStat(stat.Body)
          stat.ElseClauseList.forEach((clause) => {
              if (clause.Condition != null) {
                  visitExpr(clause.Condition)
              }
              visitStat(clause.Body)
          })
      } else if(stat.Type == "CallExprStat") {
          visitExpr(stat.Expression)
      } else if(stat.Type == "AssignmentStat") {
          stat.Lhs.forEach((ex) => {
              visitExpr(ex)
          })
          stat.Rhs.forEach((ex) => {
              visitExpr(ex)
          })
      } else {
          throw "unreachable"
      }
      postVisit(stat)
  }
  
  if (StatType[ast.Type]) {
      visitStat(ast)
  } else {
      visitExpr(ast)
  }
}

function AddVariableInfo(ast) {
  let globalVars = []
  let currentScope

  let locationGenerator = 0
  function markLocation() {
      locationGenerator++
      return locationGenerator
  }

  function pushScope() {
      currentScope = {
          "ParentScope": currentScope,
          "ChildScopeList": [],
          "VariableList": [],
          "BeginLocation": markLocation(),
      }
      if (currentScope.ParentScope) {
          currentScope.Depth = currentScope.ParentScope.Depth + 1
          currentScope.ParentScope.ChildScopeList.push(currentScope)
      } else {
          currentScope.Depth = 1
      }
      let self = currentScope
      currentScope.GetVar = function(varName){
          self.VariableList.forEach((_var) => {
              if (_var.Name == varName) {
                  return _var
              }
          })
          if (self.ParentScope) {
              return self.ParentScope.GetVar(varName)
          } else {
              globalVars.forEach((_var) => {
                  if (_var.Name == varName) {
                      return _var
                  }
              })
          }
      }
  }

  function popScope() {
      let scope = currentScope

      scope.EndLocation = markLocation()

      scope.VariableList.forEach((v) => {
          v.ScopeEndLocation = scope.EndLocation
      })

      currentScope = scope.ParentScope
      return scope
  }
  pushScope()

  function addLocalVar(name, setNameFunc, localInfo) {
      assert(localInfo, "MIssing localInfo")
      assert(name, "Missing local var name")
      let _var = {
          "Type": "Local",
          "Name": name,
          "RenameList": [setNameFunc],
          "AssignedTo": false,
          "Info": localInfo,
          "Scope": currentScope,
          "BeginLocation": markLocation(),
          "EndLocation": markLocation(),
          "ReferenceLocationList": [markLocation()],
      }
      _var.Rename = function(newName) {
          _var.Name = newName
          _var.RenameList.forEach((renameFunc) => {
              renameFunc(newName)
          })
      }

      currentScope.VariableList.push(_var)
      return _var
  }

  function getGlobalVar(name) {
      globalVars.forEach((_var) => {
          if (_var.Name == name) {
              return _var
          }
      })

      let _var = {
          "Type": "Global",
          "Name": name,
          "RenameList": [],
          "AssignedTo": false,
          "Scope": null,
          "BeginLocation": markLocation(),
          "EndLocation": markLocation(),
          "ReferenceLocationList": [],
      }

      _var.Rename = function(newName) {
          _var.Name = newName
          _var.RenameList.forEach((renameFunc) => {
              renameFunc(newName)
          })
      }
      
      globalVars.push(_var)

      return _var
  }


  function addGlobalReference(name, setNameFunc) {
      assert(name, "Missing var name")
      let _var = getGlobalVar(name)
      _var.RenameList.push(setNameFunc)
      return _var
  }

  function getLocalVar(scope, name) {
      let i
      for (i=scope.VariableList.length-1; i>=0; i--) {
          if (scope.VariableList[i].Name == name) {
              return scope.VariableList[i]
          }
      }

      if (scope.ParentScope) {
          let _var = getLocalVar(scope.ParentScope, name)
          if (_var) {
              return _var
          }
      }

      return
  }

  function referenceVariable(name, setNameFunc) {
      assert(name, "Missing var name")
      let _var = getLocalVar(currentScope, name)
      if (_var) {
          _var.RenameList.push(setNameFunc)
      } else {
          _var = addGlobalReference(name, setNameFunc)
      }

      let curLocation = markLocation()
      _var.EndLocation = curLocation
      _var.ReferenceLocationList.push(_var.EndLocation)
      return _var
  }

  let visitor = {}
  visitor.FunctionLiteral = {

      "Pre": function(expr) {
          pushScope()
          expr.ArgList.forEach((ident, index) => {
              let _var = addLocalVar(ident.Source, function(name) {
                  ident.Source = name
              }, {
                  "Type": "Argument",
                  "Index": index,
              })
          })
      },

      "Post": function(expr) {
          popScope()
      },
  }

  visitor.VariableExpr = function(expr) {
      expr.Variable = referenceVariable(expr.Token.Source, function(newName) {
          expr.Token.Source = newName
      })
  }

  visitor.StatList = {
      "Pre": function(stat) {
          pushScope()
      },

      "Post": function(stat) {
          if (!stat.SkipPop) {
              popScope()
          }
      },
  }

  visitor.LocalVarStat = {
      "Post": function(stat) {
  
          stat.VarList.forEach((ident, varNum) => {
              addLocalVar(ident.Source, function(name) {
                  stat.VarList[varNum].Source = name
              }, {
                  "Type": "Local",
              })
          })
      },
  }

  visitor.LocalFunctionStat = {
      "Pre": function(stat) {
          addLocalVar(stat.FunctionStat.NameChain[0].Source, function(name) {
              stat.FunctionStat.NameChain[0].Source = name
          }, {
              "Type": "LocalFunction",
          })

          pushScope()

          stat.FunctionStat.ArgList.forEach((ident, index) => {
              addLocalVar(ident.Source, function(name) {
                  ident.Source = name
              }, {
                  "Type": "Argument",
                  "Index": index,
              })
          })
      },

      "Post": function() {
          popScope()
      }
  }

  visitor.FunctionStat = {
      "Pre": function(stat) {
          let nameChain = stat.NameChain
          let _var
          if (nameChain.length == 1) {
              if (getLocalVar(currentScope, nameChain[0].Source)) {
                  _var = referenceVariable(nameChain[0].Source, function(name) {
                      nameChain[0].Source = name
                  })
              } else {
                  _var = addGlobalReference(nameChain[0].Source, function(name) {
                      nameChain[0].Source = name
                  })
              }
          } else {
              _var = referenceVariable(nameChain[0].Source, function(name) {
                  nameChain[0].Source = name
              })
          }
          _var.AssignedTo = true
          pushScope()
          stat.ArgList.forEach((ident, index) => {
              addLocalVar(ident.Source, function(name) {
                  ident.Source = name
              }, {
                  "Type": "Argument",
                  "Index": index,
              })
          })
      },

      "Post": function() {
          popScope()
      }
  }

  visitor.GenericForStat = {
      "Pre": function(stat) {

          stat.GeneratorList.forEach((ex) => {
              VisitAst(ex, visitor)
          })

          pushScope()
          stat.VarList.forEach((ident, index) => {
              addLocalVar(ident.Source, function(name) {
                  ident.Source = name
              }, {
                  "Type": "ForRange",
                  "Index": index,
              })
          })
          VisitAst(stat.Body, visitor)
          popScope()
          return true
      }
  }

  visitor.NumericForStat = {
      "Pre": function(stat) {
          stat.RangeList.forEach((ex) => {
              VisitAst(ex, visitor)
          })

          pushScope()
          stat.VarList.forEach((ident, index) => {
              addLocalVar(ident.Source, function(name) {
                  ident.Source = name
              }, {
                  "Type": "ForRange",
                  "Index": index,
              })
          })
          VisitAst(stat.Body, visitor)
          popScope()
          return true
      }
  }

  visitor.RepeatStat = {
      "Pre": function(stat) {
          stat.Body.SkipPop = true
      },
      "Post": function(stat) {
          popScope()
      }
  }
  visitor.AssignmentStat = {
      "Post": function(stat) {
          stat.Lhs.forEach((ex) => {
              if (ex.Variable != null) {
                  ex.Variable.AssignedTo = true
              }
          })
      }
  }
  VisitAst(ast, visitor)
  return [globalVars, popScope()]
}

function PrintAst(ast) {
  let printStat
  let printExpr
  let buffer = ''
  function printt(tk) {
      if (tk.LeadingWhite === null || tk.Source === null) {
          throw `Bad token: tk=${tk} | lwhite=${tk.LeadingWhite} | source=${tk.Source}`
      }
      buffer = `${buffer}${tk.LeadingWhite}${tk.Source}`
  }
  printExpr = function(expr) {
      if (expr.Type == "BinopExpr") {
          printExpr(expr.Lhs)
          printt(expr.Token_Op)
          printExpr(expr.Rhs)
      } else if(expr.Type == "UnopExpr") {
          printt(expr.Token_Op)
          printExpr(expr.Rhs)
      } else if(
              expr.Type == "NumberLiteral" || expr.Type == "StringLiteral"
              || expr.Type == "NilLiteral" || expr.Type == "BooleanLiteral"
              || expr.Type == "VargLiteral") 
      {
          printt(expr.Token)
      } else if(expr.Type == "FieldExpr") {
          printExpr(expr.Base)
          printt(expr.Token_Dot)
          printt(expr.Field)
      } else if(expr.Type == "IndexExpr") {
          printExpr(expr.Base)
          printt(expr.Token_OpenBracket)
          printExpr(expr.Index)
          printt(expr.Token_CloseBracket)
      } else if(expr.Type == "MethodExpr" || expr.Type == "CallExpr") {
          printExpr(expr.Base)
          if (expr.Type == "MethodExpr") {
              printt(expr.Token_Colon)
              printt(expr.Method)
          }
          if (expr.FunctionArguments.CallType == "StringCall") {
              printt(expr.FunctionArguments.Token)
          } else if(expr.FunctionArguments.CallType == "ArgCall") {
              printt(expr.FunctionArguments.Token_OpenParen)
              expr.FunctionArguments.ArgList.forEach((argExpr, index) => {
                  printExpr(argExpr)
                  let sep = expr.FunctionArguments.Token_CommaList[index]
                   if (sep != null) {
                      printt(sep)
                  }
              })
              printt(expr.FunctionArguments.Token_CloseParen)
          } else if(expr.FunctionArguments.CallType == "TableCall") {
              printExpr(expr.FunctionArguments.TableExpr)
          }
      } else if(expr.Type == "FunctionLiteral") {
          printt(expr.Token_Function)
          printt(expr.Token_OpenParen)
          expr.ArgList.forEach((arg, index) => {
              printt(arg)
              let comma = expr.Token_ArgCommaList[index]
              if (comma != null) {
                  printt(comma)
              }
          })
          if (expr.Token_Varg != null) {
              printt(expr.Token_Varg)
          }
          printt(expr.Token_CloseParen)
          printStat(expr.Body)
          printt(expr.Token_End)
      } else if(expr.Type == "VariableExpr") {
          printt(expr.Token)
      } else if(expr.Type == "ParenExpr") {
          printt(expr.Token_OpenParen)
          printExpr(expr.Expression)
          printt(expr.Token_CloseParen)
      } else if(expr.Type == "TableLiteral") {
          printt(expr.Token_OpenBrace)
          expr.EntryList.forEach((entry, index) => {
              if (entry.EntryType == "Field") {
                  printt(entry.Field)
                  printt(entry.Token_Equals)
                  printExpr(entry.Value)
              } else if(entry.EntryType == "Index") {
                  printt(entry.Token_OpenBracket)
                  printExpr(entry.Index)
                  printt(entry.Token_CloseBracket)
                  printt(entry.Token_Equals)
                  printExpr(entry.Value)
              } else if(entry.EntryType == "Value") {
                  printExpr(entry.Value)
              } else {
                  throw "unreachable"
              }
              let sep = expr.Token_SeperatorList[index]
               if (sep != null) {
                  printt(sep)
              }
          })
          printt(expr.Token_CloseBrace)
      } else {
          throw `unreachable, type: ${expr.Type}: ${expr}`
      }
  }
  printStat = function(stat) {
      if (stat == null) {
          throw `STAT IS NIL! ${stat}`
      }

      if (stat.Type == "StatList") {
          stat.StatementList.forEach((ch, index) => {
              if (ch === null || ch.Type === null) {
                  return
              }

              ch.Remove = () => {
                  stat.StatementList[index] = null
              }

              printStat(ch)
              if (stat.SemicolonList[index]) {
                  printt(stat.SemicolonList[index])
              }
          })

      } else if(stat.Type == "BreakStat") {
          printt(stat.Token_Break)
      } else if(stat.Type == "ReturnStat") {
          printt(stat.Token_Return)
          stat.ExprList.forEach((expr, index) => {
              printExpr(expr)
              if (stat.Token_CommaList[index]) {
                  printt(stat.Token_CommaList[index])
              }
          })
      } else if(stat.Type == "LocalVarStat") {
          printt(stat.Token_Local)
          stat.VarList.forEach((_var, index) => {
              printt(_var)
              let comma = stat.Token_VarCommaList[index]
              if (comma != null) {
                  printt(comma)
              }
          })
          if (stat.Token_Equals != null) {
              printt(stat.Token_Equals)
              stat.ExprList.forEach((expr, index) => {
                  printExpr(expr)
                  let comma = stat.Token_ExprCommaList[index]
                   if (comma != null) {
                      printt(comma)
                  }
              })
          }
      } else if(stat.Type == "LocalFunctionStat") {
          printt(stat.Token_Local)
          printt(stat.FunctionStat.Token_Function)
          printt(stat.FunctionStat.NameChain[0])
          printt(stat.FunctionStat.Token_OpenParen)
          stat.FunctionStat.ArgList.forEach((arg, index) => {
              printt(arg)
              let comma = stat.FunctionStat.Token_ArgCommaList[index]
               if (comma != null) {
                  printt(comma)
              }
          })
          if (stat.FunctionStat.Token_Varg) {
              printt(stat.FunctionStat.Token_Varg)
          }
          printt(stat.FunctionStat.Token_CloseParen)
          printStat(stat.FunctionStat.Body)
          printt(stat.FunctionStat.Token_End)
      } else if(stat.Type == "FunctionStat") {
          printt(stat.Token_Function)
          stat.NameChain.forEach((part, index) => {
              printt(part)
              let sep = stat.Token_NameChainSeperator[index]
               if (sep != null) {
                  printt(sep)
              }
          })
          printt(stat.Token_OpenParen)
          stat.ArgList.forEach((arg, index) => {
              printt(arg)
              let comma = stat.Token_ArgCommaList[index]
               if (comma != null) {
                  printt(comma)
              }
          })
          if (stat.Token_Varg) {
              printt(stat.Token_Varg)
          }
          printt(stat.Token_CloseParen)
          printStat(stat.Body)
          printt(stat.Token_End)
      } else if(stat.Type == "RepeatStat") {
          printt(stat.Token_Repeat)
          printStat(stat.Body)
          printt(stat.Token_Until)
          printExpr(stat.Condition)
      } else if(stat.Type == "GenericForStat") {
          printt(stat.Token_For)
          stat.VarList.forEach((_var, index) => {
              printt(_var)
              let sep = stat.Token_VarCommaList[index]
               if (sep != null) {
                  printt(sep)
              }
          })
          printt(stat.Token_In)
          stat.GeneratorList.forEach((expr, index) => {
              printExpr(expr)
              let sep = stat.Token_GeneratorCommaList[index]
               if (sep != null) {
                  printt(sep)
              }
          })
          printt(stat.Token_Do)
          printStat(stat.Body)
          printt(stat.Token_End)
      } else if(stat.Type == "NumericForStat") {
          printt(stat.Token_For)
          stat.VarList.forEach((_var, index) => {
              printt(_var)
              let sep = stat.Token_VarCommaList[index]
               if (sep != null) {
                  printt(sep);
              }
          })
          printt(stat.Token_Equals)
          stat.RangeList.forEach((expr, index) => {
              printExpr(expr)
              let sep = stat.Token_RangeCommaList[index]
               if (sep != null) {
                  printt(sep)
              }
          })
          printt(stat.Token_Do)
          printStat(stat.Body)
          printt(stat.Token_End)
      } else if(stat.Type == "WhileStat") {
          printt(stat.Token_While)
          printExpr(stat.Condition)
          printt(stat.Token_Do)
          printStat(stat.Body)
          printt(stat.Token_End)
      } else if(stat.Type == "DoStat") {
          printt(stat.Token_Do)
          printStat(stat.Body)
          //stat.Token_End.LeadingWhite = " "
          printt(stat.Token_End)
      } else if(stat.Type == "IfStat") {
          printt(stat.Token_If)
          printExpr(stat.Condition)
          printt(stat.Token_Then)
          printStat(stat.Body)
          stat.ElseClauseList.forEach((clause) => {
              printt(clause.Token)
              if (clause.Condition != null) {
                  printExpr(clause.Condition)
                  printt(clause.Token_Then)
              }
              printStat(clause.Body)
          })
          printt(stat.Token_End)
      } else if(stat.Type == "CallExprStat") {
          printExpr(stat.Expression)
      } else if(stat.Type == "AssignmentStat") {
          stat.Lhs.forEach((ex, index) => {
              printExpr(ex)
              let sep = stat.Token_LhsSeperatorList[index]
              if (sep != null) {
                  printt(sep)
              }
          })
          printt(stat.Token_Equals)
          stat.Rhs.forEach((ex, index) => {
              printExpr(ex)
              let sep = stat.Token_RhsSeperatorList[index]
              if (sep != null) {
                  printt(sep);
              }
          })
      } else {
          assert(false, "unreachable")
      }
  }
  printStat(ast)
  
  return buffer
}

function FormatAst(ast) {
  let formatStat
  let formatExpr
  let currentIndent = 0
  function applyIndent(token) {
      let indentString = `\n${"\t".repeat(currentIndent)}`
      if (token.LeadingWhite == '' || (token.LeadingWhite.substr(-indentString.length, indentString.length) != indentString)) {
          //token.LeadingWhite = token.LeadingWhite.replace("\n?[\t ]*$") /Remove all \n & \t at end of string
          // idk string patterns in js :(

          let newstr = ""
          let i
          let last
          for (i=token.LeadingWhite.length; i>=0; i--) {
              let cur = token.LeadingWhite.substr(i, 1)
              if (cur == "" || cur.match(/\s/g)) {
              } else {
                  newstr = token.LeadingWhite.substr(0,i+1)
                  break
              }
          }

          token.LeadingWhite = `${newstr}${indentString}`
      }
  }

  applyIndent({"LeadingWhite": "\nlol\t\n\t\t", "Source":"ok"})

  function indent() {
      currentIndent++
  }
  function undent() {
      currentIndent--
      assert(currentIndent >= 0, "Undented too far")
  }

  function leadingChar(tk) {
      if (tk.LeadingWhite.length > 0) {
          return tk.LeadingWhite.substr(0,1)
      } else {
          return tk.Source.substr(0,1)
      }
  }

  function padToken(tk) {
      if (!WhiteChars.includes(leadingChar(tk))) {
          tk.LeadingWhite = ' ' + tk.LeadingWhite
      }
  }

  function padExpr(expr) {
      padToken(expr.GetFirstToken())
  }

  function formatBody(openToken, bodyStat, closeToken) {
      indent()
      formatStat(bodyStat)
      undent()
      applyIndent(closeToken)
  }

  formatExpr = function(expr) {
      if (expr.Type == "BinopExpr") {
          formatExpr(expr.Lhs)
          formatExpr(expr.Rhs)
          //if (expr.Token_Op.Source == "..") { // ayeaye
          //    expr.Token_Op.LeadingWhite = " "
           //   expr.Rhs.GetFirstToken.LeadingWhite = " "
          //} else {
              padExpr(expr.Rhs)
              padToken(expr.Token_Op)
          //}
      } else if(expr.Type == "UnopExpr") {
          formatExpr(expr.Rhs)
      } else if(expr.Type == "NumberLiteral" || expr.Type == "StringLiteral"
              || expr.Type == "NilLiteral" || expr.Type == "BooleanLiteral"
              || expr.Type == "VargLiteral")
      {
          // no
      } else if(expr.Type == "FieldExpr") {
          formatExpr(expr.Base)
      } else if(expr.Type == "IndexExpr") {
          formatExpr(expr.Base)
          formatExpr(expr.Index)
      } else if(expr.Type == "MethodExpr" || expr.Type == "CallExpr") {
          formatExpr(expr.Base)
          if (expr.Type == "MethodExpr") {

          }
          if (expr.FunctionArguments.CallType == "StringCall") {

          } else if(expr.FunctionArguments.CallType == "ArgCall") {
              expr.FunctionArguments.ArgList.forEach((argExpr, index) => {
                  formatExpr(argExpr)
                  if (index > 0) {
                      padExpr(argExpr)
                  }
                  let sep = expr.FunctionArguments.Token_CommaList[index]
                   if (sep != null) {

                  }
              })

          } else if(expr.FunctionArguments.CallType == "TableCall") {
              formatExpr(expr.FunctionArguments.TableExpr)
          }
      } else if(expr.Type == "FunctionLiteral") {
          expr.ArgList.forEach((arg, index) => {
              if (index > 0) {
                  padToken(arg)
              }
              let comma = expr.Token_ArgCommaList[index]
              if (comma != null) {

              }
          })

          if (expr.ArgList.length > 0 && expr.Token_Varg != null) {
              padToken(expr.Token_Varg)
          }
          formatBody(expr.Token_CloseParen, expr.Body, expr.Token_End)
      } else if(expr.Type == "VariableExpr") {
          // no
      } else if(expr.Type == "ParenExpr") {
          formatExpr(expr.Expression)
      } else if(expr.Type == "TableLiteral") {
          if (expr.EntryList.length == 0) {

          } else {
              indent()

              let die = 15
              expr.EntryList.forEach((entry, index) => {
                  if (entry.EntryType == "Field") {
                      if (expr.EntryList.length > die) {
                          StripAst(entry.Value)
                      } else {
                          applyIndent(entry.Field)
                      }

                      padToken(entry.Token_Equals)
                      formatExpr(entry.Value)
                      padExpr(entry.Value)
                  } else if(entry.EntryType == "Index") {
                      if (expr.EntryList.length > die)
                          entry.Token_OpenBracket.LeadingWhite = ''
                      else
                          applyIndent(entry.Token_OpenBracket);

                      formatExpr(entry.Index)

                      padToken(entry.Token_Equals)
                      formatExpr(entry.Value)
                      padExpr(entry.Value)
                  } else if(entry.EntryType == "Value") {
                      formatExpr(entry.Value)

                      if (expr.EntryList.length > die) {
                          StripAst(entry.Value)
                      } else {
                          applyIndent(entry.Value.GetFirstToken())
                      }
                  } else {
                      assert(false, "unreachable")
                  }
                  let sep = expr.Token_SeperatorList[index]
                  if (sep != null) {
                      if (expr.EntryList.length > die)
                          sep.LeadingWhite = '';
                  }
              })
              undent()
              if (expr.EntryList.length > die) {
                  expr.Token_CloseBrace.LeadingWhite = ''
              } else {
                  applyIndent(expr.Token_CloseBrace)
              }
          }
      } else {
          print(expr)
          throw(`unreachable, type: ${expr.Type}:`+ expr)
      }
  }

  formatStat = function(stat) {
      if (stat.Type == "StatList") {
          stat.StatementList.forEach((stat, index) => {
              if (stat === null || stat.Type === null) {
                  return
              }

              stat.Remove = () => {
                  stat.StatementList[index] = null
              }

              formatStat(stat)
              applyIndent(stat.GetFirstToken())
          })
      } else if(stat.Type == "BreakStat") {
          // no
      } else if(stat.Type == "ReturnStat") {
          
          stat.ExprList.forEach((expr, index) => {
              formatExpr(expr)
              padExpr(expr)
              if (stat.Token_CommaList[index]) {

              }
          })
      } else if(stat.Type == "LocalVarStat") {
          stat.VarList.forEach((_var, index) => {
              padToken(_var)
              let comma = stat.Token_VarCommaList[index]
              if (comma != null) {

              }
          })
          if (stat.Token_Equals) {
              padToken(stat.Token_Equals)

              let newlist = []
              let newcommalist = []
              stat.ExprList.forEach((expr,index) => {
                  if (expr != null) {
                      if (index < stat.VarList.length) {
                          newlist.push(expr)
                          newcommalist.push(stat.Token_ExprCommaList[index])
                      } else if (expr.Type == "CallExpr" || expr.Type == "ParenExpr" || expr.Type == "VargLiteral" || expr.Type == "BinopExpr" || expr.Type == "UnopExpr") {
                          newlist.push(expr)
                          newcommalist.push(stat.Token_ExprCommaList[index])
                      }
                  }
              })

              stat.ExprList = newlist
              stat.CommaList = newcommalist

              stat.ExprList.forEach((expr,index) => {
                  if (expr != null) {
                      formatExpr(expr)
                      padExpr(expr)
                      let comma = stat.Token_ExprCommaList[index]
                      if (comma != null && stat.ExprList.length-1 == index) {
                          stat.Token_ExprCommaList[index] = null
                      }
                  }
              })
          }
      } else if(stat.Type == "LocalFunctionStat") {
          padToken(stat.FunctionStat.Token_Function)
          padToken(stat.FunctionStat.NameChain[0])

          stat.FunctionStat.ArgList.forEach((arg, index) => {
              if (index > 0) {
                  padToken(arg)
              }
              let comma = stat.FunctionStat.Token_ArgCommaList[index]
          })

          if (stat.FunctionStat.ArgList.length > 0 && stat.FunctionStat.Token_Varg) {
              padToken(stat.FunctionStat.Token_Varg)
          }

          formatBody(stat.FunctionStat.Token_CloseParen, stat.FunctionStat.Body, stat.FunctionStat.Token_End)
      } else if(stat.Type == "FunctionStat") {
          stat.NameChain.forEach((part, index) => {
              if (index == 0) {
                  padToken(part)
              }
              let sep = stat.Token_NameChainSeperator[index]
              if (sep != null) {

              }
          })

          stat.ArgList.forEach((arg, index) => {
              if (index > 0) {
                  padToken(arg)
              }
              let comma = stat.Token_ArgCommaList[index]
              if (comma != null) {

              }
          })

          if (stat.ArgList.length > 0 && stat.Token_Varg) {
              padToken(stat.Token_Varg)
          }

          formatBody(stat.Token_CloseParen, stat.Body, stat.Token_End)
      } else if(stat.Type == "RepeatStat") {
          formatBody(stat.Token_Repeat, stat.Body, stat.Token_Until)
          formatExpr(stat.Condition)
          padExpr(stat.Condition)
      } else if(stat.Type == "GenericForStat") {
          stat.VarList.forEach((_var, index) => {
              padToken(_var)
              let sep = stat.Token_VarCommaList[index]
               if (sep != null) {

              }
          })
          padToken(stat.Token_In)
          stat.GeneratorList.forEach((expr, index) => {
              formatExpr(expr)
              padExpr(expr)
              let sep = stat.Token_GeneratorCommaList[index]
               if (sep != null) {

              }
          })
          padToken(stat.Token_Do)
          formatBody(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "NumericForStat") {
          stat.VarList.forEach((_var, index) => {
              padToken(_var)
              let sep = stat.Token_VarCommaList[index]
               if (sep != null) {

              }
          })
          padToken(stat.Token_Equals)
          stat.RangeList.forEach((expr, index) => {
              formatExpr(expr)
              padExpr(expr)
              let sep = stat.Token_RangeCommaList[index]
               if (sep != null) {

              }
          })
          padToken(stat.Token_Do)
          formatBody(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "WhileStat") {
          formatExpr(stat.Condition)
          padExpr(stat.Condition)
          padToken(stat.Token_Do)
          formatBody(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "DoStat") {
          formatBody(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "IfStat") {
          formatExpr(stat.Condition)
          padExpr(stat.Condition)
          padToken(stat.Token_Then)

          let lastBodyOpen = stat.Token_Then
          let lastBody = stat.Body

          stat.ElseClauseList.forEach((clause) => {
              formatBody(lastBodyOpen, lastBody, clause.Token)
              lastBodyOpen = clause.Token

              if (clause.Condition != null) {
                  formatExpr(clause.Condition)
                  padExpr(clause.Condition)
                  padToken(clause.Token_Then)
                  lastBodyOpen = clause.Token_Then
              }
              lastBody = clause.Body
          })

          formatBody(lastBodyOpen, lastBody, stat.Token_End)
      } else if(stat.Type == "CallExprStat") {
          formatExpr(stat.Expression)
      } else if(stat.Type == "AssignmentStat") {
          stat.Lhs.forEach((ex, index) => {
              formatExpr(ex)
              if (index > 0) {
                  padExpr(ex)
              }
              let sep = stat.Token_LhsSeperatorList[index]
               if (sep != null) {

              }
          })
          padToken(stat.Token_Equals)
          stat.Rhs.forEach((ex, index) => {
              formatExpr(ex)
              padExpr(ex)
              let sep = stat.Token_RhsSeperatorList[index]
               if (sep != null) {

              }
          })
      } else {
          assert(false, "Unreachable")
      }
  }

  formatStat(ast)
}

function StripAst(ast) {
  let stripStat
  let stripExpr
  function stript(token) {
      if (token != null)
          token.LeadingWhite = '';
  }

  function joint(tokenA, tokenB) {

      stript(tokenB)
      
      let lastCh = tokenA.Source.substr(-0,1)
      let firstCh = tokenB.Source.substr(0,1)

      if ((lastCh == "-" && firstCh == "-") || (AllIdentChars.includes(lastCh) && AllIdentChars.includes(firstCh))) {
          tokenB.LeadingWhite = ' '
      } else {
          tokenB.LeadingWhite = ""
      }
  }

  function bodyjoint(open, body, close) {
      stripStat(body)
      stript(close)
      let bodyFirst = body.GetFirstToken()
      let bodyLast = body.GetLastToken()

      if (bodyFirst != null) {
          joint(open, bodyFirst)
          joint(bodyLast, close)
      } else {
          joint(open, close)
      }
  }

  stripExpr = function(expr) {
      if (expr.Type == "BinopExpr") {
          stripExpr(expr.Lhs)
          stript(expr.Token_Op)
          stripExpr(expr.Rhs)

          joint(expr.Token_Op, expr.Rhs.GetFirstToken())
          joint(expr.Lhs.GetLastToken(), expr.Token_Op)
      } else if(expr.Type == "UnopExpr") {
          stript(expr.Token_Op)
          stripExpr(expr.Rhs)

          joint(expr.Token_Op, expr.Rhs.GetFirstToken())
      } else if(expr.Type == "NumberLiteral" || expr.Type == "StringLiteral"
              || expr.Type == "NilLiteral" || expr.Type == "BooleanLiteral"
              || expr.Type == "VargLiteral")
      {
          stript(expr.Token)
      } else if(expr.Type == "FieldExpr") {
          stripExpr(expr.Base)
          stript(expr.Token_Dot)
          stript(expr.Field)
      } else if(expr.Type == "IndexExpr") {
          stripExpr(expr.Base)
          stript(expr.Token_OpenBracket)
          stripExpr(expr.Index)
          stript(expr.Token_CloseBracket)
      } else if(expr.Type == "MethodExpr" || expr.Type == "CallExpr") {
          stripExpr(expr.Base)
          if (expr.Type == "MethodExpr") {
              stript(expr.Token_Colon)
              stript(expr.Method)
          }
          if (expr.FunctionArguments.CallType == "StringCall") {
              stript(expr.FunctionArguments.Token)
          } else if(expr.FunctionArguments.CallType == "ArgCall") {
              stript(expr.FunctionArguments.Token_OpenParen)
              expr.FunctionArguments.ArgList.forEach((argExpr, index) => {
                  stripExpr(argExpr)
                  let sep = expr.FunctionArguments.Token_CommaList[index]
                  if (sep != null) {
                      stript(sep)
                  }
              })
              stript(expr.FunctionArguments.Token_CloseParen)
          } else if(expr.FunctionArguments.CallType == "TableCall") {
              stripExpr(expr.FunctionArguments.TableExpr)
          }
      } else if(expr.Type == "FunctionLiteral") {
          stript(expr.Token_Function)
          stript(expr.Token_OpenParen)
          expr.ArgList.forEach((arg, index) => {
              stript(arg)
              let comma = expr.Token_ArgCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })
          if (expr.Token_Varg != null) {
              stript(expr.Token_Varg)
          }
          stript(expr.Token_CloseParen)
          bodyjoint(expr.Token_CloseParen, expr.Body, expr.Token_End)
      } else if(expr.Type == "VariableExpr") {
          stript(expr.Token)
      } else if(expr.Type == "ParenExpr") {
          stript(expr.Token_OpenParen)
          stripExpr(expr.Expression)
          stript(expr.Token_CloseParen)
      } else if(expr.Type == "TableLiteral") {
          stript(expr.Token_OpenBrace)
          expr.EntryList.forEach((entry, index) => {
              if (entry.EntryType == "Field") {
                  stript(entry.Field)
                  stript(entry.Token_Equals)
                  stripExpr(entry.Value)
              } else if(entry.EntryType == "Index") {
                  stript(entry.Token_OpenBracket)
                  stripExpr(entry.Index)
                  stript(entry.Token_CloseBracket)
                  stript(entry.Token_Equals)
                  stripExpr(entry.Value)
              } else if(entry.EntryType == "Value") {
                  stripExpr(entry.Value)
              } else {
                  assert(false, "unreachable")
              }
              let sep = expr.Token_SeperatorList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          
          expr.Token_SeperatorList[expr.EntryList.length-1] = null
          stript(expr.Token_CloseBrace)
      } else {
          throw(`unreachable, type: ${expr.Type}:${expr}  ${console.trace()}`)
      }
  }
  
  stripStat = function(stat) {
      if (stat.Type == "StatList") {
          let i
          for (i=0; i<=stat.StatementList.length;i++) {
              let chStat = stat.StatementList[i]
              if (chStat == null) continue;
              
              stripStat(chStat)
              stript(chStat.GetFirstToken())

              let lastChStat = stat.StatementList[i-1]
              if (lastChStat != null) {

                  if (stat.SemicolonList[i-1]
                      && lastChStat.GetLastToken().Source != ")" || chStat.GetFirstToken().Source != ")") 
                  {
                      stat.SemicolonList[i-1] = null
                  }

                  if (!stat.SemicolonList[i-1]) {
                      joint(lastChStat.GetLastToken(), chStat.GetFirstToken())
                  }
              }
          }

          stat.SemicolonList[stat.StatementList.length-1] = null
          if (stat.StatementList.length > 0) {
              stript(stat.StatementList[0].GetFirstToken())
          }
      } else if(stat.Type == "BreakStat") {
          stript(stat.Token_Break)
      } else if(stat.Type == "ReturnStat") {
          stript(stat.Token_Return)
          stat.ExprList.forEach((expr, index) => {
              stripExpr(expr)
              if (stat.Token_CommaList[index] != null) {
                  stript(stat.Token_CommaList[index])
              }
          })
          if (stat.ExprList.length > 0) {
              joint(stat.Token_Return, stat.ExprList[0].GetFirstToken())
          }
      } else if(stat.Type == "LocalVarStat") {
          stript(stat.Token_Local)
          stat.VarList.forEach((_var, index) => {
              if (index == 0) {
                  joint(stat.Token_Local, _var)
              } else {
                  stript(_var)
              }
              let comma = stat.Token_VarCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })
          if (stat.Token_Equals != null) {
              stript(stat.Token_Equals)
              stat.ExprList.forEach((expr, index) => {
                  stripExpr(expr)
                  let comma = stat.Token_ExprCommaList[index]
                  if (comma != null) {
                      stript(comma)
                  }
              })
          }
      } else if(stat.Type == "LocalFunctionStat") {
          stript(stat.Token_Local)
          joint(stat.Token_Local, stat.FunctionStat.Token_Function)
          joint(stat.FunctionStat.Token_Function, stat.FunctionStat.NameChain[0])
          joint(stat.FunctionStat.NameChain[0], stat.FunctionStat.Token_OpenParen)

          stat.FunctionStat.ArgList.forEach((arg, index) => {
              stript(arg)
              let comma = stat.FunctionStat.Token_ArgCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })
          if (stat.FunctionStat.Token_Varg) {
              stript(stat.FunctionStat.Token_Varg)
          }
          stript(stat.FunctionStat.Token_CloseParen)
          bodyjoint(stat.FunctionStat.Token_CloseParen, stat.FunctionStat.Body, stat.FunctionStat.Token_End)
      } else if(stat.Type == "FunctionStat") {
          stript(stat.Token_Function)
          stat.NameChain.forEach((part, index) => {
              if (index == 0) {
                  joint(stat.Token_Function, part)
              } else {
                  stript(part)
              }
              let sep = stat.Token_NameChainSeperator[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          stript(stat.Token_OpenParen)
          stat.ArgList.forEach((arg, index) => {
              stript(arg)
              let comma = stat.Token_ArgCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })

          if (stat.Token_Varg) {
              stript(stat.Token_Varg)
          }
          stript(stat.Token_CloseParen)
          bodyjoint(stat.Token_CloseParen, stat.Body, stat.Token_End)
      } else if(stat.Type == "RepeatStat") {
          stript(stat.Token_Repeat)
          bodyjoint(stat.Token_Repeat, stat.Body, stat.Token_Until)
          stripExpr(stat.Condition)
          joint(stat.Token_Until, stat.Condition.GetFirstToken())
      } else if(stat.Type == "GenericForStat") {
          stript(stat.Token_For)
          stat.VarList.forEach((_var, index) => {
              if (index == 0) {
                  joint(stat.Token_For, _var)
              } else {
                  stript(_var)
              }
              let sep = stat.Token_VarCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.VarList[stat.VarList.length-1], stat.Token_In)
          stat.GeneratorList.forEach((expr, index) => {
              stripExpr(expr)
              if (index == 0) {
                  joint(stat.Token_In, expr.GetFirstToken())
              }
              let sep = stat.Token_GeneratorCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.GeneratorList[stat.GeneratorList.length-1].GetLastToken(), stat.Token_Do)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "NumericForStat") {
          stript(stat.Token_For)
          stat.VarList.forEach((_var, index) => {
              if (index == 0) {
                  joint(stat.Token_For, _var)
              } else {
                  stript(_var)
              }
              let sep = stat.Token_VarCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.VarList[stat.VarList.length-1], stat.Token_Equals)
          stat.RangeList.forEach((expr, index) => {
              stripExpr(expr)
              if (index == 0) {
                  joint(stat.Token_Equals, expr.GetFirstToken())
              }
              let sep = stat.Token_RangeCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.RangeList[stat.RangeList.length-1].GetLastToken(), stat.Token_Do)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "WhileStat") {
          stript(stat.Token_While)
          stripExpr(stat.Condition)
          stript(stat.Token_Do)
          joint(stat.Token_While, stat.Condition.GetFirstToken())
          joint(stat.Condition.GetLastToken(), stat.Token_Do)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "DoStat") {
          stript(stat.Token_Do)
          stript(stat.Token_End)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "IfStat") {
          stript(stat.Token_If)
          stripExpr(stat.Condition)
          joint(stat.Token_If, stat.Condition.GetFirstToken())
          joint(stat.Condition.GetLastToken(), stat.Token_Then)

          let lastBodyOpen = stat.Token_Then
          let lastBody = stat.Body

          stat.ElseClauseList.forEach((clause, i) => {
              bodyjoint(lastBodyOpen, lastBody, clause.Token)
              lastBodyOpen = clause.Token

              if (clause.Condition != null) {
                  stripExpr(clause.Condition)
                  joint(clause.Token, clause.Condition.GetFirstToken())
                  joint(clause.Condition.GetLastToken(), clause.Token_Then)
                  lastBodyOpen = clause.Token_Then
              }

              stripStat(clause.Body)
              lastBody = clause.Body            
          })

          bodyjoint(lastBodyOpen, lastBody, stat.Token_End)
      } else if(stat.Type == "CallExprStat") {
          stripExpr(stat.Expression)
      } else if(stat.Type == "AssignmentStat") {
          stat.Lhs.forEach((ex, index) => {
              stripExpr(ex)
              let sep = stat.Token_LhsSeperatorList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          stript(stat.Token_Equals)
          stat.Rhs.forEach((ex, index) => {
              stripExpr(ex)
              let sep = stat.Token_RhsSeperatorList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
      } else {
          return stripExpr(stat)
          //print(`unreachable, type: ${stat.Type}`,stat)
          //throw(`unreachable, type: ${stat.Type}:${stat}`)
      }
  }

  stripStat(ast)
}


function SolveMath(ast) { // This is some ugly code sorry for whoever is seeing this
  let solveStat
  let solveExpr

  let canSolve = {
      "NumberLiteral": true,
      "BooleanLiteral": true,
      "StringLiteral": true,
      "NilLiteral": true,
      "TableLiteral": true,
      "ParenExpr": true,
      "BinopExpr": true,
  }

  function createtype(type, val, type2=null) {
      let a
      a = {
          "Type": type,
          "Token": {
              "Type": type2 == null ? "Number" : type2,
              "LeadingWhite": "",
              "Source": "" + val,
          },
          "GetFirstToken": () => a.Token,
          "GetLastToken": () => a.Token,
      }
      return a
  }

  function createtype2(type, val) {
      let a
      a = {
          "Type": type,
          "LeadingWhite": "",
          "Source": "" + val,
      }
      return a
  }

  function createbinop(operator, lhs, rhs) {
      let a
      a = {
          "Type": "BinopExpr",
          "Token_Op": {"Type":"Symbol", "LeadingWhite":"", "Source": operator},
          "Lhs": lhs,
          "Rhs": rhs,
          "GetFirstToken": () => a.Lhs.GetFirstToken(),
          "GetLastToken": () => a.Rhs.GetLastToken(),
      }
      return a
  }

  function createunop(operator, rhs) {
      let a
      a = {
          "Type": "UnopExpr",
          "Token_Op": {"Type":"Symbol", "LeadingWhite":"", "Source": operator},
          "Rhs": rhs,
          "GetFirstToken": () => a.Token_Op,
          "GetLastToken": () => a.Rhs.GetLastToken(),
      }
      return a
  }

  function replace(a,b) {
      /*for (var [i,v] of Object.entries(a)) {
          a[i] = null
      }*/

      if (b == null) return;
      for (var [i,v] of Object.entries(b)) {
          a[i] = v
      }
  }

  function removething(a) {
      if (a == null || a.substr == null) return;

      let start = a.substr(0,1)
      let ret
      if (start == `"` || start == `'`) ret = a.substr(1,a.length-2);
      if (start == `[`) ret =  a.substr(2,a.length-4);
      if (ret == null) return '';

      let newret = ''
      let i
      for (i=0;i<=ret.length;i++) {
          let c = ret.substr(i,1)

          if (c == `'` || c == `"`) {
              newret += `\\${c}`
          } else {
              newret += c
          }
      }
      return newret
  }

  function removeParen(a) {
      if (typeof a == "object" && a.Type == "ParenExpr")
          return replace(a, a.Expression)
  }

  function solvebinop(operator, left1, right1) {
      let lhs = left1
      let rhs = right1
      if (left1 && left1.Type == "ParenExpr") lhs = left1.Expression;
      if (right1 && right1.Type == "ParenExpr") rhs = right1.Expression;

      if (lhs == null || rhs == null || lhs.Type == null || rhs.Type == null) return;

      if (lhs.Type == "VariableExpr" || lhs.Type == "CallExpr" || lhs.Type == "BinopExpr" || rhs.Type == "CallExpr" || rhs.Type == "BinopExpr" || rhs.Type == "VariableExpr") {
          // some shit later
          // if lhs == true, rhs()
          // if lhs == false, no rhs :(

          return
      }
      //if (lhs.Type == "BinopExpr" || lhs.Type == "")

      let a = (lhs.Token) || (lhs.Expression != null && lhs.Expression.Token) || null
      let b = (rhs.Token) || (rhs.Expression != null && rhs.Expression.Token) || null

      //if (a == null || b == null) return;
      //if (a.Source == null || b.Source == null) return;

      let lSrc = a != null ? a.Source : null
      let rSrc = b != null ? b.Source : null

      let left
      let right
      if (lhs.Type == "BooleanLiteral") left = lSrc == "true" ? true : false;
      if (rhs.Type == "BooleanLiteral") right = rSrc == "true" ? true : false;

      if (lhs.Type == "NumberLiteral") {
          left = parseFloat(lSrc)
          if (left == null) return;
      }
      if (rhs.Type == "NumberLiteral") {
          right = parseFloat(rSrc)
          if (right == null) return;
      }

      if (lhs.Type == "StringLiteral") left = lSrc.toString();
      if (rhs.Type == "StringLiteral") right = rSrc.toString();


      //  && lhs.Type == "NumberLiteral" && rhs.Type == "NumberLiteral"
      if (left != null && right != null) {
          if (operator == "==") return left == right;
          if (operator == "~=") return left != right;
          if (operator == "and") return left && right;
          if (operator == "or") return left || right;
          if (operator == ".." && lhs.Type == "StringLiteral" && rhs.Type == "StringLiteral") 
              return `"${removething(lSrc) + removething(rSrc)}"`;

          if (lhs.Type == "StringLiteral") left = parseFloat(removething(left));
          if (rhs.Type == "StringLiteral") right = parseFloat(removething(right));

          if (left == null || right == null) return;

          let val
          if (operator == "+") val = left + right;
          if (operator == "-") val = left - right;
          if (operator == "*") val = left * right;
          if (operator == "/") val = left / right;
          if (operator == "^") val = left ** right;
          if (operator == "%") val = left % right;

          if (operator == ">") val = left > right;
          if (operator == "<") val = left < right;
          if (operator == ">=") val = left >= right;
          if (operator == "<=") val = left <= right;

          if (val == false || val == true || (isFinite(val) && val > -(10 ** 6) && val < 10 ** 6 ))
              return val;
      }
  }

  function solveunop(operator, rhs) {
      let b = rhs.Token || rhs.Expression || rhs.EntryList || rhs

      if (b == null) return;
      if (b.Source == null && rhs.Type != "TableLiteral") return;

      if (rhs.Type == "VariableExpr" || rhs.Type == "CallExpr" || rhs.Type == "BinopExpr") {
          return
      }

      let rSrc = b.Source
      let right

      if (rhs.Type == "TableLiteral" && b != null) {
          let extra = []
          let amount = 0
          let ignoreRest = false
          let no = false
          let lastIndex = 0

          b.forEach((v,i) => {
              if (ignoreRest) {
                  extra.push(v)
              } else {
                  if (v.EntryType == "Value" || v.EntryType == "Index") {
                      if ((v.Index == null || v.Index.Type == "NumberLiteral") && v.Value) {

                          let index = (v.Index != null && v.Index.Token != null && v.Index.Token.Source !== null) ? (v.Index.Token.Source) : lastIndex + 1

                          if (index.toString() !== (++lastIndex).toString()) {
                              ignoreRest = true
                              no = true
                              return extra.push(v)
                          }

                          if (v.Value.Type != "CallExpr") {
                              amount++
                          } else {
                              ignoreRest = true
                              extra.push(v)
                          }

                      } else {
                          extra.push(v)
                          //no = true
                      }
                  }
              }
          })
          // this became a mess really quick

          if (no) {
              return
          }

          if (operator == "#") {

              rhs.EntryList = extra

              if (rhs.EntryList.length <= 0) {
                  return createtype("NumberLiteral", amount !== null ? amount : rhs.EntryList.length)
              } else if(amount <= 0) {
                  return createunop("#", rhs)
              }
  
              let newex = createbinop("+", createtype("NumberLiteral", amount), createunop("#", rhs));
              return newex
          }
      }

      if (rhs.Type == "BooleanLiteral") right = rSrc == "true" ? true : false;
      if (rhs.Type == "NumberLiteral") {
          right = parseFloat(rSrc)
          if (right === null) return;
      }
      if (rhs.Type == "StringLiteral") right = rSrc.substr(1,rSrc.length - 2);

      if (operator == "not" && rhs.Type !== null) {

          if (rhs.Type == "NilLiteral" || (rhs.Type == "BooleanLiteral" && right === false)) return true;

          return false
      }

      if (right != null) {
          if (operator == "#") return right.length;
          if (operator == "-") return -right;
      }
  }


  solveExpr = function(expr) {
      if (expr.Type == "BinopExpr") {

          //if (expr.Lhs != null && canSolve[expr.Lhs.Type] != true) {
              solveExpr(expr.Lhs)
          //}

          //if (expr.Rhs != null && canSolve[expr.Rhs.Type] != true) {
              solveExpr(expr.Rhs)
          //}

          //  && canSolve[expr.Lhs.Type] == true |  && canSolve[expr.Rhs.Type] == true
          if (expr.Lhs != null && expr.Rhs != null) {
              let tokenOp = expr.Token_Op

              if (tokenOp != null && tokenOp.Source != null) {
                  let val = solvebinop(tokenOp.Source, expr.Lhs, expr.Rhs)

                  if (val != null) {
                      if (typeof(val) == "boolean") {
                          let b = createtype("BooleanLiteral", val.toString(), "Keyword")
                          replace(expr, b)
                          return
                      } else if(typeof(val) == "number") {
                          if (isFinite(val) == true) {
                              let num = createtype("NumberLiteral", val, "Number")
                              replace(expr, num)
                              return
                          }
                      } else if(typeof(val) == "string") {
                          let str = createtype("StringLiteral", val, "String")
                          replace(expr, str)

                          return
                      } else if(typeof(val) == "object") {
                          replace(expr, val)
                          return
                      }
                      return
                  }
              }
              
              if (expr.Lhs.Type == "ParenExpr") {
                  let exprt = expr.Lhs
                  let expression = exprt.Expression
                  if(expression.Type == "NumberLiteral" || expression.Type == "StringLiteral"
                      || expression.Type == "NilLiteral" || expression.Type == "BooleanLiteral")
                  {
                      //expr.Lhs = expression
                  }
              }
              if (expr.Rhs.Type == "ParenExpr") {
                  let exprt = expr.Rhs
                  let expression = exprt.Expression
                  if(expression.Type == "NumberLiteral" || expression.Type == "StringLiteral"
                      || expression.Type == "NilLiteral" || expression.Type == "BooleanLiteral")
                  {
                      //expr.Rhs = expression
                  }
              }
          }
      } else if(expr.Type == "UnopExpr") {

          //if (expr.Rhs != null && canSolve[expr.Rhs.Type] != true) {
              solveExpr(expr.Rhs)
          //}

          if (expr.Rhs != null && canSolve[expr.Rhs.Type] == true) {
              let tokenOp = expr.Token_Op

              if (tokenOp != null && tokenOp.Source != null) {
                  let rhs = expr.Rhs.Expression != null ? expr.Rhs.Expression : expr.Rhs
                  let val = solveunop(tokenOp.Source, rhs)

                  if (val != null) {
                      if (typeof(val) == "boolean") {
                          let b = createtype("BooleanLiteral", val.toString(), "Keyword")
                          replace(expr, b)
                          return
                      } else if(typeof(val) == "number") {
                          if (isFinite(val) == true) {
                              let num = createtype("NumberLiteral", val, "Number")
                              replace(expr, num)
                              return
                          }
                      } else if(typeof(val) == "string") {
                          let str = createtype("StringLiteral", val, "String")

                          replace(expr, str)
                          
                          return
                      } else if(typeof(val) == "object") {
                          replace(expr, val)
                          return
                      }
                      return
                  }
              }
          }

          //solveExpr(expr.Rhs)
      } else if(expr.Type == "NumberLiteral" || expr.Type == "StringLiteral"
              || expr.Type == "NilLiteral" || expr.Type == "BooleanLiteral"
              || expr.Type == "VargLiteral")
      {
          // ...
          let token = expr.Token
          if (token != null) {
              if (token.Type == "Number") {
                  let int = parseFloat(token.Source)

                  if (int !== null && isFinite(int))
                      token.Source = int + "";
              }

              if (token.Type == "String") {
                  token.Source = token.Source.replace(/\\\d+/gi, (got) => {
                      let num = parseFloat(got.substr(1,got.length-1))
                      if (num && isFinite(num) && ((num >= 97 && num <= 122) || (num >= 65 && num <= 90))) {
                        return String.fromCharCode(num)
                      }
                      
                      return got
                  })
              }
          }


      } else if(expr.Type == "FieldExpr") {
          solveExpr(expr.Base)
      } else if(expr.Type == "IndexExpr") {
          solveExpr(expr.Base)
          solveExpr(expr.Index)
      } else if(expr.Type == "MethodExpr" || expr.Type == "CallExpr") {
          solveExpr(expr.Base)
          if(expr.FunctionArguments.CallType == "ArgCall") {
              expr.FunctionArguments.ArgList.forEach((argExpr, index) => {
                  solveExpr(argExpr)
              })
          } else if(expr.FunctionArguments.CallType == "TableCall") {
              solveExpr(expr.FunctionArguments.TableExpr)
          }
      } else if(expr.Type == "FunctionLiteral") {
          solveStat(expr.Body)
      } else if(expr.Type == "VariableExpr") {
          // Dont care
      } else if(expr.Type == "ParenExpr") {
          let exprExpr = expr.Expression
          if (exprExpr != null && exprExpr.Type == "ParenExpr") {
              expr.Expression = exprExpr.Expression
          }
          solveExpr(expr.Expression)

          if(expr.Type == "NumberLiteral" || expr.Type == "StringLiteral"
              || expr.Type == "NilLiteral" || expr.Type == "BooleanLiteral"
              || expr.Type == "VargLiteral") 
          {
              removeParen(expr)
          }
      } else if(expr.Type == "TableLiteral") {
          expr.EntryList.forEach((entry, index) => {
              if (entry.EntryType == "Field") {
                  solveExpr(entry.Value)
              } else if(entry.EntryType == "Index") {
                  solveExpr(entry.Index)
                  solveExpr(entry.Value)
              } else if(entry.EntryType == "Value") {
                  solveExpr(entry.Value)
              } else {
                  assert(false, "unreachable")
              }
          })
      } else {
          //throw(`unreachable, type: ${expr.Type}:${expr}  ${console.trace()}`)
      }
  }
  
  solveStat = function(stat) {
      if (stat.Type == "StatList") {
          stat.StatementList.forEach((ch, index) => {
              if (ch === null || ch.Type === null) {
                  return
              }

              ch.Remove = () => {
                  stat.StatementList[index] = null
              }

              solveStat(ch);
          })
      } else if(stat.Type == "BreakStat") {
          // no
      } else if(stat.Type == "ReturnStat") {
          stat.ExprList.forEach((expr, index) => {
              solveExpr(expr)
          })
      } else if(stat.Type == "LocalVarStat") {
          if (stat.Token_Equals != null) {
              stat.ExprList.forEach((expr, index) => {
                  solveExpr(expr)
              })
          }
      } else if(stat.Type == "LocalFunctionStat") {
          solveStat(stat.FunctionStat.Body)

          if (stat.FunctionStat.NameChain.length === 1) {
              if (stat.FunctionStat.NameChain[0].UseCount === 0) {
                  return stat.Remove()
              }
          }

      } else if(stat.Type == "FunctionStat") {
          solveStat(stat.Body)
      } else if(stat.Type == "RepeatStat") {
          solveStat(stat.Body)
          solveExpr(stat.Condition)

          if (stat.Body.Type == "StatList" && stat.Body.StatementList.length === 0) {
              //return stat.Remove()
          }
      } else if(stat.Type == "GenericForStat") {
          stat.GeneratorList.forEach((expr, index) => {
              solveExpr(expr)
          })
          solveStat(stat.Body)
      } else if(stat.Type == "NumericForStat") {
          stat.RangeList.forEach((expr, index) => {
              solveExpr(expr)
          })
          solveStat(stat.Body)


          let a = stat.RangeList[0]
          let b = stat.RangeList[1]
          let c = stat.RangeList[2]
          if (a == null || b == null) {
              return stat.Remove()
          }

          removeParen(a)
          removeParen(b)
          removeParen(c)

          if (a.Type != "NumberLiteral" || b.Type != "NumberLiteral" || (c != null && c.Type != "NumberLiteral" || c == null) ) {
              return // Nope.
          }

          let start = parseFloat(a.Token.Source)
          let end = parseFloat(b.Token.Source)
          let step = (c != null && parseFloat(c.Token.Source)) || 1

          let t1 = ((step > 0 && start <= end) || (step < 0 && start >= end))
          let t2 = ((end - start) + step) / step

          let willRun = t1 && t2 >= 0

          if (!willRun) {
              return stat.Remove()
          }

          if (stat.Body.Type == "StatList" && stat.Body.StatementList.length === 0) {
              return stat.Remove()
          }
      } else if(stat.Type == "WhileStat") {
          solveExpr(stat.Condition)
          solveStat(stat.Body)

          let condition = stat.Condition
          switch (condition.Type) {
              case "ParenExpr": {
                  condition = condition.Expression
              }
              case "BooleanLiteral": {
                  if (condition == null || condition.Token == null || condition.Token.Source !== "false") {
                      break
                  }
              }
              case "NilLiteral":
                  stat.Remove()
                  break

              default: break
          }
      } else if(stat.Type == "DoStat") {
          solveStat(stat.Body)

          if (stat.Body === null || (stat.Body.Type == "StatList" && stat.Body.StatementList.length == 0)) {
              return stat.Remove()
          }
      } else if(stat.Type == "IfStat") {
          solveExpr(stat.Condition)
          solveStat(stat.Body)
          stat.ElseClauseList.forEach((clause, i) => {
              if (clause.Condition != null) {
                  solveExpr(clause.Condition)
              }  
              solveStat(clause.Body)   
          })

          let condition = stat.Condition
          switch (condition.Type) {
              case "ParenExpr": {
                  condition = condition.Expression
              }
              case "BooleanLiteral": {
                  if (condition == null || condition.Token == null || condition.Token.Source !== "false") {
                      break
                  }
              }
              case "NilLiteral":
                  stat.Remove()
                  break

              default: break
          }
      } else if(stat.Type == "CallExprStat") {
          solveExpr(stat.Expression)
      } else if(stat.Type == "AssignmentStat") {
          stat.Lhs.forEach((ex, index) => {
              solveExpr(ex)
          })
          stat.Rhs.forEach((ex, index) => {
              solveExpr(ex)
          })
      } else {
          //print(`unreachable, type: ${stat.Type}`,stat)
          //throw(`unreachable, type: ${stat.Type}:${stat}`)
      }
  }

  solveStat(ast)
}

function genHexString(len) {
  const hex = '0123456789ABCDEF';
  let output = '';
  for (let i = 0; i < len; ++i) {
      output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
}


function Uglify(ast) {
  let uglifyStat
  let uglifyExpr
  function stript(token) {
      if (token != null)
          token.LeadingWhite = '';
  }


  function removething(a) {
      if (a == null || a.substr == null) return;

      let start = a.substr(0,1)
      let end = a.substr(-1,1)

      let ret
      if (start == `"` || start == `'`) ret = a.substr(1,a.length-2);
      if (start == `[`) {
          ret =  a.substr(2,a.length-4);
          start = "[["
          end = "]]"
      }
      if (ret == null) return '';

      let newret = ''
      let i
      for (i=0;i<=ret.length;i++) {
          let c = ret.substr(i,1)

          if (c == `'` || c == `"`) {
              newret += `\\${c}`
          } else {
              newret += c
          }
      }
      return [newret, start, end]
  }

  function joint(tokenA, tokenB) {

      stript(tokenB)
      
      let lastCh = tokenA.Source.substr(-0,1)
      let firstCh = tokenB.Source.substr(0,1)

      if ((lastCh == "-" && firstCh == "-") || (AllIdentChars.includes(lastCh) && AllIdentChars.includes(firstCh))) {
          tokenB.LeadingWhite = ' '
      } else {
          tokenB.LeadingWhite = ""
      }
  }

  function bodyjoint(open, body, close) {
      uglifyStat(body)
      stript(close)
      let bodyFirst = body.GetFirstToken()
      let bodyLast = body.GetLastToken()

      if (bodyFirst != null) {
          joint(open, bodyFirst)
          joint(bodyLast, close)
      } else {
          joint(open, close)
      }
  }

  function cnode(node) {
      let getf = node.GetFirstToken
      let getl = node.GetLastToken

      let self = node
      node.GetFirstToken = function() {
          let t = getf(self)
          assert(t, node)
          return t
      }

      node.GetLastToken = function() {
          let t = getl(self)
          assert(t, node)
          return t
      }

      return node
  }

  function ctoken(type, source) {
      return {type: type, Source: source, LeadingWhite: " "}
  }

  function replace(a,b) {
      if (typeof(a) != "object" || typeof(b) != "object") return;

      for (var [i,v] of Object.entries(a)) {
          a[i] = null
      }

      for (var [i,v] of Object.entries(b)) {
          a[i] = v
      }
  }

  function createtype(type, val, type2=null) {
      let a
      a = cnode({
          "Type": type,
          "Token": {
              "Type": type2 == null ? "Number" : type2,
              "LeadingWhite": "",
              "Source": "" + val,
          },
          "GetFirstToken": () => a.Token,
          "GetLastToken": () => a.Token,
      })
      return a
  }

  function createtype2(type, val) {
      let a
      a = {
          "Type": type,
          "LeadingWhite": " ",
          "Source": "" + val,
      }
      return a
  }

  function createbinop(operator, lhs, rhs) {
      let a
      a = {
          "Type": "BinopExpr",
          "Token_Op": {"Type":"Symbol", "LeadingWhite":"", "Source": operator},
          "Lhs": lhs,
          "Rhs": rhs,
          "GetFirstToken": () => a.Lhs.GetFirstToken(),
          "GetLastToken": () => a.Rhs.GetLastToken(),
      }
      return a
  }

  function createunop(operator, rhs) {
      let node
      node =  cnode({
          "Type": "UnopExpr",
          "Token_Op": {"Type":"Symbol", "LeadingWhite":" ", "Source": operator},
          "Rhs": rhs,
          "GetFirstToken": () => node.Token_Op,
          "GetLastToken": () => node.Rhs.GetLastToken(),
      })
      return node
  }

  function rannum() {
      return Math.floor(Math.random() * 99999)
  }

  function createparenexpr(Expr) {
      let node = cnode({
          Type: "ParenExpr",
          Expression: Expr,
          Token_OpenParen: ctoken("Symbol", "("),
          Token_CloseParen: ctoken("Symbol", ")"),
          GetFirstToken: (self) => self.Token_OpenParen,
          GetLastToken: (self) => self.Token_CloseParen
      })
  }

  function randomShit(a, b) {

      let num = Math.floor(Math.random() * 8)
      if (num == 0) {
          return `((${a || rannum()}) + (${b || rannum()}))`
      } else if(num == 1) {
          return `((${a || rannum()}) * (${b || rannum()}))`
      } else if(num == 2) {
          return `((${a || rannum()}) ^ (${b || rannum()}))`
      } else if(num == 3) {
          return `((${a || rannum()}) / (${b || rannum()}))`
      } else if(num == 4) {
          return `((${a || rannum()}) .. (${b || rannum()}))`
      } else if(num == 5) {
          return `((${a || rannum()}) and (${b || rannum()}))`
      } else if(num == 6) {
          return `((${a || rannum()}) and (${b || rannum()}))`
      } else {
          return `(not (${a || rannum()}) and (${b || rannum()}))`
      }
  }

  function generateRandomShit(ignore) {
      let num = ignore ? 1000 : Math.floor(Math.random() * 100)

      let str // ${Math.floor(Math.random() * 999)}
      if (num == 0) {
          str = `${rannum()} and true or ${randomShit("(a)")} * (b)((false)(${randomShit()})("" + ".." .. ${randomShit()} .. "")(${randomShit()})) ^ ${randomShit()}`
      } else if(num == 1 && !ignore) {
          str = `(function(a,b,c)
              return ${generateRandomShit(true)} 
                  and a or a == nil or b * a + b, c end)() 
                  or ${randomShit()} 
                  or ${rannum()} * ${randomShit()}`
      } else {
          str = `${Math.floor(Math.random() * 999)}`
      }

      let a = `${str}${i != 6 ? " " : ""}`;

      return a
  }

  function generaterandomargs() {
      let args = []
      let commalist = []

      return [args, commalist]
  }

  function createStatList(stats, semicolonList) {
      let statList = cnode({
          Type: "StatList",
          StatementList: stats || [],
          SemicolonList: semicolonList || [],
          GetFirstToken: function(self) {
              if (self.StatementList.length == 0) {
                  return
              } else {
                  return self.StatementList[0].GetFirstToken()
              }
          },
          GetLastToken: function(self) {
              if (self.StatementList.length == 0) {
                  return
              } else if(self.SemicolonList[self.StatementList.length - 1]) {
                  return self.SemicolonList[self.StatementList.length - 1]
              } else {
                  return self.StatementList[self.StatementList.length - 1].GetLastToken()
              }
          },
      })
      return statList
  }

  function createLocalStat(VarNames, ExprList) {
      let expr = cnode({
          Type: "LocalVarStat",
          VarList: VarNames,
          ExprList: ExprList || [],
          Token_Local: { type: "Keyword", LeadingWhite: " ", Source: "local"},
          Token_Equals: {type: "Symbol", LeadingWhite: " ", Source: "="},
          Token_VarCommaList: [],
          Token_ExprCommaList: [],
          GetFirstToken: (self) => self.Token_Local,
          GetLastToken: (self) => {
              if (self.ExprList.length > 0) {
                  return self.ExprList[self.ExprList.length - 1].GetLastToken()
              } else {
                  return self.VarList[self.VarList.length - 1]
              }
          }
      })
  }


  function turnNumberToFTable(value1) {
      let list = []
      let seperators = []

      let maxtablelength = 5

      let a = (value1+"").split(".");
      let value = a[0]
      let dec = a[1]

      let leftover = value - Math.min(value, maxtablelength) // Set max table length to 100

      if (parseFloat(dec) && isFinite(dec)) {
          leftover += (dec / 10)
      }
  
      let tableLol = ""
      for (let i = 0; i<Math.min(value, maxtablelength); i++) {
          if (i == 0) {
              tableLol += generateRandomShit()
          } else {
              tableLol += ", " + generateRandomShit()
          }
      }

      let scr = `
          local a = {${tableLol}}
          return #a
      `
      // Sorry, creating a new parser is poop and slow, but the easy way
      let body = CreateLuaParser(scr)

      let ranargs = [
              {Type: "Ident", Source: "a", LeadingWhite: " "},
              {Type: "Ident", Source: "b", LeadingWhite: " "}, 
      ]
      let rancommas = [
          {Type: "Symbol", Source: ",", LeadingWhite: " "},
      ]
      for (let i = 0; i>2; i++) {
          let ran = Math.random()
          if (ran > 0.5) {
              args.push({Type: "Ident", Source: `d${Math.floor(Math.random() * 50)}`, LeadingWhite: " "})
              commas.push({Type: "Symbol", Source: ",", LeadingWhite: " "})
          }
      }

      let base = cnode({
          Type: "ParenExpr",
          Expression: cnode({
              Type: "FunctionLiteral",
              NameChain: undefined,
              ArgList: ranargs,
              Body: body,
  
              Token_Function: {Type: "Keyword", Source: "function", LeadingWhite: " "},
              Token_NameChainSeperator: undefined,
              Token_OpenParen: {Type: "Symbol", Source: "(", LeadingWhite: " "},
              Token_Varg: undefined,
              Token_ArgCommaList: rancommas,
              Token_CloseParen: {Type: "Symbol", Source: ")", LeadingWhite: " "},
              Token_End: {Type: "Keyword", Source: "end", LeadingWhite: " "},
              GetFirstToken: (self) => self.Token_Function,
              GetLastToken: (self) => self.Token_End,
          }),
          Token_OpenParen: {Type: "Symbol", Source: "(", LeadingWhite: " "},
          Token_CloseParen: {Type: "Symbol", Source: ")", LeadingWhite: " "},
          GetFirstToken: (self) => self.Token_OpenParen,
          GetLastToken: (self) => self.Token_CloseParen
      })


      let [args, commalist] = generaterandomargs()
      let expr = cnode({
          Type: "CallExpr",
          Base: base,

          FunctionArguments: cnode({
              CallType: "ArgCall",
              ArgList: args || [],
              
              Token_CommaList: commalist || [],
              Token_OpenParen: {Type: "Symbol", LeadingWhite: " ", Source: "("},
              Token_CloseParen: {Type: "Symbol", LeadingWhite: " ", Source: ")"},
              GetFirstToken: (self) => self.Token_OpenParen,
              GetLastToken: (self) => self.Token_CloseParen
          }),
          GetFirstToken: (self) => self.Base.GetFirstToken(),
          GetLastToken: (self) => self.FunctionArguments.GetLastToken()
      })

      let binop = createbinop("+", expr, createtype("NumberLiteral", leftover))
      return binop//createparenexpr(binop)
  }


  function turnNumberToFString(value) {
      let list = []
      let seperators = []

      let maxstrlength = 100

      let leftover = value - Math.min(value, maxtablelength) // Set max table length to 100
      let strlol = genHexString(Math.min(value, maxtablelength))

      let scr = `
          local a = "${strlol}"
          return #a + ${leftover}
      `
      let body = CreateLuaParser(scr)

      let base = cnode({
          Type: "ParenExpr",
          Expression: cnode({
              Type: "FunctionLiteral",
              NameChain: undefined,
              ArgList: [],
              Body: body,
  
              Token_Function: {Type: "Keyword", Source: "function", LeadingWhite: " "},
              Token_NameChainSeperator: undefined,
              Token_OpenParen: {Type: "Symbol", Source: "(", LeadingWhite: " "},
              Token_Varg: undefined,
              Token_ArgCommaList: [],
              Token_CloseParen: {Type: "Symbol", Source: ")", LeadingWhite: " "},
              Token_End: {Type: "Keyword", Source: "end", LeadingWhite: " "},
              GetFirstToken: (self) => self.Token_Function,
              GetLastToken: (self) => self.Token_End,
          }),
          Token_OpenParen: {Type: "Symbol", Source: "(", LeadingWhite: " "},
          Token_CloseParen: {Type: "Symbol", Source: ")", LeadingWhite: " "},
          GetFirstToken: (self) => self.Token_OpenParen,
          GetLastToken: (self) => self.Token_CloseParen
      })


      let [args, commalist] = generaterandomargs()
      let expr = cnode({
          Type: "CallExpr",
          Base: base,

          FunctionArguments: cnode({
              CallType: "ArgCall",
              ArgList: args || [],
              
              Token_CommaList: commalist || [],
              Token_OpenParen: {Type: "Symbol", LeadingWhite: " ", Source: "("},
              Token_CloseParen: {Type: "Symbol", LeadingWhite: " ", Source: ")"},
              GetFirstToken: (self) => self.Token_OpenParen,
              GetLastToken: (self) => self.Token_CloseParen
          }),
          GetFirstToken: (self) => self.Base.GetFirstToken(),
          GetLastToken: (self) => self.FunctionArguments.GetLastToken()
      })


      return expr//createbinop("+", expr, createtype("NumberLiteral", leftover))
  }


  let addedLocal = false
  uglifyExpr = function(expr, uglied) {
      if (expr.Type == "BinopExpr") {

          uglifyExpr(expr.Lhs, uglied)
          stript(expr.Token_Op)
          uglifyExpr(expr.Rhs, uglied)

          joint(expr.Token_Op, expr.Rhs.GetFirstToken())
          joint(expr.Lhs.GetLastToken(), expr.Token_Op)
      } else if(expr.Type == "UnopExpr") {
          stript(expr.Token_Op)
          uglifyExpr(expr.Rhs, uglied)

          joint(expr.Token_Op, expr.Rhs.GetFirstToken())
      } else if(expr.Type == "NumberLiteral" || expr.Type == "StringLiteral"
              || expr.Type == "NilLiteral" || expr.Type == "BooleanLiteral"
              || expr.Type == "VargLiteral")
      {
          if (uglied) {
              switch(expr.Type) {
                  case ("NumberLiteral"):
                  case ("NilLiteral"):
                  case ("BooleanLiteral"):
                      expr.Token.Source += " "
                  case ("StringLiteral"):
                  case ("VargLiteral"): {
                      stript(expr.Token)
                  }
                  default: {
                      break
                  }
              }
              return
          }
          

          switch(expr.Type) {
              case ("NumberLiteral"): {
                  let value = isFinite(`0${expr.Token.Source}`) && parseFloat(`0${expr.Token.Source}`)

                  let howtofuckup = Math.floor(Math.random() * 25)
                  if (value !== null && typeof(value) == "number" && isFinite(value)) {
                      if (howtofuckup === 0) { // Slow as fuck
                          // #String
                          //let newexpr = turnNumberToFString(value)
                          //replace(expr, newexpr)
                          break// uglifyExpr(expr, true) // Just fucks me up
                      } else if(howtofuckup == 1) {
                          // Math shit
                          
                          /*let ran = Math.floor(Math.random() * 100)
                          if (ran === 0) {

                          } else if(ran == 1) {

                          } else {
                              let plus = parseFloat(expr.Token.Source) - Math.floor(Math.random() * 500)
                              let newor = parseFloat(expr.Token.Source - plus)
                              let newexpr = createbinop("+", createtype("NumberLiteral", newor), createtype("NumberLiteral", plus))
                              replace(expr, createparenexpr(newexpr))
                          }*/
                          break
                      } else if(howtofuckup == 2) { // This shit is slow as fucks
                          // #Table
                          let newexpr = turnNumberToFTable(value, expr.Token.Source)
                          replace(expr, newexpr)
                          break// uglifyExpr(expr, true) // Just fucks me up
                      } else {
                          // IDK
                          stript(expr.Token);
                          break
                      }
                  }

                  break
              }

              case ("StringLiteral"): {

                  let [str, start, end] = removething(expr.Token.Source)

                  let howtofuckup = Math.floor(Math.random() * 5)
                  if (howtofuckup == 0) {
                      let b = ""
                      let staph = false
                      for (let i = 0; i < str.length; i++) {
                          let char = str.charAt(i)

                          if (char == "\\" || staph) {
                              staph = true
                              b += char
                          } else {
                              b += `\\${char.charCodeAt()}`
                          }
                      }
                      expr.Token.Source = `'${b}'`
                      break
                  } else if(howtofuckup == 1) {
                      let a = []
                      let b = ""
                      if (str.length > 100) {break}

                      let staph = false // Idk, fuck \10120987602362362101+6

                      for (let i = 0; i < str.length; i++) {
                          let char = str.charAt(i)

                          if (char == "\\") {
                              staph = true
                              b = str.substr(i, str.length-i)
                              break
                          }
                          a.push(`${char.charCodeAt()}`);
                      }
                      let callexpr = CreateLuaParser(`_ = string.char(${a.concat()}) .. ${start}${b}${end}`).StatementList[0].Rhs[0]
                      if (!addedLocal) {
                          addedLocal = true
                          let local = CreateLuaParser(`local string = string`).StatementList[0]
                          ast.StatementList = [local].concat(ast.StatementList)
                      }
                      uglifyExpr(callexpr.Lhs)
                      replace(expr, callexpr)
                      break
                  } else {
                      break
                  }
              }

              default: {
                  break
              }
          }

          switch(expr.Type) {
              case ("NumberLiteral"):
              case ("NilLiteral"):
              case ("BooleanLiteral"):
                  expr.Token.Source += " "
              case ("StringLiteral"):
              case ("VargLiteral"): {
                  stript(expr.Token)
              }
              default: {
                  break
              }
          }
      } else if(expr.Type == "FieldExpr") {
          uglifyExpr(expr.Base, uglied)
          stript(expr.Token_Dot)
          stript(expr.Field)
      } else if(expr.Type == "IndexExpr") {
          uglifyExpr(expr.Base, uglied)
          stript(expr.Token_OpenBracket)
          uglifyExpr(expr.Index, uglied)
          stript(expr.Token_CloseBracket)
      } else if(expr.Type == "MethodExpr" || expr.Type == "CallExpr") {
          uglifyExpr(expr.Base, uglied)
          if (expr.Type == "MethodExpr") {
              stript(expr.Token_Colon)
              stript(expr.Method)
          }
          if (expr.FunctionArguments.CallType == "StringCall") {
              stript(expr.FunctionArguments.Token)
          } else if(expr.FunctionArguments.CallType == "ArgCall") {
              stript(expr.FunctionArguments.Token_OpenParen)
              expr.FunctionArguments.ArgList.forEach((argExpr, index) => {
                  uglifyExpr(argExpr, uglied)
                  let sep = expr.FunctionArguments.Token_CommaList[index]
                  if (sep != null) {
                      stript(sep)
                  }
              })
              stript(expr.FunctionArguments.Token_CloseParen)
          } else if(expr.FunctionArguments.CallType == "TableCall") {
              uglifyExpr(expr.FunctionArguments.TableExpr, uglied)
          }
      } else if(expr.Type == "FunctionLiteral") {
          stript(expr.Token_Function)
          stript(expr.Token_OpenParen)
          expr.ArgList.forEach((arg, index) => {
              stript(arg)
              let comma = expr.Token_ArgCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })
          if (expr.Token_Varg != null) {
              stript(expr.Token_Varg)
          }
          stript(expr.Token_CloseParen)
          bodyjoint(expr.Token_CloseParen, expr.Body, expr.Token_End)
      } else if(expr.Type == "VariableExpr") {
          stript(expr.Token)
      } else if(expr.Type == "ParenExpr") {
          stript(expr.Token_OpenParen)
          uglifyExpr(expr.Expression, uglied)
          stript(expr.Token_CloseParen)
      } else if(expr.Type == "TableLiteral") {
          stript(expr.Token_OpenBrace)
          expr.EntryList.forEach((entry, index) => {
              if (entry.EntryType == "Field") {
                  stript(entry.Field)
                  stript(entry.Token_Equals)
                  uglifyExpr(entry.Value, uglied)
              } else if(entry.EntryType == "Index") {
                  stript(entry.Token_OpenBracket)
                  uglifyExpr(entry.Index, uglied)
                  stript(entry.Token_CloseBracket)
                  stript(entry.Token_Equals)
                  uglifyExpr(entry.Value, uglied)
              } else if(entry.EntryType == "Value") {
                  uglifyExpr(entry.Value, uglied)
              } else {
                  assert(false, "unreachable")
              }
              let sep = expr.Token_SeperatorList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          
          expr.Token_SeperatorList[expr.EntryList.length-1] = null
          stript(expr.Token_CloseBrace)
      } else {
          throw(`unreachable, type: ${expr.Type}:${expr}  ${console.trace()}`)
      }
  }
  
  uglifyStat = function(stat, uglied) {
      if (stat.Type == "StatList") {
          let i
          for (i=0; i<=stat.StatementList.length;i++) {
              let chStat = stat.StatementList[i]
              if (chStat == null) continue;
              
              uglifyStat(chStat, uglied)
              stript(chStat.GetFirstToken())

              let lastChStat = stat.StatementList[i-1]
              if (lastChStat != null) {

                  if (stat.SemicolonList[i-1]
                      && lastChStat.GetLastToken().Source != ")" || chStat.GetFirstToken().Source != ")") 
                  {
                      stat.SemicolonList[i-1] = null
                  }

                  if (!stat.SemicolonList[i-1]) {
                      joint(lastChStat.GetLastToken(), chStat.GetFirstToken())
                  }
              }
          }

          stat.SemicolonList[stat.StatementList.length-1] = null
          if (stat.StatementList.length > 0) {
              stript(stat.StatementList[0].GetFirstToken())
          }
      } else if(stat.Type == "BreakStat") {
          stript(stat.Token_Break)
      } else if(stat.Type == "ReturnStat") {
          stript(stat.Token_Return)
          stat.ExprList.forEach((expr, index) => {
              uglifyExpr(expr, uglied)
              if (stat.Token_CommaList[index] != null) {
                  stript(stat.Token_CommaList[index])
              }
          })
          if (stat.ExprList.length > 0) {
              joint(stat.Token_Return, stat.ExprList[0].GetFirstToken())
          }
      } else if(stat.Type == "LocalVarStat") {
          stript(stat.Token_Local)
          stat.VarList.forEach((_var, index) => {
              if (index == 0) {
                  joint(stat.Token_Local, _var)
              } else {
                  stript(_var)
              }
              let comma = stat.Token_VarCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })
          if (stat.Token_Equals != null) {
              stript(stat.Token_Equals)
              stat.ExprList.forEach((expr, index) => {
                  uglifyExpr(expr, uglied)
                  let comma = stat.Token_ExprCommaList[index]
                  if (comma != null) {
                      stript(comma)
                  }
              })
          }
      } else if(stat.Type == "LocalFunctionStat") {
          stript(stat.Token_Local)
          joint(stat.Token_Local, stat.FunctionStat.Token_Function)
          joint(stat.FunctionStat.Token_Function, stat.FunctionStat.NameChain[0])
          joint(stat.FunctionStat.NameChain[0], stat.FunctionStat.Token_OpenParen)

          stat.FunctionStat.ArgList.forEach((arg, index) => {
              stript(arg)
              let comma = stat.FunctionStat.Token_ArgCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })
          if (stat.FunctionStat.Token_Varg) {
              stript(stat.FunctionStat.Token_Varg)
          }
          stript(stat.FunctionStat.Token_CloseParen)
          bodyjoint(stat.FunctionStat.Token_CloseParen, stat.FunctionStat.Body, stat.FunctionStat.Token_End)
      } else if(stat.Type == "FunctionStat") {
          stript(stat.Token_Function)
          stat.NameChain.forEach((part, index) => {
              if (index == 0) {
                  joint(stat.Token_Function, part)
              } else {
                  stript(part)
              }
              let sep = stat.Token_NameChainSeperator[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          stript(stat.Token_OpenParen)
          stat.ArgList.forEach((arg, index) => {
              stript(arg)
              let comma = stat.Token_ArgCommaList[index]
              if (comma != null) {
                  stript(comma)
              }
          })

          if (stat.Token_Varg) {
              stript(stat.Token_Varg)
          }
          stript(stat.Token_CloseParen)
          bodyjoint(stat.Token_CloseParen, stat.Body, stat.Token_End)
      } else if(stat.Type == "RepeatStat") {
          stript(stat.Token_Repeat)
          bodyjoint(stat.Token_Repeat, stat.Body, stat.Token_Until)
          uglifyExpr(stat.Condition, uglied)
          joint(stat.Token_Until, stat.Condition.GetFirstToken())
      } else if(stat.Type == "GenericForStat") {
          stript(stat.Token_For)
          stat.VarList.forEach((_var, index) => {
              if (index == 0) {
                  joint(stat.Token_For, _var)
              } else {
                  stript(_var)
              }
              let sep = stat.Token_VarCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.VarList[stat.VarList.length-1], stat.Token_In)
          stat.GeneratorList.forEach((expr, index) => {
              uglifyExpr(expr, uglied)
              if (index == 0) {
                  joint(stat.Token_In, expr.GetFirstToken())
              }
              let sep = stat.Token_GeneratorCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.GeneratorList[stat.GeneratorList.length-1].GetLastToken(), stat.Token_Do)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "NumericForStat") {
          stript(stat.Token_For)
          stat.VarList.forEach((_var, index) => {
              if (index == 0) {
                  joint(stat.Token_For, _var)
              } else {
                  stript(_var)
              }
              let sep = stat.Token_VarCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.VarList[stat.VarList.length-1], stat.Token_Equals)
          stat.RangeList.forEach((expr, index) => {
              uglifyExpr(expr, uglied)
              if (index == 0) {
                  joint(stat.Token_Equals, expr.GetFirstToken())
              }
              let sep = stat.Token_RangeCommaList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          joint(stat.RangeList[stat.RangeList.length-1].GetLastToken(), stat.Token_Do)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "WhileStat") {
          stript(stat.Token_While)
          uglifyExpr(stat.Condition, uglied)
          stript(stat.Token_Do)
          joint(stat.Token_While, stat.Condition.GetFirstToken())
          joint(stat.Condition.GetLastToken(), stat.Token_Do)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "DoStat") {
          stript(stat.Token_Do)
          stript(stat.Token_End)
          bodyjoint(stat.Token_Do, stat.Body, stat.Token_End)
      } else if(stat.Type == "IfStat") {
          stript(stat.Token_If)
          uglifyExpr(stat.Condition, uglied)
          joint(stat.Token_If, stat.Condition.GetFirstToken())
          joint(stat.Condition.GetLastToken(), stat.Token_Then)

          let lastBodyOpen = stat.Token_Then
          let lastBody = stat.Body

          stat.ElseClauseList.forEach((clause, i) => {
              bodyjoint(lastBodyOpen, lastBody, clause.Token)
              lastBodyOpen = clause.Token

              if (clause.Condition != null) {
                  uglifyExpr(clause.Condition, uglied)
                  joint(clause.Token, clause.Condition.GetFirstToken())
                  joint(clause.Condition.GetLastToken(), clause.Token_Then)
                  lastBodyOpen = clause.Token_Then
              }

              uglifyStat(clause.Body, uglied)
              lastBody = clause.Body            
          })

          bodyjoint(lastBodyOpen, lastBody, stat.Token_End)
      } else if(stat.Type == "CallExprStat") {
          uglifyExpr(stat.Expression, uglied)
      } else if(stat.Type == "AssignmentStat") {
          stat.Lhs.forEach((ex, index) => {
              uglifyExpr(ex, uglied)
              let sep = stat.Token_LhsSeperatorList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
          stript(stat.Token_Equals)
          stat.Rhs.forEach((ex, index) => {
              uglifyExpr(ex, uglied)
              let sep = stat.Token_RhsSeperatorList[index]
              if (sep != null) {
                  stript(sep)
              }
          })
      } else {
          return uglifyExpr(stat, uglied)
          //print(`unreachable, type: ${stat.Type}`,stat)
          //throw(`unreachable, type: ${stat.Type}:${stat}`)
      }
  }

  uglifyStat(ast)
}



let idGen = 0
let VarDigits = []


let i
for (i="a".charCodeAt(); i<="z".charCodeAt(); i++) VarDigits.push(String.fromCharCode(i));
for (i="A".charCodeAt(); i<="Z".charCodeAt(); i++) VarDigits.push(String.fromCharCode(i));
for (i="0".charCodeAt(); i<="9".charCodeAt(); i++) VarDigits.push(String.fromCharCode(i));
VarDigits.push("_")

let VarStartDigits = []
for (i="a".charCodeAt(); i<="z".charCodeAt(); i++) VarStartDigits.push(String.fromCharCode(i));
for (i="A".charCodeAt(); i<="Z".charCodeAt(); i++) VarStartDigits.push(String.fromCharCode(i));


function indexToVarName(index) {
  let id = ""
  let d = index % VarStartDigits.length
  index = (index - d) / VarStartDigits.length
  id = `${id}${VarStartDigits[d + 1]}`
  while (index > 0) {
      let d = index % VarDigits.length
      index = (index - d) / VarDigits.length
      id = `${id}${VarDigits[d+1]}`
  }
  return id
}

function genNextVarName() {
  let varToUse = idGen
  idGen++
  return indexToVarName(varToUse)
}

function genVarName() {
  let varName = genNextVarName()
  while (Keywords.includes(varName)) {
      varName = genNextVarName()
  }
  return varName
}

function MinifyVariables(globalScope, rootScope) {
  let externalGlobals = []

  let temporaryIndex = 0
  globalScope.forEach((_var) => {
      if (_var.AssignedTo) {
          _var.Rename(`_TMP_${temporaryIndex}_`)
          temporaryIndex++
      } else {
          externalGlobals[_var.Name] = true
      }
  })

  function temporaryRename(scope) {
      scope.VariableList.forEach((_var) => {
          _var.Rename(`_TMP_${temporaryIndex}_`)
          temporaryIndex++
      })
      scope.ChildScopeList.forEach((childScope) => {
          temporaryRename(childScope)
      })
  }

  let nextFreeNameIndex = 0
  globalScope.forEach((_var) => {
      if (_var.AssignedTo) {
          let varName = ""
          varName = indexToVarName(nextFreeNameIndex)
          nextFreeNameIndex++
          while (Keywords.includes(varName) || externalGlobals[varName]) {
              varName = indexToVarName(nextFreeNameIndex)
              nextFreeNameIndex++ 
          }
          _var.Rename(varName)
      }
  })

  rootScope.FirstFreeName = nextFreeNameIndex
  function doRenameScope(scope) {
      scope.VariableList.forEach((_var) => {
          let varName = ''
          varName = indexToVarName(scope.FirstFreeName)
          scope.FirstFreeName++
          while (Keywords.includes(varName) || externalGlobals[varName]) {
              varName = indexToVarName(scope.FirstFreeName)
              scope.FirstFreeName++
          }
          _var.Rename(varName)
      })
      scope.ChildScopeList.forEach((childScope) => {
          childScope.FirstFreeName = scope.FirstFreeName
          doRenameScope(childScope)
      })
  }
  doRenameScope(rootScope)
}

function MinifyVariables_2(globalScope, rootScope, renameGlobals) {
  let globalUsedNames = []
  for (var [kw, _] of Object.entries(Keywords)) {
      globalUsedNames[kw] = true
  }

  let allVariables = []
  let allLocalVariables = []
  
  globalScope.forEach((_var) => {
      if (_var.AssignedTo && renameGlobals) {
          allVariables.push(_var)
      } else {
          globalUsedNames[_var.Name] = true
      }
  })

  function addFrom(scope) {
      scope.VariableList.forEach((_var) => {
          allVariables.push(_var)
          allLocalVariables.push(_var)
      })
      scope.ChildScopeList.forEach((childScope) => {
          addFrom(childScope)
      })
  }
  addFrom(rootScope)

  allVariables.forEach((_var) => {
      _var.UsedNameArray = []
  })

  allVariables.sort((a, b) => a - b)

  let nextValidNameIndex = 0
  let varNamesLazy = []

  function varIndexToValidName(i) {
      let name = varNamesLazy[i]
      if (name == null) {
          name = indexToVarName(nextValidNameIndex)
          nextValidNameIndex++
          while (globalUsedNames[name]) {
              name = indexToVarName(nextValidNameIndex)
              nextValidNameIndex++  
          }
          varNamesLazy[i] = name
      }
      return name
  }

  allVariables.forEach((_var, _) => {
      _var.Renamed = true
      
      let i = 0
      while (_var.UsedNameArray[i]) {
          i++
      }

      _var.Rename(varIndexToValidName(i))

      if (_var.Scope) {

          allVariables.forEach((otherVar) => {
              if (!otherVar.Renamed) {
                  if (!otherVar.Scope || otherVar.Scope.Depth < _var.Scope.Depth) {
                      otherVar.ReferenceLocationList.some((refAt) => {
                          if (refAt >= _var.BeginLocation && refAt <= _var.ScopeEndLocation) {
                              otherVar.UsedNameArray[i] = true
                              return true
                          }
                          return false
                      })
                  } else if(otherVar.Scope.Depth > _var.Scope.Depth) {
                      _var.ReferenceLocationList.some((refAt) => {
                          if (refAt >= otherVar.BeginLocation && refAt <= otherVar.ScopeEndLocation) {
                              otherVar.UsedNameArray[i] = true
                              return true
                          }
                          return false
                      })
                  } else {
                      if (_var.BeginLocation < otherVar.EndLocation && _var.EndLocation > otherVar.BeginLocation) {
                         otherVar.UsedNameArray[i] = true
                      }
                  }
              }
          })
      } else {
          allVariables.forEach((otherVar) => {
              if (!otherVar.Renamed) {
                  if (otherVar.Type == "Global") {
                      otherVar.UsedNameArray[i] = true
                  } else if(otherVar.Type == "Local") {

                      _var.ReferenceLocationList.some((refAt) => {
                          if (refAt >= otherVar.BeginLocation && refAt <= otherVar.ScopeEndLocation) {
                              otherVar.UsedNameArray[i] = true
                              return true
                          }

                          return false
                      })
                  } else {
                      throw "Unreachable"
                  }
              }
          })
      }
  })
}

function BeautifyVariables(globalScope, rootScope, renameGlobals) {
  let externalGlobals = []
   globalScope.forEach((_var) => {
      if (!_var.AssignedTo || !renameGlobals) {
          externalGlobals[_var.Name] = true
      }
  })

  let localNumber = 1
  let globalNumber = 1
  function setVarName(_var, name) {
      _var.Name = name
      _var.RenameList.forEach((setter) => {
          setter(name)
      })
  }
  if (renameGlobals) {
      globalScope.forEach((_var) => {
          if (_var.AssignedTo) {
              setVarName(_var, `G_${globalNumber}_`)
              globalNumber++
          }
      })
  }

  function modify(scope) {
      scope.VariableList.forEach((_var) => {
          let name = `L_${localNumber}_`
          if (_var.Info.Type == "Argument") {
              name = `${name}arg${_var.Info.Index}`
          } else if(_var.Info.Type == "LocalFunction") {
              name = `${name}func`
          } else if(_var.Info.Type == "ForRange") {
              name = `${name}forvar${_var.Info.Index}`
          }
          setVarName(_var, name)
          localNumber++
      })
      scope.ChildScopeList.forEach((scope1) => {
          modify(scope1)
      })
  }
  
  modify(rootScope)
}


function UglifyVariables(globalScope, rootScope, renameGlobals) {
  let globalUsedNames = []
  for (var [kw, _] of Object.entries(Keywords)) {
      globalUsedNames[kw] = true
  }

  let allVariables = []
  let allLocalVariables = []
  
  
  globalScope.forEach((_var) => {
      if (_var.AssignedTo && renameGlobals) {
          allVariables.push(_var)
      } else {
          globalUsedNames[_var.Name] = true
      }
  })

  function addFrom(scope) {
      scope.VariableList.forEach((_var) => {
          allVariables.push(_var)
          allLocalVariables.push(_var)
      })
      scope.ChildScopeList.forEach((childScope) => {
          addFrom(childScope)
      })
  }
  addFrom(rootScope)

  allVariables.forEach((_var) => {
      _var.UsedNameArray = []
  })

  allVariables.sort((a, b) => a - b)

  let nextValidNameIndex = 0
  let varNamesLazy = []

  let uglyNames = []
  function generateUglyName(i) {
      if (uglyNames[i]) {
          return uglyNames[i]
      }
      function OwOIfy(str) {

          return str.split('').map(v=>{

              let c = Math.round(Math.random())
              if (c && v.toLowerCase() !== 'w') return v.toUpperCase();
              return v;

          }).join('')

      }
      const vars = ['owo', 'uwu', 'Uwu','uwU', 'Owo', 'owO', 'uWu', 'oWo', 'UwU', 'OwO'] // UGLY


      function gen() {
          let a = ""
          for (let i = 0; i<=20; i++) {
              let num = Math.floor(Math.random() * vars.length)
              a+= num !== 3? OwOIfy(vars[num]) : vars[num]
          }
          return a
      }

      let gamer = gen()
      while (uglyNames.includes(gamer))
          gamer = gen();

      uglyNames.push(gamer)

      return gamer
  }

  function varIndexToValidName(i) {
      let name = varNamesLazy[i]
      if (name == null) {
          name = generateUglyName(nextValidNameIndex)
          nextValidNameIndex++
          while (globalUsedNames[name]) {
              name = generateUglyName(nextValidNameIndex)
              nextValidNameIndex++  
          }
          varNamesLazy[i] = name
      }
      return name
  }

  allVariables.forEach((_var, _) => {
      _var.Renamed = true
      
      let i = 0
      while (_var.UsedNameArray[i]) {
          i++
      }

      _var.Rename(varIndexToValidName(i))

      if (_var.Scope) {

          allVariables.forEach((otherVar) => {
              if (!otherVar.Renamed) {
                  if (!otherVar.Scope || otherVar.Scope.Depth < _var.Scope.Depth) {
                      otherVar.ReferenceLocationList.some((refAt) => {
                          if (refAt >= _var.BeginLocation && refAt <= _var.ScopeEndLocation) {
                              otherVar.UsedNameArray[i] = true
                              return true
                          }
                          return false
                      })
                  } else if(otherVar.Scope.Depth > _var.Scope.Depth) {
                      _var.ReferenceLocationList.some((refAt) => {
                          if (refAt >= otherVar.BeginLocation && refAt <= otherVar.ScopeEndLocation) {
                              otherVar.UsedNameArray[i] = true
                              return true
                          }
                          return false
                      })
                  } else {
                      if (_var.BeginLocation < otherVar.EndLocation && _var.EndLocation > otherVar.BeginLocation) {
                         otherVar.UsedNameArray[i] = true
                      }
                  }
              }
          })
      } else {
          allVariables.forEach((otherVar) => {
              if (!otherVar.Renamed) {
                  if (otherVar.Type == "Global") {
                      otherVar.UsedNameArray[i] = true
                  } else if(otherVar.Type == "Local") {

                      _var.ReferenceLocationList.some((refAt) => {
                          if (refAt >= otherVar.BeginLocation && refAt <= otherVar.ScopeEndLocation) {
                              otherVar.UsedNameArray[i] = true
                              return true
                          }

                          return false
                      })
                  } else {
                      throw "Unreachable"
                  }
              }
          })
      }
  })
}


// hi

let luaminp = {}

luaminp.Minify = function(scr, options) {

  let ast = CreateLuaParser(scr)
  let [glb, root] = AddVariableInfo(ast)

  if (options.RenameVariables == true) {
      MinifyVariables_2(glb, root, options.RenameGlobals)
  }

  if (options.SolveMath == true) {
      SolveMath(ast) // oboy
  }

  StripAst(ast)

  let result = PrintAst(ast)
  result = `${result}`

  return result
}

luaminp.Beautify = function(scr, options) {
  // hack to allow anonymous functions
  let m = scr.match(/[^=]*\s*function\s*\(/)
  let fn
  if (m && m[0]) {
    fn = 'wago' + Date.now()
    scr = scr.replace(/[^=]*\s*function\s*\(/, `function ${fn} (`)
  }
  let ast = CreateLuaParser(scr)
  let [glb, root] = AddVariableInfo(ast)

  if (options.RenameVariables) {
      BeautifyVariables(glb, root, options.RenameGlobals)
  }

  if (options.SolveMath == true) {
      SolveMath(ast) // oboy
  }

  FormatAst(ast)

  let result = PrintAst(ast)
  result = `${result}`

  if (m && m[0] && fn) {
    result = result.replace(`${fn} `, '')
  }

  return result.trim()
}

luaminp.Uglify = function(src1, options) {
  console.log("Sorry, but this is incredibly slow for large scripts.")

  let ast1 = CreateLuaParser(src1)
  let [glb1] = AddVariableInfo(ast1)

  let lol = []
  let alreadyAdded = []

  glb1.forEach((v) => {
      if (alreadyAdded[v.Name]) {
          /*v.RenameList.forEach((a, b) => {
              alreadyAdded[v.Name].RenameList.push(a)
              v.RenameList[b] = null
          })*/
          return
      }
      alreadyAdded[v.Name] = v

      ast1.SemicolonList = [{type: "Symbol", Source: ";", LeadingWhite: ""}].concat(ast1.SemicolonList)
      lol = [CreateLuaParser(`local ${v.Name} = ${v.Name}`).StatementList[0]].concat(lol)

      //v.AssignedTo = true
      /*v.RenameList.push((a) => {
          localstat.VarList[0].Source = a
      })*/
  })
  glb1 = null
  alreadyAdded = null

  shuffle(lol)
  lol.forEach((v, i) => {
      ast1.StatementList = [v].concat(ast1.StatementList)
      lol[i] = null
  })
  lol = null

  let src2 = PrintAst(ast1)
  ast1 = null

  let ast2 = CreateLuaParser(src2)
  Uglify(ast2)
  
  StripAst(ast2)

  let [glb2, root2] = AddVariableInfo(ast2)
  UglifyVariables(glb2, root2, options.RenameGlobals) // This is so fucking slow omg

  let result = PrintAst(ast2)
  result = `${result}`

  return result
}

export default {
  Beautify: luaminp.Beautify,
  Minify: luaminp.Minify,
  Uglify: luaminp.Uglify
}

//export {luaminp as luamin};