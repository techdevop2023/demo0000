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
const cpUtils_1 = require("./cpUtils");
const settingUtils = require("./settingUtils");
const uiUtils_1 = require("./uiUtils");
function checkTerraformInstalled() {
    return __awaiter(this, void 0, void 0, function* () {
        if (settingUtils.isTerminalSetToCloudShell() || !settingUtils.getCheckTerraformCmd()) {
            return;
        }
        try {
            yield cpUtils_1.executeCommand("terraform", ["-v"], { shell: true });
        }
        catch (error) {
            uiUtils_1.openUrlHintOrNotShowAgain("Terraform is not installed, please make sure Terraform is in the PATH environment variable.", "https://aka.ms/azTerraform-requirement", () => {
                settingUtils.setCheckTerraformCmd(false);
            });
        }
    });
}
exports.checkTerraformInstalled = checkTerraformInstalled;
//# sourceMappingURL=terraformUtils.js.map