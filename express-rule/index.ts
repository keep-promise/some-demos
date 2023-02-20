import { get, isArray } from 'lodash';
import { uuid2 } from '@/utils/common';

const rule = {
  "type": "group",
  "id": "root",
  "children": [
    {
      "type": "item",
      "id": "BdZmLqHExGSdxKoz",
      "data": {
        "leftValue": "module",
        "operator": "=",
        "rightValue": "order-view",
        "props": {
          "operator": {
            "mode": "select"
          },
          "leftValue": {
            "mode": "select"
          },
          "rightValue": {
            "labels": {
              "order-view": "订单视图"
            }
          }
        }
      }
    },
    {
      "type": "group",
      "id": "f0wwp6fss5u",
      "relation": "and",
      "children": [
        {
          "type": "item",
          "id": "wj7rw5stnbj",
          "data": {
            "leftValue": "module",
            "operator": "=",
            "rightValue": "2022102800000001177",
            "props": {
              "leftValue": {
                "mode": "select"
              },
              "operator": {
                "mode": "select"
              },
              "rightValue": {
                "labels": {
                  "2022102800000001177": "知识库"
                }
              }
            }
          }
        }
      ]
    },
    {
      "type": "item",
      "id": "28bssj51iii",
      "data": {
        "leftValue": "submodule",
        "operator": "=",
        "rightValue": "2022102800000001170",
        "props": {
          "leftValue": {
            "mode": "select"
          },
          "operator": {
            "mode": "select"
          },
          "rightValue": {
            "labels": {
              "2022102800000001170": "酒店"
            }
          }
        }
      }
    }
  ],
  "relation": "and"
};


const OPERATOR_MAP: any = {
  '=': '===',
  '!=': '!==',
  '>': '>',
  '<': '<',
  '>=': '>=',
  '<=': '<=',
};

const OPERATOR_SYMS = ['=', '!=', '>=', '<=', '>', '<'];

const COMPARE_SYMS = ['<', '>', '<=', '>='];

const RELATION_MAP: any = {
  'or': '||',
  'and': '&&',
};

const LOGIC_MAP = key2value(RELATION_MAP);

function key2value(obj: any) {
  let result: any = {}
  Object.keys(obj).forEach((key: string) => {
    result[obj[key]] = key;
  });
  return result;
}


export const rule2Express = (root: any) => {
  if (!root) {
    return '';
  }

  const type = get(root, 'type');

  if (type === 'group') {
    const children = root.children || [];
    const relation = root.relation || 'and';

    if (children && Array.isArray(children) && children.length) {

      const expressList: any = [];

      children.forEach(item => {
        const express = rule2Express(item);
        expressList.push(`(${express})`);
      });
      return expressList.join(RELATION_MAP[relation]);
    }
  } else if (type === 'item') {
    const data = get(root, 'data', []) || [];

    const leftValue = get(data, 'leftValue');
    const operator = get(data, 'operator');
    const rightValue = get(data, 'rightValue');

    if (COMPARE_SYMS.includes(operator)) {
      if (operator === '<' || operator === '<=') {
        return `(formData['${leftValue}'] * 1)${OPERATOR_MAP[operator]}('${rightValue}' * 1) && formData['${leftValue}'] !== ''`;
      }
      return `(formData['${leftValue}'] * 1)${OPERATOR_MAP[operator]}('${rightValue}' * 1)`;
    }

    //处理包含，不包含逻辑
    if(operator == 'in' || operator === '!in'){
      if(isArray(rightValue) && rightValue.length>0){
        let rule = '';
        rightValue.forEach((item,index)=>{
          rule = rule + `formData['${leftValue}']==='${item}' ${index+1 < rightValue.length?'||':''}`;
        })
        return operator == 'in' ? `(${rule})` : `!(${rule})`
      }
    }

    return `formData['${leftValue}']${OPERATOR_MAP[operator]}'${rightValue}'`;
  } else {
    return '';
  }
}

export function test() {
  const testExpress2 = "((formData['module']==='order-view')&&(formData['module']==='order-view1'))";
  const testExpress = "((formData['module']==='order-view')&&(formData['module']==='order-view1'))||(formData['module']==='order-view2')";
  // const rule = express2Rule(testExpress, 'root');
  console.log('==express2Rule-result1', rule);
  const express = rule2Express(rule);
  console.log('==rule2Express-result2', express);
}

