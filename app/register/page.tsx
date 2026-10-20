import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import RegisterForm from '../components/account/RegisterForm'
import { authOptions } from '../lib/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create account' }

export default async function RegisterPage() {
    const session = await getServerSession(authOptions)
    if (session) redirect('/dashboard')

    return (
        <main className="relative flex-1 overflow-hidden pastel-wash">
            <div aria-hidden="true" className="grid-floor" />
            <span aria-hidden="true" className="axis axis-x" />
            <span aria-hidden="true" className="axis axis-z" />
            <div className="relative max-w-md px-4 py-14 mx-auto md:py-20">
            <div className="p-7 card md:p-9">
            <h1 className="mb-1.5 text-3xl font-bold text-center">Create account</h1>
            <p className="mb-7 text-center text-muted">Join the community and start sharing your models.</p>
            <RegisterForm />
            </div>
            </div>
        </main>
    )
}
