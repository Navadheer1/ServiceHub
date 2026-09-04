import Field from './Field';

export default function SkillsSection({ formData, handleArrayChange, handleInputChange, isEditing }) {
    return (
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Skills & Experience</h3>
            <div className="space-y-6">
                <Field 
                    label="Skills (comma separated)" 
                    name="skills" 
                    value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills} 
                    onChange={(e) => handleArrayChange(e, 'skills')} 
                    isEditing={isEditing} 
                    placeholder="e.g. Plumbing, Wiring, Installation"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={handleInputChange} isEditing={isEditing} />
                    <Field label="Service Radius (km)" name="serviceRadius" type="number" value={formData.serviceRadius} onChange={handleInputChange} isEditing={isEditing} />
                </div>
            </div>
        </section>
    );
}
