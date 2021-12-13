export function dummyId() {
  return Array.from(new Array(4))
    .map(() => Math.random().toString(36).slice(2))
    .join("");
}

export function generatePoint() {
  return {
    ...generateCoordinates(),
    id: dummyId(),
  };
}

export function generateCoordinates() {
  return {
    x: Math.random() * 360 - 180,
    y: Math.random() * 180 - 90,
  };
}
