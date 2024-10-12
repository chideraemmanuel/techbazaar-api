export const PASSWORD_REGEX = {
  regex: /^(?=.*[0-9])(?=.*[a-z])(?=.*\W)(?!.* ).{8,16}$/,
  hint: 'Password must be 8-16 characters long, and contain at least one numeric digit, and special character',
};

export const EMAIL_REGEX = {
  regex: /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,5})(\.[a-z]{2,5})?$/,
  hint: 'Invalid email address',
};

export const NAME_REGEX = {
  regex: /^[a-zA-Z]{3,}$/i,
  hint: function () {
    return `${
      this.label || 'Name'
    } should be at least 3 characters long, and can only contain alphabets`;
  },
};

export const PRODUCT_CATEGORIES_ARRAY = [
  'smartphones',
  'tablets',
  'laptops',
  'headphones',
  'speakers',
  'smartwatches',
  'gaming-consoles',
];
