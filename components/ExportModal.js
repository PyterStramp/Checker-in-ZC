import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ExportModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [options, setOptions] = useState({
        Arrived: true,
        Pending: true,
    });

    if (!isOpen) return null;

    const handleCheckbox = (e) => {
        setOptions({ ...options, [e.target.name]: e.target.checked });
    };

    const handleDownload = async () => {
        setIsSubmitting(true);
        const statuses = Object.keys(options).filter(k => options[k]);
        if (statuses.length === 0) {
            alert('Please select at least one status to export.');
            setIsSubmitting(false);
            return;
        }

        const url = `/api/admin/export?status=${statuses.join(',')}`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });

            if (!res.ok) throw new Error('Failed to generate file.');
            
            const blob = await res.blob();
            
            const tempUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = tempUrl;
            link.setAttribute('download', 'attendee_export.csv');
            document.body.appendChild(link);
            link.click();
            
            link.remove();
            window.URL.revokeObjectURL(tempUrl);
            onClose();

        } catch (error) {
            console.error(error);
            alert('Error downloading file.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Export Attendees</h3>
                
                <div className="mb-6">
                    <p className="font-semibold text-gray-700 mb-2">Include Status:</p>
                    <div className="flex flex-col space-y-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="Arrived" checked={options.Arrived} onChange={handleCheckbox} className="h-4 w-4 text-green-600"/>
                            <span className="text-green-700">Arrived (Who came)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="Pending" checked={options.Pending} onChange={handleCheckbox} className="h-4 w-4 text-yellow-600"/>
                            <span className="text-yellow-700">Pending (Who did not come)</span>
                        </label>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="font-semibold text-gray-700 mb-2">Preview (Columns to be Exported):</p>
                    <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded">
                        Full Name, University, ID, Email, Phone, IEEE Membership, Status, Check-in Time
                    </p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-700 bg-gray-200 rounded">Cancel</button>
                    <button onClick={handleDownload} disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 rounded">
                        {isSubmitting ? 'Generating...' : 'Download CSV'}
                    </button>
                </div>
            </div>
        </div>
    );
}
