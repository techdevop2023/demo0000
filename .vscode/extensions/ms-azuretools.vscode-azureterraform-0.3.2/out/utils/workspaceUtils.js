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
const _ = require("lodash");
const vscode = require("vscode");
const uiUtils_1 = require("./uiUtils");
function selectWorkspaceFolder() {
    return __awaiter(this, void 0, void 0, function* () {
        let folder;
        if (!_.isEmpty(vscode.workspace.workspaceFolders)) {
            if (vscode.workspace.workspaceFolders.length > 1) {
                folder = yield vscode.window.showWorkspaceFolderPick({
                    placeHolder: "Select the working directory you wish to use",
                    ignoreFocusOut: true,
                });
            }
            else {
                folder = vscode.workspace.workspaceFolders[0];
            }
        }
        else {
            const response = yield vscode.window.showInformationMessage("There is no folder opened in current workspace, would you like to open a folder?", uiUtils_1.DialogOption.open, uiUtils_1.DialogOption.cancel);
            if (response === uiUtils_1.DialogOption.open) {
                const selectedFolder = yield uiUtils_1.showFolderDialog();
                if (selectedFolder) {
                    /**
                     * Open the selected folder in a workspace.
                     * NOTE: this will restart the extension host.
                     * See: https://github.com/Microsoft/vscode/issues/58
                     */
                    yield vscode.commands.executeCommand("vscode.openFolder", selectedFolder, false /* forceNewWindow */);
                }
            }
        }
        return folder ? folder.uri.fsPath : undefined;
    });
}
exports.selectWorkspaceFolder = selectWorkspaceFolder;
//# sourceMappingURL=workspaceUtils.js.map