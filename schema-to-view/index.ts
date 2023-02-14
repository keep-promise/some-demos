// 标准字段
import sFields from './sField';
// 自定义字段
import cField from './cField';

import gSetting from './global';

export const setting = [...sFields, ...cField];

参照：https://github.com/alibaba/x-render/blob/master/tools/schema-generator/src/settings/index.js



import Generator from 'fr-generator';
<Generator
  ref={this.generatorRef}
  widgets={widgets}
  defaultValue={data.schema}
  commonSettings={{}}
  settings={setting}
  globalSettings={GlobalSettings}
  // defaultValue={faultSchema}
  // defaultValue={suggestSchema}
  // onSchemaChange={onSchemaChange}
/>
