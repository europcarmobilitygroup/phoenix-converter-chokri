/* eslint-disable @typescript-eslint/no-explicit-any */
import { rules_stories } from "./rules/index";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const transformStoriesProcess = function (
  fileInfo: { source: string; path?: string },
  api: { gogocode: any },
  options: {
    rootPath: string;
    outFilePath: string;
    outRootPath: string;
    lang: string;
  }
) {
  const rules = rules_stories;

  const sourceCode = fileInfo.source;

  const $ = api.gogocode;

  const ast = options.lang
    ? $(sourceCode, { parseOptions: { language: options.lang } })
    : $(sourceCode);
  const outAst = rules.reduce(
    (ast: any, rule: (arg0: any, arg1: any) => any) => rule(ast, options),
    ast
  );

  return outAst.generate();
};
