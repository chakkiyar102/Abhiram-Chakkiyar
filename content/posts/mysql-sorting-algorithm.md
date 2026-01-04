---
title: "What is the sorting algorithm behind ORDER BY query in MySQL?"
date: "2024-01-15"
description: "Since the last couple of weeks, I have been working on MySQL more closely. MySQL is a brilliant piece of software. I was curious to know which algorithm MySQL uses and how ORDER BY query works internally."
tags: ["database", "mysql", "algorithms"]
---

Since the last couple of weeks, I have been working on MySQL more closely. MySQL is a brilliant piece of software. I remember reading about all the sorting algorithms in college so I was curious to know which algorithm MySQL uses and how `ORDER BY` query works internally in such an efficient manner.

## The Short Answer

MySQL uses a variation of **quicksort** for most sorting operations, but it's not that simple. The actual algorithm depends on several factors:

1. **Size of the dataset**
2. **Available memory** (sort_buffer_size)
3. **Type of data being sorted**

## How ORDER BY Works Internally

When you execute a query with `ORDER BY`:

```sql
SELECT * FROM users ORDER BY created_at DESC;
```

MySQL goes through these steps:

### Step 1: Filesort Algorithm

If MySQL cannot use an index for sorting, it uses a **filesort** operation. Despite the name, filesort doesn't necessarily write to disk.

### Step 2: Memory vs Disk Sorting

- **In-memory sorting**: When the result set fits in `sort_buffer_size`, MySQL uses quicksort entirely in memory
- **Disk-based sorting**: For larger datasets, MySQL uses a combination of quicksort and merge sort

### Step 3: The Sorting Algorithms

| Scenario | Algorithm Used |
|----------|----------------|
| Small datasets (fits in memory) | Quicksort |
| Large datasets | Merge Sort with chunks |
| Indexed columns | Index scan (no sorting needed) |

## Optimizing ORDER BY Queries

### Use Indexes When Possible

```sql
CREATE INDEX idx_created_at ON users(created_at);
```

### Adjust sort_buffer_size

```sql
SET SESSION sort_buffer_size = 256000; -- 256KB
```

### Avoid Using SELECT * with ORDER BY

```sql
-- Bad
SELECT * FROM users ORDER BY created_at DESC;

-- Good
SELECT id, name, email FROM users ORDER BY created_at DESC;
```

## Conclusion

MySQL's sorting is a complex topic. The database engine intelligently chooses between different algorithms based on the situation. Understanding these internals helps you write more efficient queries.

---

*Want to learn more about database internals? Check out the [MySQL documentation](https://dev.mysql.com/doc/).*
