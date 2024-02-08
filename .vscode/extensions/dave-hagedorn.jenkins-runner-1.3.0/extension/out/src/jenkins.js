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
const jenkins = require("jenkins");
const url = require("url");
const xml2js = require("xml2js");
const util = require("util");
const pipeline_error_parser_1 = require("./pipeline_error_parser");
const log = require("./log");
const utils = require("./utils");
const timeout = util.promisify(setTimeout);
const BUILD_FETCH_RETRIES = 10;
const parseXmlString = util.promisify(xml2js.parseString);
const logger = new log.Logger("Jenkins");
class Jenkins {
    constructor(baseUrl, user) {
        this.baseUrl = baseUrl;
        this.user = user;
        this._builds = [];
    }
    static getOrCreateHost(baseUrl, user) {
        let key = `${baseUrl}-${user}`;
        if (!this._hosts.has(key)) {
            this._hosts.set(key, new Jenkins(baseUrl, user));
        }
        return this._hosts.get(key);
    }
    static get hosts() {
        return this._hosts;
    }
    get builds() {
        return this._builds;
    }
    get description() {
        return `${this.user !== undefined ? `${this.user}@` : ""}${this.baseUrl}`;
    }
    updateCredentials(useCrumbIssuer, rejectUnauthorizedCert, password) {
        let urlWithAuth = new url.URL(this.baseUrl);
        if (password !== undefined && this.user !== undefined) {
            urlWithAuth.password = password;
            urlWithAuth.username = this.user;
        }
        else if (this.user === undefined && password === undefined) {
        }
        else {
            logger.error("Jenkins instance created with password and no user, or user and no password - need both or none");
            throw new Error("invalid arguments");
        }
        const combinedUrl = urlWithAuth.href;
        // don't log passwords!
        logger.info(`Creating Jenkins instance @url=${this.baseUrl}, with user=${this.user}, password=${password ? "****" : ""}`);
        this.jenkinsInstance = jenkins({
            baseUrl: combinedUrl,
            promisify: true,
            crumbIssuer: useCrumbIssuer,
            rejectUnauthorized: rejectUnauthorizedCert,
        });
    }
    async createPipelineBuild(usingJob, withScript, logHandler, doneHandler, parameters) {
        let build = new PipelineBuild(this, this.jenkinsInstance, usingJob, withScript, logHandler, doneHandler, parameters);
        this._builds.push(build);
        return build;
    }
    destroy(build) {
        if (this._builds.indexOf(build) >= 0) {
            this._builds = this._builds.filter(e => e !== build);
            build.destroy();
        }
    }
}
Jenkins.TAG = "Jenkins";
Jenkins._hosts = new Map();
exports.default = Jenkins;
class PipelineBuild {
    constructor(jenkins, jenkinsInstance, usingJob, withScript, logHandler, doneHandler, parameters) {
        this.jenkins = jenkins;
        this.jenkinsInstance = jenkinsInstance;
        this.usingJob = usingJob;
        this.withScript = withScript;
        this.logHandler = logHandler;
        this.doneHandler = doneHandler;
        this.parameters = parameters;
        this._errors = [];
        this.buildLog = "";
        this.state = "stopped";
        logger.info(`Creating pipeline build using job ${usingJob} @${jenkins.baseUrl}, with params ${parameters}`);
    }
    get errors() {
        return this._errors;
    }
    get running() {
        return this.state === "running";
    }
    get description() {
        return `${this.usingJob} ${this.buildNumber !== undefined ? `#${this.buildNumber}` : ""} on ${this.jenkins.description}`;
    }
    async updateJobScript(jobName, script) {
        logger.info(`Fetching remote XML config for job ${this.usingJob} @${this.jenkins.baseUrl}`);
        let jobXml = await this.jenkinsInstance.job.config(jobName);
        logger.info("Parsing and updating XML with new pipeline script");
        let parsed = await parseXmlString(jobXml);
        let root = parsed["flow-definition"];
        root.definition[0].script = script;
        root.quietPeriod = 0; // make sure job starts right away
        jobXml = new xml2js.Builder().buildObject(parsed);
        logger.info(`Pushing remote XML config for job ${this.usingJob} @${this.jenkins.baseUrl}`);
        await this.jenkinsInstance.job.config(jobName, jobXml);
    }
    async postDone(error) {
        this.state = "stopped";
        logger.info(`Done job ${this.usingJob} #${this.buildNumber} @${this.jenkins.baseUrl}`);
        if (error) {
            logger.error(`Build finished with errors: ${error.message}`);
        }
        logger.info("Fetching full build log...");
        this.buildLog = await this.jenkinsInstance.build.log(this.usingJob, this.buildNumber);
        logger.info("Parsing build log for errors...");
        this._errors = pipeline_error_parser_1.parseGroovyErrors(this.buildLog);
        if (this.doneHandler) {
            this.doneHandler(error);
        }
    }
    async start() {
        if (this.buildNumber !== undefined) {
            const msg = `Trying to start build for job ${this.usingJob} - but has already been started with #${this.buildNumber}`;
            logger.error(msg);
            throw new Error(msg);
        }
        try {
            await this.updateJobScript(this.usingJob, this.withScript);
            logger.info(`Fetching next job number job ${this.usingJob} @${this.jenkins.baseUrl}`);
            // TODO:  Race condition - this requires that no other build starts between now and the below line !!!
            this.buildNumber = (await this.jenkinsInstance.job.get(this.usingJob)).nextBuildNumber;
            logger.info(`Next job number: ${this.buildNumber}`);
            logger.info(`Starting build #${this.buildNumber} of job ${this.usingJob} @${this.jenkins.baseUrl}`);
            await this.jenkinsInstance.job.build({
                name: this.usingJob,
                parameters: this.parameters,
            });
            let fetchCount = 0;
            let build = undefined;
            while (fetchCount++ < BUILD_FETCH_RETRIES) {
                try {
                    logger.info(`Trying to fetch build #${this.buildNumber}...`);
                    build = await this.jenkinsInstance.build.get(this.usingJob, this.buildNumber);
                    break;
                }
                catch (error) {
                    logger.warn(`Build probably not started yet, will try again...`);
                    await timeout(100);
                }
            }
            if (!build) {
                logger.error(`Could not find build #${this.buildNumber}`);
                if (this.doneHandler) {
                    this.doneHandler(new Error("Could not start build"));
                }
                return;
            }
            logger.info(`Fetching build output stream for build #${this.buildNumber}`);
            this.logStream = this.jenkinsInstance.build.logStream(this.usingJob, this.buildNumber);
            this.logStream.on("data", (text) => this.logHandler(text));
            this.logStream.on("end", () => this.postDone());
            this.logStream.on("error", (error) => this.postDone(error));
            this.state = "running";
        }
        catch (error) {
            logger.error(`Error starting job ${this.usingJob} #${this.buildNumber} @${this.jenkins.baseUrl}}: ${error}`);
            let detailed = utils.atPath(error, "res", "body");
            if (detailed) {
                logger.error(detailed);
            }
            if (this.doneHandler) {
                this.doneHandler(error);
            }
        }
    }
    async stop() {
        logger.info(`Stopping job ${this.usingJob} #${this.buildNumber} @${this.jenkins.baseUrl}`);
        await this.jenkinsInstance.build.stop(this.usingJob, this.buildNumber);
    }
    destroy() {
        this.stop();
        this.logStream = undefined;
        this.doneHandler = undefined;
        this.jenkins.destroy(this);
    }
}
PipelineBuild.TAG = "PipelineBuild";
//# sourceMappingURL=jenkins.js.map