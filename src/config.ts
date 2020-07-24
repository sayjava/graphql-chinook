import { generate } from "@skimah/api";
import { sqlite } from "@skimah/ds-sql";
import { readFileSync } from "fs";
import { GraphQLSchema } from "graphql";

export default async (): Promise<GraphQLSchema> => {
  const typeDefs = readFileSync("schema.graphql").toString();
  const forecast = sqlite("data/oecd.db");

  const { schema } = await generate({
    typeDefs,
    sources: {
      default: forecast,
    },
  });

  return schema;
};
