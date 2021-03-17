export interface StepFunction {
  StartAt: string;
  States: Record<string, State>;
  Playbook?: string;
  Comment?: string;
}

interface BaseState {
  Type: string;
  Next?: string;
  Catch?: any[];
  Retry?: any[];
  End?: boolean;
}

interface TaskState extends BaseState {
  Type: "Task";
  Resource: string;
  Parameters?: Record<string, any>
}

interface FailState extends BaseState {
  Type: "Fail";
  Cause?: string;
  Error?: string;
}

interface SucceedState extends BaseState {
  Type: "Succeed";
}

interface PassState extends BaseState {
  Type: "Pass";
}

interface WaitState extends BaseState {
  Type: "Wait";
  Seconds: Number;
}

interface MapState extends BaseState {
  Type: "Map";
  Iterator: StepFunction;
}

interface ChoiceState extends BaseState {
  Type: "Choice";
  Choices?: Operator[];
  Default: string;
}

export interface Operator {
  Variable?: string;
  Next?: string;
  And?: Operator[];
  Or?: Operator[];
  Not?: Operator;
  BooleanEquals?: boolean;
  NumericEquals?: number;
  NumericGreaterThan?: number;
  NumericGreaterThanEquals?: number;
  NumericLessThan?: number;
  NumericLessThanEquals?: number;
  StringEquals?: string;
  StringGreaterThan?: string;
  StringGreaterThanEquals?: string;
  StringLessThan?: string;
  StringLessThanEquals?: string;
  TimestampEquals?: string;
  TimestampGreaterThan?: string;
  TimestampGreaterThanEquals?: string;
  TimestampLessThan?: string;
  TimestampLessThanEquals?: string;
}

interface ParallelState extends BaseState {
  Type: "Parallel";
  Branches: StepFunction[];
}

interface InteractionState extends BaseState {
  Type: "Interaction";
}

export type State = TaskState | FailState | SucceedState | MapState | ChoiceState | ParallelState | PassState | InteractionState | WaitState;

export function stringifyChoiceOperator(operator: Operator) {
  const isLeaf = (operator: Operator) => Boolean(operator.Variable);

  const stringifyLeaf = (operator: Operator) => {
    const { Variable, ...rest } = operator;
    const conditionName = Object.keys(rest)[0];
    const conditionValue = rest[conditionName];
    return `(${stringifyVariable(operator.Variable)} ${stringifyOperatorName(conditionName)} ${conditionValue})`;
  };

  const traverse = (operator: Operator) => {
    if (isLeaf(operator)) {
      return stringifyLeaf(operator);
    } else {
      const { Next, ...rest } = operator;
      const operatorName = Object.keys(rest)[0];

      if (Array.isArray(rest[operatorName])) {
        const childOperators = rest[operatorName];
        return `(${childOperators.map(traverse).join(` ${operatorName} `)})`;
      } else {
        const childOperator = rest[operatorName];
        return `(${operatorName} (${traverse(childOperator)}))`;
      }
    }
  };

  const stringifyVariable = (variable: string) => variable.slice(2);

  const stringifyOperatorName = (operatorName: string) => {
    switch (true) {
      case /.*GreaterThanEquals$/.test(operatorName):
        return ">=";
      case /.*LessThanEquals$/.test(operatorName):
        return "<=";
      case /.*GreaterThan$/.test(operatorName):
        return ">";
      case /.*LessThan$/.test(operatorName):
        return "<";
      case /.*Equals$/.test(operatorName):
        return "=";
      default:
        return operatorName;
    }
  };

  try {
    return traverse(operator);
  } catch (error) {
    return "";
  }
}

export function getStates(stepFunction: StepFunction) {
  const states = {};
  traverseStepFunction(stepFunction, (stateName, state) => {
    states[stateName] = formatStateForWebViewPopup(state);
  });
  return states;
}

function formatStateForWebViewPopup(state: State) {
    return Object.keys(state).reduce((acc, key) => {
    if (Array.isArray(state[key]) || typeof state[key] === "object") {
      return acc;
    }
    const shortenedValue = `${state[key]}`.length > 25 ? `${state[key]}`.slice(0, 25) + "..." : state[key];

    acc[key] = shortenedValue;
    return acc;
  }, {});
  ///////////
  // let formatted_object = {}
  // for (const [key, value] of Object.entries(obj)) {

  //   if (typeof value === "string") {
  //     const shortenedValue = value.length > 25 ? value.slice(0, 25) + "..." : value;
  //     formatted_object[key] = shortenedValue
  //   } else if (Array.isArray(value)){
  //     // remove arrays from object
  //     continue
  //   } else if (typeof value === "object") {
  //     formatted_object = {...formatted_object, ...split_object_into_parent_keys(key, value)}
  //     // formatted_object[key] = formatObjectForWebView(formatted_object, value)
  //   }  else {
  //     formatted_object[key] = value
  //   }
  // }
  // return formatted_object
}

////////
// function split_object_into_parent_keys(parent_key_name: string, child_object: object) {
//   const new_object = {}
//   for (const [key, value] of Object.entries(child_object)) {
//     new_object[`${parent_key_name}\n${key}`] = value
//   }
//   return new_object
// }

// FIXME: What the hell is that?
function traverseStepFunction(stepFunction: StepFunction, callback: (stateName: string, step: State) => void) {
  Object.keys(stepFunction.States).forEach((stateName) => {
    const state = stepFunction.States[stateName];

    callback(stateName, state);

    switch (state.Type) {
      case "Parallel": {
        state.Branches.forEach((branch) => {
          traverseStepFunction(branch, callback);
        });
        break;
      }
      case "Map": {
        traverseStepFunction(state.Iterator, callback);
        break;
      }
    }
  });
}
