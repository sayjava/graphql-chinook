import { ApolloServer } from "apollo-server-express";
import express from "express";
import createConfig from "./config";

const port = process.env.PORT ?? 8080;

export const create = async () => {
  const schema = await createConfig();

  let socket;
  const app = express();
  const server = new ApolloServer({
    schema,
    playground: true,
  });

  server.applyMiddleware({ app });

  app.get("/", (req, res) => {
    res.send("Hello World!!! ");
  });

  return {
    start: () => (socket = app.listen(port)),
    stop: () => socket && socket.close(),
  };
};

create().then((s) => {
  console.log(`Server started at ${port}`);
  s.start();
});
