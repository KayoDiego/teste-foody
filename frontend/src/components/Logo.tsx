import { Link } from 'react-router-dom'
import logo from '../assets/foody-logo.png'

interface LogoProps {
  to?: string
  className?: string
}

export function Logo({ to, className = 'h-12 w-auto' }: LogoProps) {
  const image = (
    <img src={logo} alt="Foody Delivery" className={className} />
  )

  if (to) {
    return (
      <Link to={to} className="inline-block">
        {image}
      </Link>
    )
  }

  return image
}
