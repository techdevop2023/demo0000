"use strict";
/**
 * Copyright (c) [2019] [Dave Hagedorn]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("./constants");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
const outputChannel = vscode.window.createOutputChannel(`${constants_1.default.PLUGIN_FRIENDLY_NAME} - Debug Log`);
class Logger {
    constructor(tag) {
        this.tag = tag;
    }
    error(msg) {
        error(this.tag, msg);
    }
    warn(msg) {
        warn(this.tag, msg);
    }
    info(msg) {
        info(this.tag, msg);
    }
    debug(msg) {
        debug(this.tag, msg);
    }
}
exports.Logger = Logger;
function log(level, tag, msg) {
    const pad = (number, to = 2) => {
        let asString = `${number}`;
        return `${"0".repeat(to > asString.length ? to - asString.length : 0)}${asString}`;
    };
    const now = new Date();
    const dateString = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
    outputChannel.appendLine(`[${dateString} ${timeString}] [${tag}] [${level}] ${msg}`);
}
function error(tag, msg) {
    log(LogLevel.ERROR, tag, msg);
}
exports.error = error;
function warn(tag, msg) {
    log(LogLevel.WARN, tag, msg);
}
exports.warn = warn;
function info(tag, msg) {
    log(LogLevel.INFO, tag, msg);
}
exports.info = info;
function debug(tag, msg) {
    log(LogLevel.DEBUG, tag, msg);
}
exports.debug = debug;
function showPanel() {
    outputChannel.show(true);
}
exports.showPanel = showPanel;
//# sourceMappingURL=log.js.map