'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import DeleteCategoryButton from './DeleteCategoryButton';

interface Category {
  id: string;
  name: string;
  description: string | null;
  assetTagPrefix: string | null;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        setError('Error loading categories. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="has-text-centered p-6">Loading categories...</div>;
  }

  if (error) {
    return <div className="notification is-danger">{error}</div>;
  }

  return (
    <div className="box">
      <div className="table-container">
        <table className="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Asset Tag Prefix</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="has-text-centered">
                  No categories found. Create your first category!
                </td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || '-'}</td>
                  <td>{category.assetTagPrefix || '-'}</td>
                  <td>
                    <div className="buttons are-small">
                      <Link href={`/categories/edit/${category.id}`} className="button is-info">
                        Edit
                      </Link>
                      <DeleteCategoryButton
                        categoryId={category.id}
                        categoryName={category.name}
                        onDeleted={() => {
                          setCategories(categories.filter(c => c.id !== category.id));
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
