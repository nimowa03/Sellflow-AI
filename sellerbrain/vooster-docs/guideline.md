```markdown
# AI Seller SaaS Platform - Code Guidelines

## 1. Project Overview

This project develops a SaaS platform using AI agents to automate tasks for solo e-commerce sellers. Key architectural decisions include a React-based frontend (Next.js), a Python (FastAPI) backend, MongoDB for data storage, and Langchain/LangGraph for AI agent orchestration. Vector databases (Pinecone/Weaviate) are used for semantic search, and TensorFlow Serving/TorchServe for model deployment.

## 2. Core Principles

*   **Maintainability**: Code should be easy to understand, modify, and debug by any team member.
*   **Testability**: Code should be written in a way that allows for easy unit and integration testing.
*   **Performance**: Code should be optimized for speed and efficiency.
*   **Readability**: Code should be clear, concise, and well-documented.
*   **Security**: Code should be written with security best practices in mind to prevent vulnerabilities.

## 3. Language-Specific Guidelines

### 3.1. Python (FastAPI)

#### File Organization and Directory Structure

*   Follow the Domain-Driven Design (DDD) principles.
*   Use a clear and consistent directory structure. Example:

    ```
    backend/
    ├── app/
    │   ├── api/             # API endpoints (routers)
    │   │   ├── product.py   # Product-related APIs
    │   │   ├── content.py   # Content-related APIs
    │   │   └── ...
    │   ├── core/            # Core application logic
    │   ├── db/              # Database connection and models
    │   ├── models/          # Data models (Pydantic)
    │   ├── schemas/         # Request/Response schemas (Pydantic)
    │   ├── services/        # Business logic services
    │   ├── utils/           # Utility functions
    │   └── __init__.py
    ├── main.py             # FastAPI application entry point
    └── requirements.txt    # Dependencies
    ```

#### Import/Dependency Management

*   Use `poetry` or `pip` for dependency management.
*   Specify dependencies in `pyproject.toml` (for Poetry) or `requirements.txt` (for pip).
*   Use explicit imports: `from module import function` instead of `import module`.
*   Group imports by standard library, third-party libraries, and local modules.

    ```python
    # Standard library imports
    import os
    import json

    # Third-party library imports
    from fastapi import FastAPI, HTTPException
    from pymongo import MongoClient

    # Local module imports
    from app.models import Product
    ```

#### Error Handling Patterns

*   Use `try...except` blocks for handling exceptions.
*   Raise custom exceptions for specific error conditions.
*   Use FastAPI's `HTTPException` for returning HTTP error responses.
*   Log errors with sufficient context for debugging.

    ```python
    from fastapi import FastAPI, HTTPException
    import logging

    logger = logging.getLogger(__name__)

    async def get_product(product_id: str):
        try:
            product = await db.find_one({"_id": product_id})
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            return product
        except Exception as e:
            logger.exception(f"Error getting product {product_id}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")
    ```

### 3.2. React (Next.js)

#### File Organization and Directory Structure

*   Use the Next.js `app` directory structure.
*   Organize components into logical directories.
*   Separate UI components from business logic.

    ```
    frontend/
    ├── app/
    │   ├── dashboard/
    │   │   ├── page.tsx       # Dashboard page component
    │   │   └── components/   # Dashboard-specific components
    │   ├── products/
    │   │   ├── page.tsx       # Product page component
    │   │   └── components/   # Product-specific components
    │   ├── api/             # API route handlers
    │   │   ├── products/
    │   │   │   └── route.ts   # API route for products
    │   └── ...
    ├── components/          # Reusable UI components
    ├── utils/               # Utility functions
    ├── styles/              # Global styles
    └── ...
    ```

#### Import/Dependency Management

*   Use `npm` or `yarn` for dependency management.
*   Declare dependencies in `package.json`.
*   Use absolute imports for components and modules.

    ```javascript
    // Correct: Absolute import
    import ProductCard from '@/components/ProductCard';

    // Incorrect: Relative import (avoid)
    import ProductCard from '../../components/ProductCard';
    ```

#### Error Handling Patterns

*   Use `try...catch` blocks for handling errors.
*   Display user-friendly error messages.
*   Log errors to the console or a logging service.
*   Consider using error boundary components to prevent crashes.

    ```javascript
    import { useState, useEffect } from 'react';

    function ProductList() {
      const [products, setProducts] = useState([]);
      const [error, setError] = useState(null);

      useEffect(() => {
        async function fetchProducts() {
          try {
            const response = await fetch('/api/products');
            if (!response.ok) {
              throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            setProducts(data);
          } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message);
          }
        }
        fetchProducts();
      }, []);

      if (error) {
        return <div>Error: {error}</div>;
      }

      return (
        <ul>
          {products.map(product => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      );
    }
    ```

## 4. Code Style Rules

#### MUST Follow:

*   **Naming Conventions**:
    *   Python: `snake_case` for variables and functions, `PascalCase` for classes.
    *   JavaScript/TypeScript: `camelCase` for variables and functions, `PascalCase` for components.
    *   Consistent naming across the project.
    *   Rationale: Ensures consistency and readability.
*   **Code Formatting**:
    *   Python: Use `black` and `flake8` for code formatting and linting.
    *   JavaScript/TypeScript: Use `eslint` and `prettier` for code formatting and linting.
    *   Rationale: Enforces a consistent code style and prevents common errors.
*   **Comments and Documentation**:
    *   Write clear and concise comments to explain complex logic.
    *   Document all functions and classes with docstrings (Python) or JSDoc (JavaScript/TypeScript).
    *   Rationale: Improves code understanding and maintainability.
*   **Testing**:
    *   Write unit tests for all core functions and components.
    *   Use integration tests to verify the interaction between different parts of the system.
    *   Rationale: Ensures code correctness and prevents regressions.
*   **Security Best Practices**:
    *   Sanitize user inputs to prevent XSS and SQL injection attacks.
    *   Use secure authentication and authorization mechanisms.
    *   Rationale: Protects the system from security vulnerabilities.
*   **Use Environment Variables**:
    *   Store sensitive information like API keys and database credentials in environment variables.
    *   Rationale: Avoids hardcoding sensitive data in the codebase.

#### MUST NOT Do:

*   **Global Variables**:
    *   Avoid using global variables. Use dependency injection or state management solutions instead.
    *   Rationale: Global variables can lead to unpredictable behavior and make code harder to test.
*   **Magic Numbers/Strings**:
    *   Avoid using hardcoded numbers or strings directly in the code. Use constants instead.
    *   Rationale: Improves code readability and maintainability.
*   **Nested Callbacks**:
    *   Avoid deeply nested callbacks. Use promises, async/await, or reactive programming techniques instead.
    *   Rationale: Makes code harder to read and debug (Callback Hell).
*   **Ignoring Errors**:
    *   Never ignore errors. Handle errors gracefully and log them appropriately.
    *   Rationale: Ignoring errors can lead to unexpected behavior and make it difficult to debug problems.
*   **Over-commenting**:
    *   Comments should explain the *why* and not the *what*. Code should be self-explanatory where possible.
    *   Rationale: Too many comments clutter the code and make it harder to read.
*   **Committing Secrets**:
    *   Never commit sensitive information (API keys, passwords) to the repository.
    *   Rationale: Prevents security breaches.

## 5. Architecture Patterns

### Component/Module Structure Guidelines

*   **Frontend (React/Next.js)**:
    *   Use functional components with hooks for state management and side effects.
    *   Separate components into presentational and container components.
    *   Use a component library (e.g., Material UI, Ant Design) for consistent UI elements.
*   **Backend (FastAPI)**:
    *   Use dependency injection to manage dependencies.
    *   Separate concerns into different modules (e.g., API endpoints, business logic, data access).
    *   Use Pydantic models for data validation and serialization.

### Data Flow Patterns

*   **Frontend to Backend**:
    *   Use `fetch` or `axios` to make API requests to the backend.
    *   Handle API responses and errors appropriately.
*   **Backend to Database**:
    *   Use a database driver (e.g., `pymongo`) to interact with the MongoDB database.
    *   Use asynchronous operations to prevent blocking the main thread.
*   **AI Agent Interaction**:
    *   Backend orchestrates calls to the AI agents (Langchain/LangGraph).
    *   AI agents interact with Vector DBs (Pinecone/Weaviate) to retrieve relevant information.

### State Management Conventions

*   **Frontend (React/Next.js)**:
    *   Use React Context for global state management.
    *   Consider using a state management library like Zustand or Redux for complex state management needs.
    *   Use server actions for mutations and data fetching.

### API Design Standards

*   **RESTful APIs**:
    *   Follow RESTful principles for API design.
    *   Use standard HTTP methods (GET, POST, PUT, DELETE).
    *   Use meaningful resource names (e.g., `/products`, `/users`).
*   **JSON Format**:
    *   Use JSON for request and response bodies.
*   **Error Handling**:
    *   Return appropriate HTTP status codes for errors.
    *   Include error messages in the response body.
*   **Authentication**:
    *   Use JWT (JSON Web Tokens) for authentication.
    *   Implement proper authorization mechanisms.
*   **Versioning**:
    *   Versioning the API using URL path (e.g., `/api/v1/products`).

```python
# MUST: Example of a well-defined API endpoint in FastAPI
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import Product
from app.schemas import ProductCreate, ProductRead
from app.services import product_service

router = APIRouter()

@router.post("/", response_model=ProductRead, status_code=201)
async def create_product(product_create: ProductCreate, service: product_service = Depends()):
    """
    Endpoint to create a new product.
    """
    return await service.create_product(product_create)

@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: str, service: product_service = Depends()):
    """
    Endpoint to retrieve a product by its ID.
    """
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Explanation:
# - Uses FastAPI's APIRouter for modular API definition.
# - Includes type hints for request and response models (Pydantic).
# - Uses dependency injection for service layer.
# - Handles errors with HTTPException.
# - Provides docstrings for API documentation.
```

```python
# MUST NOT: Example of a poorly designed API endpoint (FastAPI)

from fastapi import FastAPI

app = FastAPI()

@app.get("/getData")
async def get_data(param1, param2, param3): # No type hints, unclear what parameters are
    # Complex logic directly in the endpoint
    result = do_something_complex(param1, param2, param3)
    return {"result": result}

# Explanation:
# - Lacks type hints, making it difficult to understand the expected data types.
# - Contains complex logic directly within the endpoint, making it hard to test and maintain.
# - Does not follow RESTful principles.
```

```javascript
// MUST: React component example with proper structure
import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product'; //Using absolute import
import { getProducts } from '@/api/products';    //Using absolute import

interface ProductListProps {
  // Props definition if any
}

const ProductList: React.FC<ProductListProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch products", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
};

export default ProductList;

//Explanation:
// - Using types for state variables
// - Separated data fetching logic into `api/products.ts`
// - Clear loading and error states
```

```javascript
// MUST NOT: React component example to avoid

import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  return ( //No error handling, No types, inline fetch, no loading state
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
};

export default ProductList;

//Explanation:
// - No error handling
// - No loading state
// - Inline fetch logic
// - Missing types
```
