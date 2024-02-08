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
const cp = require("child_process");
const terraformChannel_1 = require("../terraformChannel");
function executeCommand(command, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let result = "";
            const childProc = cp.spawn(command, args, options);
            childProc.stdout.on("data", (data) => {
                data = data.toString();
                result = result.concat(data);
                terraformChannel_1.terraformChannel.append(data);
            });
            childProc.stderr.on("data", (data) => terraformChannel_1.terraformChannel.append(data.toString()));
            childProc.on("error", reject);
            childProc.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`Command "${command} ${args.toString()}" failed with exit code "${code}".`));
                }
                else {
                    resolve(result);
                }
            });
        });
    });
}
exports.executeCommand = executeCommand;
//# sourceMappingURL=cpUtils.js.map