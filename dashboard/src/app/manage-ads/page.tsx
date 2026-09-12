"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { AdItem, SocialLinks } from "@/types";
import { getApiUrl } from "@/utils/config";
import {
  Megaphone,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle2,
  X,
  Globe,
  Share2,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Link as LinkIcon,
  Phone,
  MapPin,
} from "lucide-react";

// Authentic Real SVG Brand Icons
const WhatsappIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const FacebookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="igGradientManage" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path
      fill="url(#igGradientManage)"
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
    />
  </svg>
);

const YoutubeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TwitterIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ManageAdsPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [previewAdModal, setPreviewAdModal] = useState<AdItem | null>(null);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<number | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AdItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    imageUrl: string;
    videoUrl: string;
    mediaType: "image" | "video";
    adLink: string;
    isActive: boolean;
    socialLinks: SocialLinks;
  }>({
    title: "",
    subtitle: "",
    imageUrl: "",
    videoUrl: "",
    mediaType: "image",
    adLink: "",
    isActive: true,
    socialLinks: {
      phone: "",
      visitUs: "",
      whatsapp: "",
      facebook: "",
      instagram: "",
      youtube: "",
      twitter: "",
      website: "",
    },
  });

  const API_URL = getApiUrl();

  const fetchAds = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/ads`);
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        setError(`Unable to connect to backend service (HTTP ${res.status}). Please verify that the backend API server is deployed and updated.`);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAds(data.data);
      } else {
        setError(data.error || "Failed to load advertisements.");
      }
    } catch (err: any) {
      console.error("Fetch ads error:", err);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [API_URL]);

  const handleOpenAddModal = () => {
    setEditingAd(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      videoUrl: "",
      mediaType: "image",
      adLink: "",
      isActive: true,
      socialLinks: {
        phone: "",
        visitUs: "",
        whatsapp: "",
        facebook: "",
        instagram: "",
        youtube: "",
        twitter: "",
        website: "",
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: AdItem) => {
    setEditingAd(ad);
    const mediaType = ad.mediaType || (ad.videoUrl ? "video" : "image");
    setFormData({
      title: ad.title || "",
      subtitle: ad.subtitle || "",
      imageUrl: ad.imageUrl || "",
      videoUrl: ad.videoUrl || "",
      mediaType,
      adLink: ad.adLink || "",
      isActive: ad.isActive !== undefined ? ad.isActive : true,
      socialLinks: {
        phone: ad.socialLinks?.phone || "",
        visitUs: ad.socialLinks?.visitUs || "",
        whatsapp: ad.socialLinks?.whatsapp || "",
        facebook: ad.socialLinks?.facebook || "",
        instagram: ad.socialLinks?.instagram || "",
        youtube: ad.socialLinks?.youtube || "",
        twitter: ad.socialLinks?.twitter || "",
        website: ad.socialLinks?.website || "",
      },
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isVideo: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB Limit
    if (file.size > MAX_SIZE) {
      alert(isVideo ? "Please select a video smaller than 5MB." : "Please select an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const resultStr = String(event.target.result);
        if (isVideo) {
          setFormData((prev) => ({
            ...prev,
            mediaType: "video",
            videoUrl: resultStr,
            imageUrl: prev.imageUrl || resultStr,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            mediaType: "image",
            imageUrl: resultStr,
          }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleActive = async (ad: AdItem) => {
    try {
      const updatedStatus = !ad.isActive;
      const res = await fetch(`${API_URL}/api/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        alert(`Server Error: API returned HTTP ${res.status}.`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAds((prev) =>
          prev.map((item) => (item.id === ad.id ? { ...item, isActive: updatedStatus } : item))
        );
        setActionSuccess(
          `Ad "${ad.title}" status changed to ${updatedStatus ? "ACTIVE" : "INACTIVE"}.`
        );
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to update ad status.");
      }
    } catch (err) {
      console.error("Toggle active error:", err);
      alert("Server Error: Could not update status.");
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      title: formData.title.trim() || "Advertisement Banner",
    };

    try {
      setSaving(true);
      const isEdit = !!editingAd;
      const url = isEdit ? `${API_URL}/api/ads/${editingAd.id}` : `${API_URL}/api/ads`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        alert(`Server Error: API returned HTTP ${res.status}. Please check backend API server.`);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setActionSuccess(
          isEdit
            ? `Advertisement updated successfully!`
            : `Advertisement created successfully!`
        );
        setIsModalOpen(false);
        fetchAds();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to save advertisement.");
      }
    } catch (err) {
      console.error("Save ad error:", err);
      alert("Server Error: Could not save advertisement details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteCandidate) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/api/ads/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        alert(`Server Error: API returned HTTP ${res.status}.`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAds((prev) => prev.filter((a) => a.id !== deleteCandidate.id));
        setActionSuccess(`Ad "${deleteCandidate.title}" removed.`);
        setDeleteCandidate(null);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to delete advertisement.");
      }
    } catch (err) {
      console.error("Delete ad error:", err);
      alert("Server Error: Could not delete advertisement.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-indigo-600" />
              <span>Ads Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage front page pop-up advertisements, banner images, and social media links
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:to-amber-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer border border-amber-400/60"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add New Advertisement</span>
            </button>

            <button
              onClick={fetchAds}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Content Container */}
        {loading ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading advertisements...</p>
          </div>
        ) : error ? (
          <div className="p-12 bg-white rounded-2xl border border-red-200 text-center text-red-600 font-bold text-sm">
            ⚠️ {error}
          </div>
        ) : ads.length === 0 ? (
          <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No advertisements found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first pop-up advertisement to showcase banners and social media links to visitors on page load.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition cursor-pointer"
            >
              Add New Advertisement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className={`bg-white rounded-2xl border ${ad.isActive ? "border-indigo-300 ring-2 ring-indigo-500/20" : "border-slate-200 opacity-90"
                  } shadow-sm overflow-hidden flex flex-col justify-between transition hover:shadow-md`}
              >
                {/* Card Top / Banner Preview */}
                <div>
                  <div className="relative h-44 bg-slate-900 border-b border-slate-200 flex items-center justify-center overflow-hidden group">
                    {ad.imageUrl ? (
                      <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-slate-400 text-center p-4">
                        <ImageIcon className="w-10 h-10 mx-auto mb-1 text-slate-500" />
                        <p className="text-xs font-semibold">No Image Banner</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <button
                        onClick={() => handleToggleActive(ad)}
                        className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5 transition cursor-pointer ${ad.isActive
                            ? "bg-emerald-600 text-white border border-emerald-400"
                            : "bg-slate-800/80 text-slate-300 border border-slate-600 hover:bg-slate-800"
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${ad.isActive ? "bg-white animate-pulse" : "bg-slate-400"}`} />
                        <span>{ad.isActive ? "ACTIVE POPUP" : "INACTIVE"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{ad.title}</h3>
                      {ad.subtitle && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ad.subtitle}</p>
                      )}
                    </div>

                    {/* Primary Link */}
                    {ad.adLink && (
                      <div className="text-xs">
                        <span className="font-bold text-slate-600">Primary Link: </span>
                        <a
                          href={ad.adLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 font-medium hover:underline inline-flex items-center gap-1 truncate max-w-full"
                        >
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ad.adLink}</span>
                        </a>
                      </div>
                    )}

                    {/* Social Media Links Badges */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-indigo-600" />
                        <span>Social Media Links</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ad.socialLinks?.phone && (
                          <a
                            href={ad.socialLinks.phone.startsWith("tel:") ? ad.socialLinks.phone : `tel:${ad.socialLinks.phone}`}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] rounded-md font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        )}
                        {ad.socialLinks?.visitUs && (
                          <a
                            href={ad.socialLinks.visitUs}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[11px] rounded-md font-bold hover:bg-purple-100 transition flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Visit Us</span>
                          </a>
                        )}
                        {ad.socialLinks?.whatsapp && (
                          <a
                            href={ad.socialLinks.whatsapp}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] rounded-md font-bold hover:bg-emerald-100 transition"
                          >
                            WhatsApp
                          </a>
                        )}
                        {ad.socialLinks?.facebook && (
                          <a
                            href={ad.socialLinks.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] rounded-md font-bold hover:bg-blue-100 transition"
                          >
                            Facebook
                          </a>
                        )}
                        {ad.socialLinks?.instagram && (
                          <a
                            href={ad.socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 text-[11px] rounded-md font-bold hover:bg-pink-100 transition"
                          >
                            Instagram
                          </a>
                        )}
                        {ad.socialLinks?.youtube && (
                          <a
                            href={ad.socialLinks.youtube}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[11px] rounded-md font-bold hover:bg-red-100 transition"
                          >
                            YouTube
                          </a>
                        )}
                        {ad.socialLinks?.twitter && (
                          <a
                            href={ad.socialLinks.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 text-[11px] rounded-md font-bold hover:bg-sky-100 transition"
                          >
                            Twitter/X
                          </a>
                        )}
                        {ad.socialLinks?.website && (
                          <a
                            href={ad.socialLinks.website}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] rounded-md font-bold hover:bg-indigo-100 transition"
                          >
                            Website
                          </a>
                        )}
                        {!ad.socialLinks?.phone &&
                          !ad.socialLinks?.visitUs &&
                          !ad.socialLinks?.whatsapp &&
                          !ad.socialLinks?.facebook &&
                          !ad.socialLinks?.instagram &&
                          !ad.socialLinks?.youtube &&
                          !ad.socialLinks?.twitter &&
                          !ad.socialLinks?.website && (
                            <span className="text-[11px] text-slate-400 italic">No action or social links added</span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setPreviewAdModal(ad)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Preview Pop-Up</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(ad)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      title="Edit Ad"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCandidate(ad)}
                      className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Ad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL 1: Add / Edit Advertisement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-6 border border-slate-200 my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                <span>{editingAd ? "Edit Advertisement" : "Add New Advertisement"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs font-bold text-slate-700">

              {/* Media Type Selector (Image or Video) */}
              <div className="space-y-2">
                <label className="block text-slate-900 font-extrabold text-xs">
                  Advertisement Media Type :
                </label>
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: "image" })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      formData.mediaType === "image"
                        ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image Banner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: "video" })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      formData.mediaType === "video"
                        ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <VideoIcon className="w-3.5 h-3.5 text-purple-600" />
                    <span>Video Banner</span>
                  </button>
                </div>
              </div>

              {/* Media URL / Device Upload */}
              {formData.mediaType === "video" ? (
                <div className="space-y-2 p-3 bg-purple-50/50 rounded-2xl border border-purple-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-purple-900 font-extrabold">
                      Video Source (Link or Upload from Device - Max 5MB) :
                    </label>
                    <span className="text-[10px] text-purple-700 font-normal">Max 5MB</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          videoUrl: e.target.value,
                          imageUrl: e.target.value,
                        })
                      }
                      placeholder="Video Link/URL (e.g. https://.../video.mp4)"
                      className="flex-1 w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-purple-600 font-mono text-[11px]"
                    />
                    <label className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs">
                      <VideoIcon className="w-4 h-4" />
                      <span>Upload Video (Max 5MB)</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {(formData.videoUrl || formData.imageUrl) && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-purple-300 bg-slate-950 mt-2 flex items-center justify-center">
                      <video
                        src={formData.videoUrl || formData.imageUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-indigo-900 font-extrabold">
                      Banner Image (Link or Upload from Device - Max 5MB) :
                    </label>
                    <span className="text-[10px] text-indigo-700 font-normal">Max 5MB</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Image URL (e.g. /mptmm.png or https://...)"
                      className="flex-1 w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 font-mono text-[11px]"
                    />
                    <label className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs">
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload Image (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.imageUrl && !formData.imageUrl.startsWith("data:video/") && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-indigo-200 bg-slate-900 mt-2">
                      <Image src={formData.imageUrl} alt="Banner Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Primary Link */}
              <div className="space-y-1">
                <label className="block">Primary Target Link (Ad URL) :</label>
                <input
                  type="url"
                  value={formData.adLink}
                  onChange={(e) => setFormData({ ...formData, adLink: e.target.value })}
                  placeholder="https://mptmamravati.org/registration"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 font-mono text-[11px]"
                />
              </div>

              {/* Social Media & Action Links Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  <Share2 className="w-4 h-4 text-indigo-600" />
                  <span>Call, Visit Us & Social Media Links (Displayed below ad container)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-emerald-700 font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Call / Phone Link:
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks.phone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, phone: e.target.value },
                        })
                      }
                      placeholder="+919876543210 or tel:+919876543210"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-purple-700 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Visit Us / Location URL:
                    </label>
                    <input
                      type="text"
                      value={formData.socialLinks.visitUs || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, visitUs: e.target.value },
                        })
                      }
                      placeholder="https://mptmamravati.org/contact-us"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-emerald-700 font-bold">WhatsApp Link / Number:</label>
                    <input
                      type="text"
                      value={formData.socialLinks.whatsapp || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, whatsapp: e.target.value },
                        })
                      }
                      placeholder="https://wa.me/919876543210"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-blue-700 font-bold">Facebook URL:</label>
                    <input
                      type="text"
                      value={formData.socialLinks.facebook || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                        })
                      }
                      placeholder="https://facebook.com/yourpage"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-pink-700 font-bold">Instagram URL:</label>
                    <input
                      type="text"
                      value={formData.socialLinks.instagram || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-red-700 font-bold">YouTube URL:</label>
                    <input
                      type="text"
                      value={formData.socialLinks.youtube || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, youtube: e.target.value },
                        })
                      }
                      placeholder="https://youtube.com/@channel"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sky-700 font-bold">Twitter / X URL:</label>
                    <input
                      type="text"
                      value={formData.socialLinks.twitter || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                        })
                      }
                      placeholder="https://x.com/yourhandle"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-indigo-700 font-bold">Website URL:</label>
                    <input
                      type="text"
                      value={formData.socialLinks.website || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, website: e.target.value },
                        })
                      }
                      placeholder="https://mptmamravati.org"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 outline-none focus:border-indigo-600 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-extrabold text-slate-900">Set as Active Pop-up?</span>
                  <p className="text-[11px] text-slate-500 font-medium">
                    When active, this ad pops up when visitors load or refresh the front page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${formData.isActive ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
                    }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editingAd ? "Update Ad" : "Save Ad"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg">Delete Advertisement?</h3>
              <p className="text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-900">{deleteCandidate.title}</span> will be permanently deleted from the system.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAd}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Pop-up Ad Live Preview */}
      {previewAdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in overflow-y-auto">
          <div
            style={{
              width: previewAspectRatio ? `min(calc(75vh * ${previewAspectRatio}), 92vw, 48rem)` : undefined,
              minWidth: "280px",
            }}
            className="bg-white rounded-2xl max-w-[95vw] sm:max-w-3xl md:max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-auto flex flex-col transition-[width] duration-300"
          >

            {/* Floating Close Button */}
            <button
              onClick={() => {
                setPreviewAdModal(null);
                setPreviewAspectRatio(null);
              }}
              className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-lg border border-white/40 backdrop-blur-xs"
              title="Close Advertisement"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ad Image / Video Container - Thinned white padding */}
            <div className="p-1.5 sm:p-2 flex flex-col min-h-0 overflow-hidden space-y-1.5">
              {(previewAdModal.videoUrl || previewAdModal.imageUrl) && (
                <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 group">
                  {previewAdModal.mediaType === "video" ||
                  previewAdModal.videoUrl ||
                  previewAdModal.imageUrl?.endsWith(".mp4") ||
                  previewAdModal.imageUrl?.startsWith("data:video/") ? (
                    <video
                      src={previewAdModal.videoUrl || previewAdModal.imageUrl}
                      autoPlay
                      loop
                      muted
                      controls
                      playsInline
                      onLoadedMetadata={(e) => {
                        const { videoWidth, videoHeight } = e.currentTarget;
                        if (videoWidth && videoHeight) {
                          setPreviewAspectRatio(videoWidth / videoHeight);
                        }
                      }}
                      className="max-h-[75vh] w-full h-auto object-contain rounded-xl block mx-auto shadow-xs"
                    />
                  ) : previewAdModal.adLink ? (
                    <a
                      href={previewAdModal.adLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block cursor-pointer relative max-h-[75vh] w-full"
                    >
                      <img
                        ref={(img) => {
                          if (img && img.complete && img.naturalWidth && !previewAspectRatio) {
                            setPreviewAspectRatio(img.naturalWidth / img.naturalHeight);
                          }
                        }}
                        src={previewAdModal.imageUrl}
                        alt={previewAdModal.title}
                        onLoad={(e) => {
                          const { naturalWidth, naturalHeight } = e.currentTarget;
                          if (naturalWidth && naturalHeight) {
                            setPreviewAspectRatio(naturalWidth / naturalHeight);
                          }
                        }}
                        className="max-h-[75vh] w-full h-auto object-contain transition-all duration-300 group-hover:scale-[1.01] rounded-xl block mx-auto"
                      />
                    </a>
                  ) : (
                    <img
                      ref={(img) => {
                        if (img && img.complete && img.naturalWidth && !previewAspectRatio) {
                          setPreviewAspectRatio(img.naturalWidth / img.naturalHeight);
                        }
                      }}
                      src={previewAdModal.imageUrl}
                      alt={previewAdModal.title}
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        if (naturalWidth && naturalHeight) {
                          setPreviewAspectRatio(naturalWidth / naturalHeight);
                        }
                      }}
                      className="max-h-[75vh] w-full h-auto object-contain rounded-xl block mx-auto"
                    />
                  )}
                </div>
              )}

              {/* Real Action Pills & Follow Us Social Media Icons Pill Container */}
              <div className="flex items-center justify-start gap-2 py-1 px-1.5 min-h-[42px] w-full shrink-0 flex-wrap">

                {/* 1. Call Us Pill */}
                {previewAdModal.socialLinks?.phone && (
                  <a
                    href={previewAdModal.socialLinks.phone.startsWith("tel:") ? previewAdModal.socialLinks.phone : `tel:${previewAdModal.socialLinks.phone}`}
                    className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/90 text-emerald-700 border border-emerald-300/80 shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0"
                    title="Call Us"
                  >
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Call Us</span>
                  </a>
                )}

                {/* 2. Visit Us Pill */}
                {previewAdModal.socialLinks?.visitUs && (
                  <a
                    href={previewAdModal.socialLinks.visitUs}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100/90 text-purple-700 border border-purple-300/80 shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0"
                    title="Visit Us"
                  >
                    <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Visit Us</span>
                  </a>
                )}

                {/* 3. Follow Us Pill Container with all Social Media Icons */}
                {(previewAdModal.socialLinks?.whatsapp ||
                  previewAdModal.socialLinks?.facebook ||
                  previewAdModal.socialLinks?.instagram ||
                  previewAdModal.socialLinks?.youtube ||
                  previewAdModal.socialLinks?.twitter ||
                  previewAdModal.socialLinks?.website) && (
                  <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200/90 shadow-2xs flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold text-slate-700 tracking-wide select-none mr-0.5">
                      Follow Us:
                    </span>

                    <div className="flex items-center gap-2">
                      {previewAdModal.socialLinks?.whatsapp && (
                        <a
                          href={previewAdModal.socialLinks.whatsapp}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#25D366] hover:scale-120 transition-all duration-200 cursor-pointer flex items-center"
                          title="WhatsApp"
                        >
                          <WhatsappIcon className="w-5 h-5" />
                        </a>
                      )}
                      {previewAdModal.socialLinks?.facebook && (
                        <a
                          href={previewAdModal.socialLinks.facebook}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#1877F2] hover:scale-120 transition-all duration-200 cursor-pointer flex items-center"
                          title="Facebook"
                        >
                          <FacebookIcon className="w-5 h-5" />
                        </a>
                      )}
                      {previewAdModal.socialLinks?.instagram && (
                        <a
                          href={previewAdModal.socialLinks.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:scale-120 transition-all duration-200 cursor-pointer flex items-center"
                          title="Instagram"
                        >
                          <InstagramIcon className="w-5 h-5" />
                        </a>
                      )}
                      {previewAdModal.socialLinks?.youtube && (
                        <a
                          href={previewAdModal.socialLinks.youtube}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#FF0000] hover:scale-120 transition-all duration-200 cursor-pointer flex items-center"
                          title="YouTube"
                        >
                          <YoutubeIcon className="w-5 h-5" />
                        </a>
                      )}
                      {previewAdModal.socialLinks?.twitter && (
                        <a
                          href={previewAdModal.socialLinks.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-900 hover:text-black hover:scale-120 transition-all duration-200 cursor-pointer flex items-center"
                          title="Twitter / X"
                        >
                          <TwitterIcon className="w-4.5 h-4.5" />
                        </a>
                      )}
                      {previewAdModal.socialLinks?.website && (
                        <a
                          href={previewAdModal.socialLinks.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 hover:text-amber-500 hover:scale-120 transition-all duration-200 cursor-pointer flex items-center"
                          title="Website"
                        >
                          <Globe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
