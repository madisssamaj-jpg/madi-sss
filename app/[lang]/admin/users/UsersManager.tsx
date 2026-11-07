'use client';

import { useState } from 'react';

export interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPERADMIN' | 'EDITOR' | 'AUDITOR' | 'COMMUNICATIONS_COORDINATOR';
  isActive: boolean;
  createdAt?: string;
}

export function UsersManager({
  initialUsers,
  lang,
}: {
  initialUsers: AdminUserItem[];
  lang: string;
}) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return <span className="bg-red-100 text-red-800 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-bold">SUPERADMIN</span>;
      case 'EDITOR':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-bold">EDITOR</span>;
      case 'AUDITOR':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-bold">AUDITOR</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">{role}</span>;
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#01366E]">
            {lang === 'ne' ? 'प्रशासक प्रयोगकर्ता तथा भूमिकाहरू' : 'Admin Users & Role Governance'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'ne'
              ? 'प्रणालीमा पहुँच भएका अधिकृत प्रशासकहरू, सम्पादकहरू र लेखापरीक्षकहरूको सूची तथा अधिकार व्यवस्थापन।'
              : 'Authorized administrators, editors, and auditors with system access control.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl font-bold text-slate-700 border border-slate-200">
            {lang === 'ne' ? `कुल: ${users.length} प्रयोगकर्ता` : `Total: ${users.length} Users`}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'ne' ? 'नाम वा इमेल खोज्नुहोस्...' : 'Search by name or email...'}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#01366E]"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">
            {lang === 'ne' ? 'भूमिका अनुसार:' : 'Filter Role:'}
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#01366E]"
          >
            <option value="ALL">{lang === 'ne' ? 'सबै भूमिकाहरू' : 'All Roles'}</option>
            <option value="SUPERADMIN">SUPERADMIN</option>
            <option value="EDITOR">EDITOR</option>
            <option value="AUDITOR">AUDITOR</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">{lang === 'ne' ? 'प्रशासकको नाम' : 'Full Name'}</th>
                <th className="px-6 py-3.5">{lang === 'ne' ? 'इमेल ठेगाना' : 'Email'}</th>
                <th className="px-6 py-3.5">{lang === 'ne' ? 'भूमिका (Role)' : 'Role'}</th>
                <th className="px-6 py-3.5">{lang === 'ne' ? 'अवस्था' : 'Status'}</th>
                <th className="px-6 py-3.5 text-right">{lang === 'ne' ? 'कार्य' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    {lang === 'ne' ? 'कुनै प्रयोगकर्ता भेटिएन।' : 'No admin users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-[#01366E] flex items-center justify-center font-black text-xs">
                        {u.fullName.charAt(0)}
                      </span>
                      <span>{u.fullName}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          {lang === 'ne' ? 'सक्रिय' : 'Active'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                          {lang === 'ne' ? 'निष्क्रिय' : 'Deactivated'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {u.isActive
                          ? (lang === 'ne' ? 'निष्क्रिय गर्नुहोस्' : 'Deactivate')
                          : (lang === 'ne' ? 'सक्रिय गर्नुहोस्' : 'Activate')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

