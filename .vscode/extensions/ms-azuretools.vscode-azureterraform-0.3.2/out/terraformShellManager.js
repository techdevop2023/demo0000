/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TelemetryWrapper = require("vscode-extension-telemetry-wrapper");
const cloudShell_1 = require("./cloudShell");
const integratedShell_1 = require("./integratedShell");
const settingUtils_1 = require("./utils/settingUtils");
class TerraformShellManager {
    constructor() {
        this.cloudShell = new cloudShell_1.AzureCloudShell();
        this.integratedShell = new integratedShell_1.IntegratedShell();
    }
    getShell() {
        const isCloudShell = settingUtils_1.isTerminalSetToCloudShell();
        TelemetryWrapper.addContextProperty("isCloudShell", isCloudShell.toString());
        if (isCloudShell) {
            return this.cloudShell;
        }
        return this.integratedShell;
    }
    getCloudShell() {
        return this.cloudShell;
    }
    getIntegratedShell() {
        return this.integratedShell;
    }
    dispose() {
        this.cloudShell.dispose();
        this.integratedShell.dispose();
    }
}
exports.terraformShellManager = new TerraformShellManager();
//# sourceMappingURL=terraformShellManager.js.map