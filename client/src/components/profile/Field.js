export default function Field({ label, name, value, onChange, isEditing, type = "text", placeholder }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
            {isEditing ? (
                <input 
                    type={type} 
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition w-full"
                />
            ) : (
                <div className="text-gray-900 text-sm py-2 border-b border-gray-100 min-h-[2.5rem] flex items-center">
                    {value || <span className="text-gray-400 italic">Not set</span>}
                </div>
            )}
        </div>
    );
}
