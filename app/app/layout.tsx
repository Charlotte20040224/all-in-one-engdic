import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { NavBar } from '@/components/NavBar'
import { FeedbackBar } from '@/components/FeedbackBar'
import { QuickLookupProvider } from '@/components/QuickLookupProvider'
import { ReminderRunner } from '@/components/ReminderRunner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <FeedbackBar />
      <ReminderRunner />
      <QuickLookupProvider>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </QuickLookupProvider>
    </div>
  )
}
