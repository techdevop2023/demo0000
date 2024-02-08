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
const uiUtils_1 = require("./uiUtils");
function isDotInstalled() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield cpUtils_1.executeCommand("dot", ["-V"], { shell: true });
            return true;
        }
        catch (error) {
            uiUtils_1.openUrlHint("GraphViz is not installed, please make sure GraphViz is in the PATH environment variable.", "https://aka.ms/azTerraform-requirement");
            return false;
        }
    });
}
exports.isDotInstalled = isDotInstalled;
function drawGraph(workingDirectory, inputFile) {
    return __awaiter(this, void 0, void 0, function* () {
        yield cpUtils_1.executeCommand("dot", ["-Tpng", "-o", "graph.png", inputFile], {
            cwd: workingDirectory,
            shell: true,
        });
    });
}
exports.drawGraph = drawGraph;
//# sourceMappingURL=dotUtils.js.map