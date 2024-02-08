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
 *p
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
const ajv = require("ajv");
const log = require("./log");
const utils = require("./utils");
const objectAssignDeep = require("object-assign-deep");
class Settings {
    static config(name) {
        let settings = vscode.workspace.getConfiguration("jenkins-runner").inspect(name);
        if (settings === undefined) {
            return undefined;
        }
        return objectAssignDeep(settings.globalValue, settings.workspaceValue, settings.workspaceFolderValue);
    }
    static validate(obj, property) {
        if (!this.compiledSchemas.has(property)) {
            let ext = vscode.extensions.getExtension(this.EXTENSION_NAME);
            if (!ext) {
                return;
            }
            let json = ext.packageJSON;
            let schema = utils.atPath(json, "contributes", "configuration", "properties", `jenkins-runner.${property}`);
            if (!schema) {
                this.logger.error("Could not find settings schema in package.json ?!");
                return;
            }
            this.compiledSchemas.set(property, ajv().compile(schema));
        }
        let validator = this.compiledSchemas.get(property);
        let validationResult = validator(obj);
        if (!validationResult) {
            let errorMsg = "Error in Settings - see log\n";
            errorMsg += validator.errors.map(err => {
                return `In jenkins.${property}.${err.dataPath}: ${err.message}`;
            }).join("\n");
            this.logger.error(errorMsg);
            throw new Error("Error in Settings - see log");
        }
    }
    static get hosts() {
        let hosts = this.config("hostConfigs");
        if (hosts === undefined) {
            return new Map();
        }
        this.validate(hosts, "hostConfigs"); // may throw
        return new Map(Object.entries(hosts).map(([name, rawHost]) => [
            name,
            Object.assign({ friendlyName: name, useCrumbIssuer: rawHost.useCrumbIssuer || true, rejectUnauthorizedCert: rawHost.rejectUnauthorizedCert || true }, rawHost),
        ]));
    }
    static get jobs() {
        let rawJobs = Settings.config("jobs");
        if (!rawJobs) {
            return [new Map(), []];
        }
        this.validate(rawJobs, "jobs"); // may throw
        let hosts = this.hosts; // may throw
        let warnings = [];
        let errors = [];
        let asDict = new Map();
        for (let [jobName, rawJob] of Object.entries(rawJobs)) {
            let hostConfigNames = utils.toArray(rawJob.runWith);
            let missingConfigNames = hostConfigNames.filter(hostConfig => hosts.get(hostConfig) === undefined);
            let foundConfigs = hostConfigNames.map(hostConfig => hosts.get(hostConfig)).filter(hostConfig => hostConfig !== undefined);
            if (missingConfigNames.length > 0) {
                let jobWarnings = `Hosts in "runWith" field for job ${jobName} not defined - see Settings:\n` + missingConfigNames.map(name => `${name}\n`);
                warnings.push(jobWarnings);
            }
            if (foundConfigs.length === 0) {
                errors.push(`Job ${jobName} has no found host configs in its "runWith" field`);
            }
            asDict.set(jobName, {
                friendlyName: jobName,
                isDefault: (typeof rawJob.isDefault === "boolean") ? rawJob.isDefault : false,
                runWith: foundConfigs,
                name: rawJob.name,
                parameters: rawJob.parameters,
            });
        }
        for (let warning of warnings) {
            this.logger.warn(warning);
        }
        for (let error of errors) {
            this.logger.error(error);
            throw new Error("Errors in Settings - see log");
        }
        return [asDict, warnings];
    }
}
Settings.EXTENSION_NAME = "dave-hagedorn.jenkins-runner";
Settings.compiledSchemas = new Map();
Settings.logger = new log.Logger("Settings");
exports.default = Settings;
//# sourceMappingURL=settings.js.map