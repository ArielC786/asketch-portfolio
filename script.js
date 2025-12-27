const links = Array.from(document.querySelectorAll('.menu-link'))
const sections = links.map(l => document.querySelector(l.getAttribute('href')))

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const id = `#${entry.target.id}`
      const link = links.find(l => l.getAttribute('href') === id)
      if (!link) return
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.remove('active'))
        link.classList.add('active')
      }
    })
  },
  { rootMargin: '-30% 0px -60% 0px', threshold: 0.1 }
)

sections.forEach(s => s && observer.observe(s))

const form = document.getElementById('contact-form')
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault()
    const data = new FormData(form)
    const name = data.get('name')
    const email = data.get('email')
    const message = data.get('message')
    
    if (!name || !email || !message) return

    const btn = form.querySelector('button[type="submit"]')
    const originalText = btn ? btn.textContent : 'Send Message'
    
    if (btn) {
      btn.disabled = true
      btn.textContent = 'Sending...'
    }

    // ---------------------------------------------------------
    // GOOGLE FORM CONFIGURATION
    // ---------------------------------------------------------
    const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScILZ7coDKZeSpaeAmi-fl-53mzx5oNPjBwq4m5HpaSU0Hymw/formResponse'
    const ENTRY_NAME_ID = 'entry.1575583215'
    const ENTRY_EMAIL_ID = 'entry.1743007725'
    const ENTRY_MESSAGE_ID = 'entry.1671336851'

    const formData = new FormData()
    formData.append(ENTRY_NAME_ID, name)
    formData.append(ENTRY_EMAIL_ID, email)
    formData.append(ENTRY_MESSAGE_ID, message)

    fetch(GOOGLE_FORM_ACTION_URL, {
      method: 'POST',
      mode: 'no-cors', // Important for Google Forms
      body: formData
    })
    .then(() => {
      // With no-cors, we can't read the response, so we assume success if no network error
      form.reset()
      if (btn) {
        btn.textContent = 'Message Sent!'
        setTimeout(() => {
          btn.disabled = false
          btn.textContent = originalText
        }, 3000)
      }
    })
    .catch(error => {
      console.error('Error:', error)
      if (btn) {
        btn.textContent = 'Error! Try again.'
        setTimeout(() => {
          btn.disabled = false
          btn.textContent = originalText
        }, 3000)
      }
    })
  })
}

const lightbox = document.getElementById('lightbox')
const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null

const preload = src =>
  new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(src)
    i.onerror = reject
    i.src = src
  })

const swapExt = (src, ext) => src.replace(/\.(png|jpg|jpeg|gif|webp)$/i, `.${ext}`)

const candidateExts = src => {
  const m = src.match(/\.(png|jpg|jpeg|gif|webp)$/i)
  const ext = m ? m[1].toLowerCase() : 'jpg'
  if (ext === 'jpg') return [swapExt(src, 'jpg'), swapExt(src, 'JPG'), swapExt(src, 'jpeg'), swapExt(src, 'JPEG')]
  if (ext === 'jpeg') return [swapExt(src, 'jpeg'), swapExt(src, 'JPEG'), swapExt(src, 'jpg'), swapExt(src, 'JPG')]
  if (ext === 'png') return [swapExt(src, 'png'), swapExt(src, 'PNG'), swapExt(src, 'jpg'), swapExt(src, 'JPG')]
  return [src]
}

let scale = 1
let pX = 0
let pY = 0

const updateTransform = () => {
  if (lightboxImg) {
    lightboxImg.style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`
  }
}

const resetTransform = () => {
  scale = 1
  pX = 0
  pY = 0
  updateTransform()
}

const openLightbox = async src => {
  if (!lightbox || !lightboxImg) return
  lightbox.classList.remove('error')
  resetTransform()
  const candidates = [src, ...candidateExts(src)].filter((v, i, a) => a.indexOf(v) === i)
  let loaded = null
  for (const c of candidates) {
    try {
      /* eslint-disable no-await-in-loop */
      await preload(c)
      loaded = c
      break
    } catch {}
  }
  if (!loaded) {
    lightbox.classList.add('open')
    document.body.classList.add('no-scroll')
    const err = lightbox.querySelector('.lightbox-error')
    if (err) err.textContent = 'Image failed to load'
    lightbox.classList.add('error')
    return
  }
  lightboxImg.src = loaded
  lightbox.classList.add('open')
  document.body.classList.add('no-scroll')
}

const closeLightbox = () => {
  if (!lightbox) return
  lightbox.classList.remove('open')
  document.body.classList.remove('no-scroll')
}

document.querySelectorAll('.grid-item').forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src))
})

if (lightbox) {
  lightbox.addEventListener('wheel', e => {
    e.preventDefault()
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const mx = e.clientX
    const my = e.clientY
    
    const delta = -e.deltaY
    const factor = delta > 0 ? 1.1 : 0.9
    const newScale = Math.min(Math.max(0.5, scale * factor), 5)
    
    const ratio = newScale / scale
    pX = pX - (mx - cx - pX) * (ratio - 1)
    pY = pY - (my - cy - pY) * (ratio - 1)
    scale = newScale
    
    updateTransform()
  }, { passive: false })

  let isDragging = false
  let startX = 0
  let startY = 0

  lightbox.addEventListener('mousedown', e => {
    isDragging = false
    startX = e.clientX
    startY = e.clientY
    e.preventDefault()

    const onMove = e => {
      // If moved significantly, mark as dragging
      if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
        isDragging = true
      }
      if (isDragging) {
        pX += e.movementX
        pY += e.movementY
        updateTransform()
      }
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!isDragging) {
        closeLightbox()
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
}

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox()
})

const placeholderSvg = label => {
  const text = encodeURIComponent(label || 'Image')
  return `data:image/svg+xml;utf8,` +
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900' viewBox='0 0 1200 900'>` +
    `<rect width='100%' height='100%' rx='28' fill='rgb(18,18,18)'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='64' font-family='Inter, Arial, sans-serif' opacity='0.9'>${text} missing</text>` +
    `</svg>`
}

const fixThumbnailOnError = img => {
  let tried = false
  img.addEventListener('error', async () => {
    if (tried) {
      img.src = placeholderSvg(img.alt || 'Image')
      return
    }
    tried = true
    const candidates = [img.src, ...candidateExts(img.src)].filter((v, i, a) => a.indexOf(v) === i)
    for (const c of candidates) {
      try {
        /* eslint-disable no-await-in-loop */
        await preload(c)
        img.src = c
        return
      } catch {}
    }
    img.src = placeholderSvg(img.alt || 'Image')
  })
}

document.querySelectorAll('.grid-item').forEach(fixThumbnailOnError)
