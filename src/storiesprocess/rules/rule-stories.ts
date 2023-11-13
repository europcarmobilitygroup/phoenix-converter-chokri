/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function (ast: any): any {
  const placeholder = `placeholder${+new Date()}`;

  const processA = ast.replace(
    "export default { $$$0 }",
    "import { Meta, StoryFn } from '@storybook/vue' \n export default { $$$0 \n} as Meta"
  );

  const processB = processA.replace(
    "export const $_$1 = ($$$1) => ({ $$$2 })",
    "\n\n $_$1.args={...defaultArgs} \n export const $_$1: StoryFn = (args) => ({ \n$$$2 })"
  );

  const processC = processB
    .replace("args: $_$1", "const defaultArgs = $_$1")
    .replace("props: $_$2,", "setup() { return { args, ...actionsList }},")
    .replace("watch: $_$3,", "")
    .replace("data: $_$4,", "")
    .replace("methods: $_$5,", "const actionsList = $_$5");

  const processD = processB.find("const defaultArgs = $_$1");

  const processE = processC.remove("const defaultArgs = $_$1").after(placeholder);

  const processF = processE.replace(placeholder, processD);

  const processG = processE.find("const actionsList = $_$1");

  const processH = processF.after(placeholder);

  const processI = processH.replace(placeholder, processG);

  const processJ = processI.find("$$$0.args={...defaultArgs}");

  const processK = processF.remove("$$$0.args={...defaultArgs}");

  const processL = processK.after(placeholder);

  const processM = processL.replace(placeholder, processJ);

  return processM.root();
}
