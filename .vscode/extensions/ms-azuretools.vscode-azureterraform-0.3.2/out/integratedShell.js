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
const fse = require("fs-extra");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const TelemetryWrapper = require("vscode-extension-telemetry-wrapper");
const baseShell_1 = require("./baseShell");
const constants_1 = require("./constants");
const shared_1 = require("./shared");
const cpUtils_1 = require("./utils/cpUtils");
const dockerUtils_1 = require("./utils/dockerUtils");
const dotUtils_1 = require("./utils/dotUtils");
const dotUtils_2 = require("./utils/dotUtils");
const settingUtils = require("./utils/settingUtils");
const workspaceUtils_1 = require("./utils/workspaceUtils");
class IntegratedShell extends baseShell_1.BaseShell {
    // Creates a png of terraform resource graph to visualize the resources under management.
    visualize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield dotUtils_2.isDotInstalled())) {
                TelemetryWrapper.sendError(Error("dotNotInstalled"));
                return;
            }
            const cwd = yield workspaceUtils_1.selectWorkspaceFolder();
            if (!cwd) {
                TelemetryWrapper.sendError(Error("noWorkspaceSelected"));
                return;
            }
            yield this.deletePng(cwd);
            yield cpUtils_1.executeCommand("terraform", ["init"], {
                shell: true,
                cwd,
            });
            const output = yield cpUtils_1.executeCommand("terraform", ["graph"], {
                shell: true,
                cwd,
            });
            const tmpFile = path.join(os.tmpdir(), "terraformgraph.output");
            yield fse.writeFile(tmpFile, output);
            yield dotUtils_1.drawGraph(cwd, tmpFile);
            yield vscode_1.commands.executeCommand("vscode.open", vscode_1.Uri.file(path.join(cwd, IntegratedShell.GRAPH_FILE_NAME)), vscode_1.ViewColumn.Two);
        });
    }
    runTerraformTests(TestType, workingDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield dockerUtils_1.isDockerInstalled())) {
                TelemetryWrapper.sendError(Error("dockerNotInstalled"));
                return;
            }
            const containerName = settingUtils.getImageNameForTest();
            switch (TestType) {
                case shared_1.TestOption.lint:
                    yield dockerUtils_1.runLintInDocker(workingDirectory + ":/tf-test/module", containerName);
                    break;
                case shared_1.TestOption.e2e:
                    yield dockerUtils_1.runE2EInDocker(workingDirectory + ":/tf-test/module", containerName);
                    break;
                case shared_1.TestOption.custom:
                    const cmd = yield vscode.window.showInputBox({
                        prompt: "Type your custom test command",
                        value: `run -v ${workingDirectory}:/tf-test/module --rm ${containerName} rake -f ../Rakefile build`,
                    });
                    if (!cmd) {
                        return;
                    }
                    yield dockerUtils_1.runCustomCommandInDocker(cmd, containerName);
                    break;
                default:
                    break;
            }
        });
    }
    runTerraformCmd(tfCommand) {
        this.checkCreateTerminal();
        this.terminal.show();
        this.terminal.sendText(tfCommand);
    }
    initShellInternal() {
        vscode.window.onDidCloseTerminal((terminal) => {
            if (terminal === this.terminal) {
                this.dispose();
            }
        });
    }
    deletePng(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const graphPath = path.join(cwd, IntegratedShell.GRAPH_FILE_NAME);
            if (yield fse.pathExists(graphPath)) {
                yield fse.remove(graphPath);
            }
        });
    }
    checkCreateTerminal() {
        if (!this.terminal) {
            this.terminal = vscode.window.createTerminal(constants_1.Constants.TerraformTerminalName);
        }
    }
}
IntegratedShell.GRAPH_FILE_NAME = "graph.png";
exports.IntegratedShell = IntegratedShell;
//# sourceMappingURL=integratedShell.js.map