# TechBazaar Products Endpoints Documentation

This section covers the available routes for managing products in the API.

## Endpoints

### 1. Get All Available Products

Fetches a paginated list of all **available (active)** products.

**Endpoint**:

**GET** `/products`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| -------------- | ------- | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `search_query` | String | No | Filter products by text search. | - |
| `sort_by` | String | No | Field to sort results by. | `name` , `price` , `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `category` | String | No | Filter products by category. | `smartphones` , `tablets` , `laptops` , `headphones` , `speakers` , `smartwatches` , `gaming-consoles` |
| `brand` | String | No | Filter products by category. | Brand ID or name |
| `min_price` | Number | No | Filter products by a minimum price (in Nigerian Naira). | - |
| `max_price` | Number | No | Filter products by a maximum price (in Nigerian Naira). | - |
| `is_featured` | Boolean | No | Filter products by a `is_featured` status. | - |

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
        is_archived?: false;
        is_deleted?: false;
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

### 2. Get Random Available Products

Fetches a random selection of available products.

**Endpoint**:

**GET** `/products/random`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `limit` | Number | No | The number of random products to fetch (default: 20). | - |
| `exclude` | String | No | A product ID to exclude fron the result. | - |
| `sort_by` | String | No | Field to sort results by. | `name` , `price` , `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `category` | String | No | Filter products by category. | `smartphones` , `tablets` , `laptops` , `headphones` , `speakers` , `smartwatches` , `gaming-consoles` |
| `brand` | String | No | Filter products by brand. | Brand ID or name |
| `is_featured` | Boolean | No | Filter products by a `is_featured` status. | - |
| `min_price` | Number | No | Filter products by a minimum price (in Nigerian Naira). | - |
| `max_price` | Number | No | Filter products by a maximum price (in Nigerian Naira). | - |

<!-- RESPONSE SAMPLE -->

### 3. Get All Products

Fetches a paginated list of all products, including inactive ones (Requires admin authorization).

**Endpoint**:

**GET** `/products/all`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| -------------- | ------- | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `search_query` | String | No | Filter products by text search. | - |
| `sort_by` | String | No | Field to sort results by. | `name` , `price` , `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `category` | String | No | Filter products by category. | `smartphones` , `tablets` , `laptops` , `headphones` , `speakers` , `smartwatches` , `gaming-consoles` |
| `brand` | String | No | Filter products by brand. | Brand ID or name |
| `min_price` | Number | No | Filter products by a minimum price (in Nigerian Naira). | - |
| `max_price` | Number | No | Filter products by a maximum price (in Nigerian Naira). | - |
| `is_featured` | Boolean | No | Filter products by a featured status. | - |
| `is_archived` | Boolean | No | Filter products by a archived status. | - |
| `is_deleted` | Boolean | No | Filter products by a deleted status. | - |

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

### 4. Get Available Product by ID or Slug

Fetches an available product by its ID or slug.

**Endpoint**:

**GET** `/products/:idOrSlug`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `idOrSlug` | String | Yes | The product's unique ID or slug. |

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
    is_archived?: false;
    is_deleted?: false;
}
```

### 5. Get Product by ID or Slug

Fetches a product (including inactive) by its ID or slug (Requires admin authorization).

**Endpoint**:

**GET** `/products/:idOrSlug/all`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `idOrSlug` | String | Yes | The product's unique ID or slug. |

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
}
```

### 6. Get Related Products

Fetches a list of related products to the given product.

**Endpoint**:

**GET** `/products/:idOrSlug/related`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `idOrSlug` | String | Yes | The product's unique ID or slug. |

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
    is_archived?: false;
    is_deleted?: false;
}[]
```

### 7. Add Product

Adds a new product (Requires admin authorization).

**Endpoint**:

**POST** `/products`

**Body Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | -------- |
| `name` | String | Yes | Name of the product. | - |
| `brand` | String | Yes | Product's brand. | Brand ID or name |
| `description` | String | Yes | Description of the product. | - |
| `category` | String | Yes | Category of the product. | `smartphones` , `tablets` , `laptops` , `headphones` , `speakers` , `smartwatches` , `gaming-consoles` |
| `image` | File | Yes | The product's image file. | - |
| `price` | Number | Yes | The product's price (in Nigerian Naira). | - |
| `stock` | Number | Yes | The number of products in stock. | - |
| `is_featured` | Boolean | Yes | A boolean flag to either feature the product or not. | - |

**Request Sample:**

```bash
POST /products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: multipart/form-data

{
    name: string,
    brand: string,
    description: string,
    category: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles',
    image: string,
    price: number,
    stock: number,
    SKU: string,
    slug: string,
    is_featured: boolean,
}
```

<!-- RESPONSE SAMPLE -->

### 8. Update Product

Updates an existing product (Requires admin authorization).

**Endpoint**:

**PUT** `/products/:idOrSlug`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `idOrSlug` | String | Yes | The product's unique ID or slug. |

**Body Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | -------- |
| `name` | String | No | Updated name of the product. | - |
| `brand` | String | No | Updated product brand. | Brand ID or name |
| `description` | String | No | Updated product description. | - |
| `category` | String | No | Updated product category. | `smartphones` , `tablets` , `laptops` , `headphones` , `speakers` , `smartwatches` , `gaming-consoles` |
| `image` | File | No | Updated product image file. | - |
| `price` | Number | No | Updated product price (in Nigerian Naira). | - |
| `stock` | Number | No | Updated product stock count. | - |
| `is_featured` | Boolean | No | Updated product `is_featured` flag. | - |

**Request Sample:**

```bash
POST /products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: multipart/form-data

{
    name?: string,
    brand?: string,
    description?: string,
    category?: 'smartphones' | 'tablets' | 'laptops' | 'headphones' | 'speakers' | 'smartwatches' | 'gaming-consoles',
    image?: string,
    price?: number,
    stock?: number,
    SKU?: string,
    slug?: string,
    is_featured?: boolean,
}
```

<!-- RESPONSE SAMPLE -->

### 9. Delete Product

Deletes a product by its ID or slug (Requires admin authorization).

**Endpoint**:

**DELETE** `/products/:idOrSlug`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `idOrSlug` | String | Yes | The product's unique ID or slug. |

<!-- RESPONSE SAMPLE -->

### 10. Restore Product

Restores a previously deleted product. (Requires admin authorization).

**Endpoint**:

**PUT** `/products/:idOrSlug/restore`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `idOrSlug` | String | Yes | The product's unique ID or slug. |

<!-- RESPONSE SAMPLE -->
