'use client';
import { Category } from '@prisma/client';
import { useEffect, useState } from 'react';

interface AssetCategoryFilterProps {
  onCategorySelected: (categoryId: string) => void;
}

export default function AssetCategoryFilter({ onCategorySelected }: AssetCategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories));
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    onCategorySelected(categoryId);
  };

  return (
    <div className="box">
      <h3 className="title is-5">Filter by Category</h3>
      <aside className="menu">
        <ul className="menu-list">
          <li onClick={() => handleCategoryClick('')}>
            <a href="#" className={!selectedCategoryId ? 'is-active' : ''}>
              All Categories
            </a>
          </li>
          {categories.map(category => (
            <li key={category.id} onClick={() => handleCategoryClick(category.id)}>
              <a href="#" className={selectedCategoryId === category.id ? 'is-active' : ''}>
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
