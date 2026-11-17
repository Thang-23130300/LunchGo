import { Link } from 'react-router'

type BreadcrumbItem = {
  label: string
  to?: string
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="page-breadcrumb" aria-label="Đường dẫn">
      <ol>
        <li><Link to="/">Trang chủ</Link></li>
        {items.map(({ label, to }, index) => (
          <li key={label}>
            <span aria-hidden="true">/</span>
            {to ? <Link to={to}>{label}</Link> : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>{label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
