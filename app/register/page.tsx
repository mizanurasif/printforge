import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import RegisterForm from '../components/RegisterForm'
import { authOptions } from '../lib/auth'

export default async function RegisterPage() {
    const session = await getServerSession(authOptions)
    if (session) redirect('/dashboard')

    return (
        <main className="max-w-sm px-4 mx-auto mt-16">
            <h1 className="mb-6 text-3xl font-bold text-center">Create account</h1>
            <RegisterForm />
        </main>
    )
}
