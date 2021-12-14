import { GeoHashIndex } from "./bb-index.js";
import { commonTestSuite } from "../test-utils/shared-tests.js";

describe('common test suite', () => {
  commonTestSuite("geohash index", GeoHashIndex);
})
