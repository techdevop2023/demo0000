"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js = require("xml2js");
const util = require("util");
const parseXmlString = util.promisify(xml2js.parseString);
async function createXmlConfig(envinjectVersion, properties) {
    let propertiesConfig = properties.map(e => `${e.key}=${e.value}`).join("\n");
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
//# sourceMappingURL=eninjectPlugin.js.map