import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="ne" className="h-full">
      <body className="min-h-full flex items-center justify-center bg-slate-50 px-4 py-16 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FB6C01] flex items-center justify-center text-3xl font-black mx-auto">
            ४०४
          </div>
          <h1 className="text-2xl font-extrabold text-[#01366E]">
            पृष्ठ फेला परेन (Page Not Found)
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            तपाईंले खोज्नुभएको पृष्ठ स्थानान्तरण गरिएको वा हटाइएको हुन सक्छ। कृपया गृहपृष्ठमा फर्कनुहोस्।
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/ne"
              className="bg-[#01366E] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              गृहपृष्ठ (नेपाली)
            </Link>
            <Link
              href="/en"
              className="bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl text-xs transition"
            >
              Home (English)
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
