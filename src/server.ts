import bodyParser from "body-parser";
import { graphql } from "graphql";
import { Nuxt, Builder } from "nuxt";

import express from "express";
import createConfig from "./config";

const port = process.env.PORT ?? 8080;
const isDev = process.env.NODE_ENV !== "production";

const createNuxt = (server) => {
  const config = require("../nuxt.config.js");
  const nuxt = new Nuxt(config);

  if (isDev) {
    const builder = new Builder(nuxt);
    builder.build();
  }

  server.use(nuxt.render);
  return nuxt;
};

const createGraphql = async (server) => {
  const schema = await createConfig();

  server.use(bodyParser.json());
  server.use("/graphql", async (req, res, next) => {
    if (req.method === "GET") {
      res.send("Please use POST");
      return;
    }

    const response = await graphql({
      schema,
      source: req.body.query,
      variableValues: req.body.variables,
      operationName: req.body.operationNam,
    });

    res.send(response);
    return;
  });
};

export const create = async () => {
  let socket;
  const server = express();

  await createGraphql(server);
  await createNuxt(server);

  return {
    start: () => (socket = server.listen(port)),
    stop: () => {
      socket && socket.close();
    },
  };
};

create().then((s) => {
  console.log(`Server started at http://localhost:${port}`);
  s.start();

  process.on("SIGINT", () => {
    s.stop();
  });
});
