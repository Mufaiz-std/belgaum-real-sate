import { UploadPropertyForm } from '@/components/dashboard/upload/UploadPropertyForm'
import { BulkUploadButton } from './BulkUploadButton'

export default function AdminUploadPropertyPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl text-dark">Upload Property</h1>
          <p className="mt-1 font-body text-neutral">
            List a property — it will be published immediately
          </p>
        </div>
        <BulkUploadButton />
      </div>

      <UploadPropertyForm isAdmin={true} />
    </div>
  )
}
