/**

 Defining an index using an existing geohash library as a key

 This will maintain its own reverse lookup map as well, in order to allow
 removing keys and correctly updating updated indices.

 assumptions:
 - points contain (at least) an x, y, and an id property (for now, not using
 geojson)
 - the index should not assume that points are only queried by reference.
 */

import sortedIndexBy from "lodash/sortedIndexBy.js";
import sortedLastIndexBy from "lodash/sortedLastIndexBy.js";
import intersectionBy from "lodash/intersectionBy.js";
import geohash from "@geonet/geohash";
const { encode, geohashesWithinBBox } = geohash;

/**
 * Point type definition
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 * @property {string} id
 */

export class GeoHashIndex {
  constructor() {
    this._points = {};
    this._pointsByGeohash = [];
  }

  /**
   *
   * @param {Point} point
   */
  index(point) {
    const hash = this._createHash(point);
    if (this._points[point.id]) {
      this.removeFromIndex(point.id);
    }
    this._points[point.id] = hash;
    this.insertInSortedPosition(this._pointsByGeohash, [
      hash,
      point.id,
      point.x,
      point.y,
    ]);
  }

  insertInSortedPosition(arr, indexEntry) {
    const insertPosition = sortedIndexBy(arr, indexEntry, compareByFirstEntry);
    arr.splice(insertPosition, 0, indexEntry);
  }

  arrayRangeFind(minBound, maxBound) {
    const arr = this._pointsByGeohash;
    const fromIndex = sortedIndexBy(arr, [minBound], compareByFirstEntry);
    const toIndex = sortedLastIndexBy(arr, [maxBound], compareByFirstEntry);
    return arr.slice(fromIndex, toIndex);
  }

  _createHash({ x, y, id }) {
    // NOTE: arbitrarily chose precision to 8 places: about 19.1m
    return encode(x, y, 8);
  }

  removeFromIndex(id) {
    const arr = this._pointsByGeohash;
    const hash = this._points[id];

    if (hash) {
      delete this._points[id];
      let indexPosition = sortedIndexBy(
        arr,
        [hash],
        compareByFirstEntry
      );
      // This bit worries me still
      while (true) {
        if (arr[indexPosition][1] === id) {
          arr.splice(indexPosition, 1);
          break;
        } else if (!arr[indexPosition]) {
          break;
        }
      }
      return true;
    }
    return false;
  }

  queryByBoundingBox({ minX, minY, maxX, maxY }) {
    // for 1 hour, not going to worry about optimizing this.
    // it should be easy to find a library (maybe geohash-compress) that
    // will produce an efficient set of hashes.

    // taking an approach suggested here: https://gis.stackexchange.com/a/231729
    // by Steven Kay: https://gis.stackexchange.com/users/55203/steven-kay
    const bboxArea = (maxX - minX) * (maxY - minY);
    let reasonablePrecision = 1;
    if (bboxArea === 0) {
      reasonablePrecision = 8;
    } else {
      for (const precisionLevel of [1, 2, 3, 4, 5, 6, 7]) {
        const roughCellsToBBox = bboxArea / precisions[precisionLevel];
        if (roughCellsToBBox > 10) {
          reasonablePrecision = precisionLevel;
          break;
        }
      }
    }


    const hashesToFind = geohashesWithinBBox(
      minX,
      minY,
      maxX,
      maxY,
      reasonablePrecision
    );

    // todo: see if this works
    const pointsWithinHashes = hashesToFind
      .map((hash) => this.arrayRangeFind(hash, hash + "z"))
      .flat();

    // then, because there may be many false positives, refine with actual
    // coords
    return pointsWithinHashes.reduce((acc, [hash, id, x, y]) => {
      if (minX <= x && maxX >= x && minY <= y && maxY >= y) {
        acc.push(id);
      }
      return acc;
    }, []);
  }

  serialize() {
    return JSON.stringify({
      _points: this._points,
      _pointsByGeohash: this._pointsByGeohash,
    });
  }

  deserialize(data) {
    ({ _points: this._points, _pointsByGeohash: this._pointsByGeohash } =
      JSON.parse(data));
  }
}

const compareByFirstEntry = (v) => v[0];
const compareBySecondEntry = (v) => v[1];

const precisions = [
  null, // this is silly, putting it here to not accidentally get an off by one
  2025,
  63.28125,
  1.9775390625,
  0.061798095703125,
  0.0019311904907226562,
  6.034970283508301e-5,
  1.885928213596344e-6,
];
