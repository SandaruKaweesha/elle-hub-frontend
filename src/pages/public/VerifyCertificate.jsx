import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, Award, Trophy, Calendar, MapPin, 
  CheckCircle2, Download, ExternalLink, ArrowLeft, Building2, User, Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../services/api';

export default function VerifyCertificate() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (token) {
      verifyCertificateToken(token);
    }
  }, [token]);

  const verifyCertificateToken = async (certToken) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get(`/api/certificates/verify/${certToken}`);
      if (res.data && res.data.valid) {
        setVerificationResult(res.data);
      } else {
        setVerificationResult({ valid: false, message: res.data?.message || 'Invalid or Tampered Certificate' });
      }
    } catch (err) {
      console.error("Certificate verification error:", err);
      setVerificationResult({ 
        valid: false, 
        message: err.response?.data?.message || 'Certificate verification failed or token does not exist.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const certElement = document.getElementById('public-certificate-card');
    if (!certElement) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(certElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
      const renderWidth = imgWidth * ratio;
      const renderHeight = imgHeight * ratio;
      const x = (pdfWidth - renderWidth) / 2;
      const y = (pdfHeight - renderHeight) / 2;

      const rName = verificationResult?.data?.recipient_name || 'Recipient';
      pdf.addImage(imgData, 'PNG', x, y, renderWidth, renderHeight);
      pdf.save(`ElleHub_Verified_Certificate_${rName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Error downloading PDF certificate:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const verificationUrl = `${window.location.origin}/verify-certificate/${token}`;

  return (
    <div className="min-h-screen bg-slate-100 font-['Poppins'] flex flex-col justify-between p-4 md:p-8">

      
      {/* Header Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-gray-200 mb-8">
        <Link to="/" className="flex items-center gap-2 text-[#08733e] font-black text-xl tracking-tight">
          <Trophy size={24} />
          <span>Elle Hub Official Verification</span>
        </Link>
        <span className="text-xs font-bold text-gray-500 bg-white px-3.5 py-1.5 rounded-full border border-gray-200 shadow-2xs">
          Public E-Certificate Security Portal
        </span>
      </header>

      <main className="max-w-4xl mx-auto w-full space-y-6 my-auto">
        
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
            <div className="w-12 h-12 border-4 border-[#08733e] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="font-extrabold text-gray-800 text-lg">Verifying Certificate Authenticity...</h3>
            <p className="text-xs font-medium text-gray-500">Checking secure cryptographic token against Elle Hub database</p>
          </div>
        ) : verificationResult?.valid ? (
          /* VALID CERTIFICATE STATE */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            


            {/* Premium Gold Luxury E-Certificate Template Container */}
            <div id="public-certificate-card" className="bg-white rounded-3xl border-8 border-amber-400 p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden print:p-6 print:border-4">

              
              {/* Background Watermark Pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
                <Trophy size={400} />
              </div>

              {/* Certificate Top Decorative Header */}
              <div className="text-center space-y-2 relative z-10">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-amber-300 mb-2">
                  <Award size={36} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-amber-700 bg-amber-50 px-4 py-1 rounded-full border border-amber-200">
                  Official E-Certificate of Achievement
                </span>
                <h1 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 tracking-wide pt-2">
                  {verificationResult.data.tournament_title}
                </h1>
                <p className="text-xs text-gray-500 font-medium">Sri Lanka National Elle League Tournament Series</p>
              </div>

              {/* Recipient Details */}
              <div className="text-center space-y-3 relative z-10 py-4 border-y border-amber-100">
                <p className="text-xs uppercase font-extrabold tracking-widest text-gray-400">This Certificate is proudly presented to</p>
                <h2 className="text-3xl md:text-5xl font-black text-[#08733e] tracking-tight capitalize">
                  {verificationResult.data.recipient_name}
                </h2>
                <div className="inline-block mt-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    verificationResult.data.certificate_type === 'CHAMPION' || verificationResult.data.certificate_type === 'WINNER'
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-300' 
                      : verificationResult.data.certificate_type === 'RUNNER_UP' || verificationResult.data.certificate_type === 'RUNNER-UP'
                      ? 'bg-slate-100 text-slate-800 border-2 border-slate-300'
                      : 'bg-emerald-100 text-emerald-900 border-2 border-emerald-300'
                  }`}>
                    🏆 {verificationResult.data.certificate_type} AWARD
                  </span>
                </div>
              </div>

              {/* Official Verification Details Summary Table */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-5 shadow-xs text-xs space-y-3 relative z-10 text-left">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <span className="font-extrabold text-[#08733e] uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Verification Status
                  </span>
                  <span className="font-black text-emerald-900 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300 text-[11px]">
                    ✓ OFFICIAL VERIFIED CERTIFICATE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Tournament Name</span>
                    <span className="font-black text-gray-900 text-sm">{verificationResult.data.tournament_title}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Winner / Recipient</span>
                    <span className="font-black text-[#08733e] text-sm">{verificationResult.data.recipient_name}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Certificate Award</span>
                    <span className="font-extrabold text-amber-700 text-xs">{verificationResult.data.certificate_type}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Tournament Date</span>
                    <span className="font-extrabold text-gray-800 text-xs">{verificationResult.data.issue_date}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Location / Venue</span>
                    <span className="font-extrabold text-gray-800 text-xs">{verificationResult.data.tournament_location}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Organizer</span>
                    <span className="font-extrabold text-gray-800 text-xs">{verificationResult.data.organizer_name}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs md:col-span-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Official Sponsor</span>
                    <span className="font-extrabold text-indigo-900 text-xs flex items-center gap-1.5 mt-0.5">
                      <Trophy size={14} className="text-amber-500" />
                      {verificationResult.data.sponsor_name || 'Official Tournament Sponsors'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Metadata & Official Seal */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 pt-2 border-t border-amber-100/60">
                
                {/* Left Metadata */}
                <div className="space-y-2 text-xs text-gray-600 font-medium text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-gray-800 font-bold">
                    <Building2 size={14} className="text-[#08733e]" />
                    <span>Issued By: {verificationResult.data.organizer_name}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5">
                    <MapPin size={14} className="text-[#08733e]" />
                    <span>Venue: {verificationResult.data.tournament_location}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5">
                    <Calendar size={14} className="text-[#08733e]" />
                    <span>Issued Date: {verificationResult.data.issue_date}</span>
                  </div>
                </div>

                {/* Right Official Seal */}
                <div className="text-center md:text-right space-y-1">
                  <div className="w-16 h-16 rounded-full bg-[#08733e] text-white flex items-center justify-center mx-auto md:ml-auto shadow-md font-black text-xs border-2 border-emerald-600">
                    OFFICIAL
                  </div>
                  <p className="text-[11px] font-extrabold text-gray-800">Elle Hub Verified Seal</p>
                  <p className="text-[10px] text-gray-400 font-mono">Token: {token}</p>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* INVALID / FAKE CERTIFICATE STATE */
          <div className="bg-white rounded-3xl border-2 border-rose-200 p-8 md:p-12 text-center space-y-6 shadow-lg animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner border-2 border-rose-300">
              <ShieldAlert size={48} />
            </div>
            
            <div className="space-y-2">
              <span className="px-4 py-1 bg-rose-100 text-rose-800 text-xs font-black rounded-full uppercase tracking-wider">
                Verification Failed
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Invalid or Unverified Certificate
              </h2>
              <p className="text-xs text-gray-500 font-medium max-w-md mx-auto">
                The QR verification token <span className="font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">{token}</span> was not recognized by the Elle Hub security database or may have been tampered with.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-gray-600 font-medium max-w-lg mx-auto text-left space-y-1">
              <p className="font-bold text-gray-800">Why am I seeing this notice?</p>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                <li>The scanned QR code token does not match any official certificate record.</li>
                <li>The certificate may have been revoked or forged.</li>
                <li>Please contact the tournament organizer or Elle Hub official support.</li>
              </ul>
            </div>

            <Link 
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#08733e] hover:bg-[#065b31] text-white rounded-2xl text-xs font-extrabold transition-all shadow-md"
            >
              <ArrowLeft size={16} /> Return to Elle Hub Home
            </Link>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-6 text-xs text-gray-400 font-medium border-t border-gray-200 mt-8">
        © 2026 Elle Hub National Sports Platform. All Cryptographic E-Certificate Tokens Protected.
      </footer>

    </div>
  );
}
