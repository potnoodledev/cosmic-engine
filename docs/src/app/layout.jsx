/* eslint-env node */
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  metadataBase: new URL('https://docs.cosmiclabs.org'),
  title: {
    template: '%s - Cosmic Engine'
  },
  description: 'Cosmic: The Framework for the Agentic Game Engine',
  applicationName: 'Cosmic',
  generator: 'Next.js',
  appleWebApp: {
    title: 'Cosmic'
  },
  other: {
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-TileColor': '#fff'
  },
  twitter: {
    site: 'https://docs.cosmiclabs.org'
  }
}

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>Cosmic</b>{' '}
          <span style={{ opacity: '60%' }}>The Framework for the Agentic Game Engine</span>
        </div>
      }
    />
  )
  const pageMap = await getPageMap()
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          banner={<Banner storageKey="Cosmic Engine">Cosmic Engine</Banner>}
          navbar={navbar}
          footer={<Footer>MIT {new Date().getFullYear()} © OP Games.</Footer>}
          editLink="Edit this page on GitHub"
          docsRepositoryBase="https://github.com/potnoodledev/cosmic-engine/blob/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={pageMap}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
