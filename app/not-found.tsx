import NotFoundUI from './components/NotFoundUI'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page not found' }
export default function NotFound(){

  return (
    <main>
    <NotFoundUI 
        title='Page Not Found'
        subtitle="Sorry, we couldn't find the requested page!"
        link_href='/'
        link_text='Go Back Home'
    />
    </main>
  )
}