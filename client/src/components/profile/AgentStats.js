export default function AgentStats({ profile }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                Performance Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-slate-900">{profile.rating?.toFixed(1) || 0} ★</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Rating</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-slate-900">{profile.jobsCompleted || 0}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Jobs Done</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-emerald-600">${profile.earnings || 0}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Total Earnings</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-slate-900">{profile.reliability?.onTimePercentage || 100}%</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">On-Time</div>
                </div>
            </div>
        </div>
    );
}
