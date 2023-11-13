import { convertVuexComputedFactory } from "./convertComputedFactory";

export const convertVuexGetter = convertVuexComputedFactory("Getter", "getters");
