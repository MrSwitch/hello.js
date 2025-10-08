/**
 * JavaScript Code Editor Implementation
 * Uses CodeMirror for syntax highlighting and code editing features
 */

let editor; // Global editor instance

// Initialize the code editor with CodeMirror
function initCodeEditor() {
    // Get the textarea element
    const codeEditorElement = document.getElementById('code-editor');
    
    // If CodeMirror is available, replace the textarea with CodeMirror
    if (typeof CodeMirror !== 'undefined') {
        // Initialize CodeMirror
        editor = CodeMirror.fromTextArea(codeEditorElement, {
            mode: 'javascript',
            theme: 'monokai',
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            extraKeys: {
                "Tab": function(cm) {
                    if (cm.somethingSelected()) {
                        cm.indentSelection("add");
                    } else {
                        cm.replaceSelection(" ".repeat(cm.getOption("indentUnit")), "end", "+input");
                    }
                }
            }
        });
        
        // Set initial content
        editor.setValue(challenges[document.getElementById('challenge-select').value].initialCode);
        
        // Auto-resize editor based on content
        editor.setSize(null, 'auto');
        editor.setOption('viewportMargin', Infinity);
    }
}

// Get code from the editor
function getCode() {
    if (editor) {
        return editor.getValue();
    } else {
        return document.getElementById('code-editor').value;
    }
}

// Set code in the editor
function setCode(code) {
    if (editor) {
        editor.setValue(code);
    } else {
        document.getElementById('code-editor').value = code;
    }
}

// Update the editor when a new challenge is selected
function updateEditorContent(code) {
    setCode(code);
}