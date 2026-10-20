import { TransitionStartFunction } from "react"
import SortButton from "./SortButton"


/*  
CHALLENGE  
Update the buttons so each one pushes a different sort value:

- A-Z → sort=alpha  
- Popular → sort=popular  
- Most Recent → sort=recent  

You can pass the sort value into your handler however you like
*/

export default function SortControls({startTransition}:{
  startTransition: TransitionStartFunction
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort models">
      <span className="text-sm text-muted">Sort by</span>

      <SortButton startTransition={startTransition} sort="">Default</SortButton>
      <SortButton startTransition={startTransition} sort="alpha">A-Z</SortButton>
      <SortButton startTransition={startTransition} sort="popular">Popular</SortButton>
      <SortButton startTransition={startTransition} sort="recent">Recent</SortButton>
      

    </div>
  )
}