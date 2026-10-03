/* ==========================================================
   SYNTAX HIGHLIGHTING (shared by practice.html and snippets.html)
   Works out a "token type" (keyword, string, number, ...) for
   every character of a piece of code.

   tokenize(code, language) returns an array with one entry per
   character: 'kw', 'str', 'num', 'com', 'fn', 'cls' or null.
   Supported languages: javascript, python, java, sql.
   ========================================================== */

const LANGUAGES = {

    javascript: {
        keywords: new Set([
            'const', 'let', 'var', 'function', 'return', 'if', 'else',
            'for', 'while', 'new', 'class', 'this', 'null', 'undefined',
            'true', 'false', 'of', 'in', 'typeof', 'async', 'await',
            'try', 'catch', 'finally', 'throw', 'extends', 'static',
            'switch', 'case', 'break', 'continue', 'default', 'delete'
        ]),
        highlightClasses: true,
        rules: [
            ['com',  /\/\/.*|\/\*[\s\S]*?\*\//y],
            ['str',  /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y],
            // Regular expression such as /\s+/ (only right after "(").
            ['str',  /(?<=\()\/(?:\\.|[^\/\\\n])+\/[a-z]*/y],
            ['num',  /\d+(?:\.\d+)?/y],
            ['word', /[A-Za-z_$][\w$]*/y]
        ]
    },

    python: {
        keywords: new Set([
            'def', 'class', 'return', 'if', 'elif', 'else', 'for',
            'while', 'in', 'not', 'and', 'or', 'is', 'import', 'from',
            'as', 'pass', 'with', 'try', 'except', 'lambda', 'self',
            'None', 'True', 'False', 'raise', 'finally', 'yield',
            'break', 'continue', 'assert', 'global', 'del', 'async',
            'await'
        ]),
        highlightClasses: true,
        rules: [
            ['com',  /#.*/y],
            ['str',  /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y],
            ['num',  /\d+(?:\.\d+)?/y],
            ['word', /[A-Za-z_]\w*/y]
        ]
    },

    java: {
        keywords: new Set([
            'public', 'private', 'protected', 'static', 'final', 'void',
            'class', 'int', 'double', 'boolean', 'new', 'return', 'if',
            'else', 'for', 'while', 'import', 'this', 'null', 'true',
            'false', 'try', 'catch', 'finally', 'throw', 'throws',
            'extends', 'implements', 'interface', 'abstract', 'switch',
            'case', 'break', 'continue', 'default', 'instanceof',
            'super', 'long', 'float', 'char', 'byte', 'short', 'enum',
            'package'
        ]),
        highlightClasses: true,
        rules: [
            ['com',  /\/\/.*|\/\*[\s\S]*?\*\//y],
            ['str',  /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y],
            ['num',  /\d+(?:\.\d+)?/y],
            ['word', /[A-Za-z_$][\w$]*/y]
        ]
    },

    sql: {
        // SQL is not case-sensitive, so keywords are compared in UPPERCASE.
        ignoreCase: true,
        keywords: new Set([
            'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES',
            'UPDATE', 'SET', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'ON',
            'GROUP', 'BY', 'ORDER', 'HAVING', 'AS', 'DESC', 'ASC',
            'AND', 'OR', 'NOT', 'NULL', 'WITH', 'CASE', 'WHEN', 'THEN',
            'ELSE', 'END', 'LIMIT', 'OFFSET', 'DISTINCT', 'LIKE', 'IN',
            'IS', 'BETWEEN', 'EXISTS', 'UNION', 'CREATE', 'TABLE',
            'DELETE', 'FULL', 'OUTER', 'CROSS', 'OVER', 'PARTITION',
            'RECURSIVE', 'ALL', 'PRIMARY', 'KEY', 'AUTOINCREMENT', 'CHECK',
            'DEFAULT', 'FOREIGN', 'REFERENCES', 'CURRENT_TIMESTAMP',
            'INTEGER', 'REAL', 'TEXT', 'UNIQUE', 'INDEX'
        ]),
        highlightClasses: false,
        rules: [
            ['com',  /--.*/y],
            ['str',  /'(?:''|[^'])*'/y],
            ['num',  /\d+(?:\.\d+)?/y],
            ['word', /[A-Za-z_]\w*/y]
        ]
    }
};


/* Decide what kind of word this is: keyword, function call,
   class/type name, or plain text (null). */
function classifyWord(word, code, end, spec) {
    const key = spec.ignoreCase ? word.toUpperCase() : word;

    if (spec.keywords.has(key)) return 'kw';
    if (code[end] === '(') return 'fn';
    if (spec.highlightClasses && /^[A-Z]/.test(word)) return 'cls';

    return null;
}


/* Returns an array with one token type (or null) per character. */
function tokenize(code, lang) {
    const types = new Array(code.length).fill(null);
    const spec = LANGUAGES[lang];

    if (!spec) return types;

    let i = 0;

    while (i < code.length) {
        let matched = false;

        for (const [type, re] of spec.rules) {
            re.lastIndex = i;
            const m = re.exec(code);

            if (m && m[0].length > 0) {
                const end = i + m[0].length;
                const t = type === 'word'
                    ? classifyWord(m[0], code, end, spec)
                    : type;

                if (t) types.fill(t, i, end);

                i = end;
                matched = true;
                break;
            }
        }

        // Spaces, punctuation and operators stay uncoloured.
        if (!matched) i++;
    }

    return types;
}