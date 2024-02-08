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
const terraformShellManager_1 = require("../terraformShellManager");
const cpUtils_1 = require("./cpUtils");
const uiUtils_1 = require("./uiUtils");
function isDockerInstalled() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield cpUtils_1.executeCommand("docker", ["-v"], { shell: true });
            return true;
        }
        catch (error) {
            uiUtils_1.openUrlHint("Docker is not installed, please install Docker to continue.", "https://www.docker.com");
            return false;
        }
    });
}
exports.isDockerInstalled = isDockerInstalled;
function runLintInDocker(volumn, containerName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(yield pullLatestImage(containerName))) {
                return false;
            }
            const cmd = `docker run -v ${volumn} --rm ${containerName} rake -f ../Rakefile build`;
            terraformShellManager_1.terraformShellManager.getIntegratedShell().runTerraformCmd(cmd);
            return true;
        }
        catch (error) {
            uiUtils_1.promptForOpenOutputChannel("Failed to run lint task in Docker. Please open the output channel for more details.", uiUtils_1.DialogType.error);
            return false;
        }
    });
}
exports.runLintInDocker = runLintInDocker;
function runE2EInDocker(volumn, containerName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(yield pullLatestImage(containerName))) {
                return false;
            }
            const cmd = `docker run -v ${volumn} `
                + `-e ARM_CLIENT_ID `
                + `-e ARM_TENANT_ID `
                + `-e ARM_SUBSCRIPTION_ID `
                + `-e ARM_CLIENT_SECRET `
                + `-e ARM_TEST_LOCATION `
                + `-e ARM_TEST_LOCATION_ALT `
                + `--rm ${containerName} /bin/bash -c `
                + `"ssh-keygen -t rsa -b 2048 -C terraformTest -f /root/.ssh/id_rsa -N ''; rake -f ../Rakefile e2e"`;
            terraformShellManager_1.terraformShellManager.getIntegratedShell().runTerraformCmd(cmd);
            return true;
        }
        catch (error) {
            uiUtils_1.promptForOpenOutputChannel("Failed to run end to end tests in Docker. Please open the output channel for more details.", uiUtils_1.DialogType.error);
            return false;
        }
    });
}
exports.runE2EInDocker = runE2EInDocker;
function runCustomCommandInDocker(cmd, containerName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(yield pullLatestImage(containerName))) {
                return false;
            }
            yield cpUtils_1.executeCommand("docker", cmd.split(" "), { shell: true });
            return true;
        }
        catch (error) {
            uiUtils_1.promptForOpenOutputChannel("Failed to run the custom command in Docker. Please open the output channel for more details.", uiUtils_1.DialogType.error);
            return false;
        }
    });
}
exports.runCustomCommandInDocker = runCustomCommandInDocker;
function pullLatestImage(image) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield cpUtils_1.executeCommand("docker", ["pull", `${image}:latest`], { shell: true });
            return true;
        }
        catch (error) {
            uiUtils_1.promptForOpenOutputChannel(`Failed to pull the latest image: ${image}. Please open the output channel for more details.`, uiUtils_1.DialogType.error);
            return false;
        }
    });
}
//# sourceMappingURL=dockerUtils.js.map