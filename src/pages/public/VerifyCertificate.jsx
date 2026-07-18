import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, Trophy, User, Calendar, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import { certificateAPI } from '../../services/api';

export default function VerifyCertificate() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const verifyCert = async () => {
      try {
        const response = await certificateAPI.verify(id);
        if (response.data.success && response.data.valid) {
          setResult({ valid: true, data: response.data.data });
        } else {
          setResult({ valid: false });
        }
      } catch (error) {
        setResult({ valid: false });
      } finally {
        setLoading(false);
      }
    };

    verifyCert();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center font-['Poppins']">
        <Loader2 size={48} className="animate-spin text-[#00382D] mb-4" />
        <p className="text-[#666666] font-medium">Verifying Certificate...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-12 px-4 sm:px-6 lg:px-8 font-['Poppins'] flex flex-col items-center">
      
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center text-[#666666] hover:text-[#00382D] mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        
        {result?.valid ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
            {/* Header Success */}
            <div className="bg-[#16a34a] p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
                  <ShieldCheck size={40} className="text-[#16a34a]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Verified Original</h1>
                <p className="text-green-50">This certificate is authentic and securely verified by Elle-Hub.</p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-8 space-y-6">
              
              <div className="text-center pb-6 border-b border-[#e5e5e5]">
                <p className="text-sm font-bold text-[#888888] uppercase tracking-wider mb-2">Awarded To</p>
                <h2 className="text-3xl font-bold text-[#111111]">{result.data.recipient}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#16a34a] flex flex-shrink-0 items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#888888] uppercase">Tournament</p>
                    <p className="text-[#111111] font-semibold text-lg">{result.data.tournament}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#16a34a] flex flex-shrink-0 items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#888888] uppercase">Achievement / Award</p>
                    <p className="text-[#111111] font-semibold text-lg">{result.data.cert_type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f8f7f4] text-[#666666] flex flex-shrink-0 items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#888888] uppercase">Date Issued</p>
                    <p className="text-[#111111] font-medium">{new Date(result.data.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f8f7f4] text-[#666666] flex flex-shrink-0 items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#888888] uppercase">Issued By</p>
                    <p className="text-[#111111] font-medium">{result.data.organizer_name}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#e5e5e5] text-center">
                <p className="text-xs text-[#888888]">Certificate ID</p>
                <p className="text-sm font-mono text-[#666666] mt-1 bg-gray-50 py-1.5 px-3 rounded-lg inline-block">{result.data.id}</p>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
             <div className="bg-[#ef4444] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse">
                    <XCircle size={40} className="text-[#ef4444]" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Invalid Certificate</h1>
                  <p className="text-red-50">This QR code does not match any official records in our system.</p>
                </div>
             </div>
             <div className="p-8 text-center">
                <p className="text-[#666666] mb-6">The certificate you scanned might be fake or tampered with. If you believe this is a mistake, please contact the tournament organizer.</p>
                <div className="bg-red-50 text-[#ef4444] text-sm p-4 rounded-xl border border-red-100 flex items-start text-left gap-3">
                  <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                  <p><strong>Security Warning:</strong> Always ensure the URL in your browser exactly matches <code>ellehub.com/verify/...</code> when checking certificates.</p>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
