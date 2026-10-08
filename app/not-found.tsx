import NotFoundUI from './components/NotFoundUI'
export default function NotFound(){

  return (
    <NotFoundUI 
        title='Page Not Found'
        subtitle="Sorry, we couldn't find the requested page!"
        link_href='/'
        link_text='Go Back Home'
    />
  )
}