"use client";

import { useEffect, useState, useCallback } from "react";
import PermissionRoute from "../../../components/PermissionRoute";
import { apiFetch } from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import BlogListTable from "../../../components/admin/BlogListTable";
import TripListTable from "../../../components/admin/TripListTable";
import Spinner from "../../../components/ui/Spinner";

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<"trips" | "blogs">("trips");
  const [data, setData] = useState<{ trips: any[]; blogs: any[] }>({ trips: [], blogs: [] });
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModerationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, tripsRes, blogsRes] = await Promise.all([
        apiFetch("/admin/analytics/moderation-summary"),
        apiFetch("/trips/internal?status=PENDING_REVIEW"), // This might need backend support for query params
        apiFetch("/blogs?status=PENDING_REVIEW"), // This might need backend support for query params
      ]);

      const [summaryData, tripsData, blogsData] = await Promise.all([
        summaryRes.json(),
        tripsRes.json(),
        blogsRes.json(),
      ]);

      setSummary(summaryData);
      setData({
        trips: Array.isArray(tripsData) ? tripsData : [],
        blogs: Array.isArray(blogsData) ? blogsData : [],
      });
    } catch (err) {
      console.error("Moderation fetch error", err);
      setError("Failed to load moderation data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const handleModeration = async (id: string, type: "trips" | "blogs", action: "approve" | "reject" | "publish") => {
    try {
      const endpoint = type === "trips" 
        ? `/trips/${id}/${action}` // e.g. /trips/123/approve
        : `/blogs/${id}/${action}`; // e.g. /blogs/123/approve
      
      const res = await apiFetch(endpoint, { method: "POST" });
      if (res.ok) {
        fetchModerationData(); // Refresh everything
      } else {
        const body = await res.json();
        alert(body.message || `Failed to ${action} ${type}`);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <PermissionRoute permission="blog:approve">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation Dashboard</h1>
          <p className="text-muted-foreground pt-1">review and approve user-submitted content.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Pending</p>
            <p className="text-4xl font-bold pt-2">{summary?.totalPending || 0}</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Trips</p>
            <p className="text-4xl font-bold pt-2 text-primary">{summary?.pendingTrips || 0}</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Stories</p>
            <p className="text-4xl font-bold pt-2 text-accent">{summary?.pendingBlogs || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b pb-4">
          <button 
            onClick={() => setActiveTab("trips")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "trips" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Pending Trips ({data.trips.length})
          </button>
          <button 
            onClick={() => setActiveTab("blogs")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === "blogs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Pending Blogs ({data.blogs.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Spinner size={40} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">{error}</div>
        ) : (
          <div className="space-y-6">
            {activeTab === "trips" ? (
              <TripListTable 
                trips={data.trips} 
                loading={loading} 
                onRefresh={fetchModerationData}
                onAction={(id, action) => handleModeration(id, "trips", action)}
              />
            ) : (
              <BlogListTable 
                blogs={data.blogs} 
                loading={loading}
                onRefresh={fetchModerationData}
                onAction={(id, action) => handleModeration(id, "blogs", action)}
              />
            )}
          </div>
        )}
      </div>
    </PermissionRoute>
  );
}
