import type { AnyType } from "../../types/types";

/**
 * Utility class for filtering fields in data objects.
 */
class FilterData {
  /**
   * Returns a shallow copy of the object with specified fields removed.
   * @param dataObj The source object.
   * @param fieldsToRemove The list of field names to remove.
   */
  removeFields<T extends Record<string, AnyType>>(
    dataObj: T,
    fieldsToRemove: string[]
  ): Partial<T> {
    // Use Object.entries + Object.fromEntries for shallow copy minus the fields
    return Object.fromEntries(
      Object.entries(dataObj).filter(([key]) => !fieldsToRemove.includes(key))
    ) as Partial<T>;
  }

  /**
   * Returns a new object with only the specified fields.
   * You can optionally rename fields by providing [from, to] pairs.
   * @param dataObj The source object.
   * @param fields The list of field names or [from, to] rename pairs.
   */
  addFields<T extends Record<string, AnyType>>(
    dataObj: T,
    fields: (string | [string, string])[]
  ): Partial<T> {
    const entries = fields.flatMap((field) => {
      if (Array.isArray(field)) {
        const [from, to] = field;
        return dataObj[from] !== undefined ? [[to, dataObj[from]]] : [];
      }
      return dataObj[field] !== undefined ? [[field, dataObj[field]]] : [];
    });
    return Object.fromEntries(entries);
  }
}

const filterData = new FilterData();

export { filterData };
