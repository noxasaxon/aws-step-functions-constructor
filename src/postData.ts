import * as vscode from "vscode";
import * as _ from "lodash";

import { parse, getSourceMap } from "./parse/parse";
import { buildGraph } from "./graph";
import { getStates } from "./stepFunction";
import { apb } from './apb/apb'

/**
 * Update File Content in the WebView Panel
 * @remarks
 * Parses the fileName for Step Function syntax, and rebuilds the visualization graph
 * @param panel - current webview panel
 * @param uri - path to Step Functions .json file
 * @param fileName - path to Step Functions .json file
 */
export const postData = async (panel: vscode.WebviewPanel, uri: vscode.Uri, fileName: string) => {
  const stepFunction = await parse(uri, fileName);

  const serializedGraph = buildGraph(stepFunction);
  const states = getStates(stepFunction);

  panel.webview.postMessage({
    command: "UPDATE",
    data: {
      serializedGraph,
      states,
    },
  });
};
export const throttledPostData: any = _.throttle(postData, 200);

export const postDataWithAPB = async (panel: vscode.WebviewPanel, uri: vscode.Uri, fileName: string) => {
  const stepFunction = await parse(uri, fileName);
  
  let serializedGraph = ""
  let states = {}
  
  console.log('attempt socless render')
  const soclessStepFunction = new apb(stepFunction).StateMachine
  serializedGraph = buildGraph(soclessStepFunction);
  states = getStates(soclessStepFunction);
  console.log('socless render')

  panel.webview.postMessage({
    command: "UPDATE",
    data: {
      serializedGraph,
      states,
    },
  });
};
export const throttledPostDataWithAPB: any = _.throttle(postDataWithAPB, 200);

export const makeHandleReceiveMessage = (uri: vscode.Uri) => async (message) => {
  switch (message.command) {
    case "STATE_UPDATE":
      const sourceMap = await getSourceMap(uri);

      const pointer = Object.keys(sourceMap.pointers).find((key) => {
        return key.endsWith(`${message.data.stateName}/${message.data.statePropertyName}`);
      });
      if (!pointer) {
        return;
      }

      const pointerMap = sourceMap.pointers[pointer];

      vscode.workspace.openTextDocument(uri).then((document) => {
        const edit = new vscode.WorkspaceEdit();

        var textRange = new vscode.Range(
          pointerMap.value.line,
          pointerMap.value.column + 1,
          pointerMap.valueEnd.line,
          pointerMap.valueEnd.column - 1
        );

        edit.replace(document.uri, textRange, message.data.statePropertyValue);

        vscode.workspace.applyEdit(edit).then(
          (editsApplied) => {},
          (reason) => {
            vscode.window.showErrorMessage(`Error applying edits`);
          }
        );
      });
      return;
  }
};
