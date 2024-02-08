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
const TelemetryWrapper = require("vscode-extension-telemetry-wrapper");
const shared_1 = require("./shared");
const shared_2 = require("./shared");
const terraformShellManager_1 = require("./terraformShellManager");
const settingUtils_1 = require("./utils/settingUtils");
const terraformUtils_1 = require("./utils/terraformUtils");
const uiUtils_1 = require("./utils/uiUtils");
const workspaceUtils_1 = require("./utils/workspaceUtils");
let fileWatcher;
function activate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield terraformUtils_1.checkTerraformInstalled();
        yield TelemetryWrapper.initializeFromJsonFile(ctx.asAbsolutePath("./package.json"));
        initFileWatcher(ctx);
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.init", () => {
            terraformShellManager_1.terraformShellManager.getShell().runTerraformCmd(shared_1.TerraformCommand.Init);
        }));
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.plan", () => {
            terraformShellManager_1.terraformShellManager.getShell().runTerraformCmd(shared_1.TerraformCommand.Plan);
        }));
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.apply", () => {
            terraformShellManager_1.terraformShellManager.getShell().runTerraformCmd(shared_1.TerraformCommand.Apply);
        }));
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.destroy", () => {
            terraformShellManager_1.terraformShellManager.getShell().runTerraformCmd(shared_1.TerraformCommand.Destroy);
        }));
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.refresh", () => {
            terraformShellManager_1.terraformShellManager.getShell().runTerraformCmd(shared_1.TerraformCommand.Refresh);
        }));
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.validate", () => {
            terraformShellManager_1.terraformShellManager.getShell().runTerraformCmd(shared_1.TerraformCommand.Validate);
        }));
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.visualize", () => __awaiter(this, void 0, void 0, function* () {
            if (settingUtils_1.isTerminalSetToCloudShell()) {
                const choice = yield vscode.window.showInformationMessage("Visualization only works locally. Would you like to run it in the integrated terminal?", uiUtils_1.DialogOption.ok, uiUtils_1.DialogOption.cancel);
                if (choice === uiUtils_1.DialogOption.cancel) {
                    return;
                }
            }
            yield terraformShellManager_1.terraformShellManager.getIntegratedShell().visualize();
        })));
        ctx.subscriptions.push(vscode.commands.registerCommand("azureTerraform.exectest", () => __awaiter(this, void 0, void 0, function* () {
            const pick = yield vscode.window.showQuickPick([shared_2.TestOption.lint, shared_2.TestOption.e2e, shared_2.TestOption.custom], { placeHolder: "Select the type of test that you want to run" });
            if (!pick) {
                return;
            }
            const workingDirectory = yield workspaceUtils_1.selectWorkspaceFolder();
            if (!workingDirectory) {
                return;
            }
            yield terraformShellManager_1.terraformShellManager.getShell().runTerraformTests(pick, workingDirectory);
        })));
        ctx.subscriptions.push(TelemetryWrapper.instrumentOperationAsVsCodeCommand("azureTerraform.push", () => __awaiter(this, void 0, void 0, function* () {
            if (!settingUtils_1.isTerminalSetToCloudShell()) {
                vscode.window.showErrorMessage("Push function only available when using cloudshell.");
                return;
            }
            if (_.isEmpty(vscode.workspace.workspaceFolders)) {
                vscode.window.showInformationMessage("Please open a workspace in VS Code first.");
                return;
            }
            yield terraformShellManager_1.terraformShellManager.getCloudShell().pushFiles(yield vscode.workspace.findFiles(settingUtils_1.getSyncFileBlobPattern()));
        })));
    });
}
exports.activate = activate;
function deactivate() {
    terraformShellManager_1.terraformShellManager.dispose();
    if (fileWatcher) {
        fileWatcher.dispose();
    }
}
exports.deactivate = deactivate;
function initFileWatcher(ctx) {
    fileWatcher = vscode.workspace.createFileSystemWatcher(settingUtils_1.getSyncFileBlobPattern());
    ctx.subscriptions.push(fileWatcher.onDidDelete((deletedUri) => {
        if (settingUtils_1.isTerminalSetToCloudShell()) {
            terraformShellManager_1.terraformShellManager.getCloudShell().deleteFiles([deletedUri]);
        }
    }));
}
//# sourceMappingURL=extension.js.map