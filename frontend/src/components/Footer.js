import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <div className="footer-brand">Well Connected</div>
          <p className="footer-desc">
            Your one-stop shop for quality groceries, household essentials, 
            and everyday provisions. We deliver right to your doorstep.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link href="/products">All Products</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Well Connected. All rights reserved.
      </div>
    </footer>
  );
}
