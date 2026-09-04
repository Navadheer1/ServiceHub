import { MapPin } from 'lucide-react';

export default function SavedAddresses({ addresses = [], isEditing }) {
    return (
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Saved Addresses
            </h3>
            {addresses.length > 0 ? (
                <ul className="space-y-3">
                    {addresses.map((addr, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="mt-1 text-gray-400">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="block font-medium text-gray-900">{addr.label || 'Home'}</span>
                                <span className="text-sm text-gray-500">{addr.address}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-sm italic">No saved addresses.</p>
            )}
        </section>
    );
}
