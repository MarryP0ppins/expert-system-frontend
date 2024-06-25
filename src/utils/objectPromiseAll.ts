type PromisesObject<T> = { [K in keyof T]: Promise<T[K]> };

const objectPromiseAll = async <T>(obj: PromisesObject<T>): Promise<T> => {
  const keys = Object.keys(obj) as Array<keyof T>;
  const promises = keys.map((key) => obj[key]);

  const results = await Promise.all(promises);
  return results.reduce((acc, result, index) => {
    acc[keys[index]] = result;
    return acc;
  }, {} as T);
};

export default objectPromiseAll;
