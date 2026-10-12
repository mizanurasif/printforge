'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createUser, getUserByEmail } from '../lib/database/user'


const registerSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().pipe(z.email('Enter a valid email')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type RegisterState = {
    error?: string
    fieldErrors?: Partial<Record<'name' | 'email' | 'password', string[]>>
}


export async function registerUser(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
    const parsed = registerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!parsed.success) {
        return { fieldErrors: z.flattenError(parsed.error).fieldErrors }
    }

    const { name, email, password } = parsed.data
    if (await getUserByEmail(email)) {
        return { error: 'Email already registered' }
    }

    try {
        await createUser(name, email, password)
    } catch(err) {
        // 23505 = unique_violation: two sign-ups with the same email at the same moment
        if ((err as { code?: string }).code === '23505') {
            return { error: 'Email already registered' }
        }
        return { error: 'Could not create account. Please try again.' }
    }

    redirect('/login?registered=1')
}
