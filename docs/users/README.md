# TechBazaar Users Endpoints Documentation

This section covers the routes related to user management, including profile updates, wishlist, cart, and orders.

## Endpoints

### 1. Get All Users

Fetches a paginated list of all users (Requires admin authorization).

**Endpoint**:

**GET** `/users`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `search_query` | String | No | Filter users by text search. | - |
| `sort_by` | String | No | Field to sort results by. | `first_name` , `last_name` , `email` , `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `email_verified` | Boolean | No | Filter users by verified status. | - |
| `auth_type` | String | No | Filter users by authentication type. | `manual`, `google` |
| `role` | String | No | Filter users by role. | `user`, `admin` |
| `disabled` | Boolean | No | Filter users by disabled status. | - |

**Response Format:**

```ts
data: {
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  auth_type: 'manual' | 'google';
  role: 'user' | 'admin';
  disabled: boolean;
}
[];
pagination: {
  total_records: number;
  total_pages: number;
  current_page: number;
  previous_page: number;
  next_page: number;
}
```

### 2. Get Current User

Fetches the currently authenticated user's profile.

**Endpoint**:

**GET** `/users/me`

**Response Format:**

```ts
{
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  auth_type: 'manual' | 'google';
  role: 'user' | 'admin';
  disabled: boolean;
}
```

### 3. Get User By ID

Fetches a user's details by their ID (Requires admin authorization).

**Endpoint**:

**GET** `/users/:userId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId` | String | Yes | The user's unique ID. |

**Response Format:**

```ts
{
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  auth_type: 'manual' | 'google';
  role: 'user' | 'admin';
  disabled: boolean;
}
```

### 4. Update Current User

Updates the currently authenticated user's profile (Only accessible to verified users).

**Endpoint**:

**PUT** `/users/me`

**Body Parameters**:
| Parameter | Type | Required | Description | Requirement |
|-----------|------------|------------|------------|------------|
| `first_name` | String | No | The updated user's first name | - |
| `last_name` | String | No | The updated user's last name | - |
| `password` | String | No | The updated user's password | Must be 8-16 characters long, and contain at least one numeric digit, and special character |

<!-- RESPONSE EXAMPLE -->

### 5. Update User Profile Status By ID

Updates a user's profile status by their ID (Requires admin authorization).

**Endpoint**:

**PUT** `/users/:userId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId` | String | Yes | The user's unique ID. |

**Body Parameters**:
| Parameter | Type | Required | Description | Requirement |
|-----------|------------|------------|------------|------------|
| `role` | String | No | Updated user role. | `user`, `admin` |
| `disabled` | Boolean | No | Updated user disabled status. | - |

<!-- RESPONSE EXAMPLE -->

### 6. Get Current User's Wishlist

Fetches a paginated list of the current user's wishlist items (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/wishlist`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `sort_by` | String | No | Field to sort results by. | `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |

**Response Format:**

```ts
{
    data: {
       name: string;
       brand: {
          name: string;
          logo?: string;
          is_deleted?: boolean;
          deleted_at?: Date;
        };
       description: string;
       category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
       image: string;
       price: number;
       stock: number;
       SKU: string;
       slug: string;
       is_featured: boolean;
       is_archived?: boolean;
       is_deleted?: boolean;
       deleted_at?: Date;
    }[];
    pagination: {
        total_records: number;
        total_pages: number;
        current_page: number;
        previous_page: number;
        next_page: number;
    }
}
```

### 7.Get Wishlist Item By Product ID

Checks if the current user's wishlist includes the product with the provided ID (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/wishlist/product`

**Query Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id` | String | Yes | The product's unique ID. |

**Response Format:**

```ts
{
    name: string;
    brand: {
        name: string;
        logo?: string;
        is_deleted?: boolean;
        deleted_at?: Date;
    };
    description: string;
    category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
    image: string;
    price: number;
    stock: number;
    SKU: string;
    slug: string;
    is_featured: boolean;
    is_archived?: boolean;
    is_deleted?: boolean;
    deleted_at?: Date;
} | ""
```

### 8. Add Item To Wishlist

Adds a product to the authenticated user's wishlist (Only accessible to verified users).

**Endpoint**:

**POST** `/users/me/wishlist`

**Body Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `product` | String | Yes | The product's unique ID. |

<!-- RESPONSE EXAMPLE -->

### 9. Remove Item From Wishlist

Removes an item from the authenticated user's wishlist (Only accessible to verified users).

**Endpoint**:

**DELETE** `/users/me/wishlist/:wishlistItemId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `wishlistItemId` | String | Yes | The ID of the wishlist item. |

<!-- RESPONSE EXAMPLE -->

### 10. Get Current User's Cart

Fetches a paginated list of the current user's cart items (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/cart`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `sort_by` | String | No | Field to sort results by. | `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |

**Response Format:**

