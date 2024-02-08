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
const fsExtra = require("fs-extra");
const path = require("path");
const vscode = require("vscode");
const TelemetryWrapper = require("vscode-extension-telemetry-wrapper");
const baseShell_1 = require("./baseShell");
const constants_1 = require("./constants");
const shared_1 = require("./shared");
const terraformChannel_1 = require("./terraformChannel");
const cloudShellUtils_1 = require("./utils/cloudShellUtils");
const settingUtils = require("./utils/settingUtils");
const uiUtils_1 = require("./utils/uiUtils");
const workspaceUtils_1 = require("./utils/workspaceUtils");
class AzureCloudShell extends baseShell_1.BaseShell {
    pushFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            terraformChannel_1.terraformChannel.appendLine("Attempting to upload files to CloudShell...");
            if (yield this.connectedToCloudShell()) {
                const promises = [];
                for (const file of files.map((a) => a.fsPath)) {
                    promises.push(this.pushFilePromise(file));
                }
                try {
                    yield Promise.all(promises);
                    vscode.window.showInformationMessage("Synced all matched files in the current workspace to CloudShell");
                }
                catch (error) {
                    terraformChannel_1.terraformChannel.appendLine(error);
                    yield uiUtils_1.promptForOpenOutputChannel("Failed to push files to the cloud. Please open the output channel for more details.", uiUtils_1.DialogType.error);
                }
            }
        });
    }
    deleteFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const RETRY_TIMES = 3;
            if (!(yield this.connectedToCloudShell())) {
                terraformChannel_1.terraformChannel.appendLine(`cloud shell can not be opened, file deleting operation is not synced`);
                return;
            }
            for (const file of files.map((a) => a.fsPath)) {
                for (let i = 0; i < RETRY_TIMES; i++) {
                    try {
                        terraformChannel_1.terraformChannel.appendLine(`Deleting file ${file} from cloud shell`);
                        yield shared_1.azFileDelete(vscode.workspace.getWorkspaceFolder(vscode.Uri.file(file)).name, this.storageAccountName, this.storageAccountKey, this.fileShareName, file);
                        break;
                    }
                    catch (err) {
                        terraformChannel_1.terraformChannel.appendLine(err);
                    }
                }
            }
        });
    }
    runTerraformTests(testType, workingDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.connectedToCloudShell()) {
                const workspaceName = path.basename(workingDirectory);
                const setupFilesFolder = `${workspaceName}/.TFTesting`;
                const localPath = path.join(workingDirectory, ".TFTesting");
                const createAciScript = "createacitest.sh";
                const containerCommandScript = "containercmd.sh";
                const resourceGroup = settingUtils.getResourceGroupForTest();
                const aciName = settingUtils.getAciNameForTest();
                const aciGroup = settingUtils.getAciGroupForTest();
                const tfConfiguration = shared_1.escapeFile(constants_1.aciConfig(resourceGroup, aciName, aciGroup, this.storageAccountName, this.fileShareName, settingUtils.getLocationForTest(), settingUtils.getImageNameForTest(), workspaceName));
                const shellscript = constants_1.exportTestScript(tfConfiguration, this.resourceGroup, this.storageAccountName, setupFilesFolder);
                yield Promise.all([
                    fsExtra.outputFile(path.join(localPath, createAciScript), shellscript),
                    fsExtra.outputFile(path.join(localPath, containerCommandScript), constants_1.exportContainerCmd(workspaceName, yield this.resolveContainerCmd(testType))),
                ]);
                yield Promise.all([
                    shared_1.azFilePush(workspaceName, this.storageAccountName, this.storageAccountKey, this.fileShareName, path.join(localPath, createAciScript)),
                    shared_1.azFilePush(workspaceName, this.storageAccountName, this.storageAccountKey, this.fileShareName, path.join(localPath, containerCommandScript)),
                ]);
                yield vscode.commands.executeCommand("azureTerraform.push");
                const sentToTerminal = yield this.runTFCommand(`source ${createAciScript} && terraform fmt && terraform init && terraform apply -auto-approve && terraform taint azurerm_container_group.TFTest && \
                echo "\nRun the following command to get the logs from the ACI container: az container logs -g ${resourceGroup} -n ${aciGroup}\n"`, `${constants_1.Constants.clouddrive}/${setupFilesFolder}`);
                if (sentToTerminal) {
                    vscode.window.showInformationMessage(`An Azure Container Instance will be created in the Resource Group '${resourceGroup}' if the command executes successfully.`);
                }
                else {
                    vscode.window.showErrorMessage("Failed to send the command to terminal, please try it again.");
                }
            }
        });
    }
    runTerraformCmd(tfCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.connectedToCloudShell()) {
                const workingDirectory = yield workspaceUtils_1.selectWorkspaceFolder();
                yield this.runTFCommand(tfCommand, workingDirectory ? `${constants_1.Constants.clouddrive}/${path.basename(workingDirectory)}` : "");
            }
        });
    }
    dispose() {
        super.dispose();
        this.cloudShell = undefined;
        this.resourceGroup = undefined;
        this.storageAccountName = undefined;
        this.storageAccountKey = undefined;
        this.fileShareName = undefined;
    }
    initShellInternal() {
        vscode.window.onDidCloseTerminal((terminal) => __awaiter(this, void 0, void 0, function* () {
            if (terminal === this.terminal) {
                this.dispose();
            }
        }));
    }
    runTFCommand(command, workdir) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.terminal) {
                this.terminal.show();
                if (!(yield this.cloudShell.waitForConnection())) {
                    vscode.window.showErrorMessage("Establish connection to Cloud Shell failed, please try again later.");
                    TelemetryWrapper.sendError(Error("connectFail"));
                    return false;
                }
                if (workdir) {
                    this.terminal.sendText(`cd "${workdir}"`);
                }
                if (this.isCombinedWithPush(command)) {
                    yield vscode.commands.executeCommand("azureTerraform.push");
                }
                this.terminal.sendText(`${command}`);
                return true;
            }
            TelemetryWrapper.sendError(Error("sendToTerminalFail"));
            return false;
        });
    }
    connectedToCloudShell() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.terminal) {
                return true;
            }
            const message = "Do you want to open CloudShell?";
            const response = yield vscode.window.showWarningMessage(message, uiUtils_1.DialogOption.ok, uiUtils_1.DialogOption.cancel);
            if (response === uiUtils_1.DialogOption.ok) {
                const accountAPI = vscode.extensions
                    .getExtension("ms-vscode.azure-account").exports;
                this.cloudShell = accountAPI.createCloudShell("Linux");
                this.terminal = yield this.cloudShell.terminal;
                this.terminal.show();
                const storageAccount = yield cloudShellUtils_1.getStorageAccountforCloudShell(this.cloudShell);
                if (!storageAccount) {
                    vscode.window.showErrorMessage("Failed to get the Storage Account information for Cloud Shell, please try again later.");
                    return false;
                }
                this.resourceGroup = storageAccount.resourceGroup;
                this.storageAccountName = storageAccount.storageAccountName;
                this.storageAccountKey = storageAccount.storageAccountKey;
                this.fileShareName = storageAccount.fileShareName;
                terraformChannel_1.terraformChannel.appendLine("Cloudshell terminal opened.");
                return true;
            }
            console.log("Open CloudShell cancelled by user.");
            return false;
        });
    }
    pushFilePromise(file) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield fsExtra.pathExists(file)) {
                terraformChannel_1.terraformChannel.appendLine(`Uploading file ${file} to cloud shell`);
                yield shared_1.azFilePush(vscode.workspace.getWorkspaceFolder(vscode.Uri.file(file)).name, this.storageAccountName, this.storageAccountKey, this.fileShareName, file);
            }
        });
    }
    isCombinedWithPush(command) {
        switch (command) {
            case shared_1.TerraformCommand.Init:
            case shared_1.TerraformCommand.Plan:
            case shared_1.TerraformCommand.Apply:
            case shared_1.TerraformCommand.Validate:
                return true;
            default:
                return false;
        }
    }
    resolveContainerCmd(TestType) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (TestType) {
                case shared_1.TestOption.lint:
                    return "rake -f ../Rakefile build";
                case shared_1.TestOption.e2e:
                    return "ssh-keygen -t rsa -b 2048 -C terraformTest -f /root/.ssh/id_rsa -N ''; rake -f ../Rakefile e2e";
                case shared_1.TestOption.custom:
                    const cmd = yield vscode.window.showInputBox({
                        prompt: "Type your custom test command",
                        value: "rake -f ../Rakefile build",
                    });
                    return cmd ? cmd : "";
                default:
                    return "";
            }
        });
    }
}
exports.AzureCloudShell = AzureCloudShell;
//# sourceMappingURL=cloudShell.js.map