import { PlaneTakeoff } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Signup = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-6 pb-24 relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-surface -z-10"></div>
            <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[70%] bg-red-50 rounded-full blur-[120px] -z-10 opacity-60"></div>

            <div className="w-full max-w-[420px] bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 relative hover:shadow-red/5 transition-shadow duration-500">

                {/* Decorative corner shape */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-surface rounded-bl-full -z-10"></div>

                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Register</h1>
                <p className="text-sm font-medium text-gray-500 mb-8">Begin your premium journey.</p>

                <form className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Johnathan Doe"
                            className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Email</label>
                        <input
                            type="email"
                            placeholder="flyer@aviation.com"
                            className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Create Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-surface rounded-xl h-14 px-4 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red/20"
                        />
                    </div>

                    <p className="text-[10px] text-gray-400 leading-relaxed pt-2">
                        By registering, you agree to our Terms of Carriage and Privacy Policy regarding your personal data.
                    </p>

                    <button
                        type="button"
                        className="w-full bg-[#E8E8E8] text-red hover:bg-[#dedede] transition-colors rounded-full h-14 font-bold text-sm tracking-wider flex items-center justify-center gap-2 mt-4"
                    >
                        Join Membership
                        <PlaneTakeoff className="w-5 h-5 -rotate-45" />
                    </button>
                </form>

                <div className="mt-8 border-t border-gray-100 pt-6 text-center">
                    <p className="text-xs font-medium text-gray-500">
                        Already a member? <Link to="/login" className="text-red font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>

        </div>
    );
};
