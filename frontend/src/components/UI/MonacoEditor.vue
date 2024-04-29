<template>
    <div>
        <div id="code-editor" :class="{readonly: this.readonly}"></div>
    </div>
</template>

<script>
import loader from "@monaco-editor/loader"
import { getHighlighter } from 'shiki'
import { shikiToMonaco } from '@shikijs/monaco'
import wowMacroLanguage from '../libs/wowMacro.language'

export default {
    props: {
        diffEditor: { type: Boolean, default: false }, 
        original: String,
        value: String,
        lang: {type: String, default: 'json'},
        readonly: { type: Boolean, default: false }, 
    },
    data () {
        return {
            editor: null,
            editorHeight: 50
        }
    },
    watch: {
        editorHeight() {
            if (this.editor) {
                this.editor.updateOptions({height: this.editorHeight})
            }
        },
        value() {
            if (this.editor && this.value !== this.getValue()) {
                this.setValue(this.value)
            }
        },
        lang() {
            if (!this.editor) return
            if (this.diffEditor) {
                const { original, modified } = this.editor.getModel()
                monaco.editor.setModelLanguage(original, this.lang)
                monaco.editor.setModelLanguage(modified, this.lang)
            }
            else {
                monaco.editor.setModelLanguage(this.editor.getModel(), this.lang)
            }
        },
    },
    methods: {
        setDiffModel(value, original) {
            const originalModel = monaco.editor.createModel(original, this.lang)
            const modifiedModel = monaco.editor.createModel(value, this.lang)
            this.editor.setModel({
                original: originalModel,
                modified: modifiedModel
            })
        },

        getSelf() {
            if (!this.editor) return null
            return this.diffEditor ? this.editor.modifiedEditor : this.editor
        },

        setValue(value) {
            let editor = this.getSelf()
            if(editor) return editor.setValue(value)
        },

        getValue() {
            let editor = this.getSelf()
            if (!editor) return ''
            return editor.getValue()
        },

        resizeEditor() {
            if (this.editor) {
                this.editor.layout({
                    width: document.getElementById('code-editor').offsetWidth - 8 , 
                    height: (Math.min(this.editor.getModel().getLineCount(), 100) + (this.readonly ? 0 : 3)) * 19
                })
            }
        }
    },
    mounted: async function() {
        const highlighter = await getHighlighter({
            themes: [
                wowMacroLanguage.theme,
            ],
            langs: [
                'json',
                'lua',                
                {"scopeName": "source.wowMacro"}
            ],
        })

        const editorOptions = {
            minimap: {enabled: (this.value.match(/\n/g) || []).length > 50}
        }
        if (this.readonly) {
            editorOptions.readOnly = true
            editorOptions.lineNumbers = false
            editorOptions.lineDecorationsWidth = 2
            editorOptions.minimap = { enabled: false }
            editorOptions.overviewRulerLanes = 0
            editorOptions.hideCursorInOverviewRuler = true
            editorOptions.scrollbar = {vertical: 'hidden'}
            editorOptions.overviewRulerBorder = false
            editorOptions.selectionHighlight = false
            editorOptions.glyphMargin = false
            editorOptions.folding = false
        }

        const _this = this
        loader.init().then(async (monaco) => {
            if (_this.lang === 'wowMacro') {
                monaco.languages.register({id: 'wowMacro'})
                monaco.languages.setMonarchTokensProvider('wowMacro', wowMacroLanguage.tokenProvider)
                // monaco.editor.defineTheme('wowMacro', wowMacroLanguage.theme)
                // _this.options.theme = 'wowMacro'
            }
            shikiToMonaco(highlighter, monaco)
            _this.editor = monaco.editor[_this.diffEditor ? 'createDiffEditor' : 'create'](document.getElementById("code-editor"), {
                value: _this.value,
                languages: ['json', 'lua', 'wowMacro'],
                language: _this.lang,
                wordWrap: (this.lang !== 'json'),
                ...editorOptions
            })
            
            _this.resizeEditor()

            if (_this.diffEditor) {
                _this.setDiffModel(_this.value, _this.original)
            }
            else {
                _this.editor.onDidChangeModelContent(event => {
                    _this.$emit('change', _this.getValue(), event)
                    _this.$emit('input', _this.getValue())
                    _this.resizeEditor()
                })
            }
        })
    },
    computed: {
        // User () {
        //   return this.$store.state.user
        // },
    }
}
</script>

<style scoped>
#code-editor {
    width: 100%;
    min-height: 5rem;
}
</style>
<style>
.monaco-editor .view-line:has(.mtk30) {
    background: #1A1A1A;
    border: 1px solid #003322;
}
.monaco-editor .view-line:has(.mtk32) {
    background: #2A1A1A;
    border: 1px solid #332222;
}
.readonly .monaco-editor .current-line, 
.readonly .monaco-editor .wordHighlightText,
.readonly .monaco-editor .cursors-layer {
    display: none!important;
}

</style>
