'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    let request = require('request');
    let fs = require('fs');
    let output = vscode.window.createOutputChannel("Jenkins Pipeline Linter");
    let lastInput;
    let validate = vscode.commands.registerCommand('jenkins.pipeline.linter.connector.validate', () => __awaiter(this, void 0, void 0, function* () {
        let url = vscode.workspace.getConfiguration().get('jenkins.pipeline.linter.connector.url');
        let user = vscode.workspace.getConfiguration().get('jenkins.pipeline.linter.connector.user');
        let pass = vscode.workspace.getConfiguration().get('jenkins.pipeline.linter.connector.pass');
        let token = vscode.workspace.getConfiguration().get('jenkins.pipeline.linter.connector.token');
        let crumbUrl = vscode.workspace.getConfiguration().get('jenkins.pipeline.linter.connector.crumbUrl');
        let strictssl = vscode.workspace.getConfiguration().get('jenkins.pipeline.linter.connector.strictssl');
        if (url === undefined || url.length === 0) {
            url = yield vscode.window.showInputBox({ prompt: 'Enter Jenkins Pipeline Linter Url.', value: lastInput });
        }
        if ((user !== undefined && user.length > 0) && (pass === undefined || pass.length === 0) && (token === undefined || token.length === 0)) {
            pass = yield vscode.window.showInputBox({ prompt: 'Enter password.', password: true });
            if (pass === undefined || pass.length === 0) {
                token = yield vscode.window.showInputBox({ prompt: 'Enter token.', password: false });
            }
        }
        if (url !== undefined && url.length > 0) {
            lastInput = url;
            if (crumbUrl !== undefined && crumbUrl.length > 0) {
                requestCrumb(fs, request, url, crumbUrl, user, pass, token, strictssl, output);
            }
            else {
                validateRequest(fs, request, url, user, pass, token, undefined, strictssl, output);
            }
        }
        else {
            output.appendLine('Jenkins Pipeline Linter Url is not defined.');
        }
        output.show(true);
    }));
    context.subscriptions.push(validate);
}
exports.activate = activate;
function requestCrumb(fs, request, url, crumbUrl, user, pass, token, strictssl, output) {
    let options = {
        method: 'GET',
        url: crumbUrl,
        strictSSL: strictssl
    };
    if (user !== undefined && user.length > 0) {
        if (pass !== undefined && pass.length > 0) {
            options.auth = {
                'user': user,
                'pass': pass
            };
        }
        else if (token !== undefined && token.length > 0) {
            let authToken = new Buffer(user + ':' + token).toString('base64');
            options.headers = Object.assign(options.headers, { Authorization: 'Basic ' + authToken });
        }
    }
    request(options, (err, httpResponse, body) => {
        if (err) {
            output.appendLine(err);
        }
        else {
            validateRequest(fs, request, url, user, pass, token, body, strictssl, output);
        }
    });
}
function validateRequest(fs, request, url, user, pass, token, crumb, strictssl, output) {
    output.clear();
    let activeTextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor !== undefined) {
        let path = activeTextEditor.document.uri.fsPath;
        let filestream = fs.createReadStream(path);
        const chunks = [];
        filestream.on('data', (chunk) => {
            chunks.push(chunk.toString());
        });
        filestream.on('end', () => {
            let options = {
                method: 'POST',
                url: url,
                strictSSL: strictssl,
                formData: {
                    'jenkinsfile': chunks.join()
                },
                headers: {}
            };
            if (crumb !== undefined && crumb.length > 0) {
                let crumbSplit = crumb.split(':');
                options.headers = Object.assign(options.headers, { 'Jenkins-Crumb': crumbSplit[1] });
            }
            if (user !== undefined && user.length > 0) {
                if (pass !== undefined && pass.length > 0) {
                    options.auth = {
                        'user': user,
                        'pass': pass
                    };
                }
                else if (token !== undefined && token.length > 0) {
                    let authToken = new Buffer(user + ':' + token).toString('base64');
                    options.headers = Object.assign(options.headers, { Authorization: 'Basic ' + authToken });
                }
            }
            request(options, (err, httpResponse, body) => {
                if (err) {
                    output.appendLine(err);
                }
                else {
                    output.appendLine(body);
                }
            });
        });
    }
    else {
        output.appendLine('No active text editor. Open the jenkinsfile you want to validate.');
    }
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map