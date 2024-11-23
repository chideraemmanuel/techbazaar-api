# TechBazaar Brands Endpoints Documentation

This section covers the available routes for managing brands in the API.

## Endpoints

### 1. Get All Available Brands

Fetches a list of all **available** brands.

**Endpoint**:

**GET** `/brands`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | ------- |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `search_query` | String | No | Filter brands by text search. | - |
| `sort_by` | String | No | Field to sort results by. | `name` , `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `paginated` | Boolean (true) | No | Specifies if result should be returned in a paginated form. | - |

#### Response Format:

**Paginated:**

```ts
data: {
   name: string;
   logo?: string;
   is_deleted?: false;
}[];
 pagination: {
    total_records: number;
    total_pages: number;
    current_page: number;
    previous_page: number;
    next_page: number;
}
```

**Unpaginated:**

```ts
{
    name: string;
    logo?: string;
    is_deleted?: boolean;
    deleted_at?: Date;
}[];
```

### 2. Get All Brands

Fetches a list of all brands, including inactive/deleted ones (Requires admin authorization).

**Endpoint**:

**GET** `/brands/all`

**Query Parameters:**
| Parameter | Type | Required | Description | Options |
| -------------- | ------- | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `page` | Number | No | Page number for pagination (default: 1). | - |
| `limit` | Number | No | Items per page (default: 20). | - |
| `search_query` | String | No | Filter brands by text search. | - |
| `sort_by` | String | No | Field to sort results by. | `name` , `date_created` , `date_updated` |
| `sort_order` | String | No (Yes, if `sort_by` is specified) | Result sort order. | `ascending` , `descending` |
| `is_deleted` | Boolean | No | Filter brands by a deleted status. | - |
| `paginated` | Boolean (true) | No | Specifies if result should be returned in a paginated form. | - |

#### Response Format:

**Paginated:**

```ts
data: {
    name: string;
    logo?: string;
    is_deleted?: false;
}[];
 pagination: {
    total_records: number;
    total_pages: number;
    current_page: number;
    previous_page: number;
    next_page: number;
}
```

**Unpaginated:**

```ts
{
    name: string;
    logo?: string;
    is_deleted?: boolean;
    deleted_at?: Date;
}[];
```

### 3. Get Available Brand by ID or Slug

Fetches an available brand by its ID.

**Endpoint**:

**GET** `/brands/:brandId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `brandId` | String | Yes | The brand's unique ID. |

**Response Format:**

```ts
{
    name: string;
    logo?: string;
    is_deleted?: false;
};
```

### 4. Get Brand by ID or Slug

Fetches a brand (including inactive/deleted) by its ID (Requires admin authorization).

**Endpoint**:

**GET** `/brands/:brandId/all`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `brandId` | String | Yes | The brand's unique ID. |

**Response Format:**

```ts
{
    name: string;
    logo?: string;
    is_deleted?: boolean;
    deleted_at?: Date;
};
```

### 5. Add Brand

Adds a new brand (Requires admin authorization).

**Endpoint**:

**POST** `/brands`

**Body Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | -------- |
| `name` | String | Yes | Name of the brand. | - |
| `logo` | File | No | The brand's logo file. | - |

**Request Sample:**

```bash
POST /brands
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: multipart/form-data

{
    name: Apple,
    logo?: File
}
```

<!-- RESPONSE SAMPLE -->

### 8. Update Brand

Updates an existing brand (Requires admin authorization).

**Endpoint**:

**PUT** `/brands/:brandId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `brandId` | String | Yes | The brand's unique ID. |

**Body Parameters:**
| Parameter | Type | Required | Description | Options |
| --------- | ---- | -------- | ----------- | -------- |
| `name` | String | No | Updated brand name. | - |
| `logo` | File | No | Updated brand logo file. | - |

**Request Sample:**

```bash
POST /brands/:brandId
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Content-Type: multipart/form-data

{
    name?: Apple,
    logo?: File
}
```

<!-- RESPONSE SAMPLE -->

### 9. Delete Brand

Deletes a brand by its ID (Requires admin authorization).

**Endpoint**:

**DELETE** `/brands/:brandId`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `brandId` | String | Yes | The brand's unique ID. |

<!-- RESPONSE SAMPLE -->

### 10. Restore Brand

Restores a previously deleted brand. (Requires admin authorization).

**Endpoint**:

**PUT** `/brands/:brandId/restore`

**Path Parameters:**
| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `brandId` | String | Yes | The brand's unique ID. |

<!-- RESPONSE SAMPLE -->
