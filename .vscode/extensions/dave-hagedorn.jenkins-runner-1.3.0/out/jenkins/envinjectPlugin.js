"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const xml2js = require("xml2js");
const parseXmlString = util.promisify(xml2js.parseString);
exports.SHORT_NAME = "envinject";
/**
 * Creates the portion of a job's XML config for the envinject job property
 * Allows injecting environment variables into the job
 * Requires envinject plugin to be installed on Jenkins
 */
async function createXmlConfig(envinjectVersion, properties) {
    let propertiesConfig = Object.entries(properties).map(([k, v]) => `${k}=${v}`).join("\n");
    let xmlNode = await parseXmlString(`
    <EnvInjectJobProperty plugin="envinject@${envinjectVersion}">
      <info>
        <propertiesContent>${propertiesConfig}</propertiesContent>
      </info>
      <on>true</on>
      <keepJenkinsSystemVariables>true</keepJenkinsSystemVariables>
      <keepBuildVariables>true</keepBuildVariables>
      <overrideBuildParameters>false</overrideBuildParameters>
  </EnvInjectJobProperty>`);
    return xmlNode;
}
exports.createXmlConfig = createXmlConfig;
//# sourceMappingURL=envinjectPlugin.js.map