"use client";

import { usePathname, useRouter } from "next/navigation";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from './Profile.module.css';
import { useAuth } from "@/auth/AuthProvider";


export default function Profile() {
    const { currentUser, signout } = useAuth();
    const path = usePathname();
    const router = useRouter();


  //TODO handle behavior after sign in 
  const handleSignIn = () => {
   
    router.push(
        '/login'
    );}

  return (

    currentUser || path === '/login' ? null : 
    <div className={styles.profileContainer}>
      <div className={styles.rightAlignedButton}>
        <button onClick={handleSignIn}>
          <FontAwesomeIcon icon={faUser}  className={styles.icon}/>
          
        </button>
      </div>
    </div>
  );
}
