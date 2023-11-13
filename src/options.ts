import ts from "typescript";
import { ASTConvertPlugins } from "./plugins/types";
import { getDefaultPlugins } from "./plugins";
import * as vueTemplateCompiler from "vue-template-compiler";

export interface PhoenixOptions {
  root: string;
  debug: boolean;
  compatible: boolean;
  setupPropsKey: string;
  setupContextKey: string;
  typescript: typeof ts;
  vueTemplateCompiler: typeof vueTemplateCompiler;
  prettierConfig: string;
  vuexKey: string;
  plugins: ASTConvertPlugins;
}

export type InputPhoenixOptions = Partial<PhoenixOptions>;

export function getDefaultPhoenixOptions(tsModule: typeof ts = ts): PhoenixOptions {
  return {
    root: process.cwd(),
    debug: false,
    compatible: false,
    setupPropsKey: "props",
    setupContextKey: "context",
    typescript: tsModule,
    vueTemplateCompiler: vueTemplateCompiler,
    prettierConfig: ".prettierrc",
    plugins: getDefaultPlugins(tsModule),
    vuexKey: "store",
  };
}

export function mergePhoenixOptions(
  original: PhoenixOptions,
  merged: InputPhoenixOptions
): PhoenixOptions {
  return {
    ...original,
    ...merged,
  };
}
