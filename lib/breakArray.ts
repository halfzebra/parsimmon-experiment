export function breakArray<T>(
  predicate: (x: T) => boolean,
  list: T[]
): [T[], T[]] {
  let i;
  let length;
  let pivot;

  if (typeof predicate !== 'function') {
    throw new Error(
      `breakArray: got '${typeof predicate}' instead of a function as 'predicate'`
    );
  }

  if (!Array.isArray(list)) {
    throw new Error(`breakArray: got '${typeof list}' instead of an 'Array'`);
  }

  if (list.length === 0) {
    return [[], []];
  }

  length = list.length;
  i = list.findIndex(predicate);
  pivot = i - 1;

  if (pivot <= length - 1 && 0 <= pivot) {
    i = i - 1;
  }

  if (i === -1) {
    pivot = length;
  }

  return [list.slice(0, pivot + 1), list.slice(pivot + 1)];
}
