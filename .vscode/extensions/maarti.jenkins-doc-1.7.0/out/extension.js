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
exports.deactivate = exports.activate = exports.directiveCompletions = exports.sectionCompletions = exports.envVarCompletions = exports.stepCompletions = exports.docs = void 0;
const vscode = __importStar(require("vscode"));
const completion_provider_1 = require("./completion-provider");
const go_definition_provider_1 = require("./go-definition-provider");
const hover_provider_1 = require("./hover-provider");
const jenkins_data_json_1 = __importDefault(require("./jenkins-data.json"));
/** Map containing all Jenkins documentation data indexed by their instruction name */
exports.docs = new Map();
exports.stepCompletions = [];
exports.envVarCompletions = [];
exports.sectionCompletions = [];
exports.directiveCompletions = [];
function activate(context) {
    console.log('Extension "jenkins-doc" is now active');
    initDocMap();
    initEnvVarCompletionArray();
    initSectionCompletionArray();
    initDirectiveCompletionArray();
    initStepCompletionArray();
    const groovyFileSelector = {
        language: 'groovy', // Known language identifiers list: https://code.visualstudio.com/docs/languages/identifiers
    };
    const hoverRegistration = vscode.languages.registerHoverProvider(groovyFileSelector, new hover_provider_1.HoverProvider());
    const completionRegistration = vscode.languages.registerCompletionItemProvider(groovyFileSelector, new completion_provider_1.CompletionProvider());
    const goToDefinitionRegistration = vscode.languages.registerDefinitionProvider(groovyFileSelector, new go_definition_provider_1.GoDefinitionProvider());
    context.subscriptions.push(hoverRegistration, completionRegistration, goToDefinitionRegistration);
}
exports.activate = activate;
function deactivate() {
    console.log('jenkins-doc deactivated');
}
exports.deactivate = deactivate;
function initDocMap() {
    console.log('Hovering Documentation map initialization...');
    // Jenkins instructions
    jenkins_data_json_1.default.instructions.forEach(instruction => {
        const markdowns = [];
        markdowns.push(new vscode.MarkdownString(`**${instruction.name}**\n\n${instruction.description}`));
        instruction.parameters.forEach(parameter => {
            const markdown = new vscode.MarkdownString();
            const optionalLabel = parameter.isOptional ? '*(Optional)*' : '';
            markdown.appendMarkdown(`\`${parameter.name}\`: **${parameter.type}** ${optionalLabel}\n\n`);
            parameter.values.forEach(value => markdown.appendMarkdown(`* ${value}\n`));
            markdown.appendMarkdown(`\n`);
            markdown.appendMarkdown(`${parameter.description}`);
            markdowns.push(markdown);
        });
        if (instruction.url) {
            markdowns.push(new vscode.MarkdownString(`[See documentation](${instruction.url})`));
        }
        exports.docs.set(instruction.command, markdowns);
    });
    // Jenkins env variables
    jenkins_data_json_1.default.environmentVariables.forEach(envVar => {
        const markdowns = [];
        markdowns.push(new vscode.MarkdownString(`**${envVar.name}**\n\n${envVar.description}`), new vscode.MarkdownString('Referencing or using environment variables can be accomplished like accessing any key in a Groovy Map, for example:').appendCodeblock(`step {\n    echo "${envVar.name} is: \${env.${envVar.name}}"\n}`, 'groovy'), new vscode.MarkdownString('The full list of environment variables accessible from within Jenkins Pipeline is documented at ${YOUR_JENKINS_URL}/pipeline-syntax/globals#env')),
            exports.docs.set(envVar.name, markdowns);
    });
    console.log(`Hovering Documentation map initialized with ${exports.docs.size} entries`);
    // Jenkins Sections/Directives
    [...jenkins_data_json_1.default.sections, ...jenkins_data_json_1.default.directives].forEach(section => {
        const markdowns = [];
        const optionalLabel = section.isOptional ? '*(Optional)*' : '';
        markdowns.push(new vscode.MarkdownString(`**${section.name}** ${optionalLabel}\n\n${section.description}`));
        markdowns.push(new vscode.MarkdownString(`**Allowed:** ${section.allowed}`));
        if (section.url) {
            markdowns.push(new vscode.MarkdownString(`[See documentation](${section.url})`));
        }
        exports.docs.set(section.name, markdowns);
    });
}
function initEnvVarCompletionArray() {
    console.log('Env Var completion array initialization...');
    exports.envVarCompletions.push(...jenkins_data_json_1.default.environmentVariables.map(envVar => {
        const completion = new vscode.CompletionItem(envVar.name);
        completion.insertText = new vscode.SnippetString(`env.${envVar.name}`);
        completion.detail = 'Jenkins Environment Variable';
        completion.documentation = new vscode.MarkdownString(envVar.description);
        completion.kind = vscode.CompletionItemKind.Variable;
        completion.sortText = '99';
        return completion;
    }));
    const envCompletion = new vscode.CompletionItem('env', vscode.CompletionItemKind.Variable);
    envCompletion.command = {
        command: 'editor.action.triggerSuggest',
        title: 'Trigger environment variables autocompletion',
    };
    envCompletion.insertText = 'env.';
    envCompletion.detail = 'Jenkins Environment Variable';
    envCompletion.sortText = '99';
    envCompletion.documentation = new vscode.MarkdownString('The full list of environment variables accessible from within Jenkins Pipeline is documented at ${YOUR_JENKINS_URL}/pipeline-syntax/globals#env');
    exports.stepCompletions.push(envCompletion);
    console.log(`Env Var completion array initialized with ${exports.envVarCompletions.length} entries`);
}
function initSectionCompletionArray() {
    console.log('Section completion array initialization...');
    exports.sectionCompletions.push(...jenkins_data_json_1.default.sections.map(sectionOrDirectiveToCompletion));
    console.log(`Section completion array initialized with ${exports.sectionCompletions.length} entries`);
}
function initDirectiveCompletionArray() {
    console.log('Directive completion array initialization...');
    exports.directiveCompletions.push(...jenkins_data_json_1.default.directives.map(sectionOrDirectiveToCompletion));
    console.log(`Directive completion array initialized with ${exports.directiveCompletions.length} entries`);
}
function initStepCompletionArray() {
    console.log('Step completion array initialization...');
    exports.stepCompletions.push(...jenkins_data_json_1.default.instructions.map(instruction => {
        const completion = new vscode.CompletionItem(instruction.command);
        if (instruction.parameters.length) {
            completion.command = {
                command: 'editor.action.triggerSuggest',
                title: 'Trigger parameters autocompletion',
            };
            completion.insertText = new vscode.SnippetString(`${instruction.command}($0)`);
        }
        else {
            completion.insertText = new vscode.SnippetString(`${instruction.command}()`);
        }
        completion.detail = `Jenkins (${instruction.plugin}) Step`;
        completion.documentation = new vscode.MarkdownString(instruction.description);
        completion.kind = vscode.CompletionItemKind.Function;
        completion.sortText = '99';
        return completion;
    }));
    console.log(`Step completion array initialized with ${exports.stepCompletions.length} entries`);
}
function sectionOrDirectiveToCompletion(instruction) {
    const completion = new vscode.CompletionItem(instruction.name);
    completion.detail =
        instruction.instructionType === 'Section' ? 'Jenkins Section' : 'Jenkins Directive';
    completion.documentation = new vscode.MarkdownString(instruction.description);
    completion.kind = vscode.CompletionItemKind.Class;
    completion.sortText = '99';
    if (instruction.innerInstructions.length) {
        const enumValues = instruction.innerInstructions.join(',');
        completion.insertText = new vscode.SnippetString(`${instruction.name}{\n    \${1|${enumValues}|}\n}`);
    }
    return completion;
}
//# sourceMappingURL=extension.js.map