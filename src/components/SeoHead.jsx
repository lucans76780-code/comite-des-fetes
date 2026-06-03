import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  getSeoForPath,
} from '../lib/seo'

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const seo = getSeoForPath(pathname)
    const title = seo.title
    const description = seo.description ?? DEFAULT_DESCRIPTION
    const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`
    const ogImage = `${SITE_URL}${DEFAULT_OG_IMAGE}`

    document.title = title
    setMeta('name', 'description', description)

    if (seo.noindex) {
      setMeta('name', 'robots', 'noindex, nofollow')
    } else {
      setMeta('name', 'robots', 'index, follow')
    }

    setLink('canonical', canonical)

    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:image', ogImage)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:locale', 'fr_FR')
    setMeta('property', 'og:site_name', 'Anim Argueil')

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', ogImage)
  }, [pathname])

  return null
}
