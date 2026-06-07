import { UploadPropertyForm } from '@/components/dashboard/upload/UploadPropertyForm'

export default function UploadPropertyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl text-dark">Upload Property</h1>
        <p className="mt-1 font-body text-neutral">
          List your property for sale in Belagavi
        </p>
      </div>

      <UploadPropertyForm />
    </div>
  )
}
