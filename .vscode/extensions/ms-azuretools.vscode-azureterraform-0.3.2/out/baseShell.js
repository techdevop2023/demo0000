/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const terraformChannel_1 = require("./terraformChannel");
class BaseShell {
    constructor() {
        this.initShellInternal();
    }
    dispose() {
        terraformChannel_1.terraformChannel.appendLine(`Terraform terminal: ${this.terminal.name} closed`);
        this.terminal.dispose();
        this.terminal = undefined;
    }
}
exports.BaseShell = BaseShell;
//# sourceMappingURL=baseShell.js.map