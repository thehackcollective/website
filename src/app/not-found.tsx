import { StatusPage } from '@/app/status-page'
import { DocumentTitle } from '@/ui/document-title'

export function NotFound() {
  return (
    <>
      <DocumentTitle title="Page not found · The Hack Collective" />
      <meta name="robots" content="noindex" />
      <StatusPage title="Page not found" />
    </>
  )
}
