import { ArrowLeft, ArrowRight, KeyRound, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Step = 'request' | 'reset' | 'success';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // API: POST /api/auth/request-password-reset?email={email}
      // Response: { success: true, message: "Password reset OTP sent to email..." }
      // await authService.requestPasswordReset(email);
      setStep('reset');
    } catch {
      setError('Không tìm thấy email. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // API: POST /api/auth/reset-password?email={email}&otp={otp}&newPassword={newPassword}
      // Response: { success: true, message: "Password reset successful..." }
      // await authService.resetPassword({ email, otp, newPassword });
      setStep('success');
    } catch {
      setError('OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-surface -z-10"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[70%] bg-red-50 rounded-full blur-[120px] -z-10 opacity-60"></div>

      <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative">

        {/* Back button */}
        {step !== 'success' && (
          <button
            onClick={() => step === 'request' ? navigate('/login') : setStep('request')}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-widest mb-8 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {step === 'request' ? 'Back to login' : 'Change email'}
          </button>
        )}

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="flex gap-2 mb-8">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'request' || step === 'reset' ? 'bg-red' : 'bg-gray-200'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'reset' ? 'bg-red' : 'bg-gray-200'}`} />
          </div>
        )}

        {/* ── Step 1: Enter Email ── */}
        {step === 'request' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-red" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Forgot Password</h1>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Enter your email and we'll send you an OTP to reset your password.
            </p>

            <form className="space-y-6" onSubmit={handleRequestReset}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl px-4 py-3">{error}</div>
              )}

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="flyer@aviation.com"
                  required
                  className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red text-white hover:bg-reddark transition-colors rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red/20 disabled:opacity-60"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <p className="text-xs font-medium text-gray-500">
                Remember your password? <Link to="/login" className="text-red font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </>
        )}

        {/* ── Step 2: Enter OTP + New Password ── */}
        {step === 'reset' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red/10 flex items-center justify-center mb-6">
              <KeyRound className="w-6 h-6 text-red" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Enter OTP</h1>
            <p className="text-sm font-medium text-gray-500 mb-2">
              We sent an OTP to <span className="font-bold text-gray-800">{email}</span>.
            </p>
            <p className="text-xs text-gray-400 mb-8">Check your inbox and spam folder.</p>

            <form className="space-y-5" onSubmit={handleResetPassword}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl px-4 py-3">{error}</div>
              )}

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20 tracking-widest text-center"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red text-white hover:bg-reddark transition-colors rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red/20 disabled:opacity-60 mt-2"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: Success ── */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Password Reset!</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-red text-white hover:bg-reddark transition-colors rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red/20"
            >
              Back to Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
