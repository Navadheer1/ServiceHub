export default function ProfileTabs({ activeTab, setActiveTab, isAgent }) {
    const tabs = isAgent 
        ? ['overview', 'skills', 'earnings', 'availability', 'settings']
        : ['overview', 'bookings', 'settings'];

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
                            ${activeTab === tab 
                                ? (isAgent ? 'border-slate-800 text-slate-900' : 'border-blue-500 text-blue-600')
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </nav>
        </div>
    );
}
