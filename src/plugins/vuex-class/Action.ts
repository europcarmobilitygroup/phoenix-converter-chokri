import { convertVuexMethodFactory } from "./convertMethodFactory";

export const convertVuexAction = convertVuexMethodFactory("Action", "dispatch");
