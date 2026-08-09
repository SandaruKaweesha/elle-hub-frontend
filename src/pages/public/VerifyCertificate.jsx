import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, Award, Trophy, Calendar, MapPin, 
  CheckCircle2, Download, ExternalLink, ArrowLeft, Building2, User, Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
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

  const handleDownload = async () => {
    const certElement = document.getElementById('public-certificate-card');
    if (!certElement) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(certElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const rName = verificationResult?.data?.recipient_name || 'Recipient';
      downloadLink.download = `ElleHub_Verified_Certificate_${rName.replace(/\s+/g, '_')}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Error downloading certificate:", err);
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
            
            {/* Official Verification Badge Banner */}
            <div className="bg-emerald-700 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-600">
              <div className="flex items-center gap-3.5 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#08733e] flex items-center justify-center font-black shadow-inner">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-lg font-black tracking-wide">VERIFIED BY ELLE HUB</h2>
                    <CheckCircle2 size={18} className="text-emerald-300" />
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    Official Cryptographic Certificate Token: <span className="font-mono font-bold text-white bg-emerald-800 px-2 py-0.5 rounded">{token}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-[#08733e] rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer print:hidden disabled:opacity-50"
              >
                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {downloading ? "Generating PNG..." : "Download E-Certificate (PNG)"}
              </button>
            </div>

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
                    verificationResult.data.certificate_type === 'CHAMPION' 
                      ? 'bg-amber-100 text-amber-900 border-2 border-amber-300' 
                      : verificationResult.data.certificate_type === 'RUNNER_UP'
                      ? 'bg-slate-100 text-slate-800 border-2 border-slate-300'
                      : 'bg-emerald-100 text-emerald-900 border-2 border-emerald-300'
                  }`}>
                    🏆 {verificationResult.data.certificate_type} AWARD
                  </span>
                </div>
              </div>

              {/* Certificate Metadata & Embedded Live QR Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10 pt-2">
                
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

                {/* Center QR Code Container */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-white border-2 border-amber-300 rounded-2xl shadow-md">
                    <QRCodeSVG 
                      value={verificationUrl} 
                      size={110} 
                      bgColor={"#FFFFFF"} 
                      fgColor={"#08733e"} 
                      level={"H"} 
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 font-bold">Scan to Verify Authenticity</span>
                </div>

                {/* Right Official Seal */}
                <div className="text-center md:text-right space-y-1">
                  <div className="w-16 h-16 rounded-full bg-[#08733e] text-white flex items-center justify-center mx-auto md:ml-auto shadow-md font-black text-xs">
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
