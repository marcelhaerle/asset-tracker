'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface CategoryFormData {
  name: string;
  description: string;
  assetTagPrefix: string;
}

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    assetTagPrefix: string | null;
  };
  mode: 'create' | 'edit';
}

export default function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    assetTagPrefix: initialData?.assetTagPrefix || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        assetTagPrefix: initialData.assetTagPrefix || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = mode === 'create' ? '/api/categories' : `/api/categories/${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save category');
      }

      // Redirect back to categories page
      router.push('/categories');
      router.refresh();
    } catch (err: unknown) {
      const errorMesasge = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMesasge);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="box">
      {error && <div className="notification is-danger mb-4">{error}</div>}

      <div className="field">
        <label className="label" htmlFor="name">
          Category Name *
        </label>
        <div className="control">
          <input
            id="name"
            name="name"
            className="input"
            type="text"
            placeholder="Enter category name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="assetTagPrefix">
          Asset Tag Prefix
        </label>
        <div className="control">
          <input
            id="assetTagPrefix"
            name="assetTagPrefix"
            className="input"
            type="text"
            placeholder="Enter asset tag prefix"
            value={formData.assetTagPrefix}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="description">
          Description
        </label>
        <div className="control">
          <textarea
            id="description"
            name="description"
            className="textarea"
            placeholder="Enter category description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field is-grouped mt-5">
        <div className="control">
          <button
            type="submit"
            className={`button is-primary ${isSubmitting ? 'is-loading' : ''}`}
            disabled={isSubmitting}
          >
            {mode === 'create' ? 'Create Category' : 'Update Category'}
          </button>
        </div>
        <div className="control">
          <button
            type="button"
            className="button is-light"
            onClick={() => router.push('/categories')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
