"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolProvider = void 0;
const vscode = __importStar(require("vscode"));
class SymbolProvider {
    provideDocumentSymbols(document, token) {
        const symbols = [];
        let depth = 0;
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const text = line.text;
            const textLowerCase = text.toLowerCase();
            let openBrackets = textLowerCase.match(/\{/g) || [];
            let closeBrackets = textLowerCase.match(/\}/g) || [];
            const depthsMap = new Map();
            const newDepth = depth + openBrackets.length - closeBrackets.length;
            if (newDepth > depth) {
                const words = text.trim().match(/\w*/) || ['???'];
                let word = '?';
                if (words.length) {
                    word = words[0];
                }
                const symbol = new vscode.DocumentSymbol(word, 'stepDetail', vscode.SymbolKind.Function, new vscode.Range(new vscode.Position(i, 0), new vscode.Position(0, 0)), new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, text.length - 1)));
                depthsMap.set(newDepth, symbol);
                console.log(word + ' added');
            }
            else if (newDepth < depth && depthsMap.has(depth)) {
                const symbol = depthsMap.get(depth);
                symbol.range = new vscode.Range(symbol.range.start, new vscode.Position(i, text.length - 1));
                symbols.push(symbol);
                depthsMap.delete(depth);
            }
            depth = newDepth;
            console.log(`line ${i} depth=${depth} ${text.trim().substr(0, 10)}`);
        }
        console.log(`total = ${symbols.length} symbols`);
        return symbols;
    }
}
exports.SymbolProvider = SymbolProvider;
//# sourceMappingURL=symbol-provider.js.map