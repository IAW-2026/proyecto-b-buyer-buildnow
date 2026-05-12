import { Decimal } from "@prisma/client/runtime/library";

type Serialized<T> =
  T extends Decimal
    ? number
    : T extends Array<infer U>
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

export function serializeDecimal<T>(data: T): Serialized<T> {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "object" &&
      value !== null &&
      value.constructor?.name === "Decimal"
        ? Number(value)
        : value
    )
  ) as Serialized<T>;
}