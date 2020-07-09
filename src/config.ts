import { generate } from "@skimah/api";
import { sqlite } from "@skimah/ds-sql";
import JSONSource from "@skimah/ds-json";
import { readFileSync } from "fs";
import { GraphQLSchema } from "graphql";

export default async (): Promise<GraphQLSchema> => {
  const typeDefs = readFileSync("schema.graphql").toString();

  const ratings = new JSONSource({ filepath: "data/ratings.json" });
  const chinook = sqlite("data/chinook.sqlite");

  const { schema } = await generate({
    typeDefs,
    sources: {
      ratings,
      chinook,
    },
  });

  return schema;
};
