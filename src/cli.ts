import program from "commander";
import { convertFile } from "./index.js";
import { writeFileInfo } from "./file";
import { isStoryFile } from "./utils";
import { promises as fsPromises, PathLike } from "fs";
import { debug } from "console";
import * as fg from "fast-glob";
import $ from "gogocode";
import { transformStoriesProcess } from "./storiesprocess/transform";
import fs from "fs";

function camelize(str: string) {
  return str.replace(/-(\w)/g, (_, c: string) => (c ? c.toUpperCase() : ""));
}

async function checkIfContainsAsync(filename: PathLike | fsPromises.FileHandle, str: string) {
  try {
    const contents = await fsPromises.readFile(filename, "utf-8");

    const result = contents.includes(str);

    return result;
  } catch (err) {
    console.log(err);
  }
}

function getCmdOptions(cmd: { options: Array<{ long: string }> }) {
  const args: { [key: string]: boolean | string } = {};
  cmd.options.forEach((o: { long: string }) => {
    const key = camelize(o.long.replace(/^--/, ""));

    if (
      typeof (cmd as unknown as Record<string, string>)[key] !== "function" &&
      typeof (cmd as unknown as Record<string, string>)[key] !== "undefined"
    ) {
      args[key] = (cmd as unknown as Record<string, string>)[key];
    }
  });
  return args;
}

program
  .command("<directoryPath>")
  .description("convert vue component files from class to composition api")
  .option("-s, --stories", "Set for Storybook Stories processing")
  .action(async (filePath: string, cmd) => {
    const cmdOptions = getCmdOptions(cmd);

    const vueFiles = fg.sync(filePath + "/**/*.vue", { onlyFiles: true, deep: Infinity });
    const tsFiles = fg.sync(filePath + "/**/*.ts", { onlyFiles: true, deep: Infinity });

    const files = [...vueFiles, ...tsFiles];

    const validFiles = [];
    const pageOrComponentFiles = [];
    const storiesFiles = [];
    const mixinFiles = [];

    for (let i = 0; i < files.length; i++) {
      if (!cmdOptions.stories) {
        if (await checkIfContainsAsync(files[i], "vue-property-decorator")) {
          validFiles.push(files[i]);
        }
        if (await checkIfContainsAsync(files[i], "vue-class-component")) {
          validFiles.push(files[i]);
        }
        if (await checkIfContainsAsync(files[i], "vuex-class")) {
          validFiles.push(files[i]);
        }
        if (await checkIfContainsAsync(files[i], "nuxt-property-decorator")) {
          validFiles.push(files[i]);
        }
        if (await checkIfContainsAsync(files[i], "nuxt-class-component")) {
          validFiles.push(files[i]);
        }
      } else {
        if (isStoryFile(files[i])) {
          validFiles.push(files[i]);
          storiesFiles.push(files[i]);
        }
      }
    }

    for (let i = 0; i < validFiles.length; i++) {
      if (await checkIfContainsAsync(validFiles[i], "Mixins extend")) {
        mixinFiles.push(validFiles[i]);
      } else {
        pageOrComponentFiles.push(validFiles[i]);
      }
    }

    const toConvertFiles = [...mixinFiles, ...pageOrComponentFiles];

    for (let i = 0; i < toConvertFiles.length; i++) {
      const currentfile = toConvertFiles[i];
      const extensions = [".vue", ".ts"];

      const extension = (/\.([^.]*)$/.exec(currentfile) || [])[0] ?? " ";

      if (!extensions.includes(extension)) {
        debug(
          `skip ${currentfile} file because not end with ${extensions[0]} or with ${extensions[1]}.`
        );
        continue;
      } else {
        if (cmdOptions.stories) {
          fs.readFile(currentfile, function read(err: unknown, code: { toString: () => any }) {
            if (err) {
              console.log("HELLO, je suis dans ERR");
              throw err;
            }

            const processedStory = transformStoriesProcess(
              {
                source: code.toString(),
                path: currentfile,
              },
              {
                gogocode: $,
              },
              {
                rootPath: __dirname,
                outFilePath: currentfile,
                outRootPath: __dirname,
                lang: "js",
              }
            );

            fs.writeFile(currentfile, processedStory, function (err: unknown) {
              if (err) {
                throw err;
              }
            });
          });
        } else {
          const { file, result } = convertFile(
            filePath,
            cmdOptions.root as string,
            cmdOptions.config as string
          );

          if (cmdOptions.view) {
            console.log(result);
            return;
          }

          writeFileInfo(file, result);
          console.log("Please check the TODO comments on result.");
        }
      }
    }
  });

program.parse(process.argv);
