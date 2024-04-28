
// https://ohdarling88.medium.com/4-steps-to-add-custom-language-support-to-monaco-editor-5075eafa156d

import vitesseDark from 'shiki/themes/vitesse-dark.mjs'

export default {
    brackets: [['[',']','delimiter.square']],
    tokenProvider: {
        operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '>>>='
        ],
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    
        // we include these common regular expressions
        symbols:  /[=><!~?:&|+\-*/^%]+/,
    
        // The main tokenizer for our languages
        tokenizer: {
            root: [
                [ /^\/(run|script|console)\s+/i, {token: 'wow.luacommand', next: '@runlua', nextEmbedded: 'lua', bracket: '@open'} ],
                [ /^\/(reload|logout|camp|quit|enableaddons|disasbleaddons|guildquit|gquit)\b/i, {token: 'wow.slashcommand.warning'} ],
                [ /^#show(tooltip)?\b.*/i,  {token: 'wow.hashcommand'} ],
                [ /^\/[a-z]+\b/i, {token: 'wow.slashcommand'} ],
                [ /reset=[\w/]+/, 'wow.option.reset' ],
                [ /\s!/, 'wow.togglecommand' ],
                [ /%\w/, 'wow.chatreplacement' ],
                [ /\{\w+}/, 'wow.chatreplacement' ],
                [ /^#.*$/, 'comment' ],

                // whitespace
                { include: '@whitespace' },
        
                // delimiters and operators
                // [/[{}()[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, { cases: { '@operators': 'operator',
                                        '@default'  : '' } } ],
        
                // numbers
                [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],
        
                // delimiter: after number because of .\d floats
                [/[;,.]/, 'delimiter'],
        
                // strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                [/"/, 'string', '@string_double'],
                [/'/, 'string', '@string_single'],

                // options
                [/\[/, {token: 'wow.option.delimiter', next: '@option', bracket: '@open'}],
            ],
        
            comment: [
                [ /#.*/, 'comment' ],
            ],
            
            string_double: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ],

            string_single: [
                [/[^\\']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/'/, 'string', '@pop']
            ],
        
            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\/.*$/,    'comment'],
            ],

            option: [
                [ /(@[a-z]+)/, ['wow.option.target'] ],
                [ /([a-z]+:?)([\w/]*)/, ['wow.option.conditional', 'wow.option.value'] ],
                [ /([,="])/, ['wow.option.delimiter'] ],
                [ /\]/, { token: 'wow.option.delimiter', bracket: '@close', next: '@pop' } ],
            ],

            runlua: [
                [ /.+/, {cases: {
                    '@default': '',
                }} ],
                [ /$/, {token: '', bracket: '@close', next: '@pop', nextEmbedded: '@pop'} ],
            ]
        },
    },

    theme: {
        colors: {
            "editor.background": "#121212",
            "editor.foreground": "#dbd7caee",
        },
        displayName: "Vitesse Dark Custom",
        name: "vitesse-dark-custom",
        semanticHighlighting: true,
        tokenColors: vitesseDark.tokenColors.concat([
            {scope: ["wow.slashcommand"], settings: {foreground: "#80A665"}},
            {scope: ["wow.slashcommand.warning"], settings: {foreground: "#FF8645"}},
            {scope: ["wow.hashcommand"], settings: {foreground: "#b8a965"}},
            {scope: ["wow.togglecommand"], settings: {foreground: "#aaffff"}},
            {scope: ["wow.luacommand"], settings: {foreground: "#aaffcc"}},
            {scope: ["wow.chatreplacement"], settings: {foreground: "#aaffff"}},
            {scope: ["wow.option.delimiter"], settings: {foreground: "#775555"}},
            {scope: ["wow.option.target"], settings: {foreground: "#5DA994"}},
            {scope: ["wow.option.reset"], settings: {foreground: "#cb7676"}},
            {scope: ["wow.option.conditional"], settings: {foreground: "#cb7676"}},
            {scope: ["wow.option.value"], settings: {foreground: "#fdaeb7"}},
        ])
    },

    autoComplete: {}
}
  
