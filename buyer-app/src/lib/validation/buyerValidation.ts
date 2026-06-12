const PHONE_MIN_LENGTH = 8;
const PHONE_MAX_LENGTH = 15;

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export function getRequiredFormValue(
  formData: FormData,
  field: string,
  label: string
): ValidationResult<string> {
  const value =
    formData.get(field)?.toString().trim() ?? "";

  if (!value) {
    return {
      success: false,
      error: `${label} es requerido.`,
    };
  }

  return {
    success: true,
    data: value,
  };
}

export function getOptionalFormValue(
  formData: FormData,
  field: string
) {
  const value =
    formData.get(field)?.toString().trim() ?? "";

  return value || undefined;
}

export function validatePhone(
  phone: string
): ValidationResult<string> {
  if (!phone) {
    return {
      success: false,
      error: "El telefono es requerido.",
    };
  }

  if (!/^\d+$/.test(phone)) {
    return {
      success: false,
      error:
        "Formato de telefono invalido. Ingresa entre 8 y 15 numeros, sin espacios, guiones ni otros caracteres.",
    };
  }

  if (
    phone.length < PHONE_MIN_LENGTH ||
    phone.length > PHONE_MAX_LENGTH
  ) {
    return {
      success: false,
      error:
        "Formato de telefono invalido. Ingresa entre 8 y 15 numeros, sin espacios, guiones ni otros caracteres.",
    };
  }

  return {
    success: true,
    data: phone,
  };
}
