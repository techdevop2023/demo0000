"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function isTerminalSetToCloudShell() {
    return vscode.workspace.getConfiguration().get("azureTerraform.terminal") === "cloudshell";
}
exports.isTerminalSetToCloudShell = isTerminalSetToCloudShell;
function getSyncFileBlobPattern() {
    return vscode.workspace.getConfiguration().get("azureTerraform.files");
}
exports.getSyncFileBlobPattern = getSyncFileBlobPattern;
function getResourceGroupForTest() {
    return vscode.workspace.getConfiguration().get("azureTerraform.test.aciResourceGroup");
}
exports.getResourceGroupForTest = getResourceGroupForTest;
function getAciNameForTest() {
    return vscode.workspace.getConfiguration().get("azureTerraform.test.aciName");
}
exports.getAciNameForTest = getAciNameForTest;
function getAciGroupForTest() {
    return vscode.workspace.getConfiguration().get("azureTerraform.aciContainerGroup");
}
exports.getAciGroupForTest = getAciGroupForTest;
function getLocationForTest() {
    return vscode.workspace.getConfiguration().get("azureTerraform.test.location");
}
exports.getLocationForTest = getLocationForTest;
function getImageNameForTest() {
    return vscode.workspace.getConfiguration().get("azureTerraform.test.imageName");
}
exports.getImageNameForTest = getImageNameForTest;
function getCheckTerraformCmd() {
    return vscode.workspace.getConfiguration().get("azureTerraform.checkTerraformCmd");
}
exports.getCheckTerraformCmd = getCheckTerraformCmd;
function setCheckTerraformCmd(checked) {
    vscode.workspace.getConfiguration().update("azureTerraform.checkTerraformCmd", checked);
}
exports.setCheckTerraformCmd = setCheckTerraformCmd;
//# sourceMappingURL=settingUtils.js.map