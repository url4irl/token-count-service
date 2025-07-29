import { FetchMock } from "jest-fetch-mock";

declare global {
  namespace jest {
    interface Global {
      fetch: FetchMock;
    }
  }
}