export const asyncFilter = async <T>(arr: Array<T>, predicate: Predicate<T>) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

type Predicate<Item> = (item?: Item, index?: number) => Promise<boolean>;
