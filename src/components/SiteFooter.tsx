import { Link } from 'react-router'

function SiteFooter({ menuHref }: { menuHref: string }) {
  const navigationState = { fromMenu: menuHref }

  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-footer__columns">
          <div>
            <Link className="site-brand" to="/" state={navigationState} aria-label="LunchGo">
              <span>Lunch <span className="site-brand__accent">Go.</span></span>
            </Link>
            <p className="site-footer__description">
              Một cách đơn giản để chọn món và đặt bữa trưa. Tập trung vào thực đơn dễ tìm, giỏ hàng rõ ràng và quy trình xác nhận nhanh gọn.
            </p>
          </div>
          <nav className="site-footer__group" aria-labelledby="footer-discover">
            <h2 id="footer-discover">Khám phá</h2>
            <Link to="/" state={navigationState}>Trang chủ</Link>
            <Link to={menuHref}>Thực đơn</Link>
          </nav>
          <nav className="site-footer__group" aria-labelledby="footer-order">
            <h2 id="footer-order">Đặt món</h2>
            <Link to="/cart" state={navigationState}>Giỏ hàng</Link>
            <Link to="/checkout" state={navigationState}>Thanh toán COD</Link>
          </nav>
          <div className="site-footer__group">
            <h2>Về LunchGo</h2>
            <span>Dự án Front End</span>
            <span>Không thanh toán thật</span>
            <span>Giao diện học phần</span>
          </div>
        </div>
        <small className="site-footer__copyright">© 2026 LunchGo · Demo học phần Front End.</small>
      </div>
    </footer>
  )
}

export default SiteFooter
