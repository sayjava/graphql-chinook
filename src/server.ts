import bodyParser from "body-parser";
import express from "express";
import { graphql } from "graphql";
import next from "next";
import createConfig from "./schema";

const port = process.env.PORT ?? 8080;
const isDev = process.env.NODE_ENV !== "production";

const createNext = async (server) => {
  const app = next({ dev: isDev });
  const handle = app.getRequestHandler();
  await app.prepare();

  if (isDev) {
    server.all("*", (req, res) => {
      return handle(req, res);
    });
  }
};

const createGraphql = async (server) => {
  const schema = await createConfig();

  server.use(bodyParser.json());

  server.use("/graphql", async (req, res) => {
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
  await createNext(server);

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
