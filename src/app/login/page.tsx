import { Metadata } from 'next';

import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login - Asset Tracker',
  description: 'Login to the Asset Tracker system',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const redirectTo = (await searchParams).redirectTo;

  return (
    <div className="section mt-6">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-one-third">
            <div className="box">
              <h1 className="title has-text-centered">Login</h1>
              <LoginForm redirectTo={redirectTo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
