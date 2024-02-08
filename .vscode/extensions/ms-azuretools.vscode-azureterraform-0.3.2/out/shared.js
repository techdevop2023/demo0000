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
const azureStorage = require("azure-storage");
const path = require("path");
const cloudFile_1 = require("./cloudFile");
var TerminalType;
(function (TerminalType) {
    TerminalType["Integrated"] = "integrated";
    TerminalType["CloudShell"] = "cloudshell";
})(TerminalType = exports.TerminalType || (exports.TerminalType = {}));
var FileSystem;
(function (FileSystem) {
    FileSystem["docker"] = "docker";
    FileSystem["local"] = "local";
    FileSystem["cloudshell"] = "cloudshell";
})(FileSystem = exports.FileSystem || (exports.FileSystem = {}));
var TestOption;
(function (TestOption) {
    TestOption["lint"] = "lint";
    TestOption["e2e"] = "end to end";
    TestOption["custom"] = "custom";
})(TestOption = exports.TestOption || (exports.TestOption = {}));
var TerraformCommand;
(function (TerraformCommand) {
    TerraformCommand["Init"] = "terraform init";
    TerraformCommand["Plan"] = "terraform plan";
    TerraformCommand["Apply"] = "terraform apply";
    TerraformCommand["Destroy"] = "terraform destroy";
    TerraformCommand["Refresh"] = "terraform refresh";
    TerraformCommand["Validate"] = "terraform validate";
})(TerraformCommand = exports.TerraformCommand || (exports.TerraformCommand = {}));
function escapeFile(data) {
    return data.replace(/"/g, '\\"').replace(/\$/g, "\\\$");
}
exports.escapeFile = escapeFile;
function azFileDelete(workspaceName, storageAccountName, storageAccountKey, fileShareName, localFileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        const fs = azureStorage.createFileService(storageAccountName, storageAccountKey);
        const cf = new cloudFile_1.CloudFile(workspaceName, fileShareName, localFileUri, FileSystem.local);
        yield deleteFile(cf, fs);
    });
}
exports.azFileDelete = azFileDelete;
function azFilePull(workspaceName, storageAccountName, storageAccountKey, fileShareName, cloudShellFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const fs = azureStorage.createFileService(storageAccountName, storageAccountKey);
        const cf = new cloudFile_1.CloudFile(workspaceName, fileShareName, cloudShellFileName, FileSystem.cloudshell);
        yield readFile(cf, fs);
    });
}
exports.azFilePull = azFilePull;
function azFilePush(workspaceName, storageAccountName, storageAccountKey, fileShareName, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const fs = azureStorage.createFileService(storageAccountName, storageAccountKey);
        const cf = new cloudFile_1.CloudFile(workspaceName, fileShareName, fileName, FileSystem.local);
        const pathCount = cf.cloudShellDir.split(path.sep).length;
        // try create file share if it does not exist
        try {
            yield createShare(cf, fs);
        }
        catch (error) {
            console.log(`Error creating FileShare: ${cf.fileShareName}\n\n${error}`);
            return;
        }
        // try create directory path if it does not exist, dirs need to be created at each level
        try {
            for (let i = 0; i < pathCount; i++) {
                yield createDirectoryPath(cf, i, fs);
            }
        }
        catch (error) {
            console.log(`Error creating directory: ${cf.cloudShellDir}\n\n${error}`);
            return;
        }
        // try create file if not exist
        try {
            yield createFile(cf, fs);
        }
        catch (error) {
            console.log(`Error creating file: ${cf.localUri}\n\n${error}`);
        }
        return;
    });
}
exports.azFilePush = azFilePush;
function createShare(cf, fs) {
    return new Promise((resolve, reject) => {
        fs.createShareIfNotExists(cf.fileShareName, ((error, result) => {
            if (!error) {
                if (result && result.created) {
                    console.log(`FileShare: ${cf.fileShareName} created.`);
                }
                resolve();
            }
            else {
                reject(error);
            }
        }));
    });
}
function createDirectoryPath(cf, i, fs) {
    return new Promise((resolve, reject) => {
        let tempDir = "";
        const dirArray = cf.cloudShellDir.split(path.sep);
        for (let j = 0; j < dirArray.length && j <= i; j++) {
            tempDir = tempDir + dirArray[j] + "/";
        }
        fs.createDirectoryIfNotExists(cf.fileShareName, tempDir, ((error, result) => {
            if (!error) {
                if (result && result.created) {
                    console.log(`Created dir: ${tempDir}`);
                }
                resolve();
            }
            else {
                reject(error);
            }
        }));
    });
}
function createFile(cf, fs) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(cf.localUri);
        fs.createFileFromLocalFile(cf.fileShareName, cf.cloudShellDir, fileName, cf.localUri, (error) => {
            if (!error) {
                console.log(`File synced to cloud: ${fileName}`);
                resolve();
            }
            else {
                reject(error);
            }
        });
    });
}
function readFile(cf, fs) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(cf.cloudShellUri);
        fs.getFileToLocalFile(cf.fileShareName, cf.cloudShellDir, fileName, cf.localUri, (error) => {
            if (!error) {
                console.log(`File synced to local workspace: ${cf.localUri}`);
                resolve();
            }
            else {
                reject(error);
            }
        });
    });
}
function deleteFile(cf, fs) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(cf.localUri);
        fs.deleteFileIfExists(cf.fileShareName, cf.cloudShellDir, fileName, (error, result) => {
            if (!error) {
                if (result) {
                    console.log(`File deleted from cloudshell: ${cf.cloudShellUri}`);
                }
                else {
                    console.log(`File does not exist in cloudshell: ${cf.cloudShellUri}`);
                }
                resolve();
            }
            else {
                reject(error);
            }
        });
    });
}
//# sourceMappingURL=shared.js.map