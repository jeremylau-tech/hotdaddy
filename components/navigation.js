"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons/faHouse";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons/faPowerOff";
import { faRankingStar } from "@fortawesome/free-solid-svg-icons/faRankingStar";
import { faSeedling } from "@fortawesome/free-solid-svg-icons/faSeedling";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, signout } = useAuth();

  if (!currentUser) {
    return null;
  }

  const isNavItemActive = (pathToCheck, actualPath) => {
    return pathToCheck === actualPath;
  };

  return (
    <nav className="btm-nav bg-base-100">
      <ul className="menu menu-horizontal">
      <li>
      <Link
        className={isNavItemActive("/", pathname) ? "active" : ""}
        href="/"
      >
        <FontAwesomeIcon icon={faHouse} className ={ isNavItemActive("/", pathname) ? 'text-primary': 'neutral' } />
        Home
      </Link>
    </li>

    <li>
      <Link
        className={isNavItemActive("/leaderboard", pathname) ? "active" : ""}
        href="/leaderboard"
      >
          <FontAwesomeIcon icon={faRankingStar} className ={ isNavItemActive("/leaderboard", pathname) ? 'text-primary': 'neutral' } />

        Leaderboard
      </Link>
    </li>

        <li>
          <Link
            className={isNavItemActive("/growth", pathname) ? "active" : ""}
            href="/growth"
          >
            <FontAwesomeIcon icon={faSeedling} className ={ isNavItemActive("/growth", pathname) ? 'text-primary': 'neutral' } />
            Growth
          </Link>
        </li>
        
      </ul>
    </nav>
  );
}
