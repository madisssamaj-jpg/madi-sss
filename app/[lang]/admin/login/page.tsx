'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { loginAdminAction } from '@/app/actions/auth-actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || 'ne';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const res = await loginAdminAction(formData);
      if (res.success) {
        router.push(`/${lang}/admin`);
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#01366E] text-white font-bold text-2xl mb-4 shadow">
          म
        </div>
        <h2 className="text-3xl font-extrabold text-[#01366E]">
          {lang === 'ne' ? 'प्रशासक लगइन' : 'Admin Portal Login'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {lang === 'ne'
            ? 'मादी (संखुवासभा) सरोकार समाज वित्तीय तथा प्रशासनिक प्रणाली'
            : 'Madi (Sankhuwasabha) Sarokar Samaj CMS & Financial Subsystem'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700">
              <span className="font-semibold">{lang === 'ne' ? 'त्रुटि: ' : 'Error: '}</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {lang === 'ne' ? 'प्रशासक इमेल' : 'Superadmin Email'}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@madisss.org.np"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FB6C01] focus:border-transparent text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {lang === 'ne'
                  ? 'सुरक्षाका लागि दर सीमित (Rate-limited) गरिएको छ।'
                  : 'Rate-limited for cryptographic security.'}
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {lang === 'ne' ? 'प्रशासक पासवर्ड' : 'Administrator password'}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FB6C01] focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-[#01366E] hover:bg-[#002855] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01366E] transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {lang === 'ne' ? 'प्रमाणीकरण गर्दै...' : 'Authenticating...'}
                  </span>
                ) : lang === 'ne' ? (
                  'लगइन गर्नुहोस्'
                ) : (
                  'Sign In to CMS'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-4 text-center">
            <a
              href={`/${lang}`}
              className="text-xs text-gray-500 hover:text-[#FB6C01] transition font-medium"
            >
              ← {lang === 'ne' ? 'सार्वजनिक वेबसाइटमा फर्कनुहोस्' : 'Back to Public Portal'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

