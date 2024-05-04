import Link from 'next/link';
import { useRouter } from 'next/router';
// import styles from './Navbar.module.css';

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className={styles.navbar}>
      <Link href="/home" className={router.pathname === '/home' ? styles.active : ''}>
        Home
      </Link>
      <Link href="/leaderboard" className={router.pathname === '/leaderboard' ? styles.active : ''}>
        Leaderboard
      </Link>
      <Link href="/login" className={router.pathname === '/login' ? styles.active : ''}>
        Login
      </Link>
    </nav>
  );
};

export default Navbar;
