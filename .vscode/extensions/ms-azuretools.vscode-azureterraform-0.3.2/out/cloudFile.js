/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const shared_1 = require("./shared");
class CloudFile {
    constructor(workspaceName, // vscode workspace name
        fileShareName, // name of file share in storage account
        fileUri, // full path to file
        fileSystem) {
        // Ex. local file you want to push to cloudshell, env would be local
        this.workspaceName = workspaceName;
        this.fileShareName = fileShareName;
        this.fileSystem = fileSystem;
        if (fileSystem === shared_1.FileSystem.cloudshell) {
            this.cloudShellUri = fileUri;
            this.localUri = this.convertCSToLocalPath(fileUri);
            console.log(this.localUri);
        }
        else if (fileSystem === shared_1.FileSystem.local) {
            this.localUri = fileUri;
            this.cloudShellUri = this.convertLocalToCSPath(fileUri);
            console.log(this.cloudShellUri);
        }
        this.cloudShellDir = path.dirname(this.cloudShellUri);
    }
    // Convert Local file path to cloudshell
    convertLocalToCSPath(localPath) {
        const localDir = path.dirname(path.relative(vscode.workspace.workspaceFolders.
            find((ws) => ws.name === this.workspaceName).uri.fsPath, localPath));
        const cloudShellDir = this.workspaceName + "/" + localDir;
        return cloudShellDir + "/" + path.basename(localPath);
    }
    convertCSToLocalPath(csPath) {
        const dirArray = path.dirname(csPath).split(path.sep);
        const fileName = path.basename(csPath);
        if (dirArray.length === 0) {
            throw new RangeError("{csPath} is invalid cloudshell path.");
        }
        const wsFolder = vscode.workspace.workspaceFolders.find((ws) => ws.name === dirArray[0]);
        if (wsFolder === undefined) {
            throw new RangeError("{csPath} does not contain valid workspace name in path");
        }
        this.workspaceName = wsFolder.name;
        let baseFsPath = wsFolder.uri.fsPath;
        for (let i = 1; i < dirArray.length; i++) {
            baseFsPath = baseFsPath + "/" + dirArray[i];
        }
        return baseFsPath + "/" + fileName;
    }
}
exports.CloudFile = CloudFile;
//# sourceMappingURL=cloudFile.js.map