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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
const extension_1 = require("./extension");
const jenkins_data_json_1 = __importDefault(require("./jenkins-data.json"));
class CompletionProvider {
    provideCompletionItems(document, position, token, context) {
        const completions = [
            ...extension_1.stepCompletions,
            ...extension_1.sectionCompletions,
            ...extension_1.directiveCompletions,
        ];
        let previousLine = '';
        if (position.line) {
            const previousLinePosition = new vscode.Position(position.line - 1, position.character);
            previousLine = document.lineAt(previousLinePosition).text;
        }
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const linesPrefix = previousLine + '\n' + linePrefix;
        // "env." autocompletion
        if (linePrefix.match(/(env)\.\w*$/)) {
            completions.push(...extension_1.envVarCompletions.map(completion => (Object.assign(Object.assign({}, completion), { insertText: completion.label, sortText: '1', preselect: true }))));
        }
        else {
            completions.push(...extension_1.envVarCompletions);
        }
        // Inside a post{}
        if (linesPrefix.match(/(post\s*{\s*\w*)$/)) {
            const postSection = jenkins_data_json_1.default.sections.find(section => section.name === 'post');
            if (postSection) {
                completions.push(...postSection.innerInstructions.map(innerInstruction => {
                    const completion = new vscode.CompletionItem(innerInstruction, vscode.CompletionItemKind.Class);
                    completion.detail = 'Jenkins Post-condition';
                    completion.insertText = new vscode.SnippetString(`${innerInstruction} {\n    $0\n}`);
                    completion.sortText = '2';
                    completion.preselect = true;
                    return completion;
                }));
            }
        }
        // Function parameters autocompletion
        // Get the first word preceding a space or parenthesis, after the last opening brace { of the line
        const instructionMatch = linePrefix.match(/{?\s*(\w+)\s*[( ](?!.*[{(])/) || [];
        if (instructionMatch.length > 1) {
            const command = instructionMatch[1];
            const instruction = jenkins_data_json_1.default.instructions.find(instruction => instruction.command === command);
            if (instruction) {
                const paramCompletions = instruction.parameters.map(parameter => {
                    const completion = new vscode.CompletionItem(parameter.name, vscode.CompletionItemKind.Property);
                    completion.documentation = parseDocumentation(parameter);
                    completion.detail = `${parameter.type} ${parameter.isOptional ? '(Optional)' : ''}`;
                    completion.sortText = parameter.isOptional ? '12' : '11';
                    completion.preselect = true;
                    if (parameter.type === 'String') {
                        completion.insertText = new vscode.SnippetString(`${parameter.name}: '$0'`);
                    }
                    else if (parameter.type === 'boolean') {
                        completion.insertText = new vscode.SnippetString(`${parameter.name}: \${1|true,false|}`);
                    }
                    else if (parameter.type === 'Enum' && parameter.values.length) {
                        const enumValues = parameter.values.join(',');
                        completion.insertText = new vscode.SnippetString(`${parameter.name}: '\${1|${enumValues}|}'`);
                    }
                    else {
                        completion.insertText = `${parameter.name}: `;
                    }
                    return completion;
                });
                completions.push(...paramCompletions);
            }
        }
        return completions;
    }
}
exports.CompletionProvider = CompletionProvider;
function parseDocumentation(parameter) {
    let markdown = '';
    if (parameter.values.length) {
        markdown += parameter.values.map(value => `* ${value}\n`).join('');
        markdown += '\n';
    }
    if (parameter.description) {
        markdown += parameter.description;
    }
    return markdown ? new vscode.MarkdownString(markdown) : undefined;
}
//# sourceMappingURL=completion-provider.js.map