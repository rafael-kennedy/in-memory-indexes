import sortedIndexBy from "lodash/sortedIndexBy.js";
import sortedLastIndexBy from "lodash/sortedLastIndexBy.js";
import intersectionBy from "lodash/intersectionBy.js";

/**

 Another silly implementation. creates two indexes, an x index, and a y index
 and then calculates an intersection to find things inside the bbox. Intuitively
 this doesn't seem _that_ crazy, until you think about (for example) querying for
 points along I-75 (a long north-south highway) by its bounding box, which would
 would need to sift through a list of nearly all points in north america.

 */

/**
 * Point type definition
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 * @property {string} id
 */

export class SillyXYIndex {
  constructor() {
    this._points = {};
    this._x_index = [];
    this._y_index = [];
  }

  /**
   *
   * @param {Point} point
   */
  index(point) {
    if (this._points[point.id]) {
      // TODO: this is silly. we can obviously check whether x or y has changed
      this.removeFromIndex(point.id);
    }
    this._points[point.id] = [point.x, point.y];
    this.insertInSortedPosition(this._x_index, [point.x, point.id]);
    this.insertInSortedPosition(this._y_index, [point.y, point.id]);
  }

  insertInSortedPosition(arr, indexEntry) {
    const insertPosition = sortedIndexBy(arr, indexEntry, compareByFirstEntry);
    // TODO potentially an optimization to not use O(n) splice
    arr.splice(insertPosition, 0, indexEntry);
  }

  arrayRangeFind(arr, minBound, maxBound) {
    const fromIndex = sortedIndexBy(arr, [minBound], compareByFirstEntry);
    const toIndex = sortedLastIndexBy(arr, [maxBound], compareByFirstEntry);
    return arr.slice(fromIndex, toIndex);
  }

  removeFromArray(arr, coordinateValue, id) {
    let indexPosition = sortedIndexBy(
      arr,
      [coordinateValue],
      compareByFirstEntry
    );
    // TODO: this is gonna break REAL bad if we ever try to remove something
    // that's not there.
    while (true) {
      if (arr[indexPosition][1] === id) {
        arr.splice(indexPosition, 1);
        break;
      } else if (!arr[indexPosition]) {
        break;
      }
    }
  }

  removeFromIndex(id) {
    if (this._points[id]) {
      const [x, y] = this._points[id];
      delete this._points[id];
      this.removeFromArray(this._x_index, x, id);
      this.removeFromArray(this._y_index, y, id);
    }
    return false;
  }

  queryByBoundingBox({ minX, minY, maxX, maxY }) {
    const elementsWithinXBounds = this.arrayRangeFind(
      this._x_index,
      minX,
      maxX
    );
    const elementsWithinYBounds = this.arrayRangeFind(
      this._y_index,
      minY,
      maxY
    );

    return intersectionBy(
      elementsWithinXBounds,
      elementsWithinYBounds,
      compareBySecondEntry
    ).map(compareBySecondEntry);
  }

  serialize() {
    return JSON.stringify({
      _points: this._points,
      _x_index: this._x_index,
      _y_index: this._y_index,
    });
  }

  deserialize(data) {
    ({
      _points: this._points,
      _x_index: this._x_index,
      _y_index: this._y_index,
    } = JSON.parse(data));
  }
}

const compareByFirstEntry = (v) => v[0];
const compareBySecondEntry = (v) => v[1];
