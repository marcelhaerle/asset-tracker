import Link from 'next/link';
import CategoryList from '@/components/category/CategoryList';

export default function CategoriesPage() {
  return (
    <div className="container">
      <section className="section">
        <div className="columns">
          <div className="column">
            <h1 className="title is-2">Categories</h1>
            <h2 className="subtitle">Manage asset categories to better organize your inventory.</h2>
          </div>
          <div className="column is-narrow">
            <Link href="/categories/new" className="button is-primary">
              <span className="icon">
                <i className="fas fa-plus"></i>
              </span>
              <span>New Category</span>
            </Link>
          </div>
        </div>

        <CategoryList />
      </section>
    </div>
  );
}