```ts
{
    data: {
       name: string;
       brand: {
          name: string;
          logo?: string;
          is_deleted?: boolean;
          deleted_at?: Date;
        };
       description: string;
       category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
       image: string;
       price: number;
       stock: number;
       SKU: string;
       slug: string;
       is_featured: boolean;
       is_archived?: boolean;
       is_deleted?: boolean;
       deleted_at?: Date;
    }[];
    pagination: {
        total_records: number;
        total_pages: number;
        current_page: number;
        previous_page: number;
        next_page: number;
    }
}
```

### 11. Get Current User's Cart Summary

Fetches a paginated list of the authenticated user's cart items (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/cart/summary`

**Response Format:**

```ts
{
  total_items: number;
  total_amount: number;
}
```

### 12.Get Cart Item By Product ID

Checks if the authenticated user's cart includes the product with the provided ID (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/cart/product`

**Query Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id` | String | Yes | The product's unique ID. |

**Response Format:**

```ts
{
    name: string;
    brand: {
        name: string;
        logo?: string;
        is_deleted?: boolean;
        deleted_at?: Date;
    };
    description: string;
    category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
    image: string;
    price: number;
    stock: number;
    SKU: string;
    slug: string;
    is_featured: boolean;
    is_archived?: boolean;
    is_deleted?: boolean;
    deleted_at?: Date;
} | ""
```

### 13. Add Item To Cart

Adds a product to the authenticated user's cart (Only accessible to verified users).

**Endpoint**:

**POST** `/users/me/cart`

**Body Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `product` | String | Yes | The product's unique ID. |

<!-- RESPONSE EXAMPLE -->

### 14. Remove Item From Cart

Removes an item from the authenticated user's cart (Only accessible to verified users).

**Endpoint**:

**DELETE** `/users/me/cart/:cartItemId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `cartItemId` | String | Yes | The ID of the cart item. |

<!-- RESPONSE EXAMPLE -->

### 15. Increment Cart Item Quantity

Increments an item's quantity from the authenticated user's cart (Only accessible to verified users).

**Endpoint**:

**PUT** `/users/me/cart/:cartItemId/increment`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `cartItemId` | String | Yes | The ID of the cart item. |

<!-- RESPONSE EXAMPLE -->

### 16. Decrement Cart Item Quantity

Decrements an item's quantity from the authenticated user's cart (Only accessible to verified users).

**Endpoint**:

**PUT** `/users/me/cart/:cartItemId/decrement`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `cartItemId` | String | Yes | The ID of the cart item. |

<!-- RESPONSE EXAMPLE -->

### 17. Clear Cart

Clears the authenticated user's cart (Only accessible to verified users).

**Endpoint**:

**DELETE** `/users/me/cart`

<!-- RESPONSE EXAMPLE -->

### 18. Get Current User's Orders

Fetches a paginated list of the authenticated user's orders (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/orders`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `sort_by` | String | No | Field to sort results by. | `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `status` | String | No | Filter by order status. | `pending` , `processing` , `in-transit` , `partially-shipped` , `out-for-delivery` , `shipped` , `delivered` , `cancelled` |
| `start_date` | Date (YYYY-MM-DD) | No | Filter orders starting from a particular date. | - |
| `end_date` | Date (YYYY-MM-DD) | No | Filter orders ending at a particular date. | - |

**Response Format:**

```ts
data: {
  user: {
     first_name: string;
     last_name: string;
     email: string;
     email_verified: boolean;
     auth_type: 'manual' | 'google';
     role: 'user' | 'admin';
     disabled: boolean;
};
  items: {
      name: string;
         brand: {
            name: string;
            logo?: string;
            is_deleted?: boolean;
            deleted_at?: Date;
       };
       description: string;
       category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
       image: string;
       price: number;
       stock: number;
       SKU: string;
       slug: string;
       is_featured: boolean;
       is_archived?: boolean;
       is_deleted?: boolean;
       deleted_at?: Date;
    }[];
  billing_information: {
    receipent: {
      first_name: string;
      last_name: string;
      mobile_number: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
  };
  status: 'pending' | 'processing' | 'in-transit' | 'partially-shipped' | 'out-for-delivery' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
}[];
 pagination: {
    total_records: number;
    total_pages: number;
    current_page: number;
    previous_page: number;
    next_page: number;
}
```

### 19. Get User's Orders

Fetches a paginated list of a user's orders (Requires admin authentication).

**Endpoint**:

**GET** `/users/:userId/orders`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId` | String | Yes | The user's unique ID. |

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `sort_by` | String | No | Field to sort results by. | `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `status` | String | No | Filter by order status. | `pending` , `processing` , `in-transit` , `partially-shipped` , `out-for-delivery` , `shipped` , `delivered` , `cancelled` |
| `start_date` | Date (YYYY-MM-DD) | No | Filter orders starting from a particular date. | - |
| `end_date` | Date (YYYY-MM-DD) | No | Filter orders ending at a particular date. | - |

**Response Format:**

