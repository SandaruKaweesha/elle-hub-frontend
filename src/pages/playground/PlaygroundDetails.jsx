import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Edit2, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ShieldCheck
} from "lucide-react";
import api from "../../services/api";

export default function PlaygroundDetails() {
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    playgroundName: "",
    locatedDistrict: "",
    location: "",
    address: "",
    contactNumber: "",
    area: "500 Sq. Ft",
    capacity: "500 Sq. Ft"
  });

  const [originalData, setOriginalData] = useState({});

  const fetchGroundDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/user/${userId}`);
      if (res.data && res.data.success !== false) {
        const u = res.data.data;
        const areaVal = u.area || u.playground_area || u.capacity || "500 Sq. Ft";
        const mapped = {
          playgroundName: u.playground_name || u.playgroundName || u.display_name || "Badulla Ground",
          locatedDistrict: u.located_district || u.locatedDistrict || "Badulla",
          location: u.location || "Badulla",
          address: u.address || "Lower Street, Badulla",
          contactNumber: u.contact_number || "0771234567",
          area: areaVal,
          capacity: areaVal
        };
        setFormData(mapped);
        setOriginalData(mapped);
      } else {
        throw new Error(res.data.message || "Failed to load ground details.");
      }
    } catch (err) {
      console.error("Fetch playground error:", err);
      setError("Could not query playground details from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchGroundDetails();
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const payload = {
        playgroundName: formData.playgroundName,
        locatedDistrict: formData.locatedDistrict,
        location: formData.location,
        address: formData.address,
        contactNumber: formData.contactNumber,
        area: formData.area || formData.capacity,
        capacity: formData.area || formData.capacity
      };

      const res = await api.put("/user/update", payload);
      if (res.data && res.data.success !== false) {
        setOriginalData(formData);
        setEditMode(false);
        setSuccessMsg("Playground ground details updated successfully!");

        const updatedUser = {
          ...currentUser,
          playgroundName: formData.playgroundName,
          playground_name: formData.playgroundName,
          displayName: formData.playgroundName
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        throw new Error(res.data.message || "Failed to update ground details.");
      }
    } catch (err) {
      console.error("Update playground error:", err);
      setError(err.response?.data?.message || err.message || "Could not update ground details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center font-['Poppins']">
        <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#666666] font-medium text-sm">Loading ground details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-['Poppins'] space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111111] sm:text-3xl">Ground Details & Specifications</h1>
          <p className="mt-1 text-xs text-[#666666]">Manage official venue specifications, location address, and capacity.</p>
        </div>

        {!editMode ? (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Edit2 size={14} /> Edit Specifications
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setFormData(originalData); setEditMode(false); }}
            className="px-4 py-2 bg-gray-100 text-[#555555] text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <X size={14} /> Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Playground Name */}
            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Playground / Ground Name</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  disabled={!editMode}
                  value={formData.playgroundName}
                  onChange={(e) => setFormData({ ...formData, playgroundName: e.target.value })}
                  placeholder="e.g. Badulla Municipal Sports Complex Ground"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                  required
                />
              </div>
            </div>

            {/* Located District */}
            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Located District</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  disabled={!editMode}
                  value={formData.locatedDistrict}
                  onChange={(e) => setFormData({ ...formData, locatedDistrict: e.target.value })}
                  placeholder="e.g. Badulla"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Street Address</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  disabled={!editMode}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Lower Street, Badulla"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                  required
                />
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Ground Contact Phone</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  disabled={!editMode}
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. 0771234567"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                  required
                />
              </div>
            </div>

            {/* Playground Area */}
            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Playground Area</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  disabled={!editMode}
                  value={formData.area || formData.capacity}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value, capacity: e.target.value })}
                  placeholder="e.g. 500 Sq. Ft or 2 Acres"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                  required
                />
              </div>
            </div>

            {/* Location City */}
            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Location City / Town</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  disabled={!editMode}
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Badulla City"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                />
              </div>
            </div>

          </div>

          {editMode && (
            <div className="pt-4 border-t border-[#e5e5e5] flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Specifications
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}
