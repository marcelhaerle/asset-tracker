import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CategoryForm from '@/components/category/CategoryForm';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  // Fetch category from database
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="container">
      <section className="section">
        <h1 className="title is-2">Edit Category</h1>

        <div className="content mb-5">
          <p>Update category details below.</p>
        </div>

        <CategoryForm initialData={category} mode="edit" />
      </section>
    </div>
  );
}