export function express2Rule(express: string, id: string = 'root') {
  const result: any = {
    type: 'group',
    id: id,
    children: []
  };
  if (!express.includes('||') && !express.includes('&&')) {
    const rule = express2RuleItem(express);
    if (id === 'root') {
      return {
        type: 'group',
        id: id,
        relation: 'and',
        children: [rule]
      };
    } else {
      return rule;
    }
  }
  const { leftExpress, relation, rightExpress }  = splitExpress(express);
  result.relation = relation;
  const leftRule = express2Rule(leftExpress, uuid2());
  const rightRule = express2Rule(rightExpress, uuid2());
  result.children.push(leftRule);
  result.children.push(rightRule);
  return result;
}

function express2RuleItem(express: string) {
  express = express.replaceAll(/[\(\)]/g, '');
  const data: any = {};
  OPERATOR_SYMS.some((operator) => {
    if (express.includes(OPERATOR_MAP[operator])) {
      data.operator = operator;
      return true;
    }
  });
  const reg = /\'(.+?)\'/g;
  const values = express.match(reg);
  data.leftValue = values?.[0].replace(/\'/g, '');
  data.rightValue = values?.[1].replace(/\'/g, '');
  return {
    type: 'item',
    id: uuid2(),
    data: data
  };
}

function splitExpress(express: string) {
  express = removeOuterBracket(express);
  const N = express.length;
  let leftBracket = 0;
  let rightBracket = 0;
  let index = 0;
  for (let i = 0; i < N; i++) {
    if (express[i] == '(') leftBracket++;
    if (express[i] == ')') rightBracket++;
    if (leftBracket === rightBracket && leftBracket != 0) {
      index = i + 1;
      break;
    }
  }
  const symb = express.substring(index, index+2);
  const leftExpress = express.substring(0, index);
  const rightExpress = express.substring(index+2, N);
  return {
    relation: LOGIC_MAP[symb] || LOGIC_MAP['&&'],
    leftExpress: leftExpress,
    rightExpress: rightExpress
  }
}

function removeOuterBracket(express: string): string {
  const N = express.length;
  let leftBracket = 0;
  let rightBracket = 0;
  let index = 0;
  for (let i = 0; i < N; i++) {
    if (express[i] == '(') leftBracket++;
    if (express[i] == ')') rightBracket++;
    if (leftBracket === rightBracket && leftBracket != 0) {
      index = i + 1;
      break;
    }
  }
  if (index == N) {
    express = express.substring(1, N-1);
    return removeOuterBracket(express);
  }
  return express;
}

const testrule = {
  "type": "group",
  "id": "root",
  "children": [
      {
          "type": "item",
          "id": "EYYcvDpDHxWITbmX",
          "data": {
              "leftValue": "module",
              "operator": "=",
              "rightValue": "order-view",
              "props": {
                  "operator": {
                      "mode": "select"
                  },
                  "leftValue": {
                      "mode": "select"
                  },
                  "rightValue": {
                      "labels": {
                          "order-view": "订单视图"
                      }
                  }
              }
          }
      },
      {
          "type": "item",
          "id": "gtk20u309u9",
          "data": {
              "leftValue": "submodule",
              "operator": "=",
              "rightValue": "2022102800000001158",
              "props": {
                  "leftValue": {
                      "mode": "select"
                  },
                  "operator": {
                      "mode": "select"
                  },
                  "rightValue": {
                      "labels": {
                          "2022102800000001158": "酒店"
                      }
                  }
              }
          }
      },
      {
          "type": "group",
          "id": "f3p05eq3hq8",
          "relation": "and",
          "children": [
              {
                  "type": "item",
                  "id": "4x438y1u555",
                  "data": {
                      "leftValue": "submodule",
                      "operator": "=",
                      "rightValue": "2022102800000001157",
                      "props": {
                          "leftValue": {
                              "mode": "select"
                          },
                          "operator": {
                              "mode": "select"
                          },
                          "rightValue": {
                              "labels": {
                                  "2022102800000001157": "国内机票"
                              }
                          }
                      }
                  }
              },
              {
                  "type": "item",
                  "id": "0x5d006bp8xl",
                  "data": {
                      "leftValue": "user",
                      "operator": "=",
                      "props": {
                          "leftValue": {
                              "mode": "input"
                          },
                          "operator": {
                              "mode": "input"
                          }
                      },
                      "rightValue": "3333"
                  }
              }
          ]
      },
      {
          "type": "item",
          "id": "k7ibx0l19i",
          "data": {
              "leftValue": "orderId",
              "operator": "=",
              "props": {
                  "leftValue": {
                      "mode": "input"
                  },
                  "operator": {
                      "mode": "input"
                  }
              },
              "rightValue": "11111"
          }
      }
  ]
};