```ts
data: {
  user: {
     first_name: string;
     last_name: string;
     email: string;
     email_verified: boolean;
     auth_type: 'manual' | 'google';
     role: 'user' | 'admin';
     disabled: boolean;
};
  items: {
      name: string;
         brand: {
            name: string;
            logo?: string;
            is_deleted?: boolean;
            deleted_at?: Date;
       };
       description: string;
       category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
       image: string;
       price: number;
       stock: number;
       SKU: string;
       slug: string;
       is_featured: boolean;
       is_archived?: boolean;
       is_deleted?: boolean;
       deleted_at?: Date;
    }[];
  billing_information: {
    receipent: {
      first_name: string;
      last_name: string;
      mobile_number: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
  };
  status: 'pending' | 'processing' | 'in-transit' | 'partially-shipped' | 'out-for-delivery' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
}[];
 pagination: {
    total_records: number;
    total_pages: number;
    current_page: number;
    previous_page: number;
    next_page: number;
}
```

### 20. Get Current User's Order By ID

Fetches details of an order of authenticated user by its ID (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/orders/:orderId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `orderId` | String | Yes | The ID of the order. |

**Response Format:**

```ts
{
  user: {
     first_name: string;
     last_name: string;
     email: string;
     email_verified: boolean;
     auth_type: 'manual' | 'google';
     role: 'user' | 'admin';
     disabled: boolean;
};
  items: {
      name: string;
         brand: {
            name: string;
            logo?: string;
            is_deleted?: boolean;
            deleted_at?: Date;
       };
       description: string;
       category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
       image: string;
       price: number;
       stock: number;
       SKU: string;
       slug: string;
       is_featured: boolean;
       is_archived?: boolean;
       is_deleted?: boolean;
       deleted_at?: Date;
    }[];
  billing_information: {
    receipent: {
      first_name: string;
      last_name: string;
      mobile_number: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
  };
  status: 'pending' | 'processing' | 'in-transit' | 'partially-shipped' | 'out-for-delivery' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
};
```

### 21. Get A User's Order By ID

Fetches details of a user's order its by ID (Requires admin authentication).

**Endpoint**:

**GET** `/users/:userId/orders/:orderId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `userId` | String | Yes | The user's unique ID. |
| `orderId` | String | Yes | The ID of the order. |

**Response Format:**

```ts
{
  user: {
     first_name: string;
     last_name: string;
     email: string;
     email_verified: boolean;
     auth_type: 'manual' | 'google';
     role: 'user' | 'admin';
     disabled: boolean;
};
  items: {
      name: string;
         brand: {
            name: string;
            logo?: string;
            is_deleted?: boolean;
            deleted_at?: Date;
       };
       description: string;
       category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles';
       image: string;
       price: number;
       stock: number;
       SKU: string;
       slug: string;
       is_featured: boolean;
       is_archived?: boolean;
       is_deleted?: boolean;
       deleted_at?: Date;
    }[];
  billing_information: {
    receipent: {
      first_name: string;
      last_name: string;
      mobile_number: string;
    };
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
  };
  status: 'pending' | 'processing' | 'in-transit' | 'partially-shipped' | 'out-for-delivery' | 'shipped' | 'delivered' | 'cancelled';
  total_price: number;
};
```

### 22. Place Order

Places an order for the authenticated user (Only accessible to verified users).

**Endpoint**:

**POST** `/users/me/orders`

**Body Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `billing_information` | Object | No | The order's billing information. See below for fields. |
| `use_saved_billing_information` | Boolean | No | Specifies whether to use previously saved billing information |

**`billing_information` fields:**
| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `receipent` | Object | Yes | The order receipent's information |
| | | | - `first_name` (String, Required): The order receipent's first name |
| | | | - `last_name` (String, Required): The order receipent's last name |
| | | | - `mobile_number` (String, Required): The order receipent's mobile number |
| `address` | Object | Yes | The order address information |
| | | | - `street` (String, Required): The order destination street |
| | | | - `city` (String, Required): The order destination city |
| | | | - `state` (String, Required): The order destination state |
| | | | - `country` (String, Required): The order destination country |

**Query Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `save_billing_information` | Boolean | No | Specifies whether to save the provided billing information. This will delete any previously saved billing information if any. |

<!-- RESPONSE EXAMPLE -->

### 23. Cancel Current User's Order By ID

Cancels an order of authenticated user by ID (Only accessible to verified users).

**Endpoint**:

**DELETE** `/users/me/orders/:orderId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `orderId` | String | Yes | The ID of the order. |

<!-- RESPONSE EXAMPLE -->

### 24. Get Current User's Saved Billing Information

Fetches the saved billing information of the authenticated user (Only accessible to verified users).

**Endpoint**:

**GET** `/users/me/billing`

**Response Format:**

```ts
{
  user: {
    first_name: string;
    last_name: string;
    email: string;
    email_verified: boolean;
    auth_type: 'manual' | 'google';
    role: 'user' | 'admin';
    disabled: boolean;
  }
  receipent: {
    first_name: string;
    last_name: string;
    mobile_number: string;
  }
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  }
}
```
