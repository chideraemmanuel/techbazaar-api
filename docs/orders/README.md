# TechBazaar Orders Endpoints Documentation

This section covers the routes related to managing orders, including fetching all orders, retrieving specific orders by ID, and updating order statuses.

## Endpoints

### 1. Get All Orders

Fetches a paginated list of all orders (Requires admin authorization).

**Endpoint**:

**GET** `/orders`

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

### 2. Get Order By ID

Fetches details of a specific order by its ID. (Requires admin authorization).

**Endpoint**:

**GET** `/orders/:orderId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `orderId` | String | Yes | The order's unique ID. |

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

### 3. Update Order Status

Updates the status of a specific order by its ID. (Requires admin authorization).

**Endpoint**:

**GET** `/orders/:orderId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `orderId` | String | Yes | The order's unique ID. |

**Body Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `status` | String | Yes | The order's unique ID. | `pending` , `processing` , `in-transit` , `partially-shipped` , `out-for-delivery` , `shipped` , `delivered` , `cancelled` |

<!-- RESPONSE EXAMPLE -->
