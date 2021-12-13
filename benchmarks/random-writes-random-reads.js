import { commonBenchmark } from "../test-utils/shared-benchmarks.js";
import { generateCoordinates, generatePoint } from "../test-utils/index.js";

commonBenchmark(
  "insert 100 points; read 5000 random bbox queries",
  "100-writes-5000-random-reads",
  (implmentationClass) => () => {
    const points = Array.from({ length: 100 }).map(() => generatePoint());
    const queries = Array.from({ length: 5000 }).map(() => {
      const { x, y } = generateCoordinates();
      const { x: x2, y: y2 } = generateCoordinates();
      return {
        minX: Math.min(x, x2),
        maxX: Math.max(x, x2),
        minY: Math.min(y, y2),
        maxY: Math.max(y, y2),
      };
    });
    return () => {
      const index = new implmentationClass();
      points.forEach((point) => index.index(point));
      queries.forEach((query) => {
        const returned = index.queryByBoundingBox(query);
      });
    };
  }
);

commonBenchmark(
  "insert 5000 points; read 100 random bbox queries",
  "5000-writes-100-random-reads",
  (implmentationClass) => () => {
    const points = Array.from({ length: 5000 }).map(() => generatePoint());
    const queries = Array.from({ length: 100 }).map(() => {
      const { x, y } = generateCoordinates();
      const { x: x2, y: y2 } = generateCoordinates();
      return {
        minX: Math.min(x, x2),
        maxX: Math.max(x, x2),
        minY: Math.min(y, y2),
        maxY: Math.max(y, y2),
      };
    });
    return () => {
      const index = new implmentationClass();
      points.forEach((point) => index.index(point));
      queries.forEach((query) => {
        const returned = index.queryByBoundingBox(query);
      });
    };
  }
);

commonBenchmark(
  "insert 5000 points; read 5000 random bbox queries",
  "5000-writes-5000-random-reads",
  (implmentationClass) => () => {
    const points = Array.from({ length: 5000 }).map(() => generatePoint());
    const queries = Array.from({ length: 5000 }).map(() => {
      const { x, y } = generateCoordinates();
      const { x: x2, y: y2 } = generateCoordinates();
      return {
        minX: Math.min(x, x2),
        maxX: Math.max(x, x2),
        minY: Math.min(y, y2),
        maxY: Math.max(y, y2),
      };
    });
    return () => {
      const index = new implmentationClass();
      points.forEach((point) => index.index(point));
      queries.forEach((query) => {
        const returned = index.queryByBoundingBox(query);
      });
    };
  }
);
