"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the MIT License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/
const request = require("request");
var BuildStatus;
(function (BuildStatus) {
    BuildStatus[BuildStatus["Success"] = 0] = "Success";
    BuildStatus[BuildStatus["Failed"] = 1] = "Failed";
    BuildStatus[BuildStatus["Disabled"] = 2] = "Disabled";
    BuildStatus[BuildStatus["InProgress"] = 3] = "InProgress";
})(BuildStatus = exports.BuildStatus || (exports.BuildStatus = {}));
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Connected"] = 0] = "Connected";
    ConnectionStatus[ConnectionStatus["InvalidAddress"] = 1] = "InvalidAddress";
    ConnectionStatus[ConnectionStatus["AuthenticationRequired"] = 2] = "AuthenticationRequired";
    ConnectionStatus[ConnectionStatus["Error"] = 3] = "Error";
})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));
/**s
 * colorToBuildStatus
 */
function colorToBuildStatus(color) {
    if (color.endsWith('_anime'))
        return BuildStatus.InProgress;
    switch (color) {
        case "blue":
            return BuildStatus.Success;
        case "red":
            return BuildStatus.Failed;
        default:
            return BuildStatus.Disabled;
    }
}
exports.colorToBuildStatus = colorToBuildStatus;
function colorToBuildStatusName(color) {
    switch (color) {
        case "blue":
            return 'Sucess';
        case "blue_anime":
            return 'Sucess';
        case "red":
            return 'Failed';
        case "red_anime":
            return 'Failed';
        case "yellow":
            return "Unstable";
        case "yellow_anime":
            return "Unstable";
        case "grey":
            return "Pending";
        case "grey_anime":
            return "Pending";
        case "aborted":
            return "Aborted";
        case "aborted_anime":
            return "Aborted";
        case "notbuilt":
            return "Not built";
        case "notbuilt_anime":
            return "Not built";
        default:
            return 'Disabled';
    }
}
exports.colorToBuildStatusName = colorToBuildStatusName;
function getConnectionStatusName(status) {
    switch (status) {
        case ConnectionStatus.Connected:
            return "Connected";
        case ConnectionStatus.InvalidAddress:
            return "Invalid Address";
        case ConnectionStatus.Error:
            return "Error";
        default:
            return "Authentication Required";
    }
}
exports.getConnectionStatusName = getConnectionStatusName;
class Jenkins {
    getStatus(url, username, password) {
        return new Promise((resolve, reject) => {
            let data = "";
            let statusCode;
            let result;
            request
                .get(url + "/api/json", {
                auth: {
                    user: username,
                    pass: password
                }
            })
                .on("response", function (response) {
                statusCode = response.statusCode;
            })
                .on("data", function (chunk) {
                data += chunk;
            })
                .on("end", function () {
                switch (statusCode) {
                    case 200:
                        const myArr = JSON.parse(data);
                        result = {
                            jobName: myArr.displayName,
                            url: myArr.url,
                            status: colorToBuildStatus(myArr.color),
                            statusName: colorToBuildStatusName(myArr.color),
                            buildNr: myArr.lastBuild ? myArr.lastBuild.number : 0,
                            connectionStatus: ConnectionStatus.Connected,
                            connectionStatusName: getConnectionStatusName(ConnectionStatus.Connected),
                            code: undefined
                        };
                        if (result.status === BuildStatus.InProgress) {
                            result.statusName = result.statusName + " (in progress)";
                        }
                        resolve(result);
                        break;
                    case 401:
                    case 403:
                        result = {
                            jobName: "AUTHENTICATION NEEDED",
                            url,
                            status: BuildStatus.Disabled,
                            statusName: "Disabled",
                            buildNr: undefined,
                            code: statusCode,
                            connectionStatus: ConnectionStatus.AuthenticationRequired,
                            connectionStatusName: getConnectionStatusName(ConnectionStatus.AuthenticationRequired)
                        };
                        resolve(result);
                        break;
                    default:
                        result = {
                            jobName: "Invalid URL",
                            url,
                            status: BuildStatus.Disabled,
                            statusName: "Disabled",
                            buildNr: undefined,
                            code: statusCode,
                            connectionStatus: ConnectionStatus.InvalidAddress,
                            connectionStatusName: getConnectionStatusName(ConnectionStatus.InvalidAddress)
                        };
                        resolve(result);
                        break;
                }
            })
                .on("error", function (err) {
                result = {
                    jobName: err.toString(),
                    url,
                    status: BuildStatus.Disabled,
                    statusName: "Disabled",
                    buildNr: undefined,
                    code: err.code,
                    connectionStatus: ConnectionStatus.Error,
                    connectionStatusName: getConnectionStatusName(ConnectionStatus.Error)
                };
                resolve(result);
            });
        });
    }
}
exports.Jenkins = Jenkins;
//# sourceMappingURL=Jenkins.js.map