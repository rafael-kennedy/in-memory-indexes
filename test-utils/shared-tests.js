import { fiftyPointSet } from "./fixtures.js";
import { dummyId } from "./index.js";

export function commonTestSuite(implementationName, implementationClass) {
  const state = {};
  describe(`${implementationName} required API`, () => {
    beforeAll(() => {
      state.points = [];
      state.implementationClass = implementationClass;
      state.indexPoints = () => {
        state.index = new implementationClass();
        state.points.forEach((point) => state.index.index(point));
        return state.index;
      };
    });

    afterEach(() => {
      state.points = [];
      state.index = null;
    });

    describe("index method", () => {
      // TODO: implement standalone tests for insertion. currently covered
      // by later boundingboxtests
      test("indexing a point that already exists updates the existing entry", () => {
        state.points = [
          { x: 2, y: 2, id: "inside" },
          { x: 0, y: 1, id: "inside" },
          { x: 0, y: 0, id: "inside" },
        ];
        state.indexPoints();
        const resultsInitial = state.index.queryByBoundingBox({
          minX: 1,
          minY: 1,
          maxX: 3,
          maxY: 3,
        });
        expect(resultsInitial.length).toBe(0);
        const resultsUpdated = state.index.queryByBoundingBox({
          minX: 0,
          minY: 0,
          maxX: 0,
          maxY: 0,
        });
        expect(resultsUpdated.length).toBe(1);
        expect(resultsUpdated[0]).toBe("inside");
        const resultsGlobal = state.index.queryByBoundingBox({
          minX: -180,
          minY: -90,
          maxX: 180,
          maxY: 90,
        });
        expect(resultsGlobal.length).toBe(1);
        expect(resultsGlobal[0]).toBe("inside");
      });
    });

    describe("queryByBoundingBox method", () => {
      test("point in box is returned", () => {
        state.points = [{ x: 0, y: 0, id: "inside" }];
        state.indexPoints();
        const results = state.index.queryByBoundingBox({
          minX: -1,
          minY: -1,
          maxX: 1,
          maxY: 1,
        });
        expect(results.length).toBe(1);
        expect(results[0]).toBe("inside");
      });

      test("points outside box are not returned", () => {
        state.points = [
          { x: 2, y: 0, id: "x-outside" },
          { x: 0, y: 2, id: "y-outside" },
          { x: 2, y: 2, id: "xy-outside" },
          { x: 0, y: 1.00001, id: "y-outside-slightly" },
          { x: 1.00001, y: 0, id: "x-outside-slightly" },
        ];
        state.indexPoints();
        const results = state.index.queryByBoundingBox({
          minX: -1,
          minY: -1,
          maxX: 1,
          maxY: 1,
        });
        expect(results.length).toBe(0);
      });

      test("points intersecting box are returned", () => {
        state.points = [
          { x: 1, y: 0, id: "x-intersect-max" },
          { x: -1, y: 0, id: "x-intersect-min" },
          { x: 0, y: 1, id: "y-intersect-max" },
          { x: 0, y: -1, id: "y-intersect-min" },
          { x: 1, y: 1, id: "xy-intersect-max" },
          { x: -1, y: -1, id: "xy-intersect-min" },
        ];
        state.indexPoints();
        const results = state.index.queryByBoundingBox({
          minX: -1,
          minY: -1,
          maxX: 1,
          maxY: 1,
        });
        expect(results.length).toBe(state.points.length);
      });

      // TODO: test error cases
    });

    describe("removeFromIndex method", () => {
      test("removes key found in data", () => {
        state.points = [
          { x: 0, y: 0, id: "not-deleted" },
          { x: 0, y: 0, id: "to-be-deleted" },
        ];
        state.indexPoints();
        const foundKeyToDelete = state.index.removeFromIndex("to-be-deleted");
        expect(foundKeyToDelete).toBe(true);
        const results = state.index.queryByBoundingBox({
          minX: -1,
          minY: -1,
          maxX: 1,
          maxY: 1,
        });
        expect(results.length).toBe(1);
        expect(results[0]).toBe("not-deleted");
      });

      test("ignores missing keys", () => {
        state.points = [{ x: 0, y: 0, id: "not-deleted" }];
        state.indexPoints();
        const foundKeyToDelete = state.index.removeFromIndex("to-be-deleted");
        expect(foundKeyToDelete).toBe(false);
        const results = state.index.queryByBoundingBox({
          minX: -1,
          minY: -1,
          maxX: 1,
          maxY: 1,
        });
        expect(results.length).toBe(1);
        expect(results[0]).toBe("not-deleted");
      });
    });

    describe("serialize / deserialize methods", () => {
      test("serialize produces a string", () => {
        state.points = [{ x: 0, y: 0, id: "inside" }];
        state.indexPoints();
        const serializeOutput = state.index.serialize();
        expect(typeof serializeOutput).toBe("string");
        expect(serializeOutput.length).toBeGreaterThan(2);
      });

      test("serializeOutput can be deserialized", () => {
        state.points = [{ x: 0, y: 0, id: "inside" }];
        state.indexPoints();
        const serializeOutput = state.index.serialize();
        const newIndex = new state.implementationClass();
        newIndex.deserialize(serializeOutput);
        const results = state.index.queryByBoundingBox({
          minX: -1,
          minY: -1,
          maxX: 1,
          maxY: 1,
        });
        expect(results.length).toBe(1);
        expect(results[0]).toBe("inside");
      });
    });
  });
}
