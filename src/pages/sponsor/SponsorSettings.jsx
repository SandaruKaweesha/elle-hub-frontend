import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  User, 
  Shield, 
  Save, 
  Edit2, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Trash2,
  Lock
} from "lucide-react";
import api from "../../services/api";

export default function SponsorSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = currentUser.userId || currentUser.user_id || currentUser.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: "",
    contactPerson: "",
    contactNumber: "",
    address: "",
    email: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [accountStatus, setAccountStatus] = useState("APPROVED");
  const [showDeletionConfirmModal, setShowDeletionConfirmModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/user/${userId}`);
      if (response.data && response.data.success !== false) {
        const data = response.data.data;
        const mappedData = {
          companyName: data.company_name || data.companyName || data.display_name || "",
          contactPerson: data.sponsor_contact_person || data.contact_person || data.contactPerson || "",
          contactNumber: data.contact_number || data.contactNumber || "",
          address: data.sponsor_address || data.address || "",
          email: data.email || "",
        };
        setProfileData(mappedData);
        setOriginalProfileData(mappedData);
        setAccountStatus(data.status || "APPROVED");
      } else {
        setError(response.data.message || "Failed to load sponsor profile.");
      }
    } catch (err) {
      console.error("Fetch sponsor profile error:", err);
      setError("Unable to connect to the server to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const showFeedback = (msg, type = "success") => {
    if (type === "success") {
      setSuccessMsg(msg);
      setError(null);
    } else {
      setError(msg);
      setSuccessMsg(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        companyName: profileData.companyName,
        contactPerson: profileData.contactPerson,
        contactNumber: profileData.contactNumber,
        address: profileData.address,
      };

      const response = await api.put("/user/update", payload);
      if (response.data && response.data.success !== false) {
        setOriginalProfileData(profileData);
        setProfileEditMode(false);
        showFeedback("Sponsor profile details updated successfully!", "success");

        const updatedUser = {
          ...currentUser,
          companyName: profileData.companyName,
          company_name: profileData.companyName,
          displayName: profileData.companyName,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        showFeedback(response.data.message || "Failed to update profile.", "error");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      showFeedback(err.response?.data?.message || "An error occurred while saving profile changes.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!passwordData.newPassword) {
      showFeedback("Please enter a new password.", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showFeedback("Password must be at least 6 characters long.", "error");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showFeedback("New passwords do not match. Please re-enter.", "error");
      return;
    }

    setIsSavingPassword(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await api.put("/user/updatePassword", {
        newPassword: passwordData.newPassword,
      });

      if (response.data && response.data.success !== false) {
        setPasswordData({ newPassword: "", confirmPassword: "" });
        showFeedback("Password updated successfully!", "success");
      } else {
        showFeedback(response.data.message || "Failed to update password.", "error");
      }
    } catch (err) {
      console.error("Password update error:", err);
      showFeedback(err.response?.data?.message || "Failed to update password.", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeletionRequestSubmit = async () => {
    try {
      setIsSavingProfile(true);
      setError(null);
      setSuccessMsg(null);
      const response = await api.post("/user/request-deletion");
      if (response.data && response.data.success !== false) {
        setSuccessMsg("Your account deletion request has been submitted successfully to system administrators.");
        setAccountStatus("DELETION_PENDING");
        setShowDeletionConfirmModal(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error(response.data.message || "Failed to submit deletion request.");
      }
    } catch (err) {
      console.error("Deletion request error:", err);
      setError(err.response?.data?.message || err.message || "Failed to submit deletion request.");
      setShowDeletionConfirmModal(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center font-['Poppins']">
        <div className="w-10 h-10 border-4 border-[#00382D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#666666] font-medium text-sm">Loading sponsor profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-['Poppins'] animate-in fade-in duration-300 pb-12">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#111111] tracking-tight">Sponsor Profile & Settings</h1>
        <p className="text-[#666666] text-sm mt-1">Manage your official corporate details, credentials, and password.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm mb-6 flex overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange("profile")}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === "profile" 
              ? "border-[#00382D] text-[#00382D] bg-[#00382D]/5" 
              : "border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50"
          }`}
        >
          <User size={18} strokeWidth={activeTab === "profile" ? 2 : 1.5} /> Profile Details
        </button>

        <div className="w-[1px] bg-[#e5e5e5] shrink-0"></div>

        <button
          type="button"
          onClick={() => handleTabChange("security")}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === "security" 
              ? "border-[#00382D] text-[#00382D] bg-[#00382D]/5" 
              : "border-transparent text-[#666666] hover:text-[#111111] hover:bg-gray-50"
          }`}
        >
          <Shield size={18} strokeWidth={activeTab === "security" ? 2 : 1.5} /> Security & Password
        </button>
      </div>

      {/* Main Tab Panel Container */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-6 md:p-8">
        
        {/* Tab 1: Profile Details */}
        {activeTab === "profile" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#e5e5e5]">
              <div>
                <h2 className="text-xl font-bold text-[#111111]">Sponsor Profile Details</h2>
                <p className="text-xs text-[#666666] mt-0.5">Official corporate sponsorship credentials and contact info.</p>
              </div>

              {!profileEditMode ? (
                <button
                  type="button"
                  onClick={() => setProfileEditMode(true)}
                  className="px-4 py-2 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setProfileData(originalProfileData); setProfileEditMode(false); }}
                  className="px-4 py-2 bg-gray-100 text-[#555555] text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Company / Sponsor Name</label>
                  <div className="relative">
                    <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      disabled={!profileEditMode}
                      value={profileData.companyName}
                      onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full pl-11 pr-4 py-3 bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#666666] cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Contact Person</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      disabled={!profileEditMode}
                      value={profileData.contactPerson}
                      onChange={(e) => setProfileData({ ...profileData, contactPerson: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                      placeholder="e.g. Mr. John Perera"
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Contact Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      disabled={!profileEditMode}
                      value={profileData.contactNumber}
                      onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                      required
                    />
                  </div>
                </div>

                {/* Headquarters Address */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Company Address / Headquarters</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      disabled={!profileEditMode}
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] disabled:bg-[#f1f0ec] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                      placeholder="e.g. 123 Commercial St, Colombo"
                    />
                  </div>
                </div>

              </div>

              {profileEditMode && (
                <div className="pt-4 border-t border-[#e5e5e5] flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              )}
            </form>

            {/* Danger Zone */}
            <div className="mt-10 pt-8 border-t border-[#e5e5e5]">
              <h3 className="text-xs font-extrabold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>
              
              <div className="p-4 bg-red-50/50 border border-red-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#111111]">
                    <span>Current Account Status:</span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[11px]">
                      Active & Verified Sponsor
                    </span>
                  </div>
                  <p className="text-xs text-[#666666]">
                    Your sponsor organization account is active and verified to sponsor official tournaments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeletionConfirmModal(true)}
                  className="px-4 py-2.5 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Trash2 size={14} /> Request Account Deletion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === "security" && (
          <div className="animate-in fade-in duration-300 max-w-xl">
            <div className="pb-6 mb-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-bold text-[#111111]">Update Password</h2>
              <p className="text-xs text-[#666666] mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
            </div>

            <form onSubmit={handlePasswordSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f7f4] border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#00382D]"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-6 py-3 bg-[#00382D] text-white text-xs font-bold rounded-xl hover:bg-[#002a22] transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Key size={14} /> Update Password
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeletionConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#111111]">Request Account Deletion</h3>
              <p className="text-xs text-[#666666]">
                Are you sure you want to request account deletion? Your request will be sent to system administrators for review.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeletionConfirmModal(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletionRequestSubmit}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
