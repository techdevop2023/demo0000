# Jenkins Declarative Pipeline Linter

*A plugin to lint Jenkins declarative pipelines via the Jenkins CLI.*

- [Gettting Started](#getting-started)
- [Settings](#settings)
- [Usage](#usage)
- [Attributions](#attributions)

![Installation](https://github.com/ekeel/jenkins-declarative-linter/raw/HEAD/images/jdl-install.gif)  
![Configuration](https://github.com/ekeel/jenkins-declarative-linter/raw/HEAD/images/jdl-config.gif)

----------

## Getting Started

In order to use the Jenkins Declarative Pipeline Linter plugin you need to configure Jenkins to recognize your public key and set the `jenkins-declarative-linter.url`, `jenkins-declarative-linter.port`, and `jenkins-declarative-linter.user` VSCode settings.

> **_NOTE_**  
> If you are not using the standard `~/.ssh/id_rsa` key, set the `jenkins-declarative-linter.key` setting to the path of your key file.

> **_NOTE_**  
> You need to have your public key configured in the Jenkins instance you are using for validation. In order to configure your public key in Jenkins:
>   1. Navigate to `https://<JENKINS_INSTANCE>/me/configure`.
>   2. Locate 'SSH Public Keys' and add your public key.
>   ![Jenkins SSH Key Configuration](https://github.com/ekeel/jenkins-declarative-linter/raw/HEAD/images/jenkins-key-config.png)

----------

## Settings

*The following settings can be set via the UI or the `settings.json` file.*

![Settings UI](https://github.com/ekeel/jenkins-declarative-linter/raw/HEAD/images/Settings.png)

### `jenkins-declarative-linter.url`

*The URL to the Jenkins instance.*

**Required**: `true`

#### Example

```json
{
  "jenkins-declarative-linter.url": "localhost"
}
```

### `jenkins-declarative-linter.port`

*The SSH port configured for the Jenkins instance.*

**Required**: `true`

**Example**  
```json
{
  "jenkins-declarative-linter.port": "2222"
}
```

### `jenkins-declarative-linter.user`

*The username for connecting to the Jenkins instance.*

**Required**: `true`

**Example**  
```json
{
  "jenkins-declarative-linter.user": "user1"
}
```

### `jenkins-declarative-linter.key`

*The path to the SSH key for connecting to the Jenkins instance.*

**Required**: `false`

**Example**  
```json
{
  "jenkins-declarative-linter.key": "/path/to/key"
}
```

----------

## Usage

To lint a declarative Jenkins pipeline script:
1. Open the script in a text editor window.
2. Enter `>Lint Jenkinsfile` in the command pallete.
3. The results will appear in a `JDL` output view.

### Output: Valid Script File Example

```
[INFO] Validating c:\tmp\jenkinsdev\jenkinsfiles\NAntDbTest.jenkinsfile
[INFO] Jenkinsfile successfully validated.
```

[GIF](https://github.com/ekeel/jenkins-declarative-linter/blob/HEAD/images/lint-success.gif)

### Output: Invalid Script File Example

```
[INFO] Validating c:\tmp\jenkinsdev\jenkinsfiles\NAntDbTest.jenkinsfile
[INFO] Errors encountered validating Jenkinsfile:
WorkflowScript: 22: Unknown stage section "script". Starting with version 0.5, steps in a stage must be in a ‘steps’ block. @ line 22, column 5.
       stage('Execute NAnt DB Scripts') {
       ^

WorkflowScript: 22: Expected one of "steps", "stages", or "parallel" for stage "Execute NAnt DB Scripts" @ line 22, column 5.
       stage('Execute NAnt DB Scripts') {
       ^
```

[GIF](https://github.com/ekeel/jenkins-declarative-linter/blob/HEAD/images/lint-failure.gif)

----------

## Attributions

[Images](https://github.com/ekeel/jenkins-declarative-linter/blob/f3dc8d64774bf3cca0dac02bc6996b2d948a89c7/images/README.md)
