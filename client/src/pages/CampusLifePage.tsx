import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { UniversitySiteLayout } from '@/components/marketing/UniversitySiteLayout'
import { SectionHeading } from '@/components/marketing/shared'
import { campusGallery } from '@/data/universitySiteData'

const CampusLifePage: React.FC = () => {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const selectedIndex = useMemo(() => {
    return campusGallery.findIndex((image) => image.id === selectedImageId)
  }, [selectedImageId])

  const selectedImage = selectedIndex >= 0 ? campusGallery[selectedIndex] : null

  const goNext = () => {
    if (selectedIndex < 0) return
    const next = (selectedIndex + 1) % campusGallery.length
    setSelectedImageId(campusGallery[next].id)
  }

  const goPrev = () => {
    if (selectedIndex < 0) return
    const prev = (selectedIndex - 1 + campusGallery.length) % campusGallery.length
    setSelectedImageId(campusGallery[prev].id)
  }

  return (
    <UniversitySiteLayout title="Campus Life">
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Campus Life"
          title="Masonry gallery with immersive story mode"
          description="Explore student life with lazy-loaded media, hover details, and a swipe-ready lightbox."
        />

        <div className="relative mb-10 overflow-hidden rounded-3xl">
          <video
            className="h-[360px] w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={campusGallery[0].image}
          >
            <source src="https://cdn.coverr.co/videos/coverr-university-campus-walk-1576/1080p.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-8 left-8 max-w-lg text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Featured Story</p>
            <h3 className="mt-2 font-heading text-3xl">A day in campus innovation labs</h3>
            <p className="mt-2 text-sm text-slate-200">Research teams and student clubs co-create impact projects from prototype to publication.</p>
          </div>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {campusGallery.map((photo) => (
            <motion.button
              key={photo.id}
              type="button"
              className="group relative mb-4 block w-full overflow-hidden rounded-2xl"
              whileHover={{ scale: 1.015 }}
              onClick={() => setSelectedImageId(photo.id)}
            >
              <img
                src={photo.image}
                alt={photo.title}
                loading="lazy"
                className="w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 translate-y-5 p-4 text-left text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{photo.category}</p>
                <p className="mt-1 font-semibold">{photo.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[88] flex items-center justify-center bg-slate-950/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImageId(null)}
            onTouchStart={(event) => setTouchStart(event.changedTouches[0].clientX)}
            onTouchEnd={(event) => {
              if (touchStart === null) return
              const endX = event.changedTouches[0].clientX
              const delta = endX - touchStart
              if (delta > 50) goPrev()
              if (delta < -50) goNext()
              setTouchStart(null)
            }}
          >
            <button
              type="button"
              className="absolute right-6 top-6 rounded-full bg-white/15 p-2 text-white"
              onClick={() => setSelectedImageId(null)}
              aria-label="Close image viewer"
            >
              <X className="h-5 w-5" />
            </button>

            <button type="button" className="absolute left-4 rounded-full bg-white/15 px-4 py-2 text-white" onClick={goPrev}>Prev</button>
            <button type="button" className="absolute right-4 rounded-full bg-white/15 px-4 py-2 text-white" onClick={goNext}>Next</button>

            <motion.div
              className="max-h-[86vh] max-w-5xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <img src={selectedImage.image} alt={selectedImage.title} className="max-h-[70vh] w-full rounded-2xl object-cover" />
              <div className="mt-4 rounded-2xl bg-white/10 p-4 text-white backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{selectedImage.category}</p>
                <h3 className="mt-1 font-heading text-2xl">{selectedImage.title}</h3>
                <p className="mt-2 text-sm text-slate-200">{selectedImage.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </UniversitySiteLayout>
  )
}

export default CampusLifePage
