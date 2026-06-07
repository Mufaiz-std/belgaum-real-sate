import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface PublicPageShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function PublicPageShell({ title, subtitle, children }: PublicPageShellProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-3xl font-semibold text-dark sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 font-body text-lg text-neutral">{subtitle}</p>
            )}
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm sm:p-10">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
