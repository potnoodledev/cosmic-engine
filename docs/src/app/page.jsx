import styles from './page.module.css'
import './page.css'
import { Link } from 'nextra-theme-docs'

export default function IndexPage() {
  return (
    <div className="home-content">
    <div className="content-container">
      <h1 className="headline">
        Cosmic Engine<br className="max-sm:hidden" />
      </h1>
      <p className="subtitle">
        Build better games through agentic co-creation,{' '}
        <br className="max-md:hidden" />
        presented by{' '}
        <Link href="https://engine.cosmiclabs.org" className="text-current">
          Cosmic Labs
        </Link>
        .
      </p>
      <p className="subtitle">
        <Link className={styles.cta} href="/docs">
          Get started <span>→</span>
        </Link>
      </p>
    </div>
    <div className="features-container x:border-b nextra-border">
      <div className="content-container">
      </div>
    </div>
  </div>   
  )
}
