/**

 Defining a naive, baseline implementation to give a rough estimate of how much
 the performance of each implementation is improved, and to lay out the central
 assumptions.

 This can also point out if there are places where a more complex index shows
 worse performance.

 assumptions:
 - points contain (at least) an x, y, and an id property (for now, not using
 geojson)
 - the index should not assume that points are only queried by reference.
 - ids are unique, and do not need to be enforced in the database
 */

/**
 * Point type definition
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 * @property {string} id
 */

export class NaiveBbIndex {
  constructor() {
    this._points = {};
  }

  /**
   *
   * @param {Point} point
   */
  index(point) {
    this._points[point.id] = [point.x, point.y];
  }

  removeFromIndex(id) {
    if (this._points[id]) {
      delete this._points[id];
      return true;
    }
    return false;
  }

  queryByBoundingBox({ minX, minY, maxX, maxY }) {
    return Object.entries(this._points).reduce((acc, [id, [x, y]]) => {
      if (minX <= x && maxX >= x && minY <= y && maxY >= y) {
        acc.push(id);
      }
      return acc;
    }, []);
  }

  serialize() {
    return JSON.stringify(this._points);
  }

  deserialize(data) {
    this._points = JSON.parse(data);
  }
}
