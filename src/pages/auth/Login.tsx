import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Login = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-[#F5F5F7] -z-10"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[70%] bg-red-50 rounded-full blur-[120px] -z-10 opacity-60"></div>

      <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative hover:shadow-[#C9111E]/5 transition-shadow duration-500">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Login</h1>
        <p className="text-sm font-medium text-gray-500 mb-10">Welcome back to the horizon.</p>
        
        <form className="space-y-6">
           <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Email</label>
              <input 
                 type="email" 
                 placeholder="flyer@aviation.com" 
                 className="w-full bg-[#f6f6f6] rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20" 
              />
           </div>

           <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Password</label>
              <input 
                 type="password" 
                 placeholder="••••••••" 
                 className="w-full bg-[#f6f6f6] rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9111E]/20" 
              />
           </div>

           <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center cursor-pointer"></div>
              <label className="text-xs font-semibold text-gray-600 cursor-pointer">Remember me</label>
           </div>

           <button 
             type="button"
             className="w-full bg-[#C9111E] text-white hover:bg-[#A50D17] transition-colors rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-8 shadow-lg shadow-[#C9111E]/20"
           >
             Sign In
             <ArrowRight className="w-4 h-4" />
           </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <p className="text-xs font-medium text-gray-500">
            New traveler? <Link to="/signup" className="text-[#C9111E] font-bold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
      
    </div>
  );
};
