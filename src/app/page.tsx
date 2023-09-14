import Image from 'next/image'
import styles from './page.module.css'

import { SignOut } from '@/app/auth/page'

export default function Home() {
  return (
    <main className={styles.main}>
      <SignOut />
    </main>
  )
}
