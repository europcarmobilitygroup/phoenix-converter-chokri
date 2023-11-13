import { convertVuexMethodFactory } from "./convertMethodFactory";

export const convertVuexMutation = convertVuexMethodFactory("Mutation", "commit");
