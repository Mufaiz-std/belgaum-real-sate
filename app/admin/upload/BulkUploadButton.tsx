'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

export function BulkUploadButton() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading and parsing properties...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/ingest-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success(`Successfully added ${data.summary.successful} properties!`, {
        id: toastId,
      });

      if (data.summary.failures > 0) {
        console.error('Upload failures:', data.summary.errors);
        toast.warning(`Failed to add ${data.summary.failures} properties. Check console for details.`);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during upload', {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label
        className={`flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors ${
          isUploading ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <Upload className="w-4 h-4" />
        <span className="font-medium text-sm">
          {isUploading ? 'Uploading...' : 'Bulk Upload (Excel)'}
        </span>
        <input
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
