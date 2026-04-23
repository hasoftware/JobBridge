import { useEffect, useRef } from 'react'

export function useScrollReveal(options = {}) {
    const ref = useRef(null)

    useEffect(() => {
        const node = ref.current
        if (!node) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    node.classList.add('reveal-in')
                    observer.unobserve(node)
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px', ...options },
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return ref
}
