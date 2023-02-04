export const asyncFilter = async <ArrayType extends Array<any>>(arr: ArrayType, predicate): Promise<ArrayType> => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]) as ArrayType;
};
