import { Decimal } from "@prisma/client/runtime/library";

type Serialized<T> =
  T extends Decimal
    ? number
    : T extends Array<infer U>
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

// This function recursively traverses the input data and converts any Decimal instances to numbers.
export function serializeDecimal<T>(data: T): Serialized<T> {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      // Check if value is a Decimal instance
      if (value instanceof Decimal) {
        return Number(value);
      }
      
      // Fallback: check by constructor name
      if (
        typeof value === "object" &&
        value !== null &&
        value.constructor?.name === "Decimal"
      ) {
        return Number(value);
      }
      
      return value;
    })
  ) as Serialized<T>;
}