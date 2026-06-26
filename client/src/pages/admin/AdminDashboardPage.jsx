/**
 * AdminDashboardPage.jsx — System Admin dashboard
 */

import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Venue Managers", value: "2", link: "/admin/approved-managers", color: "from-success to-emerald-600" },
    { label: "Total Venues", value: "12", link: "/venues", color: "from-primary to-primary-dark" },
    { label: "System Logs", value: "Audit", link: "/admin/approved-managers", color: "from-warning to-amber-600" },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="System administration overview" />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-surface border border-surface-lighter rounded-xl p-5 hover:border-primary/30 transition-all"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="bg-surface border border-surface-lighter rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/approved-managers">
            <button className="px-4 py-2 bg-surface-light hover:bg-surface-lighter text-gray-200 text-sm font-medium rounded-lg transition-colors">
              Create Venue Manager
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
