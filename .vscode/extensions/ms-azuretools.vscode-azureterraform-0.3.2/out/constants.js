/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Constants {
}
Constants.TerraformTerminalName = "Terraform";
Constants.TestContainer = "microsoft/terraform-test";
Constants.clouddrive = "$HOME/clouddrive";
exports.Constants = Constants;
function aciConfig(resourceGroup, aciName, aciGroup, storageAccountName, storageAccountShare, location, testContainer, projectName) {
    let TFConfiguration;
    // TODO - add a check on the location where ACI is available - if (['westus', eastus].indexOf(location) == -1) {
    TFConfiguration = `variable "location" {
        default = "${location}"
    }

variable "storage_account_key" { }

resource "azurerm_resource_group" "TFTest" {
    name     = "${resourceGroup}"
    location = "${location}"
}
resource "azurerm_container_group" "TFTest" {
    depends_on = ["azurerm_resource_group.TFTest"]
    name = "${aciGroup}"
    location = "${location}"
    resource_group_name = "${resourceGroup}"
    ip_address_type = "public"
    os_type = "linux"
    restart_policy = "Never"

    container {
        name = "${aciName}"
        image = "${testContainer}"
        cpu = "1"
        memory = "2"
        port = "80"

        environment_variables {
            "ARM_TEST_LOCATION"="${location}"
            "ARM_TEST_LOCATION_ALT"="${location}"
        }

        command = "/bin/bash -c '/module/${projectName}/.TFTesting/containercmd.sh'"

        volume {
            name = "module"
            mount_path = "/module"
            read_only = false
            share_name = "${storageAccountShare}"
            storage_account_name = "${storageAccountName}"
            storage_account_key = "\${var.storage_account_key}"
        }
    }
}`;
    return TFConfiguration;
}
exports.aciConfig = aciConfig;
function exportTestScript(TFConfiguration, resoureGroupName, storageAccountName, testDirectory) {
    const testScript = `
        #!/bin/bash
        mkdir -p $HOME/clouddrive/${testDirectory}

        echo -e "${TFConfiguration}" > $HOME/clouddrive/${testDirectory}/testfile.tf

        export TF_VAR_storage_account_key=$(az storage account keys list -g ${resoureGroupName} -n ${storageAccountName} | jq '.[0].value')

        mkdir -p $HOME/clouddrive/${testDirectory}/.azure

        az account list --refresh &> /dev/null

        cp $HOME/.azure/*.json $HOME/clouddrive/${testDirectory}/.azure

    `;
    return testScript;
}
exports.exportTestScript = exportTestScript;
function exportContainerCmd(moduleDir, containerCommand) {
    const containerScript = `#!/bin/bash

echo "Copying terraform project..."
cp -a /module/${moduleDir}/. /tf-test/module/

echo "Initializing environment..."
mkdir /root/.azure
cp /module/${moduleDir}/.TFTesting/.azure/*.json /root/.azure

echo "Starting to Run test task..."
${containerCommand}
echo "Container test operation completed - read the logs for status"`;
    return containerScript;
}
exports.exportContainerCmd = exportContainerCmd;
//# sourceMappingURL=constants.js.map