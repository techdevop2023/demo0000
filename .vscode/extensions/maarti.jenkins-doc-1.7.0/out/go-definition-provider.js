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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoDefinitionProvider = void 0;
const vscode = __importStar(require("vscode"));
class GoDefinitionProvider {
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const wordRange = document.getWordRangeAtPosition(position, /(?:\w+\.)?\w+/g);
            const clickedWords = document.getText(wordRange).split('.');
            if (clickedWords.length >= 2) {
                const [fileName, functionName] = clickedWords;
                console.log(`Clicked: ${fileName}.groovy => ${functionName}`);
                // Find files that have the same name of the clicked word
                // const pattern = `**/${fileName}.groovy`;
                const pattern = `**/*.groovy`;
                const location = vscode.workspace
                    .findFiles(pattern)
                    .then((uris) => __awaiter(this, void 0, void 0, function* () {
                    for (const uri of uris) {
                        const functionPosition = yield vscode.workspace.openTextDocument(uri).then(doc => {
                            return findFunctionInWholeDoc(doc, functionName);
                        });
                        if (functionPosition) {
                            return new Promise((resolve, reject) => {
                                resolve(new vscode.Location(uri, functionPosition));
                            });
                        }
                    }
                }));
                return location;
            }
            else {
                const fileOrfunction = clickedWords[0];
                console.log(`Clicked: ${fileOrfunction}`);
                // Check in the current file if a function is declared with this name
                const functionPosition = findFunctionInWholeDoc(document, fileOrfunction);
                if (functionPosition) {
                    return new Promise((resolve, reject) => {
                        resolve(new vscode.Location(document.uri, functionPosition));
                    });
                }
                // Check if a file has the same name of the clicked word
                const pattern = `**/${fileOrfunction}.groovy`;
                return vscode.workspace.findFiles(pattern).then(uris => {
                    return new Promise((resolve, reject) => {
                        resolve(new vscode.Location(uris[0], new vscode.Position(0, 0)));
                    });
                });
            }
        });
    }
}
exports.GoDefinitionProvider = GoDefinitionProvider;
// Check in a file if a function with the given name is declared
function findFunctionInDocLineByLine(document, functionName) {
    for (let i = 0; i < document.lineCount; i++) {
        const functionDeclarationRegex = new RegExp(`\\w+(?: \\w+)? (${functionName}) *\\(.*\\) *{`);
        if (document.lineAt(i).text.match(functionDeclarationRegex)) {
            return new vscode.Position(i, 0);
        }
    }
    return undefined;
}
function findFunctionInWholeDoc(document, functionName) {
    const firstLine = document.lineAt(0);
    const lastLine = document.lineAt(document.lineCount - 1);
    const textRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
    const content = document.getText(textRange);
    const functionDeclarationRegex = new RegExp(`\\w+(?: *\\w+)? +${functionName} *\\([^{}]*?\\)\\s*?{`, 's');
    const match = content.match(functionDeclarationRegex);
    if (match) {
        const line = content.substr(0, match.index).split(/\r?\n/).length - 1;
        return new vscode.Position(line, 0);
    }
    return undefined;
}
//# sourceMappingURL=go-definition-provider.js.map