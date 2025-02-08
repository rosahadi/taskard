const filterObj = <T extends object>(
  obj: T,
  ...allowedFields: (keyof T)[]
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) =>
      allowedFields.includes(key as keyof T)
    )
  ) as Partial<T>;
};

export default filterObj;
