/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class TerraformChannel {
    constructor() {
        this.channel = vscode.window.createOutputChannel("Azure Terraform");
    }
    appendLine(message, title) {
        if (title) {
            const simplifiedTime = (new Date()).toISOString().replace(/z|t/gi, " ").trim(); // YYYY-MM-DD HH:mm:ss.sss
            const hightlightingTitle = `[${title} ${simplifiedTime}]`;
            this.channel.appendLine(hightlightingTitle);
        }
        this.channel.appendLine(message);
    }
    append(message) {
        this.channel.append(message);
    }
    show() {
        this.channel.show();
    }
}
exports.terraformChannel = new TerraformChannel();
//# sourceMappingURL=terraformChannel.js.map