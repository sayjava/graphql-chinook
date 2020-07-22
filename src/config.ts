import { generate } from "@skimah/api";
import CSVSource from "@skimah/ds-csv";
import { readFileSync } from "fs";
import { GraphQLSchema } from "graphql";

export default async (): Promise<GraphQLSchema> => {
  const typeDefs = readFileSync("schema.graphql").toString();
  const singleHit = new CSVSource({ filepath: "data/single_hit_forecast.csv" });

  const { schema } = await generate({
    typeDefs,
    sources: {
      singleHit,
      default: singleHit,
    },
  });

  return schema;
};
