# Visualize AWS step functions for Visual Studio Code

[![](https://vsmarketplacebadge.apphb.com/version-short/paulshestakov.aws-step-functions-constructor.svg)](https://marketplace.visualstudio.com/items?itemName=paulshestakov.aws-step-functions-constructor)
[![](https://vsmarketplacebadge.apphb.com/downloads-short/paulshestakov.aws-step-functions-constructor.svg)](https://marketplace.visualstudio.com/items?itemName=paulshestakov.aws-step-functions-constructor)
[![](https://vsmarketplacebadge.apphb.com/installs/paulshestakov.aws-step-functions-constructor.svg)](https://marketplace.visualstudio.com/items?itemName=paulshestakov.aws-step-functions-constructor)

## Supported formats:

- ASL definition in JSON or YAML
- SAM ASL definition or ASL file reference
- Cloudformation definitionString
- Serverless declaration

## Open in split view

Go into Command Palette and type:

```
> Show step function
```

![Usage Example](https://github.com/PaulShestakov/pics/blob/master/sf2.png?raw=true)

## License

This software is released under [MIT License](http://www.opensource.org/licenses/mit-license.php)

## Review

Feedback and contributions welcome. Please leave a [review](https://marketplace.visualstudio.com/items?itemName=paulshestakov.aws-step-functions-constructor#review-details).

## Info

- [ASL](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html) - Amazon states language definition

## Alternatives

[AWS Toolkit for Visual Studio Code](https://github.com/aws/aws-toolkit-vscode)

The AWS Toolkit for Visual Studio Code supports defining, visualizing, and publishing your Step Functions workflows for local and remote state machines using code snippets, code completion, and code validation. Features such as automatic linting and code snippets allow for fast creation and deployment of state machines without leaving VS Code.

Those features are documented [here](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/bulding-stepfunctions.html).

## Extension Development

To use this extension in development mode:
```bash
# after npm install
npm run webpack
npm run watch
npm run test
```
