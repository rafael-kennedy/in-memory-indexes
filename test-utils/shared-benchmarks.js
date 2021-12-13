import { add, complete, cycle, save, suite } from "benny";
import { NaiveBbIndex } from "../bounding-boxes/naive-bb-index.js";
import { generatePoint } from "./index.js";
import { SillyXYIndex } from "../bounding-boxes/x-and-y-indices.js";

const implementations = [
  ["naive implementation", NaiveBbIndex],
  ["silly x y implementation", SillyXYIndex],
];

export function addPerImplemtation(nameFn, testBodyHOF) {
  return implementations.map(([implementationName, implementationClass]) => {
    return add(nameFn(implementationName), testBodyHOF(implementationClass), {
      minSamples: 10,
      maxTime: 30,
    });
  });
}

export function commonBenchmark(name, filename, testBodyHOF) {
  suite(
    name,
    ...addPerImplemtation((name) => name, testBodyHOF),
    cycle(),
    complete(),
    save({
      file: filename,
      format: "json",
      details: true,
    })
  );
}
