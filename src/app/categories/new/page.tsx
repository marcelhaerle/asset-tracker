import CategoryForm from '@/components/category/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="container">
      <section className="section">
        <h1 className="title is-2">Create New Category</h1>

        <div className="content mb-5">
          <p>Create a new category to organize your assets.</p>
        </div>

        <CategoryForm mode="create" />
      </section>
    </div>
  );
}
