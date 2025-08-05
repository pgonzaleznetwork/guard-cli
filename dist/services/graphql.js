"use strict";
import fetch from "cross-fetch";
import pkg from "@apollo/client/core/core.cjs";
import { guardConfig } from "./config.js";
const { ApolloClient, HttpLink, InMemoryCache } = pkg;
const apiToken = (await guardConfig.getConfig()).apiToken;
export const graphqlClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://fc-dev.autorabit.com/api/spm/graphql",
    fetch,
    headers: {
      Authorization: `Bearer ${apiToken}`
    }
  }),
  cache: new InMemoryCache()
});
