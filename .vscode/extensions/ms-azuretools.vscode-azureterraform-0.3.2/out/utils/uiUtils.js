/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const opn = require("opn");
const vscode = require("vscode");
const terraformChannel_1 = require("../terraformChannel");
function openUrlHintOrNotShowAgain(message, url, notShowCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield vscode.window.showInformationMessage(message, DialogOption.learnMore, DialogOption.notShownAgain);
        if (response === DialogOption.learnMore && url) {
            opn(url);
        }
        else if (response === DialogOption.notShownAgain) {
            notShowCallback();
        }
    });
}
exports.openUrlHintOrNotShowAgain = openUrlHintOrNotShowAgain;
function openUrlHint(message, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield vscode.window.showInformationMessage(message, DialogOption.learnMore, DialogOption.cancel);
        if (response === DialogOption.learnMore && url) {
            opn(url);
        }
    });
}
exports.openUrlHint = openUrlHint;
function showFolderDialog() {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultUri = vscode.workspace.rootPath ? vscode.Uri.file(vscode.workspace.rootPath) : undefined;
        const options = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: "Select",
            defaultUri,
        };
        const result = yield vscode.window.showOpenDialog(options);
        if (!result || result.length === 0) {
            return undefined;
        }
        return result[0];
    });
}
exports.showFolderDialog = showFolderDialog;
function promptForOpenOutputChannel(message, type) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        switch (type) {
            case DialogType.info:
                result = yield vscode.window.showInformationMessage(message, DialogOption.open, DialogOption.cancel);
                break;
            case DialogType.warning:
                result = yield vscode.window.showWarningMessage(message, DialogOption.open, DialogOption.cancel);
                break;
            case DialogType.error:
                result = yield vscode.window.showErrorMessage(message, DialogOption.open, DialogOption.cancel);
                break;
            default:
                break;
        }
        if (result === DialogOption.open) {
            terraformChannel_1.terraformChannel.show();
        }
    });
}
exports.promptForOpenOutputChannel = promptForOpenOutputChannel;
var DialogOption;
(function (DialogOption) {
    DialogOption.ok = { title: "OK" };
    DialogOption.cancel = { title: "Cancel", isCloseAffordance: true };
    DialogOption.open = { title: "Open" };
    DialogOption.learnMore = { title: "Learn More" };
    DialogOption.notShownAgain = { title: "Don't show again" };
})(DialogOption = exports.DialogOption || (exports.DialogOption = {}));
var DialogType;
(function (DialogType) {
    DialogType["info"] = "info";
    DialogType["warning"] = "warning";
    DialogType["error"] = "error";
})(DialogType = exports.DialogType || (exports.DialogType = {}));
//# sourceMappingURL=uiUtils.js.map