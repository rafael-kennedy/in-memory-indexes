import { commonBenchmark } from "../test-utils/shared-benchmarks.js";
import { generatePoint } from "../test-utils/index.js";

commonBenchmark('init and insert 5000 points', '5000-inserts', (implmentationClass) => () => {
  const points = Array.from({ length: 5000 }).map((v) =>
    generatePoint()
  );
  return () => {
    const index = new implmentationClass();
    points.forEach((point) => index.index(point));
  };
})