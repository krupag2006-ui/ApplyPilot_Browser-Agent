import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Briefcase, Calendar, CheckCircle2, Clock, 
  ExternalLink, Send, ArrowRight, Filter, Search, X, 
  ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';

export default function TrackerPage({ onOpenUpload }) {
  const { 
    profile, applications, opportunities, setSelectedApplicationId, 
    fetchApplications, addNotification 
  } = useApp();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppDetail, setSelectedAppDetail] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Join application with opportunity metadata
  const enrichedApplications = useMemo(() => {
    if (!applications) return [];
    return applications.map(app => {
      const opp = opportunities.find(o => o.id === app.opportunity_id);
      return {
        ...app,
        company: opp ? opp.company : app.opportunity_id,
        role: opp ? opp.role : 'Application',
        location: opp ? opp.location : 'Remote (India)',
        deadline: opp ? opp.deadline : 'N/A',
        required_skills: opp ? opp.required_skills : [],
      };
    }).reverse();
  }, [applications, opportunities]);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return enrichedApplications.filter(app => {
      if (statusFilter !== 'All') {
        if (statusFilter.toLowerCase() !== app.status.toLowerCase()) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          app.opportunity_id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [enrichedApplications, statusFilter, searchQuery]);

  const handleRefresh = async () => {
    if (!profile?.profile_id) return;
    setIsRefreshing(true);
    try {
      await fetchApplications(profile.profile_id);
      addNotification('info', 'Application status refreshed from database.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLaunchAssistant = (appId) => {
    setSelectedApplicationId(appId);
    navigate('/assistant');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ivory-300">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Central Pipeline</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
            Application Tracker
          </h1>
          <p className="text-sm text-charcoal-600 mt-1 max-w-2xl">
            Track all your drafted, ready-for-review, and submitted applications in one place. 
            All records persist directly to SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-ivory-200 hover:bg-ivory-300 border border-ivory-300 text-charcoal-800 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/opportunities"
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold transition-colors shadow-sm"
          >
            <span>+ Apply to New Role</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['All', 'Draft', 'Ready for Review', 'Submitted'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-forest-800 text-ivory-50'
                  : 'bg-ivory-200 text-charcoal-700 hover:bg-ivory-300'
              }`}
            >
              {st} {st === 'All' ? `(${enrichedApplications.length})` : ''}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-ivory-300 bg-white text-xs text-charcoal-900 focus:border-terracotta-500"
          />
        </div>

      </div>

      {/* Applications Table / Cards */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF6F0] rounded-xl border border-ivory-300 p-8 space-y-3">
          <FileText className="w-10 h-10 text-charcoal-400 mx-auto" />
          <h3 className="font-editorial text-lg font-bold text-forest-950">
            No applications match this filter
          </h3>
          <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
            Browse the opportunities catalog to discover positions and submit them using our browser assistant.
          </p>
          <Link
            to="/opportunities"
            className="inline-block text-xs font-semibold text-terracotta-600 underline pt-1"
          >
            Browse Opportunities Catalog →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-soft overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              <thead>
                <tr className="border-b border-ivory-300 bg-ivory-100/70 text-charcoal-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">ID & Role</th>
                  <th className="py-3.5 px-5">Company</th>
                  <th className="py-3.5 px-5">Deadline</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ivory-200">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-ivory-50/70 transition-colors">
                    
                    {/* Role & ID */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] text-charcoal-400">
                          #{app.id}
                        </span>
                        <div>
                          <p className="font-bold text-forest-950 text-sm">
                            {app.role}
                          </p>
                          <p className="text-[11px] text-charcoal-500">
                            {app.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-5 text-charcoal-800 font-medium">
                      {app.company}
                    </td>

                    {/* Deadline */}
                    <td className="py-4 px-5 font-mono text-charcoal-600">
                      {app.deadline}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <StatusBadge status={app.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAppDetail(app)}
                          className="px-2.5 py-1 rounded border border-ivory-300 text-charcoal-700 hover:bg-ivory-200 transition-colors"
                        >
                          Details
                        </button>

                        <button
                          onClick={() => handleLaunchAssistant(app.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-forest-800 hover:bg-forest-900 text-ivory-50 font-semibold transition-colors shadow-sm"
                        >
                          <Send className="w-3 h-3 text-terracotta-300" />
                          <span>{app.status === 'Submitted' ? 'View Demo' : 'Autofill'}</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      )}

      {/* Application Details Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-xl border border-ivory-300 shadow-lifted max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-ivory-300 flex items-center justify-between bg-ivory-100">
              <div>
                <h3 className="font-editorial text-lg font-bold text-forest-950">
                  Application #{selectedAppDetail.id}
                </h3>
                <p className="text-xs text-charcoal-600">
                  {selectedAppDetail.role} • {selectedAppDetail.company}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="p-1 rounded-md text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-ivory-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Current Status:</span>
                  <StatusBadge status={selectedAppDetail.status} size="sm" />
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Target Role:</span>
                  <span className="font-semibold text-charcoal-900">{selectedAppDetail.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Company:</span>
                  <span className="font-semibold text-charcoal-900">{selectedAppDetail.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Location:</span>
                  <span className="text-charcoal-900">{selectedAppDetail.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Deadline:</span>
                  <span className="font-mono text-charcoal-900">{selectedAppDetail.deadline}</span>
                </div>
              </div>

              <div>
                <span className="text-charcoal-600 font-semibold block mb-1.5">Required Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedAppDetail.required_skills?.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-forest-100 text-forest-800 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-ivory-200/70 rounded-lg border border-ivory-300">
                <p className="text-[11px] text-charcoal-600 leading-relaxed">
                  FastAPI SQLite application record is active. To trigger or test the automated 
                  Playwright browser fill for this application, open the Application Assistant.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-ivory-300 bg-ivory-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="px-4 py-2 rounded-md border border-ivory-300 text-charcoal-700 text-xs font-semibold hover:bg-ivory-200"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const id = selectedAppDetail.id;
                  setSelectedAppDetail(null);
                  handleLaunchAssistant(id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900"
              >
                <Send className="w-3.5 h-3.5 text-terracotta-300" />
                <span>Open in Assistant</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
