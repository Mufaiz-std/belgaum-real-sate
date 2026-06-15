import { UploadPropertyForm } from '@/components/dashboard/upload/UploadPropertyForm'
import { getSession } from '@/lib/auth'
import { getDashboardUser } from '@/lib/dashboard'
import { redirect } from 'next/navigation'
import { BulkUploadButton } from './BulkUploadButton'

export default async function UploadPropertyPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await getDashboardUser(session.userId)
  if (!user) redirect('/login')

  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl text-dark">Upload Property</h1>
          <p className="mt-1 font-body text-neutral">
            List your property for sale in Belagavi
          </p>
        </div>
        {isAdmin && <BulkUploadButton />}
      </div>

      <UploadPropertyForm />
    </div>
  )
}
