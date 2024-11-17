export const PASSWORD_VALIDATION = {
  regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*\W)(?!.* ).{8,16}$/,
  hint: 'Password must be 8-16 characters long, and contain at least one numeric digit, and special character',
};

export const EMAIL_REGEX = {
  regex: /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,5})(\.[a-z]{2,5})?$/,
  hint: 'Invalid email address',
};

export const PHONE_NUMBER_REGEX =
  /^[\+]?[0-9]{0,3}\W?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

export const NAME_REGEX = /^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/;

export const PRODUCT_CATEGORIES_ARRAY = [
  'smartphones',
  'tablets',
  'laptops',
  'headphones',
  'speakers',
  'smartwatches',
  'gaming-consoles',
];
