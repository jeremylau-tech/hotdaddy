import Link from 'next/link';

const Navbar = () => {

  return (
    <nav>
      <Link href="/" >Home</Link>
      <Link href="/leaderboard" >Leaderboard</Link>
      <Link href="/login">Login</Link>
    </nav>
  );
};

export default Navbar;
