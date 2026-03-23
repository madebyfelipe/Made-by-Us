type Props = {
  width?: number
  height?: number
  className?: string
}

export default function Logo({ width = 120, height = 40, className = '' }: Props) {
  return (
    <span className={`inline-flex ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-black.png"
        alt="Made by Felipe"
        width={width}
        height={height}
        className="logo-light"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-white.png"
        alt="Made by Felipe"
        width={width}
        height={height}
        className="logo-dark"
      />
    </span>
  )
}
